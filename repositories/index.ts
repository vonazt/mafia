import { GamesModel } from './mongoose';

export const joinGame = async (
  socketId: string,
  name: string,
  gameId: number,
) => {
  console.log(`saving player`);

  // const playerCount = GamesModel.find

  // // const player =

  // users[name] = socket.id;
  // console.log('count', count);
  // if (count > 3) {
  //   io.to(users['richard']).emit(`message`, "Hello Alex, how've you been");
  // }
};

export const createGame = async (): Promise<string> => {
  const gameId = Math.floor(Math.random() * 4000).toString();
  const gameToSave = new GamesModel({ gameId });
  await gameToSave.save();
  return gameId;
};
