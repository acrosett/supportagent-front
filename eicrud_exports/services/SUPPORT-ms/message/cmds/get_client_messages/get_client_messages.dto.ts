import { IsString, IsOptional, MaxLength, IsBoolean } from "class-validator";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { Message } from "../../message.entity";

export class GetClientMessagesDto {

    @IsString()
    @MaxLength(100)
    identifier: string;

    @IsString()
    @MaxLength(200)
    apiKey: string;

    @IsBoolean()
    inverted = false;

}

//used by super-client, update me here
export type GetClientMessagesReturnDto = FindResponseDto<Message>;