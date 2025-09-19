import { IsString, IsOptional, MinLength, IsNumber, IsBoolean, IsEnum, Min } from "class-validator";
import { User } from "../../user/user.entity";

export class NotificationSubConfig {

    @IsBoolean()
    @IsOptional()
    bWhatsapp: boolean = false;

    @IsBoolean()
    @IsOptional()
    bEmail: boolean = false;

}

export class NotificationConfig {

    @IsNumber()
    @Min(0)
    @IsOptional()
    notificationUnreadCount: number = 0;

    @IsBoolean()
    @IsOptional()
    promotionalEmails: boolean = true;

    @IsOptional()
    exceededQuota: NotificationSubConfig = new NotificationSubConfig();

    @IsOptional()
    lowBalance: NotificationSubConfig = new NotificationSubConfig();
 
    @IsOptional()
    newIssues: NotificationSubConfig = new NotificationSubConfig();

}

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

    @IsOptional()
    notificationConfig: NotificationConfig = new NotificationConfig();

    // Error tracking
    @IsNumber()
    autoTopUpFailureCount: number = 0;

    @IsOptional()
    lastAutoTopUpAttempt?: Date;

    //End Vault properties

    @IsOptional()
    flaggedForDeletion?: Date;


    accountDeleteNotifSent: boolean = false;

    createdAt: Date;

    updatedAt: Date;

}