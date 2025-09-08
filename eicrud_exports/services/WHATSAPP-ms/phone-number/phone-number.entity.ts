import { IsString, IsOptional, IsBoolean, IsPhoneNumber } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";

export class PhoneNumber {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsPhoneNumber()
    number: string;

    @IsString()
    @IsOptional()
    name?: string;

    product: Product;

    @IsBoolean()
    isVerified: boolean;

    @IsString()
    @IsOptional()
    verifyCode?: string;

    @IsOptional()
    lastVerifySentDate?: Date;

    createdAt: Date;

    updatedAt: Date;

}