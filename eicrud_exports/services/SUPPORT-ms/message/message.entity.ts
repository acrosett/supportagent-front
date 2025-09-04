import { IsString, IsOptional, IsEnum } from "class-validator";
import { Client } from "../client/client.entity";
import { User } from "../../user/user.entity";

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

    createdAt: Date;

    updatedAt: Date;

}