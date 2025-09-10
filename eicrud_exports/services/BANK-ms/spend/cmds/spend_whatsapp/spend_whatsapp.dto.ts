import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";


export class SpendWhatsappDto {

    product: Product;

    @IsOptional()
    @IsBoolean()
    bTest?: boolean;

    @IsNumber()
    msgCount: number;

}

//used by super-client, update me here
export type SpendWhatsappReturnDto = string;