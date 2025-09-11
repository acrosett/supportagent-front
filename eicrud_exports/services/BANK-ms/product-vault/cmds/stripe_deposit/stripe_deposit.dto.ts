import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";

export enum CheckoutMode {
    PAYMENT = 'payment',
    SETUP = 'setup'
}

export class StripeDepositDto {

    @IsNumber()
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