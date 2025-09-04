import { IsString, IsOptional, IsDate } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";


export class Event {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    product: Product;

    @IsDate()
    @IsOptional()
    resolutionDate?: Date;

    @IsString()
    @IsOptional()
    resolutionNotes?: string;

    createdAt: Date;

    updatedAt: Date;

}