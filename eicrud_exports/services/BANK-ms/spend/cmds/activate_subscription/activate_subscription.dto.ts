import { IsString } from "class-validator";


export class ActivateSubscriptionDto {

    @IsString()
    productId: string;

}

export interface ActivateSubscriptionReturnDto {
    // Empty interface - action throws on error, no return on success
}