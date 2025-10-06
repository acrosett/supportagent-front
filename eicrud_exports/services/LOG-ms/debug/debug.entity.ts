import { IsString, IsOptional } from "class-validator";


export class Debug {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}