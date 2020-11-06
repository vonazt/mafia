import { GamesModel, IGamesDocument, Player } from './mongoose';

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
  return GamesModel.findOneAndUpdate(
    { gameId },
    { $addToSet: { players: { name, socketId } } },
    { new: true, useFindAndModify: false },
  );
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
): Promise<IGamesDocument> => {
  return GamesModel.updateOne({ gameId }, players);
};

export const disconnectPlayerFromGame = async (
  socketId: string,
): Promise<void> => {
  const result = await GamesModel.updateOne(
    { players: { $elemMatch: { socketId } } },
    { $set: { 'players.$.connected': false, 'players.$.socketId': null } },
    { new: true, lean: true },
  );
  console.log('result is', result);
};

export const removePlayerFromGame = async (socketId: string): Promise<void> =>
  GamesModel.updateOne(
    { players: { $elemMatch: { socketId } } },
    { $pull: { players: { socketId } } },
    { new: true, lean: true },
  );
