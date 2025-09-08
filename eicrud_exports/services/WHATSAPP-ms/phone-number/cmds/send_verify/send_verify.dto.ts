import { IsString, IsOptional, IsPhoneNumber } from "class-validator";


export class SendVerifyDto {

    @IsPhoneNumber()
    number: string;

    @IsString()
    productId: string;

}

//used by super-client, update me here
export type SendVerifyReturnDto = string;