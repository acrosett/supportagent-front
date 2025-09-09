import { IsString, IsOptional, IsBoolean } from "class-validator";
import { Product } from "../SUPPORT-ms/product/product.entity";

export class Notification {

    @IsString()
    @IsOptional()
    id: string;

    product: Product | string;

    @IsString()
    message: string;

    @IsBoolean()
    read: boolean;

    createdAt: Date;

    updatedAt: Date;

}