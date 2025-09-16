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

    @IsString()
    product: Product | string;

    uniqueId: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsNumber()
    messageCount: number;

    @IsNumber()
    messagesToday: number;

    @IsOptional()
    lastMessageDailyReset?: Date;

    @IsNumber()
    messagesThisWeek: number;

    @IsOptional()
    lastMessageWeeklyReset?: Date;

    @IsEnum(ClientPriority)
    priority: ClientPriority;

    @IsBoolean()
    isGuest: boolean;

    @IsBoolean()
    isTest: boolean;

    @IsOptional()
    lastMessageDate?: Date;

    @IsBoolean()
    conversationResolved: Boolean = false;

    @IsBoolean()
    conversationArchived: Boolean = false;

    ghostedUntil: Date;

    @IsBoolean()
    aiOn: boolean = true;

    @IsBoolean()
    lastMessageReadByStaff: boolean = false;

    createdAt: Date;

    updatedAt: Date;

}