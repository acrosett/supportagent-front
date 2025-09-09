import { IsString, IsOptional, MinLength, IsNumber, IsBoolean, IsEnum } from "class-validator";
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

    @IsString()
    @IsOptional()
    webhookUrl?: string;

    @IsString()
    @IsOptional()
    sharedSecret?: string;

    @IsBoolean()
    chatOn: boolean;

    // Start vault properties, do not put class-validator decorators on these,
    // it keeps them from being set through the API
    balance: number;

    lastComputedBalance?: Date;

    subscriptionActive: boolean;

    lastSubscriptionChecked?: Date;

    //End Vault properties


    createdAt: Date;

    updatedAt: Date;

}