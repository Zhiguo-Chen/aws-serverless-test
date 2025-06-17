import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { MessageProcessor } from './message-processor';

export class WorkflowBuilder {
  messageProcessor: MessageProcessor;
  constructor() {
    this.messageProcessor = new MessageProcessor();
  }

  buildWorkflow() {
    const callModel = async (state: any, config: any) => {
      return await this.messageProcessor.processMessage(state, config);
    };

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('model', callModel)
      .addEdge(START, 'model')
      .addEdge('model', END);

    return workflow.compile();
  }
}
