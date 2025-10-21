import { IsString, IsOptional } from "class-validator";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { CustomTool } from "../../custom-tool.entity";

export class SearchDto {

    @IsString()
    @IsOptional()
    text?: string;

}

//used by super-client, update me here
export type SearchReturnDto = FindResponseDto<Partial<CustomTool>>;