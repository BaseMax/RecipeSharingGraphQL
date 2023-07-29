import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
@ObjectType()
export class User {
  @Field()
  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop( {required : true})
  password: string;

  @Field()
  @Prop()
  name: string;

  @Field()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
