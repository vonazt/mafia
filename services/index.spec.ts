import { Player } from '../repositories/mongoose';
import * as gamesService from './index';

type Roles = {
  mafia: string[];
  detective: string[];
  civilian: string[];
  guardianAngel: string[];
};

const generateRandomString = (): string =>
  Math.random().toString(36).substring(7);

const getPlayers = (numberOfPlayers: number): Player[] =>
  Array.from(Array(numberOfPlayers)).map(() => ({
    name: generateRandomString(),
    socketId: generateRandomString(),
    connected: true
  }));

const getAllRoles = (roles: string[]): Roles =>
  roles.reduce(
    (rolesAcc, currRole) => ({
      ...rolesAcc,
      [currRole]: [...rolesAcc[currRole], currRole],
    }),
    { mafia: [], detective: [], civilian: [], guardianAngel: [] },
  );

describe(`role distribution`, () => {
  it(`should create one mafia, one detective, five civilians and no guardian angel for min num of players`, () => {
    const players = getPlayers(7);
    const roles = gamesService.createRoles(players);
    const { mafia, detective, civilian, guardianAngel } = getAllRoles(roles);
    expect(mafia).toHaveLength(1);
    expect(detective).toHaveLength(1);
    expect(guardianAngel).toHaveLength(0);
    expect(civilian).toHaveLength(5);
  });
  it(`should create one mafia role for every five players`, () => {
    const players = getPlayers(Math.floor(Math.random() * 100));
    const roles = gamesService.createRoles(players);
    const numberOfMafia = roles.filter((role) => role === `mafia`);
    expect(numberOfMafia).toHaveLength(Math.floor(players.length / 5));
  });
  it(`should create one detective for every three mafia`, () => {
    const players = getPlayers(Math.floor(Math.random() * 100));
    const roles = gamesService.createRoles(players);
    const { mafia, detective } = getAllRoles(roles);
    expect(detective).toHaveLength(Math.ceil(mafia.length / 3));
  });
  it(`should create one guardian angel for every 10 players`, () => {
    const players = getPlayers(Math.floor(Math.random() * 100));
    const roles = gamesService.createRoles(players);
    const numberOfGuardianAngels = roles.filter(
      (role) => role === `guardianAngel`,
    );
    expect(numberOfGuardianAngels).toHaveLength(Math.floor(players.length / 10));
  });
  it(`should create the right number of roles for up to 100 players`, () => {
    const players = getPlayers(Math.floor(Math.random() * 100));
    const roles = gamesService.createRoles(players);
    const { mafia, detective, civilian, guardianAngel } = getAllRoles(roles);
    expect(mafia).toHaveLength(Math.floor(players.length / 5));
    expect(detective).toHaveLength(Math.ceil(mafia.length / 3));
    expect(guardianAngel).toHaveLength(Math.floor(players.length / 10));
    expect(civilian).toHaveLength(players.length - mafia.length - detective.length - guardianAngel.length);
  })
});
