import { TrySpendDto, TrySpendReturnDto } from './cmds/try_spend/try_spend.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Spend } from "./spend.entity";


export class SpendClient extends CrudClient<Spend> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'spend'});
  }
  // GENERATED START
  async try_spend(
      dto: TrySpendDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<TrySpendReturnDto> {
      return super.cmd('try_spend', dto, options, copts);
  }

  async try_spendS(
      dto: TrySpendDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<TrySpendReturnDto> {
      return super.cmdS('try_spend', dto, options, copts);
  }

  async try_spendL(
      dto: TrySpendDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<TrySpendReturnDto> {
      return super.cmdL('try_spend', dto, options, copts) as any;
  }

  async try_spendSL(
      dto: TrySpendDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<TrySpendReturnDto> {
      return super.cmdSL('try_spend', dto, options, copts) as any;
  }

}