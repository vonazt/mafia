import {
  GamesModel,
  IGamesDocument,
  IUpdateGamesDocument,
  Player,
} from './mongoose';

export const joinGame = async (gameId: string) => {
  return GamesModel.findOne({ gameId });
};

export const createGame = async (): Promise<string> => {
  const gameId = Math.floor(1000 + Math.random() * 9000).toString();
  const gameToSave = new GamesModel({ gameId });
  await gameToSave.save();
  return gameId;
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
  if (!playerAlreadyInGame)
    return GamesModel.findOneAndUpdate(
      { gameId },
      { $addToSet: { players: { name, socketId } } },
      { new: true, useFindAndModify: false },
    );
  else {
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

export const updatePlayers = async (
  gameId: string,
  players: Player[],
): Promise<IUpdateGamesDocument> => {
  const result = await GamesModel.findOneAndUpdate(
    { gameId },
    { players },
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
  assassin: string,
  gameId: string,
): Promise<IUpdateGamesDocument> => {
  // console.log('player to kill', player);
  // console.log('game id', gameId);
  console.log('assasin is', assassin)
  await GamesModel.findOneAndUpdate(
    {
      gameId,
      players: { $elemMatch: { nominatedBy: { $in: assassin } } },
    },
    { $pull: { 'players.$.nominatedBy': assassin } },
    { new: true, lean: true, useFindAndModify: false },
  );

  const updatedGame = await GamesModel.findOneAndUpdate(
    {
      gameId,
      players: { $elemMatch: { name: player.name } },
    },
    { $addToSet: { 'players.$.nominatedBy': assassin } },
    { new: true, lean: true, useFindAndModify: false },
  );

  console.log('UPDATED GAME IN ASSASSINATE IS', updatedGame.players[0].nominatedBy);
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
  if (nominated.length === 1 && nominated[0].votes === mafia.length) {
    const gameWithDeadPlayer = await GamesModel.findOneAndUpdate(
      { gameId, players: { $elemMatch: { name: nominated[0].name } } },
      {
        $set: { 'players.$.isAlive': false },
        stageComplete: true,
        lastPlayerKilled: nominated[0],
      },
      { useFindAndModify: false, new: true, lean: true },
    );
    return gameWithDeadPlayer;
  }
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
