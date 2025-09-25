import { UpdateCustomerInvoiceEmailDto, UpdateCustomerInvoiceEmailReturnDto } from './cmds/update_customer_invoice_email/update_customer_invoice_email.dto';
import { StripeDepositAsyncDto, StripeDepositAsyncReturnDto } from './cmds/stripe_deposit_async/stripe_deposit_async.dto';
import { StripeDepositDto, StripeDepositReturnDto } from './cmds/stripe_deposit/stripe_deposit.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { ProductVault } from "./product-vault.entity";


export class ProductVaultClient extends CrudClient<ProductVault> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'product-vault'});
  }
  // GENERATED START
  async update_customer_invoice_email(
      dto: UpdateCustomerInvoiceEmailDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<UpdateCustomerInvoiceEmailReturnDto> {
      return super.cmd('update_customer_invoice_email', dto, options, copts);
  }

  async update_customer_invoice_emailS(
      dto: UpdateCustomerInvoiceEmailDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<UpdateCustomerInvoiceEmailReturnDto> {
      return super.cmdS('update_customer_invoice_email', dto, options, copts);
  }

  async update_customer_invoice_emailL(
      dto: UpdateCustomerInvoiceEmailDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<UpdateCustomerInvoiceEmailReturnDto> {
      return super.cmdL('update_customer_invoice_email', dto, options, copts) as any;
  }

  async update_customer_invoice_emailSL(
      dto: UpdateCustomerInvoiceEmailDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<UpdateCustomerInvoiceEmailReturnDto> {
      return super.cmdSL('update_customer_invoice_email', dto, options, copts) as any;
  }

  async stripe_deposit_async(
      dto: StripeDepositAsyncDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositAsyncReturnDto> {
      return super.cmd('stripe_deposit_async', dto, options, copts);
  }

  async stripe_deposit_asyncS(
      dto: StripeDepositAsyncDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositAsyncReturnDto> {
      return super.cmdS('stripe_deposit_async', dto, options, copts);
  }

  async stripe_deposit_asyncL(
      dto: StripeDepositAsyncDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositAsyncReturnDto> {
      return super.cmdL('stripe_deposit_async', dto, options, copts) as any;
  }

  async stripe_deposit_asyncSL(
      dto: StripeDepositAsyncDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositAsyncReturnDto> {
      return super.cmdSL('stripe_deposit_async', dto, options, copts) as any;
  }

  async stripe_deposit(
      dto: StripeDepositDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositReturnDto> {
      return super.cmd('stripe_deposit', dto, options, copts);
  }

  async stripe_depositS(
      dto: StripeDepositDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositReturnDto> {
      return super.cmdS('stripe_deposit', dto, options, copts);
  }

  async stripe_depositL(
      dto: StripeDepositDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositReturnDto> {
      return super.cmdL('stripe_deposit', dto, options, copts) as any;
  }

  async stripe_depositSL(
      dto: StripeDepositDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<StripeDepositReturnDto> {
      return super.cmdSL('stripe_deposit', dto, options, copts) as any;
  }

}