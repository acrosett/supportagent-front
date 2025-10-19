import { IsString, IsOptional, IsNumber, MaxLength } from "class-validator";


export class VerifyRecaptchaDto {

    @IsString()
    token: string;

    @IsOptional()
    @IsNumber()
    threshold?: number = 0.5;

    @IsOptional()
    @IsString()
    clientIp?: string;

    @IsOptional()
    @IsString()
    expectedAction?: string;

}

export type VerifyRecaptchaReturnDto = number