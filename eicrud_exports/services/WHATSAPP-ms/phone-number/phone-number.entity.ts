import { IsString, IsOptional, IsBoolean } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";


export class PhoneNumber {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsString()
    number: string;

    @IsString()
    @IsOptional()
    name?: string;

    product: Product;

    @IsBoolean()
    isEmergency: boolean;

    @IsBoolean()
    isDocumentation: boolean;

    @IsBoolean()
    isDailySupport: boolean;

    createdAt: Date;

    updatedAt: Date;

}