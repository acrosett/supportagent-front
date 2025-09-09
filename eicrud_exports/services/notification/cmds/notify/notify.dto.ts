import { IsString, IsOptional, IsObject } from "class-validator";
import { Product } from "../../../SUPPORT-ms/product/product.entity";
import { ContactConfig } from "../../../WHATSAPP-ms/contact-config/contact-config.entity";

export class NotifyDto {

    @IsObject()
    product: Product;

    @IsString()
    message: string;

    @IsObject()
    @IsOptional()
    contactConfig?: ContactConfig;

}

export interface NotifyReturnDto {
    success: boolean;
    notificationId: string;
}