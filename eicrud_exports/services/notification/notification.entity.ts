import { IsString, IsOptional, IsBoolean } from "class-validator";
import { Product } from "../SUPPORT-ms/product/product.entity";

export class Notification {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    product: Product | string;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsBoolean()
    read: boolean;

    createdAt: Date;

    updatedAt: Date;

}