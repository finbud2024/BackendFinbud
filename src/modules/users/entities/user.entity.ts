import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Account Data Schema
@Schema()
class AccountData {
  @Prop({ required: true, unique: true, description: 'User email address used as username' })
  username: string;

  @Prop()
  password: string;

  @Prop({ enum: ['admin', 'user'], default: 'user', required: true })
  priviledge: string;

  @Prop()
  securityQuestion: string;

  @Prop()
  securityAnswer: string;
}

// Identity Data Schema
@Schema()
class IdentityData {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  displayName: string;

  @Prop()
  profilePicture: string;
}

// Banking Account Data Schema
@Schema()
class BankingAccountData {
  @Prop({ default: 0 })
  accountBalance: number;

  @Prop({ default: 0 })
  stockValue: number;

  @Prop({ default: 1000 })
  cash: number;
}

// Settings Schema
@Schema()
class Settings {
  @Prop({ default: false })
  darkMode: boolean;
}

// Main User Schema
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: AccountData, required: true })
  accountData: AccountData;

  @Prop({ type: IdentityData })
  identityData: IdentityData;

  @Prop({ type: BankingAccountData })
  bankingAccountData: BankingAccountData;

  @Prop({ type: Settings })
  settings: Settings;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

// Add pre-save hook for password hashing
UserSchema.pre('save', async function (next) {
  try {
    const user = this as UserDocument;

    // Update account balance
    if (user.bankingAccountData) {
      user.bankingAccountData.accountBalance = 
        user.bankingAccountData.cash + user.bankingAccountData.stockValue;
    }

    // Only hash the password if it has been modified
    if (user.isModified('accountData.password') && user.accountData?.password) {
      const salt = await bcrypt.genSalt(10);
      user.accountData.password = await bcrypt.hash(
        user.accountData.password,
        salt,
      );
    }
    next();
  } catch (error) {
    next(error);
  }
}); 