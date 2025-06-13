import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { MessageProcessor } from './message-processor.js';

export class WorkflowBuilder {
  constructor() {
    this.messageProcessor = new MessageProcessor();
  }

  buildWorkflow() {
    const callModel = async (state, config) => {
      return await this.messageProcessor.processMessage(state, config);
    };

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('model', callModel)
      .addEdge(START, 'model')
      .addEdge('model', END);

    return workflow.compile();
  }
}
