import { IsString, IsOptional, IsEnum, IsArray } from "class-validator";
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

    owner: User | string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    product: Product;

    @IsEnum(IssueStatus)
    status: IssueStatus = IssueStatus.OPEN;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags: string[] = [];

    comments;

    createdAt: Date;

    updatedAt: Date;

}