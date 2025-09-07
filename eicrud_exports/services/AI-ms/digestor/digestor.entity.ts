import { IsString, IsOptional } from "class-validator";


export class Digestor {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}