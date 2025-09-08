import { IsString, IsOptional, IsNumber, IsUUID, IsBoolean, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";

export enum ClientPriority {
    LOWEST = 'lowest',
    REGULAR = 'regular',
    HIGH = 'high',
}


export class Client {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    product: Product;

    uniqueId: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsNumber()
    messageCount: number;

    @IsEnum(ClientPriority)
    priority: ClientPriority;

    @IsBoolean()
    isGuest: boolean;

    @IsBoolean()
    isTest: boolean;

    @IsOptional()
    lastMessageDate?: Date;

    conversationResolved: Boolean = false;

    ghostedUntil: Date;

    createdAt: Date;

    updatedAt: Date;

}