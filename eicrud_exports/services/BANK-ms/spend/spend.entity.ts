import { IsString, IsOptional } from "class-validator";


export class Spend {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}