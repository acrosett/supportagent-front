import { IsString, IsOptional, IsBoolean, MinLength, Matches } from "class-validator";
import { Product } from "../product/product.entity";

export class Domain {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @MinLength(1)
    @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/, {
        message: 'Domain must be a valid domain name.'
    })
    domain: string;

    @IsBoolean()
    @IsOptional()
    isVerified: boolean = false;

    randomString?: string;

    @IsString()
    product: Product | string;

    createdAt: Date;

    updatedAt: Date;

}