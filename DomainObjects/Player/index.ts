import { Schema } from 'mongoose';

export type Player = {
  _id?: Schema.Types.ObjectId;
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Player[];
  connected?: boolean;
};

export type NominatedAndAliveAndMafiaPlayers = {
  nominatedPlayers: Player[];
  alivePlayers: Player[];
  mafiaPlayers: Player[];
};
