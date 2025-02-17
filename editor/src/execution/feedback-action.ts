import { SChildElement, Command, type CommandExecutionContext, SModelElement, SModelRoot, TYPES, Action } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { addCssClass, addCssClassToElements, removeCssClass, removeCssClassOfElements } from '../utils/element-css-classes';
import type { ElementExecution } from './action';

import { isExecutable, type Executable } from './model';

export interface ExecutedFeedbackAction extends Action {
  kind: typeof ExecutedFeedbackCommand.KIND;
  oldElementExecutions?: ElementExecution[];
  elementExecutions: ElementExecution[];
  lastExecutedElementId: string;
}

export namespace ExecutedFeedbackAction {
  export function create(options: {
    oldElementExecutions?: ElementExecution[];
    elementExecutions: ElementExecution[];
    lastExecutedElementId: string;
  }): ExecutedFeedbackAction {
    return {
      kind: ExecutedFeedbackCommand.KIND,
      ...options
    };
  }
}

@injectable()
export class ExecutedFeedbackCommand extends Command {
  static readonly KIND = 'executedFeedbackCommand';
  static readonly EXECUTED_CSS_CLASS = 'executed';
  static readonly LAST_EXECUTED_CSS_CLASS = 'last';
  static readonly FAILED_CSS_CLASS = 'failed';

  protected executed: SChildElement[] = [];
  protected failed: SChildElement[] = [];
  protected lastExecutedElement?: SModelElement;

  // @ts-ignore
  constructor(@inject(TYPES.Action) protected readonly action: ExecutedFeedbackAction) {
    super();
  }

  execute(context: CommandExecutionContext): SModelRoot {
    const model = context.root;
    this.lastExecutedElement = model.index.getById(this.action.lastExecutedElementId);
    this.action.oldElementExecutions?.forEach(elementExecution => {
      const element = model.index.getById(elementExecution.elementId);
      if (element instanceof SChildElement && isExecutable(element)) {
        setExecutionCount(element as Executable, 0);
        const cssClass = elementExecution.failed ? ExecutedFeedbackCommand.FAILED_CSS_CLASS : ExecutedFeedbackCommand.EXECUTED_CSS_CLASS;
        removeCssClass(element, cssClass);
      }
    });
    this.action.elementExecutions.forEach(elementExecution => {
      const element = model.index.getById(elementExecution.elementId);
      if (element instanceof SChildElement && isExecutable(element)) {
        setExecutionCount(element as Executable, elementExecution.count);
        if (elementExecution.failed) {
          this.failed.push(element);
        } else {
          this.executed.push(element);
        }
      }
    });
    return this.redo(context);
  }

  undo(context: CommandExecutionContext): SModelRoot {
    removeCssClassOfElements(this.executed, ExecutedFeedbackCommand.EXECUTED_CSS_CLASS);
    removeCssClassOfElements(this.failed, ExecutedFeedbackCommand.FAILED_CSS_CLASS);
    return context.root;
  }

  redo(context: CommandExecutionContext): SModelRoot {
    addCssClassToElements(this.executed, ExecutedFeedbackCommand.EXECUTED_CSS_CLASS);
    addCssClassToElements(this.failed, ExecutedFeedbackCommand.FAILED_CSS_CLASS);
    removeCssClassOfElements(this.executed, ExecutedFeedbackCommand.LAST_EXECUTED_CSS_CLASS);
    if (this.lastExecutedElement) {
      addCssClass(this.lastExecutedElement, ExecutedFeedbackCommand.LAST_EXECUTED_CSS_CLASS);
    }
    return context.root;
  }
}

export interface StoppedFeedbackAction extends Action {
  kind: typeof StoppedFeedbackCommand.KIND;
  oldStoppedElement: string;
  stoppedElement?: string;
}

export namespace StoppedFeedbackAction {
  export function create(options: { oldStoppedElement: string; stoppedElement?: string }): StoppedFeedbackAction {
    return {
      kind: StoppedFeedbackCommand.KIND,
      ...options
    };
  }
}

@injectable()
export class StoppedFeedbackCommand extends Command {
  static readonly KIND = 'stoppedFeedbackCommand';
  static readonly STOPPED_CSS_CLASS = 'stopped';

  protected stoppedElement: SChildElement;

  // @ts-ignore
  constructor(@inject(TYPES.Action) protected readonly action: StoppedFeedbackAction) {
    super();
  }

  execute(context: CommandExecutionContext): SModelRoot {
    const model = context.root;
    const oldElement = model.index.getById(this.action.oldStoppedElement);
    if (oldElement instanceof SChildElement && isExecutable(oldElement)) {
      removeCssClass(oldElement, StoppedFeedbackCommand.STOPPED_CSS_CLASS);
    }
    const element = model.index.getById(this.action.stoppedElement ?? '');
    if (element instanceof SChildElement && isExecutable(element)) {
      this.stoppedElement = element;
    }
    return this.redo(context);
  }

  undo(context: CommandExecutionContext): SModelRoot {
    removeCssClass(this.stoppedElement, StoppedFeedbackCommand.STOPPED_CSS_CLASS);
    return context.root;
  }

  redo(context: CommandExecutionContext): SModelRoot {
    addCssClass(this.stoppedElement, StoppedFeedbackCommand.STOPPED_CSS_CLASS);
    return context.root;
  }
}

function setExecutionCount(element: Executable, count: number): void {
  element.executionCount = count;
}
