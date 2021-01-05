import { ObjectType, Field } from 'type-graphql';
import { Player } from '../Player/types';

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
export class Game {
  @Field(() => [Player], { nullable: `items` })
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
