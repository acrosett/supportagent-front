import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { CustomTool } from "./custom-tool.entity";


export class CustomToolClient extends CrudClient<CustomTool> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'custom-tool'});
  }
  // GENERATED START
}