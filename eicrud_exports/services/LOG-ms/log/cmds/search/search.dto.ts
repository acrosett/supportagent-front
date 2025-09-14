import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from "class-validator";
import { LogType } from "../../log.entity";

export class SearchDto {

    @IsString()
    @IsOptional()
    messageLike?: string;

    @IsEnum(LogType, { each: true })
    @IsArray()
    @IsOptional()
    types?: LogType[];

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

}

export type SearchReturnDto = any;