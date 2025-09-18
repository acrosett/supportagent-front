import { IsString, IsNumber, IsObject, Min, Max } from "class-validator";
import { ProductVault } from "../../product-vault.entity";

export class StripeDepositAsyncDto {

    @IsObject()
    vault: ProductVault;

    @IsNumber()
    @Min(60)
    @Max(50000)
    amount: number; // Amount in credits (same as dollars)

}

//used by super-client, update me here
export type StripeDepositAsyncReturnDto = {
    success: boolean;
    paymentIntentId?: string;
    error?: string;
};