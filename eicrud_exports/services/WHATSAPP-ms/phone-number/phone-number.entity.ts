import { IsString, IsOptional, IsBoolean, IsPhoneNumber } from "class-validator";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { ClientPriority } from "../../SUPPORT-ms/client/client.entity";

export class PhoneNumber {

    @IsString()
    @IsOptional()
    id: string;

    @IsPhoneNumber()
    number: string;

    @IsString()
    @IsOptional()
    name?: string;

    product: Product | string;

    @IsBoolean()
    isVerified: boolean;

    @IsString()
    @IsOptional()
    verifyCode?: string;

    @IsOptional()
    lastVerifySentDate?: Date;

    // Map of client priority to the last date a message was sent
    @IsOptional()
    lastMessageNewConvo?: Partial<Record<ClientPriority, Date>>;

    createdAt: Date;

    updatedAt: Date;

}