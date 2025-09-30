import { IsString, IsOptional, IsArray } from "class-validator";
import { FindResponseDto } from '@eicrud/shared/interfaces';
import { Faq } from "../../faq.entity";

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

}

//used by super-client, update me here
export type SearchReturnDto = FindResponseDto<Faq>;