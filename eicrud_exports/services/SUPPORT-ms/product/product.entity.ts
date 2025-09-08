import { IsString, IsOptional, MinLength, IsNumber, IsBoolean } from "class-validator";
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

    @IsNumber()
    @IsOptional()
    balance: number;

    @IsOptional()
    lastComputedBalance?: Date;

    @IsBoolean()
    chatOn: boolean;

    @IsBoolean()
    subscriptionActive: boolean;

    @IsOptional()
    lastSubscriptionChecked?: Date;

    createdAt: Date;

    updatedAt: Date;

}