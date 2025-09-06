import { IsString, IsOptional, MinLength } from "class-validator";
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

    createdAt: Date;

    updatedAt: Date;

}