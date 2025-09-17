import { IsString, IsOptional, IsArray, IsIn, IsEnum } from "class-validator";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { Issue, IssueStatus } from "../../issue.entity";

type FilterValue = 'true' | 'false' | 'both';

export class SearchDto {

    @IsString()
    @IsOptional()
    text?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    product: string;

    @IsEnum(IssueStatus, { each: true })
    @IsArray()
    @IsOptional()
    statuses?: IssueStatus[];

    @IsIn(['true', 'false', 'both'])
    @IsOptional()
    archivedStatus?: FilterValue;    // 'true' = archived only, 'false' = active only, 'both' = all

}

//used by super-client, update me here
export type SearchReturnDto = FindResponseDto<Issue>;