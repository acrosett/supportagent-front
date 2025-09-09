import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { WidgetConfig } from "./widget-config.entity";


export class WidgetConfigClient extends CrudClient<WidgetConfig> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'widget-config'});
  }
  // GENERATED START
}