import { IsString, IsOptional, MaxLength, IsBoolean } from "class-validator";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { Message } from "../../message.entity";

export class GetClientMessagesDto {

    @IsString()
    identifier: string;

    @IsString()
    apiKey: string;

    @IsBoolean()
    inverted = false;

}

//used by super-client, update me here
export type GetClientMessagesReturnDto = FindResponseDto<Message>;