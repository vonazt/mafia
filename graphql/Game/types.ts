import { ObjectType, Field } from 'type-graphql';
import { Player } from '../Player/types';

@ObjectType()
export class Game {
  @Field(() => [Player], { nullable: `items` })
  players: Player[];
  @Field()
  gameId: string;
  @Field()
  stage: string;
  @Field(() => Player)
  lastPlayerKilled: Player;
  @Field(() => Player)
  nominatedPlayers: Player[];
}
