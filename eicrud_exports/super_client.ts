import { WhatsappMessageClient } from './services/WHATSAPP-ms/whatsapp-message/whatsapp-message.client';
import { PhoneNumberClient } from './services/WHATSAPP-ms/phone-number/phone-number.client';
import { UserClient } from './services/user/user.client';
import { ProductClient } from './services/SUPPORT-ms/product/product.client';
import { MessageClient } from './services/SUPPORT-ms/message/message.client';
import { IssueCommentClient } from './services/SUPPORT-ms/issue-comment/issue-comment.client';
import { IssueClient } from './services/SUPPORT-ms/issue/issue.client';
import { FaqClient } from './services/SUPPORT-ms/faq/faq.client';
import { EventClient } from './services/SUPPORT-ms/event/event.client';
import { ClientClient } from './services/SUPPORT-ms/client/client.client';
import { LlmTrainingDataClient } from './services/LOG-ms/llm-training-data/llm-training-data.client';
import { EmailClient } from './services/email/email.client';
import { SpendClient } from './services/BANK-ms/spend/spend.client';
import { DepositClient } from './services/BANK-ms/deposit/deposit.client';
import { WhatsappAgentClient } from './services/AI-ms/whatsapp-agent/whatsapp-agent.client';
import { LlmProviderClient } from './services/AI-ms/llm-provider/llm-provider.client';
import { EditorAgentClient } from './services/AI-ms/editor-agent/editor-agent.client';
import { ChatAgentClient } from './services/AI-ms/chat-agent/chat-agent.client';
import { AgentMessageClient } from './services/AI-ms/agent-message/agent-message.client';
import { SuperClientConfig } from "@eicrud/client";

export class SuperClient {

    constructor(config: SuperClientConfig) {

        // GENERATED START 1
        this.whatsappMessage = new WhatsappMessageClient(config);
        this.phoneNumber = new PhoneNumberClient(config);
        this.user = new UserClient(config);
        this.product = new ProductClient(config);
        this.message = new MessageClient(config);
        this.issueComment = new IssueCommentClient(config);
        this.issue = new IssueClient(config);
        this.faq = new FaqClient(config);
        this.event = new EventClient(config);
        this.client = new ClientClient(config);
        this.llmTrainingData = new LlmTrainingDataClient(config);
        this.email = new EmailClient(config);
        this.spend = new SpendClient(config);
        this.deposit = new DepositClient(config);
        this.whatsappAgent = new WhatsappAgentClient(config);
        this.llmProvider = new LlmProviderClient(config);
        this.editorAgent = new EditorAgentClient(config);
        this.chatAgent = new ChatAgentClient(config);
        this.agentMessage = new AgentMessageClient(config);
    }

    // GENERATED START 2
    whatsappMessage: WhatsappMessageClient;
    phoneNumber: PhoneNumberClient;
    user: UserClient;
    product: ProductClient;
    message: MessageClient;
    issueComment: IssueCommentClient;
    issue: IssueClient;
    faq: FaqClient;
    event: EventClient;
    client: ClientClient;
    llmTrainingData: LlmTrainingDataClient;
    email: EmailClient;
    spend: SpendClient;
    deposit: DepositClient;
    whatsappAgent: WhatsappAgentClient;
    llmProvider: LlmProviderClient;
    editorAgent: EditorAgentClient;
    chatAgent: ChatAgentClient;
    agentMessage: AgentMessageClient;
}