import { IsString, IsOptional, IsArray } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";


export class Faq {

    @IsString()
    @IsOptional()
    id: string;

    

    @IsString()
    question: string;

    product: Product;

    @IsString()
    answer: string;

    @IsArray()
    @IsOptional()
    tags: string[];

    createdAt: Date;

    updatedAt: Date;

}