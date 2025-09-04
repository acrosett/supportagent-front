import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";
import { IssueComment } from "../issue-comment/issue-comment.entity";

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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

    comments;

    createdAt: Date;

    updatedAt: Date;

}