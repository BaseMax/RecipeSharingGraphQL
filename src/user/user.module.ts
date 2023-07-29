import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./entities/user.entity";

@Module({
  imports: [MongooseModule.forFeature([{ name: "User", schema: UserSchema }])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
