import { IsString, IsOptional, IsEnum } from "class-validator";
import { Client } from "../client/client.entity";
import { User } from "../../user/user.entity";
import { Spend } from "../../BANK-ms/spend/spend.entity";

export enum MessageType {
  USER = 'user',
  AI = 'ai',
}

export class Message {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsString()
    content: string;

    @IsEnum(MessageType)
    type: MessageType;

    client: Client;

    @IsString()
    @IsOptional()
    sessionId?: string;

    @IsOptional()
    metadata?: any;

    @IsOptional()
    spend?: Spend;

    createdAt: Date;

    updatedAt: Date;

}