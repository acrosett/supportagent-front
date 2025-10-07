import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { WaitingList } from "./waiting-list.entity";


export class WaitingListClient extends CrudClient<WaitingList> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'waiting-list'});
  }
  // GENERATED START
}