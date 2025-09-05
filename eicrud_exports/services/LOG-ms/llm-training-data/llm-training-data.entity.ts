import { IsString, IsOptional, IsBoolean } from "class-validator";


export class LlmTrainingData {

    @IsString()
    @IsOptional()
    id: string;

    llmInput: string;

    llmOutput: string;

    @IsBoolean()
    isTest: boolean;

    @IsString()
    contextId: string;

    agentVersion: string;

    @IsString()
    agentName: string;

    errorCount: number = 0;

    createdAt: Date;

    updatedAt: Date;
}