import 'reflect-metadata';
import { Service } from 'typedi';
import { IPlayerService } from '../Services/PlayerService';
import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Subscription,
  ObjectType,
  Field
} from 'type-graphql';
import { IPlayerHandler } from '../Handlers/PlayerHandler';

@ObjectType()
export class Player {
  @Field()
  _id?: string;
  @Field()
  socketId: string;
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

@Service()
@Resolver()
export default class PlayerResolver {
  constructor(private readonly playerService: IPlayerService) {}
  @Query(() => Player)
  async list() {
    // this.playerService.list()
  }

}
