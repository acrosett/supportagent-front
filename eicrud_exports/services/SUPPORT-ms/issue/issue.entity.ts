import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";
import { IssueComment } from "../issue-comment/issue-comment.entity";

export enum IssueStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
}

export class Issue {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    product: Product | string;

    @IsEnum(IssueStatus)
    status: IssueStatus = IssueStatus.OPEN;

    @IsOptional()
    @IsBoolean()
    isArchived: boolean = false;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags: string[] = [];

    comments;

    createdAt: Date;

    updatedAt: Date;

}