import { GamesModel } from './mongoose';

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
) => {
  return GamesModel.findOneAndUpdate(
    { gameId },
    { $addToSet: { players: { name, socketId } }, $inc: { playerCount: 1 } },
    { new: true, useFindAndModify: false },
  );
};
