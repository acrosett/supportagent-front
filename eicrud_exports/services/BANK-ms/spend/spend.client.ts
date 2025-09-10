import { TrySpendDto, TrySpendReturnDto } from './cmds/try_spend/try_spend.dto';
import { SpendWhatsappDto, SpendWhatsappReturnDto } from './cmds/spend_whatsapp/spend_whatsapp.dto';
import { SpendThinkDto, SpendThinkReturnDto } from './cmds/spend_think/spend_think.dto';
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

  async spend_whatsapp(
      dto: SpendWhatsappDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendWhatsappReturnDto> {
      return super.cmd('spend_whatsapp', dto, options, copts);
  }

  async spend_whatsappS(
      dto: SpendWhatsappDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendWhatsappReturnDto> {
      return super.cmdS('spend_whatsapp', dto, options, copts);
  }

  async spend_whatsappL(
      dto: SpendWhatsappDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendWhatsappReturnDto> {
      return super.cmdL('spend_whatsapp', dto, options, copts) as any;
  }

  async spend_whatsappSL(
      dto: SpendWhatsappDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendWhatsappReturnDto> {
      return super.cmdSL('spend_whatsapp', dto, options, copts) as any;
  }

  async spend_think(
      dto: SpendThinkDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendThinkReturnDto> {
      return super.cmd('spend_think', dto, options, copts);
  }

  async spend_thinkS(
      dto: SpendThinkDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendThinkReturnDto> {
      return super.cmdS('spend_think', dto, options, copts);
  }

  async spend_thinkL(
      dto: SpendThinkDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendThinkReturnDto> {
      return super.cmdL('spend_think', dto, options, copts) as any;
  }

  async spend_thinkSL(
      dto: SpendThinkDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SpendThinkReturnDto> {
      return super.cmdSL('spend_think', dto, options, copts) as any;
  }

}