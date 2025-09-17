import { IsString, IsOptional } from "class-validator";
import { Product } from "../product/product.entity";


export class IssueTag {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    name: string;

    @IsString()
    color: string;

    @IsString()
    product: Product | string;

    createdAt: Date;

    updatedAt: Date;

}