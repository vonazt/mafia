import 'reflect-metadata';
import { Service, Inject } from 'typedi';
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
import {GAME_SERVICE, UPDATED_GAME} from '../../constants'

@Service()
@Resolver(Game)
export default class GameResolver {
  constructor(
    @Inject(GAME_SERVICE) private readonly gameService: IGameService,
  ) {}
  @Query(() => String)
  healthyGame() {
    return `healthyGame`;
  }
  @Mutation(() => Game)
  async create(@PubSub() pubsub: PubSubEngine) {
    const updatedGame = await this.gameService.create();
    const updatedGamePayload = updatedGame;
    await pubsub.publish(UPDATED_GAME, updatedGamePayload);
    return updatedGame;
  }

  @Mutation(() => Game)
  async join(@Arg(`gameId`) gameId: string, @PubSub() pubsub: PubSubEngine) {
    const updatedGame: LeanGameDocument = await this.gameService.join(gameId);
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }

  @Subscription({
    topics: UPDATED_GAME,
    filter: ({ payload, args }) => payload.gameId === args.gameId,
  })
  updatedGame(
    @Root() updatedGamePayload: Game,
    @Arg(`gameId`) gameId: string,
  ): Game | null {
    // console.log('game id is', gameId);
    // console.log('updated game is', updatedGamePayload)
    return { ...updatedGamePayload };
  }
}
