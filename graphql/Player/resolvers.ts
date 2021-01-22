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
import {
  PLAYER_SERVICE,
  UPDATED_GAME,
  PLAYER_UPDATE,
  ID,
  GAME_ID,
  PLAYER,
  PLAYER_ID,
  MAFIA_HITMAN_ID,
  PLAYER_KILLED_ID,
  PLAYER_TO_NOMINATE_ID,
  NOMINATED_BY_ID,
  PLAYER_TO_LYNCH_ID,
} from '../../constants';

@Service()
@Resolver(Player)
export default class PlayerResolver {
  constructor(
    @Inject(PLAYER_SERVICE) private readonly playerService: IPlayerService,
  ) {}
  @Query(() => Boolean)
  async investigatePlayer(@Arg(ID) _id: string) {
    return this.playerService.investigate(_id);
  }

  @Mutation(() => Game)
  async addPlayer(
    @Arg(GAME_ID) gameId: string,
    @Arg(PLAYER) player: PlayerInput,
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
    @Arg(GAME_ID) gameId: string,
    @Arg(PLAYER) player: PlayerInput,
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
    @Arg(PLAYER_ID) playerId: string,
    @Arg(MAFIA_HITMAN_ID) mafiaHitmanId: string,
    @Arg(GAME_ID) gameId: string,
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
    @Arg(PLAYER_KILLED_ID) playerKilledId: string,
    @Arg(GAME_ID) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.confirmAssassination(
      playerKilledId,
      gameId,
    );
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }

  @Mutation(() => Boolean)
  async protectPlayer(@Arg(ID) _id: string, @Arg(GAME_ID) gameId: string) {
    return this.playerService.protect(_id, gameId);
  }

  @Mutation(() => Game)
  async nominatePlayer(
    @Arg(PLAYER_TO_NOMINATE_ID) playerToNominateId: string,
    @Arg(NOMINATED_BY_ID) nominatedById: string,
    @Arg(GAME_ID) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.nominate(
      playerToNominateId,
      nominatedById,
      gameId,
    );
    await pubsub.publish(UPDATED_GAME, updatedGame);
    return updatedGame;
  }

  @Mutation(() => Game)
  async lynchPlayer(
    @Arg(PLAYER_TO_LYNCH_ID) playerToLynchId: string,
    @Arg(NOMINATED_BY_ID) nominatedById: string,
    @Arg(GAME_ID) gameId: string,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const updatedGame: LeanGameDocument = await this.playerService.lynch(
      playerToLynchId,
      nominatedById,
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
  updatedPlayer(@Root() updatedPlayer: Player, @Arg(ID) _id: string): Player {
    console.log('UPDATING PLAYERS', updatedPlayer.name);

    return { ...updatedPlayer };
  }
}
