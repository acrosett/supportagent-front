import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { PhoneNumber } from "../phone-number/phone-number.entity";
import { Spend } from "../../BANK-ms/spend/spend.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";

export enum WhatsappMessageDirection {
  TO = 'to',
  FROM = 'from'
}

export class WhatsappMessage {

    @IsString()
    @IsOptional()
    id: string;

    product: string | Product;

    @IsString()
    content: string;

    phoneNumber: PhoneNumber;

    @IsEnum(WhatsappMessageDirection)
    direction: WhatsappMessageDirection;

    @IsString()
    @IsOptional()
    messageId?: string;


    @IsOptional()
    metadata?: any;

    @IsOptional()
    spend?: Spend;

    createdAt: Date;

    updatedAt: Date;

}