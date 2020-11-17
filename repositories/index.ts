import {
  GamesModel,
  IGamesDocument,
  ILeanGamesDocument,
  ILeanPlayerDocument,
  Player,
  PlayerModel,
} from './mongoose';

const getGameById = async (gameId: string): Promise<ILeanGamesDocument> =>
  GamesModel.findOne({ gameId }, null, { lean: true })
    .populate(`players`)
    .populate({
      path: 'players',
      populate: {
        path: 'nominatedBy',
        model: 'Player',
      },
    })
    .populate(`lastPlayerKilled`)
    .populate(`nominatedPlayers`)

const updateGame = async (gameId: string, operation: {}) =>
  GamesModel.findOneAndUpdate({ gameId }, operation, {
    new: true,
    useFindAndModify: false,
  })
    .populate(`players`)
    .populate({
      path: 'players',
      populate: {
        path: 'nominatedBy',
        model: 'Player',
      },
    })
    .populate(`lastPlayerKilled`)
    .populate(`nominatedPlayers`);

const getPlayerById = async (_id: Object, projection: string) =>
  PlayerModel.findById({ _id }, projection, { lean: true });

const updatePlayerById = async (_id: Object, operation: {}) =>
  PlayerModel.findByIdAndUpdate({ _id }, operation, {
    useFindAndModify: false,
    new: true,
    lean: true,
  });

const updatePlayer = async (filter: {}, operation: {}) =>
  PlayerModel.findOneAndUpdate(filter, operation, {
    useFindAndModify: false,
  });

// export const createGame = async (): Promise<IGamesDocument> => {
//   const gameId = Math.floor(1000 + Math.random() * 9000).toString();
//   const gameToSave = new GamesModel({ gameId });
//   await gameToSave.save();
//   return gameToSave;
// };

export const addPlayer = async (
  gameId: string,
  player: Player,
  socketId: string,
): Promise<ILeanGamesDocument> => {
  const { players } = await getGameById(gameId);

  const playerAlreadyInGame = (players).find(
    ({ name }) => name === player.name,
  );
  if (!playerAlreadyInGame) {
    const playerToSave = new PlayerModel({ name: player.name, socketId });
    await playerToSave.save();

    return updateGame(gameId, {
      $addToSet: {
        players: playerToSave._id,
      },
    });
  } else {
    await updatePlayerById(playerAlreadyInGame._id, {
      connected: true,
      socketId,
    });

    return getGameById(gameId);
  }
};

export const listPlayersInGame = async (gameId: string): Promise<Player[]> => {
  try {
    const { players } = await getGameById(gameId);
    return players;
  } catch (err) {
    console.error(`No game found`);
    return null;
  }
};

export const startGame = async (
  gameId: string,
  players: Player[],
): Promise<ILeanGamesDocument> => {
  await Promise.all(
    players.map(({ _id, role }) => updatePlayerById(_id, { role })),
  );
  return updateGame(gameId, {
    players: players.map(({ _id }) => _id),
    $set: { 'stages.intro': false, 'stages.mafiaAwake': true },
  });
};

const handlePlayerNomination = async (
  playerToNominate: Player,
  nominatedBy: Player,
): Promise<void> => {
  await updatePlayer(
    { nominatedBy: nominatedBy._id },
    { $pull: { nominatedBy: nominatedBy._id } },
  );
  await updatePlayerById(playerToNominate._id, {
    $addToSet: { nominatedBy: nominatedBy._id },
  });
};

export const assassinatePlayer = async (
  player: Player,
  mafiaHitman: Player,
  gameId: string,
): Promise<ILeanGamesDocument> => {
  await handlePlayerNomination(player, mafiaHitman);

  const updatedGame = await getGameById(gameId);

  const { nominated, mafia } = getNominatedAndMafia(
    updatedGame.players,
  );

  if (
    nominated.length === 1 &&
    nominated[0].nominatedBy.length === mafia.length
  ) {
    return updateGame(gameId, {
      nominatedPlayers: nominated,
    });
  }
  return updatedGame;
};

