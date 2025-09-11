import { IsNumber, IsObject } from "class-validator";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";

export class CheckAutoTopUpDto {

    @IsObject()
    product: Product;

    @IsNumber()
    balance: number;

}

//used by super-client, update me here
export type CheckAutoTopUpReturnDto = boolean;