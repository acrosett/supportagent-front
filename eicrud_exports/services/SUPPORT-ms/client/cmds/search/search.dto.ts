import { IsString, IsOptional, IsEnum, IsArray } from "class-validator";
import { ClientPriority } from "../../client.entity";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { Client } from "../../client.entity";

export class SearchDto {

    @IsString()
    @IsOptional()
    text?: string;

    @IsEnum(ClientPriority, { each: true })
    @IsArray()
    @IsOptional()
    priorities?: ClientPriority[];

    @IsString()
    product: string;

}

//used by super-client, update me here
export type SearchReturnDto = FindResponseDto<Client>;