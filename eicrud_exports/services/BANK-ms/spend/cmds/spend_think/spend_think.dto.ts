import { IsString, IsOptional, IsBoolean } from "class-validator";
import { Think } from "../../spend.entity";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";


export class SpendThinkDto {

    product: Product;

    @IsOptional()
    @IsBoolean()
    bTest?: boolean;

    think: Think;

}

//used by super-client, update me here
export type SpendThinkReturnDto = string;