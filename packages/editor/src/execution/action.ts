import {
  Action,
  IActionDispatcher,
  IActionHandler,
  IFeedbackActionDispatcher,
  ModelInitializationConstraint,
  TYPES
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';

import { ExecutedFeedbackAction, StoppedFeedbackAction } from './feedback-action';
import { ElementExecution, SetExecutedElementsAction, StoppedAction } from '@axonivy/process-editor-protocol';

@injectable()
export class SetExecutedElementsActionHandler implements IActionHandler {
  @inject(TYPES.IFeedbackActionDispatcher) protected feedbackDispatcher: IFeedbackActionDispatcher;
  @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher;
  @inject(ModelInitializationConstraint) protected modelInitializationConstraint: ModelInitializationConstraint;
  oldExecutions: ElementExecution[];

  handle(action: Action): Action | void {
    if (SetExecutedElementsAction.is(action)) {
      const feedbackAction = ExecutedFeedbackAction.create({
        oldElementExecutions: this.oldExecutions,
        elementExecutions: action.elementExecutions,
        lastExecutedElementId: action.lastExecutedElementId
      });
      // feedback is only applied after model update but we may send this action already with SetModel action
      // se we ensure that the model is already initialized
      this.modelInitializationConstraint.onInitialized(() => {
        if (action.elementExecutions.length > 0) {
          this.feedbackDispatcher.registerFeedback(this, [feedbackAction]);
        } else {
          this.feedbackDispatcher.deregisterFeedback(this, [feedbackAction]);
        }
        this.oldExecutions = action.elementExecutions;
      });
    }
  }
}

@injectable()
export class StoppedActionHandler implements IActionHandler {
  @inject(TYPES.IFeedbackActionDispatcher) protected feedbackDispatcher: IFeedbackActionDispatcher;
  @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher;
  oldStoppedElement: string;

  handle(action: Action): Action | void {
    if (StoppedAction.is(action)) {
      const feedbackAction = StoppedFeedbackAction.create({ oldStoppedElement: this.oldStoppedElement, stoppedElement: action.elementId });
      if (action.elementId && action.elementId.length > 0) {
        this.feedbackDispatcher.registerFeedback(this, [feedbackAction]);
      } else {
        this.feedbackDispatcher.deregisterFeedback(this, [feedbackAction]);
      }
      this.oldStoppedElement = action.elementId ?? '';
    }
  }
}
