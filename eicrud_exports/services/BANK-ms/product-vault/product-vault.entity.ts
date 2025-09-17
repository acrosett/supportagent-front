import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from "class-validator";
import { Product } from "../../SUPPORT-ms/product/product.entity";

export enum AutoTopUpMethod {
    ACH = 'ach',
    SEPA = 'sepa'
}

export class ProductVault {

    @IsString()
    @IsOptional()
    id: string;

    product: Product | string;

    @IsString()
    stripeCustomerId?: string;

    // Auto top-up configuration
    @IsOptional()
    @IsEnum(AutoTopUpMethod)
    autoTopUpMethod?: AutoTopUpMethod;

    // Payment method IDs from Stripe
    @IsOptional()
    @IsString()
    achPaymentMethodId?: string;

    @IsOptional()
    @IsString()
    sepaPaymentMethodId?: string;

    // Verification and consent tracking
    @IsBoolean()
    bankAccountVerified: boolean = false;

    @IsOptional()
    mandateAcceptedDate?: Date;

    @IsOptional()
    autoTopUpConsentDate?: Date;

    @IsOptional()
    @IsString()
    lastPaymentIntentId?: string;

    createdAt: Date;

    updatedAt: Date;

}