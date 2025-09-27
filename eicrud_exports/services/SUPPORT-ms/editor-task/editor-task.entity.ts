import { IsString, IsOptional, IsEnum } from "class-validator";
import { Product } from "../product/product.entity";

export enum EditorTaskInitiator {
    STAFF_AGENT = 'STAFF_AGENT',
    DIGESTOR = 'DIGESTOR'
}

export enum EditorTaskStatus {
    NEW = 'NEW',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}


export class EditorTask {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    newKnowledge: string;

    @IsString()
    product: Product | string;

    @IsEnum(EditorTaskInitiator)
    initiator: EditorTaskInitiator;

    @IsEnum(EditorTaskStatus)
    status: EditorTaskStatus;

    createdAt: Date;

    updatedAt: Date;

}