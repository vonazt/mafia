import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { IPlayerService } from '../../Services/PlayerService';
import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Subscription,
  ObjectType,
  Field,
  Root,
  PubSub,
  PubSubEngine,
  Publisher,
} from 'type-graphql';
import { Game } from './types';
import { IGameService } from '../../Services/GameService';
import { Player } from '../PlayerResolver';
import { LeanGameDocument } from '../../DomainObjects/Mongoose/GameDocuments';

@Service()
@Resolver(Game)
export default class PlayerResolver {
  constructor(
    @Inject(`GAME_SERVICE`) private readonly gameService: IGameService,
  ) {}
  @Query(() => String)
  healthy() {
    return `healthy`;
  }
  @Mutation(() => Game)
  async create(@PubSub() pubsub: PubSubEngine) {
    const updatedGame = await this.gameService.create();
    const updatedGamePayload = updatedGame.players;
    await pubsub.publish(`NEW_PLAYERS`, updatedGamePayload);
    return updatedGame;
  }

  @Mutation(() => Game)
  async join(@Arg(`gameId`) gameId: string, @PubSub() pubsub: PubSubEngine) {
    const updatedGame: LeanGameDocument = await this.gameService.join(gameId);
    const updatedGamePayload = updatedGame.players;
    await pubsub.publish(`NEW_PLAYERS`, updatedGamePayload);
    return updatedGame;
  }

  @Subscription({ topics: `NEW_PLAYERS` })
  updatedGame(
    @Root() updatedGamePayload: Game,
    @Arg(`gameId`) gameId: string,
  ): Game {
    console.log('game id is', gameId);
    return { ...updatedGamePayload };
  }
}
