import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { AdminNotif } from "./admin-notif.entity";


export class AdminNotifClient extends CrudClient<AdminNotif> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'admin-notif'});
  }
  // GENERATED START
}