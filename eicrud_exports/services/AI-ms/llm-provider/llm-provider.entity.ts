import { IsString, IsOptional } from "class-validator";


export class LlmProvider {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}