import { IsString, IsOptional, IsArray, IsNumber, Min, Max } from "class-validator";
import { Faq } from "../../faq.entity";


export class VectorSearchDto {

    @IsArray()
    @IsNumber({}, { each: true })
    embedding: number[];

    @IsString()
    productId: string;

    @IsNumber()
    @Min(0)
    @Max(1)
    @IsOptional()
    threshold?: number = 0.7;

    @IsNumber()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 10;

}

//used by super-client, update me here
export type VectorSearchReturnDto = (Partial<Faq> & { score: number })[];