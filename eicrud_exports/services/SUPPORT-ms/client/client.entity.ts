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

    @IsString()
    product: Product | string;

    @IsString()
    uniqueId: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    messageCount: number = 0;

    messagesToday: number = 0;

    // Total tokens used by this client today
    tokenCountToday: number = 0;

    @IsOptional()
    lastMessageDailyReset?: Date;

    messagesThisWeek: number = 0;

    // Total tokens used by this client this week
    tokenCountThisWeek: number = 0;

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
    @IsOptional()
    conversationResolved: Boolean = false;

    @IsBoolean()
    @IsOptional()
    conversationArchived: Boolean = false;

    
    @IsBoolean()
    @IsOptional()
    nameChangedByAI: Boolean = false;

    ghostedUntil: Date;

    @IsBoolean()
    aiOn: boolean = true;

    @IsBoolean()
    lastMessageReadByStaff: boolean = false;

    @IsBoolean()
    @IsOptional()
    anonymized: boolean = false;

    createdAt: Date;

    updatedAt: Date;

}