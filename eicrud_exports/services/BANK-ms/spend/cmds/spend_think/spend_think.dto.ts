import { IsString, IsOptional, IsBoolean } from "class-validator";
import { Think, Spend } from "../../spend.entity";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";

// Type that forces think to be defined on Spend
export type SpendWithThink = Omit<Spend, 'think'> & {
    think: Think;
};

export class SpendThinkDto {

    product: Product;

    bTest?: boolean;

    spend: SpendWithThink;

}

//used by super-client, update me here
export type SpendThinkReturnDto = string;