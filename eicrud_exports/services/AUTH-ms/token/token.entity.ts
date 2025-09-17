import { IsString, IsOptional, IsDate } from "class-validator";
import { User } from "../../user/user.entity";


export class Token {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    token: string;

    @IsDate()
    expiresAt?: Date;

    user: User;

    createdAt: Date;

    updatedAt: Date;

}