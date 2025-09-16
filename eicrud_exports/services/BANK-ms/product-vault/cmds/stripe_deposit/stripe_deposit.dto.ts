import { IsString, IsOptional, IsNumber, IsEnum, Min } from "class-validator";

export enum CheckoutMode {
    PAYMENT = 'payment',
    SETUP = 'setup'
}

export class StripeDepositDto {

    //MIN 1$
    @IsNumber()
    @Min(100)
    amount: number; // Amount in cents

    @IsString()
    @IsOptional()
    mode?: CheckoutMode = CheckoutMode.PAYMENT;
}

//used by super-client, update me here
export type StripeDepositReturnDto = {
    sessionId: string;
    sessionUrl: string;
};