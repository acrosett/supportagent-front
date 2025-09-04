import { IsString, IsOptional } from "class-validator";


export class EditorAgent {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}