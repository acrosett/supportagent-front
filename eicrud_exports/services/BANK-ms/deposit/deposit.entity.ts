import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from "class-validator";
import { Product } from "../../SUPPORT-ms/product/product.entity";

export enum DepositStatus {
    COMPLETED = 'completed',
    REFUNDED = 'refunded',
    DISPUTED = 'disputed'
}

export enum DepositSource {
    STRIPE_CARD = 'stripe_card',
    STRIPE_SEPA = 'stripe_sepa',
    STRIPE_ACH = 'stripe_ach',
    MANUAL = 'manual',
    ADMIN = 'admin'
}

export class Deposit {

    @IsString()
    @IsOptional()
    id: string;

    @IsNumber()
    amount: number; // Amount in credits (same as dollars)

    @IsString()
    currency: string = 'USD'; // Currency code

    @IsBoolean()
    isAutoTopUp: boolean;

    @IsEnum(DepositStatus)
    status: DepositStatus;

    @IsEnum(DepositSource)
    source: DepositSource;

    product: Product | string;

    @IsString()
    userId: string;

    // Stripe-related fields for refunds, disputes, etc.
    @IsOptional()
    @IsString()
    stripePaymentIntentId?: string;

    @IsOptional()
    @IsString()
    stripeChargeId?: string;

    @IsOptional()
    @IsString()
    stripeCustomerId?: string;

    @IsOptional()
    @IsString()
    stripeSessionId?: string; // For checkout sessions

    @IsOptional()
    @IsString()
    stripePaymentMethodId?: string;

    // Refund tracking
    @IsOptional()
    @IsString()
    stripeRefundId?: string;

    @IsOptional()
    @IsNumber()
    refundedAmount?: number;

    @IsOptional()
    refundedAt?: Date;

    // Dispute tracking
    @IsOptional()
    @IsString()
    stripeDisputeId?: string;

    @IsOptional()
    disputedAt?: Date;

    // Additional metadata
    @IsOptional()
    @IsString()
    failureReason?: string;

    @IsOptional()
    metadata?: any; // JSON field for additional data

    createdAt: Date;

    updatedAt: Date;

}