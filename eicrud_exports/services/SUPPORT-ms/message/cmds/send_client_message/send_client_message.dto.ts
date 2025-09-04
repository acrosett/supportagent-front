import { IsString, IsOptional } from "class-validator";


export class SendClientMessageDto {

    @IsString()
    @IsOptional()
    myArg: string;

}

//used by super-client, update me here
export type SendClientMessageReturnDto = string;