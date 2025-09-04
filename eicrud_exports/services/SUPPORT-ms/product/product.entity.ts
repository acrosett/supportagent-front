import { IsString, IsOptional } from "class-validator";
import { User } from "../../user/user.entity";


export class Product {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    createdAt: Date;

    updatedAt: Date;

}