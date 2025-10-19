import { IsString, IsOptional, IsBoolean } from "class-validator";


export class SendClientMessageDto {

    @IsString()
    identifier: string;

    @IsString()
    apiKey: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    customerCurrentPageUrl?: string;

    @IsOptional()
    @IsString()
    recaptchaToken?: string;

    @IsBoolean()
    inverted = false;

}

//used by super-client, update me here
export type SendClientMessageReturnDto = boolean;