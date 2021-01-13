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
  @Query(() => Boolean)
  async investigatePlayer(@Arg(`_id`) _id: string) {
    return this.playerService.investigate(_id)
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

  @Mutation(() => Game)
  async rejoinPlayer(
    @Arg('gameId') gameId: string,
    @Arg('player') player: PlayerInput,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.add(
      gameId,
      player,
    );

    await updatedGame.players.map((playerToUpdate) =>
      pubsub.publish(PLAYER_UPDATE, playerToUpdate),
    );
    return updatedGame;
  }

  @Mutation(() => Game)
  async nominatePlayerForAssassination(
    @Arg('playerId') playerId: string,
    @Arg(`mafiaHitmanId`) mafiaHitmanId: string,
    @Arg(`gameId`) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.nominateForAssassination(
      playerId,
      mafiaHitmanId,
      gameId,
    );
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }

  @Mutation(() => Game)
  async confirmAssassination(
    @Arg(`playerKilledId`) playerKilledId: string,
    @Arg(`gameId`) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.confirmAssassination(
      playerKilledId,
      gameId,
    );
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }



  @Subscription({
    topics: PLAYER_UPDATE,
    filter: ({ payload, args }) =>
      payload._id.toString() === args._id.toString(),
  })
  updatedPlayer(
    @Root() updatedPlayer: Player,
    @Arg(`_id`) _id: string,
  ): Player {
    console.log('UPDATING PLAYERS', updatedPlayer.name);

    return { ...updatedPlayer };
  }
}
