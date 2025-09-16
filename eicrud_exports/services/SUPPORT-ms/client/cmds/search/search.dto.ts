import { IsString, IsOptional, IsEnum, IsArray, IsIn } from "class-validator";
import { ClientPriority } from "../../client.entity";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { Client } from "../../client.entity";

type FilterValue = 'true' | 'false' | 'both';

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

    @IsIn(['true', 'false', 'both'])
    @IsOptional()
    readStatus?: FilterValue;        // 'true' = read only, 'false' = unread only, 'both' = all
    
    @IsIn(['true', 'false', 'both'])
    @IsOptional()
    resolvedStatus?: FilterValue;    // 'true' = resolved only, 'false' = active only, 'both' = all
    
    @IsIn(['true', 'false', 'both'])
    @IsOptional()
    aiStatus?: FilterValue;          // 'true' = AI enabled only, 'false' = AI disabled only, 'both' = all

    @IsIn(['true', 'false', 'both'])
    @IsOptional()
    archivedStatus?: FilterValue;    // 'true' = archived only, 'false' = active only, 'both' = all

}

//used by super-client, update me here
export type SearchReturnDto = FindResponseDto<Client>;