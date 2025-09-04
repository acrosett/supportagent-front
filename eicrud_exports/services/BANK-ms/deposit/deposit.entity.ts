import { IsString, IsOptional } from "class-validator";


export class Deposit {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}