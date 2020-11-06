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
  const { players } = await GamesModel.findOne({ gameId }, null, {lean: true});
  return players;
};