import { IsString, IsOptional, IsNumber, MaxLength } from "class-validator";


export class VerifyRecaptchaDto {

    @IsString()
    @MaxLength(1000)
    token: string;

    @IsOptional()
    @IsNumber()
    threshold?: number = 0.5;

    @IsOptional()
    @IsString()
    clientIp?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    expectedAction?: string;

}

export interface VerifyRecaptchaReturnDto {
    valid: boolean;
    score: number;
    rateLimited?: boolean;
    action?: string;
    actionMatched?: boolean;
}