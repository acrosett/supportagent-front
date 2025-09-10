import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";

export class TrySpendDto {

    product: Product;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsBoolean()
    bTest?: boolean;

}

//used by super-client, update me here
export type TrySpendReturnDto = boolean;