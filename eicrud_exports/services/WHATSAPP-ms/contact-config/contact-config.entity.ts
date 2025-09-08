import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from "class-validator";
import { ClientPriority } from "../../SUPPORT-ms/client/client.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { PhoneNumber } from "../phone-number/phone-number.entity";

export enum AIType {
    FAST = 'fast',
    SMART = 'smart'
}

export class ContactConfig {

    @IsString()
    @IsOptional()
    id: string;

    @IsEnum(ClientPriority)
    clientPriority: ClientPriority;
    
    @IsOptional()
    @IsString()
    phoneNumber?: PhoneNumber | string;

    @IsBoolean()
    contactForDocumentationUpdate: boolean = true;

    @IsBoolean()
    contactForIssues: boolean = true;

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

    @IsEnum(AIType)
    clientFacingAiType: AIType = AIType.FAST;

    @IsEnum(AIType)
    staffFacingAiType: AIType = AIType.FAST;

    createdAt: Date;

    updatedAt: Date;

}