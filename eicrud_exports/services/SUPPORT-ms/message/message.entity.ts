import { IsString, IsOptional, IsEnum, IsBoolean } from "class-validator";
import { Client } from "../client/client.entity";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";
import { Spend } from "../../BANK-ms/spend/spend.entity";

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
    @IsBoolean()
    fromStaff: boolean = false;

    @IsOptional()
    @IsBoolean()
    isHidden: boolean = false;

    client: Client;

    product: Product | string;

    @IsOptional()
    metadata?: any;

    createdAt: Date;

    updatedAt: Date;

}