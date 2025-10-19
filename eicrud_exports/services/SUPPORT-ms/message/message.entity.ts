import { IsString, IsOptional, IsEnum, IsBoolean, IsArray } from "class-validator";
import { Client } from "../client/client.entity";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";
import { Spend } from "../../BANK-ms/spend/spend.entity";
import { AiModelType } from "../../BANK-ms/spend/cmds/shared.utils";

export enum MessageType {
  USER = 'user',
  AI = 'ai',
}

export class Message {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    content: string;

    @IsEnum(MessageType)
    type: MessageType;

    @IsOptional()
    embedding?: number[];

    @IsOptional()
    @IsBoolean()
    fromStaff: boolean = false;

    @IsOptional()
    @IsBoolean()
    fromCache: boolean = false;

    @IsOptional()
    @IsBoolean()
    isHidden: boolean = false;


    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    followUps?: string[] = [];

    client: Client | string;

    product: Product | string;


    aiType: AiModelType;

    @IsOptional()
    @IsString()
    customerCurrentPageUrl?: string;

    createdAt: Date;

    updatedAt: Date;

}