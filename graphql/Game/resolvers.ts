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
import { GAME_SERVICE, PLAYER_UPDATE, UPDATED_GAME } from '../../constants';

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
  async createGame(@PubSub() pubsub: PubSubEngine) {
    const updatedGame = await this.gameService.create();
    const updatedGamePayload = updatedGame;
    await pubsub.publish(UPDATED_GAME, updatedGamePayload);
    return updatedGame;
  }

  @Mutation(() => Game)
  async joinGame(
    @Arg(`gameId`) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.gameService.join(gameId);
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }

  @Mutation(() => Game)
  async startGame(
    @Arg(`gameId`) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.gameService.start(gameId);
    await Promise.all([
      updatedGame.players.map((player) =>
        pubsub.publish(PLAYER_UPDATE, player),
      ),
      pubsub.publish(UPDATED_GAME, updatedGame),
    ]);

    return updatedGame;
  }

  @Mutation(() => Game)
  async endDetectiveTurn(@Arg(`gameId`) gameId: string, @PubSub() pubsub: PubSubEngine,) {
    const updatedGame: LeanGameDocument = await this.gameService.endDetectiveTurn(gameId)
    await pubsub.publish(UPDATED_GAME, updatedGame)
    return updatedGame
  }

  @Subscription({
    topics: UPDATED_GAME,
    filter: ({ payload, args }) => payload.gameId === args.gameId,
  })
  updatedGame(
    @Root() updatedGamePayload: Game,
    @Arg(`gameId`) gameId: string,
  ): Game | null {
    return { ...updatedGamePayload };
  }
}
