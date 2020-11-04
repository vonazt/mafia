import { Player } from '../repositories/mongoose';
import * as gameRepository from '../repositories';

export const joinGame = gameRepository.joinGame;

export const createGame = gameRepository.createGame

export const addPlayer = gameRepository.addPlayer

export const startGame = async (gameId: string) => {
  const players = await gameRepository.listPlayers(gameId)
  console.log('players are', players)
}

// const roles: string[] = [`civilian`, `mafia`, `inspector`, `guardian angel`] 

const shuffleRoles = (roles: string[]): string[] => {
  for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles
}

export const createRoles = (players: Player[]) => {
  const numberOfPlayers = players.length
  const numberOfMafia = Math.floor(numberOfPlayers / 5)
  const numberOfCivilians = numberOfPlayers - numberOfMafia
  const mafiaRoles = Array.from(Array(numberOfMafia)).map(() => `mafia`)
  const civilianRoles = Array.from(Array(numberOfCivilians)).map(() => `civilian`)
  const combinedRoles = [...mafiaRoles, ...civilianRoles]
  return shuffleRoles(combinedRoles)
  
}
