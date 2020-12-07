import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { IPlayerService } from '../Services/PlayerService';
import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Subscription,
  ObjectType,
  Field,
} from 'type-graphql';
import { Player } from './PlayerResolver';
import { IGameService } from '../Services/GameService';

@ObjectType()
class Stages {
  @Field()
  intro: boolean;
  @Field()
  mafiaAwake: boolean;
  @Field()
  detectiveAwake: boolean;
  @Field()
  guardianAngelAwake: boolean;
  @Field()
  day: boolean;
  @Field()
  twoNominations: boolean;
  @Field()
  tie: boolean;
  @Field()
  playerLynched: boolean;
}

@ObjectType()
class Game {
  @Field(() => Player)
  players: Player[];
  @Field()
  gameId: string;
  @Field(() => Stages)
  stages: Stages;
  @Field(() => Player)
  lastPlayerKilled: Player;
  @Field(() => Player)
  nominatedPlayers: Player[];
}

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
  async create() {
    return this.gameService.create();
  }
}
