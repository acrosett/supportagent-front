import { IsString, IsOptional, MinLength, IsNumber, IsBoolean, IsEnum, Min } from "class-validator";
import { User } from "../../user/user.entity";

export class Product {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    owner: User | string;

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsOptional()
    @IsString()
    additionalInstructions: string;

    @IsString()
    @IsOptional()
    webhookUrl?: string;

    @IsString()
    @IsOptional()
    sharedSecret?: string;

    @IsBoolean()
    @IsOptional()
    chatOn: boolean;

    // Start vault properties, do not put class-validator decorators on these,
    // it keeps them from being set through the API
    balance: number;

    lastComputedBalance?: Date;

    subscriptionActive: boolean;

    lastSubscriptionChecked?: Date;

    // Auto top-up configuration
    autoTopUpEnabled: boolean = false;

    @IsOptional()
    @IsNumber()
    maxDepositPerMonth?: number;

    @IsOptional()
    @IsNumber()
    @Min(60)
    autoTopUpAmount?: number;

    @IsNumber()
    @IsOptional()
    notificationUnreadCount: number = 0;

    // Error tracking
    @IsNumber()
    autoTopUpFailureCount: number = 0;

    @IsOptional()
    lastAutoTopUpAttempt?: Date;

    //End Vault properties


    createdAt: Date;

    updatedAt: Date;

}