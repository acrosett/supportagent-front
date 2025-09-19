import { EffectiveDeleteAccountDto, EffectiveDeleteAccountReturnDto } from './cmds/effective_delete_account/effective_delete_account.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { AccountDeletion } from "./account-deletion.entity";


export class AccountDeletionClient extends CrudClient<AccountDeletion> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'account-deletion'});
  }
  // GENERATED START
  async effective_delete_account(
      dto: EffectiveDeleteAccountDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<EffectiveDeleteAccountReturnDto> {
      return super.cmd('effective_delete_account', dto, options, copts);
  }

  async effective_delete_accountS(
      dto: EffectiveDeleteAccountDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<EffectiveDeleteAccountReturnDto> {
      return super.cmdS('effective_delete_account', dto, options, copts);
  }

  async effective_delete_accountL(
      dto: EffectiveDeleteAccountDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<EffectiveDeleteAccountReturnDto> {
      return super.cmdL('effective_delete_account', dto, options, copts) as any;
  }

  async effective_delete_accountSL(
      dto: EffectiveDeleteAccountDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<EffectiveDeleteAccountReturnDto> {
      return super.cmdSL('effective_delete_account', dto, options, copts) as any;
  }

}