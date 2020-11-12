import { Player } from '../repositories/mongoose';
import * as gameRepository from '../repositories';

export const joinGame = gameRepository.joinGame;

export const createGame = gameRepository.createGame;

export const addPlayer = gameRepository.addPlayer;

export const startGame = async (gameId: string): Promise<Player[]> => {
  const players: Player[] = await gameRepository.listPlayers(gameId);
  const roles: string[] = createRoles(players);
  const playersWithAssignedRoles = players.map((player: Player, index: number) => ({
    ...player,
    role: roles[index],
  }));
  await gameRepository.updatePlayers(gameId, playersWithAssignedRoles)
  return playersWithAssignedRoles
};

const shuffleRoles = (roles: string[]): string[] => {
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles;
};

export const createRoles = (players: Player[]): string[] => {
  const numberOfPlayers = players.length;
  const numberOfMafia = Math.floor(numberOfPlayers / 5);
  const numberOfDetectives = Math.ceil(numberOfMafia / 3);
  const numberOfGuardianAngels = Math.floor(numberOfPlayers / 10);
  const numberOfCivilians =
    numberOfPlayers -
    numberOfMafia -
    numberOfDetectives -
    numberOfGuardianAngels;
  const mafiaRoles = Array.from(Array(numberOfMafia)).map(() => `mafia`);
  const detectiveRoles = Array.from(Array(numberOfDetectives)).map(
    () => `detective`,
  );
  const guardianAngelRoles = Array.from(Array(numberOfGuardianAngels)).map(
    () => `guardianAngel`,
  );
  const civilianRoles = Array.from(Array(numberOfCivilians)).map(
    () => `civilian`,
  );
  const combinedRoles = [
    ...mafiaRoles,
    ...civilianRoles,
    ...detectiveRoles,
    ...guardianAngelRoles,
  ];
  return shuffleRoles(combinedRoles);
};

export const assassinatePlayer = gameRepository.assassinatePlayer

export const disconnectPlayerFromGame = gameRepository.disconnectPlayerFromGame

export const removePlayerFromGame = gameRepository.removePlayerFromGame
