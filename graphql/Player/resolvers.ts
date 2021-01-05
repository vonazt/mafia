import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { IPlayerService } from '../../Services/PlayerService';
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  PubSub,
  PubSubEngine,
} from 'type-graphql';
import { LeanGameDocument } from '../../DomainObjects/Mongoose/GameDocuments';
import { PlayerInput, Player } from './types';
import { Game } from '../Game/types';

@Service()
@Resolver(Player)
export default class PlayerResolver {
  constructor(
    @Inject(`PLAYER_SERVICE`) private readonly playerService: IPlayerService,
  ) {}
  @Query(() => String)
  healthyPlayer() {
    return `healthyPlayer`;
  }
  @Mutation(() => Game)
  async addPlayer(
    @Arg('gameId') gameId: string,
    @Arg('player') player: PlayerInput,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.add(
      gameId,
      player,
    );
    await pubsub.publish(`NEW_PLAYERS`, updatedGame);
    console.log('UPDATED GAME AFTER ADDING PLAYER', updatedGame);
    return updatedGame;
  }
}
