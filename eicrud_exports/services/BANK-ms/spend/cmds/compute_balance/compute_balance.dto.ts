import { IsObject } from "class-validator";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";


export class ComputeBalanceDto {

    @IsObject()
    product: Product;

}

//used by super-client, update me here
export type ComputeBalanceReturnDto = {
    balance: number;
    lastComputed: Date;
};