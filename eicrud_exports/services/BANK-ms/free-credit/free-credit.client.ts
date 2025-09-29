import { AwardFreeCreditsDto, AwardFreeCreditsReturnDto } from './cmds/award_free_credits/award_free_credits.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { FreeCredit } from "./free-credit.entity";


export class FreeCreditClient extends CrudClient<FreeCredit> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'free-credit'});
  }
  // GENERATED START
  async award_free_credits(
      dto: AwardFreeCreditsDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<AwardFreeCreditsReturnDto> {
      return super.cmd('award_free_credits', dto, options, copts);
  }

  async award_free_creditsS(
      dto: AwardFreeCreditsDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<AwardFreeCreditsReturnDto> {
      return super.cmdS('award_free_credits', dto, options, copts);
  }

  async award_free_creditsL(
      dto: AwardFreeCreditsDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<AwardFreeCreditsReturnDto> {
      return super.cmdL('award_free_credits', dto, options, copts) as any;
  }

  async award_free_creditsSL(
      dto: AwardFreeCreditsDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<AwardFreeCreditsReturnDto> {
      return super.cmdSL('award_free_credits', dto, options, copts) as any;
  }

}