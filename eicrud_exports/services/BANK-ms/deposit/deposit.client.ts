import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Deposit } from "./deposit.entity";


export class DepositClient extends CrudClient<Deposit> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'deposit'});
  }
  // GENERATED START
}