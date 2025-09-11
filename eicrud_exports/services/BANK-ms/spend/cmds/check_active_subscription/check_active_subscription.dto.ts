import { IsObject } from "class-validator";
import { Product } from "../../../../SUPPORT-ms/product/product.entity";


export class CheckActiveSubscriptionDto {

    @IsObject()
    product: Product;

}

//used by super-client, update me here
export type CheckActiveSubscriptionReturnDto = {
    isActive: boolean;
    lastChecked: Date;
};