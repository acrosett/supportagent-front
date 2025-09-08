import { IsString, IsOptional } from "class-validator";


export class VerifyCodeDto {

    @IsString()
    code: string;

    @IsString()
    numberId: string;

    @IsString()
    productId: string;

}

//used by super-client, update me here
export type VerifyCodeReturnDto = string;