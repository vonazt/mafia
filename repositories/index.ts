import {
  GamesModel,
  IGamesDocument,
  IUpdateGamesDocument,
  Player,
  PlayerModel,
} from './mongoose';

export const joinGame = async (gameId: string) => {
  return GamesModel.findOne({ gameId });
};

export const createGame = async (): Promise<IGamesDocument> => {
  const gameId = Math.floor(1000 + Math.random() * 9000).toString();
  const gameToSave = new GamesModel({ gameId });
  await gameToSave.save();
  return gameToSave;
};

export const addPlayer = async (
  gameId: string,
  name: string,
  socketId: string,
): Promise<IGamesDocument> => {
  const playerAlreadyInGame = await GamesModel.findOne({
    gameId,
    players: { $elemMatch: { name } },
  });
  if (!playerAlreadyInGame) {
    const playerToSave = new PlayerModel({ name, socketId });
    await playerToSave.save();

    return GamesModel.findOneAndUpdate(
      { gameId },
      {
        $addToSet: {
          players: playerToSave,
        },
      },
      { new: true, useFindAndModify: false },
    );
  } else {
    return GamesModel.findOneAndUpdate(
      {
        gameId,
        players: { $elemMatch: { name } },
      },
      { $set: { 'players.$.connected': true, 'players.$.socketId': socketId } },
      { new: true, useFindAndModify: false },
    );
  }
};

export const listPlayers = async (gameId: string): Promise<Player[]> => {
  const { players } = await GamesModel.findOne({ gameId }, null, {
    lean: true,
  });
  return players;
};

export const startGame = async (
  gameId: string,
  players: Player[],
): Promise<IUpdateGamesDocument> => {
  const result = await GamesModel.findOneAndUpdate(
    { gameId },
    { players, $set: { 'stages.intro': false, 'stages.mafiaAwake': true } },
    {
      useFindAndModify: false,
      new: true,
      lean: true,
    },
  );
  return result;
};

export const assassinatePlayer = async (
  player: Player,
  mafiaHitman: Player,
  gameId: string,
): Promise<IUpdateGamesDocument> => {
  //remove mafiaHitman._id from previously nominated player's nominatedBy array
  await GamesModel.findOneAndUpdate(
    {
      gameId,
      players: { $elemMatch: { nominatedBy: { $in: mafiaHitman._id } } },
    },
    { $pull: { 'players.$.nominatedBy': mafiaHitman._id } },
    { new: true, lean: true, useFindAndModify: false },
  );
  //add mafiaHitman._id to nominated player's nominatedBy array
  const updatedGame = await GamesModel.findOneAndUpdate(
    {
      gameId,
      players: { $elemMatch: { _id: player._id } },
    },
    { $addToSet: { 'players.$.nominatedBy': mafiaHitman._id } },
    { new: true, lean: true, useFindAndModify: false },
  ).populate({
    path: 'players',
    populate: {
      path: 'nominatedBy',
      model: 'Player',
    },
  });

  const { nominated, mafia } = updatedGame.players.reduce(
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
  if (
    nominated.length === 1 &&
    nominated[0].nominatedBy.length === mafia.length
  ) {
    console.log('PLAYER IS ABOUT TO DIE');
    return GamesModel.findOneAndUpdate(
      { gameId, players: { $elemMatch: { _id: nominated[0]._id } } },
      {
        nominatedPlayer: nominated[0],
      },
      { useFindAndModify: false, new: true, lean: true },
    );
  }
  return updatedGame;
};

export const killPlayer = async (
  playerToDie: Player,
  gameId: string,
): Promise<IUpdateGamesDocument> => {
  const updatedGame = await GamesModel.findOneAndUpdate(
    { gameId },
    {
      lastPlayerKilled: playerToDie,
      $set: { 'stages.mafiaAwake': false, 'stages.detectiveAwake': true },
    },
    { new: true, lean: true, useFindAndModify: false },
  );
  console.log('updated gma ei', updatedGame);
  return updatedGame;
};

export const disconnectPlayerFromGame = async (
  socketId: string,
): Promise<IUpdateGamesDocument> =>
  GamesModel.findOneAndUpdate(
    { players: { $elemMatch: { socketId } } },
    { $set: { 'players.$.connected': false, 'players.$.socketId': null } },
    { new: true, lean: true, useFindAndModify: false },
  );

export const removePlayerFromGame = async (
  socketId: string,
): Promise<IUpdateGamesDocument> =>
  GamesModel.findOneAndUpdate(
    { players: { $elemMatch: { socketId } } },
    { $pull: { players: { socketId } } },
    { new: true, lean: true, useFindAndModify: false },
  );
