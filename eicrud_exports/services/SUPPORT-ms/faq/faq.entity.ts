import { IsString, IsOptional, IsArray } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";


export class Faq {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    question: string;

    @IsString()
    product: Product | string;

    @IsString()
    answer: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags: string[];

    @IsOptional()
    embedding?: number[]; 
    
    createdAt: Date;

    updatedAt: Date;

}