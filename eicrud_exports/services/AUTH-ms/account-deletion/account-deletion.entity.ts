import { IsString, IsOptional } from "class-validator";

export class AccountDeletion {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    deletedUserId: string | ObjectId;

    @IsString()
    hashedEmail: string;

    @IsOptional()
    acceptedEulaDate?: Date;

    @IsString()
    @IsOptional()
    stripeCustomerId?: string;

    @IsString()
    productId: string | ObjectId;

    @IsOptional()
    errors?: string[];

    createdAt: Date;

    updatedAt: Date;

}