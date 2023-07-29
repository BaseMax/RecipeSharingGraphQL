import { Document } from "mongoose";

export interface UserDocument extends Document {
  readonly email: string;
  readonly name: string;
  readonly password: string;
  readonly createdAt: Date;
}
