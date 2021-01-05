import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { IPlayerService } from '../../Services/PlayerService';
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Subscription,
  Root,
  PubSub,
  PubSubEngine,
} from 'type-graphql';
import { Game } from './types';
import { IGameService } from '../../Services/GameService';
import { LeanGameDocument } from '../../DomainObjects/Mongoose/GameDocuments';

@Service()
@Resolver(Game)
export default class GameResolver {
  constructor(
    @Inject(`GAME_SERVICE`) private readonly gameService: IGameService,
  ) {}
  @Query(() => String)
  healthyGame() {
    return `healthyGame`;
  }
  @Mutation(() => Game)
  async create() {
    const updatedGame = await this.gameService.create();
    // const updatedGamePayload = updatedGame;
    // await pubsub.publish(`NEW_PLAYERS`, updatedGamePayload);
    return updatedGame;
  }

  @Mutation(() => Game)
  async join(@Arg(`gameId`) gameId: string, @PubSub() pubsub: PubSubEngine) {
    const updatedGame: LeanGameDocument = await this.gameService.join(gameId);
    await pubsub.publish(`NEW_PLAYERS`, updatedGame);
    return updatedGame;
  }

  @Subscription({
    topics: `NEW_PLAYERS`,
    filter: ({ payload, args }) => {
      console.log('payload is', payload);
      console.log('args are', args);
      return payload.gameId === args.gameId;
    },
  })
  updatedGame(
    @Root() updatedGamePayload: Game,
    @Arg(`gameId`) gameId: string,
  ): Game {
    // console.log('game id is', gameId);
    // console.log('updated game is', updatedGamePayload)
    return { ...updatedGamePayload };
  }
}
