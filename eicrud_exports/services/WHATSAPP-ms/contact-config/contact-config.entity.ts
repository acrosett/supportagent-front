import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, Min, Max } from "class-validator";
import { ClientPriority } from "../../SUPPORT-ms/client/client.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { PhoneNumber } from "../phone-number/phone-number.entity";
import { AiModelType } from "../../BANK-ms/spend/cmds/shared.utils";


export class ContactConfig {

    @IsString()
    @IsOptional()
    id: string;

    @IsEnum(ClientPriority)
    clientPriority: ClientPriority;
    
    @IsOptional()
    @IsString()
    phoneNumber?: PhoneNumber | string;

    
    @IsEnum(AiModelType)
    clientFacingAiType: AiModelType = AiModelType.FAST;

    @IsEnum(AiModelType)
    staffFacingAiType: AiModelType = AiModelType.FAST;

    @IsBoolean()
    contactForDocumentationUpdate: boolean = true;

    @IsBoolean()
    contactForIssues: boolean = true;

    @IsBoolean()
    tellClientsToLogin: boolean = false;

    @IsString()
    product: Product | string;;

    @IsNumber()
    MaxMessagesPerWeekGlobal: number = 2000;

    @IsNumber()
    MaxMessagesPerDayGlobal: number = 500;

    @IsNumber()
    MaxMessagesPerWeekPerUser: number = 200;

    @IsNumber()
    MaxMessagesPerDayPerUser: number = 80;

    @IsNumber()
    messageCountToday: number;

    // Total tokens counted globally today for this product/priority
    @IsNumber()
    tokenCountToday: number;

    @IsOptional()
    lastMessageDailyReset?: Date;

    @IsNumber()
    messageCountThisWeek: number;

    // Total tokens counted globally this week for this product/priority
    @IsNumber()
    tokenCountThisWeek: number;

    @IsOptional()
    lastMessageWeeklyReset?: Date;

    @IsBoolean()
    hasBeenNotifiedDailyGlobal: boolean;

    @IsBoolean()
    hasBeenNotifiedWeeklyGlobal: boolean;


    // @IsNumber()
    // @Min(12)
    // @Max(20)
    // maxHistoryPages: number = 18;

    createdAt: Date;

    updatedAt: Date;

}