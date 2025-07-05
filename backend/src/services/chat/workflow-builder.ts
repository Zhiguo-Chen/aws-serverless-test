import { END, START, StateGraph } from '@langchain/langgraph';
import { MessageProcessor } from './message-processor';
import { BaseMessage } from '@langchain/core/messages';

export interface AgentState {
  messages: BaseMessage[];
  products?: any[] | null;
}

export class WorkflowBuilder {
  messageProcessor: MessageProcessor;
  constructor() {
    this.messageProcessor = new MessageProcessor();
  }

  buildWorkflow() {
    const callModel = async (
      state: AgentState,
      config: any,
    ): Promise<Partial<AgentState>> => {
      return await this.messageProcessor.processMessage(state, config);
    };

    const workflow = new StateGraph<AgentState>({
      channels: {
        messages: {
          value: (x, y) => x.concat(y),
          default: () => [],
        },
        products: {
          value: (x, y) => y,
          default: () => null,
        },
      },
    })
      .addNode('model', callModel)
      .addEdge(START, 'model')
      .addEdge('model', END);

    return workflow.compile();
  }
}
