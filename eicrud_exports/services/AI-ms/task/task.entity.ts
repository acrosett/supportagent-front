import { IsString, IsOptional } from "class-validator";
import { Spend } from "../../BANK-ms/spend/spend.entity";
import { User } from "../../user/user.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";

export class Task {

    @IsString()
    @IsOptional()
    id: string;

    @IsOptional()
    spend?: Spend;

    initiator: User;

    product: Product;

    createdAt: Date;

    updatedAt: Date;

}