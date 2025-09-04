import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Event } from "./event.entity";


export class EventClient extends CrudClient<Event> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'event'});
  }
  // GENERATED START
}