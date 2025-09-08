import { IsString, IsOptional, IsNumber } from "class-validator";
import { Product } from "../../SUPPORT-ms/product/product.entity";


export class Deposit {

    @IsString()
    @IsOptional()
    id: string;

    @IsNumber()
    amount: number;

    product: Product | string;

    createdAt: Date;

    updatedAt: Date;

}