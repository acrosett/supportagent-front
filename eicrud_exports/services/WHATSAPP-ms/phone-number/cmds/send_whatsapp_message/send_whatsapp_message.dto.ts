import { IsString, IsEnum } from "class-validator";
import { ClientPriority } from "../../../../SUPPORT-ms/client/client.entity";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";


export enum WhatsappTemplate {
    VERIFY_CODE = 'verify_code',
    // SIMPLE_UPDATE = 'simple_update',
    CUSTOMER_UPDATE = 'customer_update'
}

export class SendWhatsappMessageDto {

    @IsString()
    message: string;

    @IsEnum(ClientPriority)
    clientPriority?: ClientPriority;

    @IsString()
    destinationNumber?: string;

    @IsString()
    productId: string;

    @IsEnum(WhatsappTemplate)
    template?: WhatsappTemplate;

}

//used by super-client, update me here
export type SendWhatsappMessageReturnDto = string;