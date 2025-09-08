import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { StaffContactAgent } from "./staff-contact-agent.entity";


export class StaffContactAgentClient extends CrudClient<StaffContactAgent> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'staff-contact-agent'});
  }
  // GENERATED START
}