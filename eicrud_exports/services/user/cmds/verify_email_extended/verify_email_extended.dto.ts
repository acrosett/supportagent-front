import { IsString, IsOptional, IsBoolean } from "class-validator";


export class VerifyEmailExtendedDto {

  @IsOptional()
  @IsBoolean()
  logMeIn: boolean;

  @IsString()
  token_id: string;

}

//used by super-client, update me here
export type VerifyEmailExtendedReturnDto = {
        accessToken?: string;
};