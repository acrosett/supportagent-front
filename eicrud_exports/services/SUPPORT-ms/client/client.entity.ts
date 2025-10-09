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

    @IsNumber()
    messageCount: number;

    @IsNumber()
    messagesToday: number;

    // Total tokens used by this client today
    @IsNumber()
    tokenCountToday: number;

    @IsOptional()
    lastMessageDailyReset?: Date;

    @IsNumber()
    messagesThisWeek: number;

    // Total tokens used by this client this week
    @IsNumber()
    tokenCountThisWeek: number;

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

    
    @IsBoolean()
    nameChangedByAI: Boolean = false;

    ghostedUntil: Date;

    @IsBoolean()
    aiOn: boolean = true;

    @IsBoolean()
    lastMessageReadByStaff: boolean = false;

    @IsBoolean()
    @IsOptional()
    anonymized: boolean;

    createdAt: Date;

    updatedAt: Date;

}