export const nominatePlayer = async (
  playerToNominate: Player,
  nominatedBy: Player,
  gameId: string,
): Promise<ILeanGamesDocument> => {
  await handlePlayerNomination(playerToNominate, nominatedBy);
  const updatedGame = await getGameById(gameId);
  const nominatedPlayers = (updatedGame.players).filter(
    ({ nominatedBy }) => nominatedBy.length,
  );
  const alive = (updatedGame.players).filter(
    ({ isAlive }) => isAlive,
  );
  //TODO: ACCOUNT FOR PLAYER NOMINATING THEMSELVES

  if (
    nominatedPlayers.length === 2 &&
    nominatedPlayers.reduce(
      (acc, { nominatedBy }) => [...acc, ...nominatedBy],
      [],
    ).length === alive.length
  ) {
    await Promise.all(
      (updatedGame.players).map((player) =>
        updatePlayerById(player._id, { nominatedBy: [] }),
      ),
    );
    return updateGame(gameId, {
      nominatedPlayers,
      $set: { 'stages.day': false, 'stages.twoNominations': true },
    });
  }
  return updateGame(gameId, { nominatedPlayers });
};

export const killPlayer = async (
  playerToDie: Player,
  gameId: string,
): Promise<ILeanGamesDocument> => {
  const lastPlayerKilled = await updatePlayerById(playerToDie._id, {
    isAlive: false,
    nominatedBy: [],
  });
  return updateGame(gameId, {
    lastPlayerKilled,
    nominatedPlayers: [],
    $set: {
      'stages.mafiaAwake': false,
      'stages.detectiveAwake': true,
    },
  });
};

export const lynchPlayer = async (
  playerToLynch: Player,
  nominatedBy: Player,
  gameId: string,
) => {
  await handlePlayerNomination(playerToLynch, nominatedBy);
  const updatedGame = await getGameById(gameId)
  const nominatedPlayers = (updatedGame.players).filter(
    ({ nominatedBy }) => nominatedBy.length,
  );

  const alive = (updatedGame.players).filter(
    ({ isAlive }) => isAlive,
  );


  if (
    nominatedPlayers.reduce(
      (acc, { nominatedBy }) => [...acc, ...nominatedBy],
      [],
    ).length === alive.length
  ) {
    if (
      nominatedPlayers[0].nominatedBy.length ===
      nominatedPlayers[1].nominatedBy.length
    ) {
      return updateGame(gameId, {
        $set: { 'stages.twoNominations': false, 'stages.tie': true },
      });
    }
    const lynchedPlayer =
      nominatedPlayers[0].nominatedBy.length >
      nominatedPlayers[1].nominatedBy.length
        ? nominatedPlayers[0]
        : nominatedPlayers[1];

    await Promise.all(
      (updatedGame.players).map(({ _id }) =>
        _id === lynchedPlayer._id
          ? updatePlayerById(_id, {
              isAlive: false,
              nominatedBy: [],
            })
          : updatePlayerById(_id, { nominatedBy: [] }),
      ),
    );

    return updateGame(gameId, {
      lastPlayerKilled: lynchedPlayer,
      $set: {
        'stages.twoNominations': false,
        'stages.tie': false,
        'stages.playerLynched': true,
      },
    });
  }
  return updatedGame;
};

export const investigatePlayer = async (
  playerToInvestigate: Player,
): Promise<boolean> => {
  const { role } = await getPlayerById(playerToInvestigate._id, `role`);

  return role === `mafia`;
};

export const endDetectiveTurn = async (
  gameId: string,
): Promise<ILeanGamesDocument> => {
  const { players, stages } = await getGameById(gameId);
  const gameHasGuardianAngel = (players).find(
    ({ role }) => role === `guardianAngel`,
  );

  const updatedStages = gameHasGuardianAngel
    ? { ...stages, detectiveAwake: false, guardianAngelAwake: true }
    : {
        ...stages,
        detectiveAwake: false,
        day: true,
      };
  return updateGame(gameId, { stages: updatedStages });
};

export const disconnectPlayerFromGame = async (
  socketId: string,
): Promise<ILeanPlayerDocument> =>
  updatePlayer({ socketId }, { connected: false, socketId: null });

export const removePlayerFromGame = async (
  socketId: string,
): Promise<ILeanGamesDocument> =>
  GamesModel.findOneAndUpdate(
    { players: { $elemMatch: { socketId } } },
    { $pull: { players: { socketId } } },
    { new: true, lean: true, useFindAndModify: false },
  );

const getNominatedAndMafia = (players: Player[]) =>
  players.reduce(
    (acc, currPlayer) => {
      if (currPlayer.nominatedBy.length && currPlayer.role === `mafia`) {
        return {
          nominated: [...acc.nominated, currPlayer],
          mafia: [...acc.mafia, currPlayer],
        };
      }
      if (currPlayer.nominatedBy.length) {
        return { ...acc, nominated: [...acc.nominated, currPlayer] };
      }
      if (currPlayer.role === `mafia`)
        return { ...acc, mafia: [...acc.mafia, currPlayer] };
      return acc;
    },
    {
      nominated: [],
      mafia: [],
    },
  );
