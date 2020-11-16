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
    .populate(`nominatedPlayer`);

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
    .populate(`nominatedPlayer`);

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

export const createGame = async (): Promise<IGamesDocument> => {
  const gameId = Math.floor(1000 + Math.random() * 9000).toString();
  const gameToSave = new GamesModel({ gameId });
  await gameToSave.save();
  return gameToSave;
};

export const addPlayer = async (
  gameId: string,
  player: Player,
  socketId: string,
): Promise<ILeanGamesDocument> => {
  const { players } = await getGameById(gameId);

  const playerAlreadyInGame = (players as Player[]).find(
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
  const { players } = await getGameById(gameId);
  return players as Player[];
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

export const assassinatePlayer = async (
  player: Player,
  mafiaHitman: Player,
  gameId: string,
): Promise<ILeanGamesDocument> => {
  //remove mafiaHitman._id from previously nominated player's nominatedBy array
  await updatePlayer(
    { nominatedBy: mafiaHitman._id },
    { $pull: { nominatedBy: mafiaHitman._id } },
  );
  //add mafiaHitman._id to nominated player's nominatedBy array
  await updatePlayerById(player._id, {
    $addToSet: { nominatedBy: mafiaHitman._id },
  });

  const updatedGame = await getGameById(gameId);

  const { nominated, mafia } = getNominatedAndMafia(
    updatedGame.players as Player[],
  );

  if (
    nominated.length === 1 &&
    nominated[0].nominatedBy.length === mafia.length
  ) {
    return updateGame(gameId, {
      nominatedPlayer: nominated[0],
    });
  }
  return updatedGame;
};

export const killPlayer = async (
  playerToDie: Player,
  gameId: string,
): Promise<ILeanGamesDocument> => {
  const lastPlayerKilled = await updatePlayerById(playerToDie._id, {
    isAlive: false,
  });
  return updateGame(gameId, {
    lastPlayerKilled,
    nominatedPlayer: null,
    $set: {
      'stages.mafiaAwake': false,
      'stages.detectiveAwake': true,
    },
  });
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
  const gameHasGuardianAngel = (players as Player[]).find(
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
