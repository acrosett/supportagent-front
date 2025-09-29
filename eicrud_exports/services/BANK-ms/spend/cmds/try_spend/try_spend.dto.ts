import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";
import { Spend } from "../../spend.entity";

export class TrySpendDto {

    product: Product;

    bTest?: boolean;

    spend: Partial<Spend>;

}

//used by super-client, update me here
export type TrySpendReturnDto = boolean;