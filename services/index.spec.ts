import { Player } from '../repositories/mongoose';
import * as gamesService from './index';

const generateRandomString = (): string =>
  Math.random().toString(36).substring(7);

const getPlayers = (numberOfPlayers: number): Player[] =>
  Array.from(Array(numberOfPlayers)).map(() => ({
    name: generateRandomString(),
    socketId: generateRandomString(),
  }));

describe(`mafia distribution`, () => {
  it(`should create one mafia role for every five players`, () => {
    const players = getPlayers(Math.floor(Math.random() * 100));
    const roles = gamesService.createRoles(players);
    const filteredRoles = roles.filter((role) => role === `mafia`);
    expect(filteredRoles).toHaveLength(Math.floor(players.length / 5));
  });
});
