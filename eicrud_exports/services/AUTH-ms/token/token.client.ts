import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Token } from "./token.entity";


export class TokenClient extends CrudClient<Token> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'token'});
  }
  // GENERATED START
}