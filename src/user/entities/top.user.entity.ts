import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user.entity";

@ObjectType()
export class TopUser extends User {
  @Field()
  createdAt: Date;
  @Field()
  recipes_count: number;
  @Field()
  _id: string;
}
