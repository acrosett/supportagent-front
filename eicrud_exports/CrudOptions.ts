import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ICrudOptions } from '@eicrud/shared/interfaces';
import type { OrderByType } from '@eicrud/shared/interfaces';

export class CrudOptions<T = any> {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  populate?: `${Extract<keyof T, string>}${string}`[];

  @IsOptional()
  @IsString()
  mockRole?: string;

  @IsOptional()
  @IsBoolean()
  cached?: boolean;

  @IsOptional()
  @IsBoolean()
  returnUpdatedEntity?: boolean;

  @IsOptional()
  @IsBoolean()
  jwtCookie?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: Extract<keyof T, string>[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclude?: Extract<keyof T, string>[];

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;

  @IsOptional()
  @IsObject({ each: true })
  orderBy?: OrderByType<T>;

  /**
   * Allow the entity ID to be pregenerated in create operations
   * @warning Letting users set IDs can lead to security issues
   */
  @IsOptional()
  @IsBoolean()
  allowIdOverride?: boolean;

  @IsOptional()
  @IsBoolean()
  skipServiceHooks?: boolean;
}
