import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { PhoneNumber } from "../phone-number/phone-number.entity";
import { Spend } from "../../BANK-ms/spend/spend.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { ClientPriority } from "../../SUPPORT-ms/client/client.entity";

export enum WhatsappMessageDirection {
  AI = 'ai',
  STAFF = 'staff'
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
    from: WhatsappMessageDirection;

    @IsEnum(ClientPriority)
    clientPriority: ClientPriority;

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