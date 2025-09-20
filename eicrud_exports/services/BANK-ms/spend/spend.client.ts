import { TrySpendDto, TrySpendReturnDto } from './cmds/try_spend/try_spend.dto';
import { ToggleAutoTopUpDto, ToggleAutoTopUpReturnDto } from './cmds/toggle_auto_top_up/toggle_auto_top_up.dto';
import { SpendWhatsappDto, SpendWhatsappReturnDto } from './cmds/spend_whatsapp/spend_whatsapp.dto';
import { SpendThinkDto, SpendThinkReturnDto } from './cmds/spend_think/spend_think.dto';
import { ComputeBalanceDto, ComputeBalanceReturnDto } from './cmds/compute_balance/compute_balance.dto';
import { CheckAutoTopUpDto, CheckAutoTopUpReturnDto } from './cmds/check_auto_top_up/check_auto_top_up.dto';
import { CheckActiveSubscriptionDto, CheckActiveSubscriptionReturnDto } from './cmds/check_active_subscription/check_active_subscription.dto';
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

  async toggle_auto_top_up(
      dto: ToggleAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ToggleAutoTopUpReturnDto> {
      return super.cmd('toggle_auto_top_up', dto, options, copts);
  }

  async toggle_auto_top_upS(
      dto: ToggleAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ToggleAutoTopUpReturnDto> {
      return super.cmdS('toggle_auto_top_up', dto, options, copts);
  }

  async toggle_auto_top_upL(
      dto: ToggleAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ToggleAutoTopUpReturnDto> {
      return super.cmdL('toggle_auto_top_up', dto, options, copts) as any;
  }

  async toggle_auto_top_upSL(
      dto: ToggleAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ToggleAutoTopUpReturnDto> {
      return super.cmdSL('toggle_auto_top_up', dto, options, copts) as any;
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

  async compute_balance(
      dto: ComputeBalanceDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ComputeBalanceReturnDto> {
      return super.cmd('compute_balance', dto, options, copts);
  }

  async compute_balanceS(
      dto: ComputeBalanceDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ComputeBalanceReturnDto> {
      return super.cmdS('compute_balance', dto, options, copts);
  }

  async compute_balanceL(
      dto: ComputeBalanceDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ComputeBalanceReturnDto> {
      return super.cmdL('compute_balance', dto, options, copts) as any;
  }

  async compute_balanceSL(
      dto: ComputeBalanceDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<ComputeBalanceReturnDto> {
      return super.cmdSL('compute_balance', dto, options, copts) as any;
  }

  async check_auto_top_up(
      dto: CheckAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckAutoTopUpReturnDto> {
      return super.cmd('check_auto_top_up', dto, options, copts);
  }

  async check_auto_top_upS(
      dto: CheckAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckAutoTopUpReturnDto> {
      return super.cmdS('check_auto_top_up', dto, options, copts);
  }

  async check_auto_top_upL(
      dto: CheckAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckAutoTopUpReturnDto> {
      return super.cmdL('check_auto_top_up', dto, options, copts) as any;
  }

  async check_auto_top_upSL(
      dto: CheckAutoTopUpDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckAutoTopUpReturnDto> {
      return super.cmdSL('check_auto_top_up', dto, options, copts) as any;
  }

  async check_active_subscription(
      dto: CheckActiveSubscriptionDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckActiveSubscriptionReturnDto> {
      return super.cmd('check_active_subscription', dto, options, copts);
  }

  async check_active_subscriptionS(
      dto: CheckActiveSubscriptionDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckActiveSubscriptionReturnDto> {
      return super.cmdS('check_active_subscription', dto, options, copts);
  }

  async check_active_subscriptionL(
      dto: CheckActiveSubscriptionDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckActiveSubscriptionReturnDto> {
      return super.cmdL('check_active_subscription', dto, options, copts) as any;
  }

  async check_active_subscriptionSL(
      dto: CheckActiveSubscriptionDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckActiveSubscriptionReturnDto> {
      return super.cmdSL('check_active_subscription', dto, options, copts) as any;
  }

}