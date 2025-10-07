import { IsString, IsOptional, IsEmail } from "class-validator";


export class WaitingList {

    @IsString()
    @IsOptional()
    id: string;

    @IsEmail()
    email: string;

    createdAt: Date;

    updatedAt: Date;

}