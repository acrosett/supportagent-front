import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { IssueComment } from "./issue-comment.entity";


export class IssueCommentClient extends CrudClient<IssueComment> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'issue-comment'});
  }
  // GENERATED START
}