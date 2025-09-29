import { IsString, IsOptional, IsObject, IsEnum } from "class-validator";
import { Product } from "../../../SUPPORT-ms/product/product.entity";
import { ContactConfig } from "../../../WHATSAPP-ms/contact-config/contact-config.entity";
import { ClientPriority } from "../../../SUPPORT-ms/client/client.entity";

export enum NotificationType {
    SYSTEM = 'SYSTEM',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    NEW_ISSUE = 'NEW_ISSUE',
    LOW_BALANCE = 'LOW_BALANCE'
}

export class NotifyDto {

    @IsObject()
    product: Product;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationType)
    notificationType: NotificationType;

    @IsObject()
    @IsOptional()
    clientPriority?: ClientPriority;

}

export interface NotifyReturnDto {
    success: boolean;
    notificationId: string;
}