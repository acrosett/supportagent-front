import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Faq } from "./faq.entity";


export class FaqClient extends CrudClient<Faq> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'faq'});
  }
  // GENERATED START
}