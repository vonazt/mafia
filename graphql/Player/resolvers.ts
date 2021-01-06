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
  Subscription,
  Root,
} from 'type-graphql';
import { LeanGameDocument } from '../../DomainObjects/Mongoose/GameDocuments';
import { PlayerInput, Player } from './types';
import { Game } from '../Game/types';
import { PLAYER_SERVICE, UPDATED_GAME, PLAYER_UPDATE } from '../../constants';

@Service()
@Resolver(Player)
export default class PlayerResolver {
  constructor(
    @Inject(PLAYER_SERVICE) private readonly playerService: IPlayerService,
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
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }

  @Subscription({
    topics: PLAYER_UPDATE,
    filter: ({ payload, args }) => payload._id.toString() === args._id,
  })
  updatedPlayer(
    @Root() updatedPlayer: Player,
    @Arg(`_id`) _id: string,
  ): Player {
    return { ...updatedPlayer };
  }
}
