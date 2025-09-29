import { IsString, IsOptional, IsNumber, Min } from "class-validator";


export class FreeCredit {

    @IsString()
    @IsOptional()
    id: string;

    remainingCreditsToAward: number = 50; // App-wide remaining free credits to give

    createdAt: Date;

    updatedAt: Date;

}