import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { PhoneNumber } from "./phone-number.entity";


export class PhoneNumberClient extends CrudClient<PhoneNumber> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'phone-number'});
  }
  // GENERATED START
}