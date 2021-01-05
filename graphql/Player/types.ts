import { ObjectType, Field, InputType } from 'type-graphql';

@ObjectType()
export class Player {
  @Field()
  _id?: string;
  @Field()
  name: string;
  @Field()
  role?: string;
  @Field()
  isAlive?: boolean;
  @Field(() => Player)
  nominatedBy?: Player[];
  @Field()
  connected?: boolean;
}

@InputType('PlayerInput')
export class PlayerInput {
  @Field({ nullable: true })
  _id: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  role: string;
  @Field({ nullable: true })
  isAlive: boolean;
  @Field({ nullable: true })
  connected: boolean;
}
