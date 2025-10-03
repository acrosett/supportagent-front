import { IsString, IsOptional, MaxLength, IsBoolean } from "class-validator";


export class SendClientMessageDto {

    @IsString()
    @MaxLength(100)
    identifier: string;

    @IsString()
    @MaxLength(200)
    apiKey: string;

    @IsString()
    @MaxLength(2000)
    content: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    customerCurrentPageUrl?: string;

    @IsOptional()
    @IsString()
    recaptchaToken?: string;

    @IsBoolean()
    inverted = false;

}

//used by super-client, update me here
export type SendClientMessageReturnDto = string;