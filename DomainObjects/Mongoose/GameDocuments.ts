import { Document } from 'mongoose';
import { Player } from '../Player';

export type Stages = {
  intro: boolean;
  mafiaAwake: boolean;
  detectiveAwake: boolean;
  guardianAngelAwake: boolean;
  day: boolean;
  twoNominations: boolean;
  tie: boolean;
  playerLynched: boolean;
};

export interface IGameDocument extends Document {
  players: Player[];
  gameId: string;
  stages: Stages;
  lastPlayerKilled: Player;
  nominatedPlayers: Player[];
}

export type LeanGameDocument = Pick<
  IGameDocument,
  | 'players'
  | 'gameId'
  | 'stages'
  | 'lastPlayerKilled'
  | '_id'
  | 'nominatedPlayers'
>;
