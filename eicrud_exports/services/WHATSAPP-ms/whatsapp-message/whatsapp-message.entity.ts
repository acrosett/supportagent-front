import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { PhoneNumber } from "../phone-number/phone-number.entity";
import { Spend } from "../../BANK-ms/spend/spend.entity";

export enum WhatsappMessageDirection {
  TO = 'to',
  FROM = 'from'
}

export class WhatsappMessage {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsString()
    content: string;

    phoneNumber: PhoneNumber;

    @IsEnum(WhatsappMessageDirection)
    direction: WhatsappMessageDirection;

    @IsString()
    @IsOptional()
    messageId?: string;

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