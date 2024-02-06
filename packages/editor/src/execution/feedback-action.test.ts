import {
  ActionDispatcher,
  Bounds,
  CommandExecutionContext,
  configureCommand,
  createFeatureSet,
  defaultModule,
  FeedbackActionDispatcher,
  InitializeCanvasBoundsAction,
  GChildElement,
  GModelRoot,
  TYPES
} from '@eclipse-glsp/client';
import { describe, test, expect, beforeEach } from 'vitest';
import { Container, injectable } from 'inversify';

import { ExecutedFeedbackAction, ExecutedFeedbackCommand, StoppedFeedbackAction, StoppedFeedbackCommand } from './feedback-action';
import { executionFeature } from './model';
import { ElementExecution } from '@axonivy/process-editor-protocol';
import { createTestContainer } from '../utils/test-utils';

let executedRoot: GModelRoot;
let stoppedRoot: GModelRoot;

@injectable()
class ExecutedFeedbackCommandMock extends ExecutedFeedbackCommand {
  execute(context: CommandExecutionContext): GModelRoot {
    context.root = executedRoot;
    return super.execute(context);
  }
}

@injectable()
class StoppedFeedbackCommandMock extends StoppedFeedbackCommand {
  execute(context: CommandExecutionContext): GModelRoot {
    context.root = stoppedRoot;
    return super.execute(context);
  }
}

class Node extends GChildElement {
  features = createFeatureSet([executionFeature]);
}

function createContainer(): Container {
  const container = createTestContainer();
  configureCommand(container, ExecutedFeedbackCommandMock);
  configureCommand(container, StoppedFeedbackCommandMock);
  return container;
}

describe('ExecutedFeedbackAction', () => {
  let actionDispatcher: ActionDispatcher;
  executedRoot = new GModelRoot();
  const node = new Node();
  node.id = 'foo';
  executedRoot.add(node);

  beforeEach(() => {
    const container = createContainer();
    actionDispatcher = container.get<ActionDispatcher>(TYPES.IActionDispatcher);
    actionDispatcher.dispatch(InitializeCanvasBoundsAction.create(Bounds.EMPTY));
    node.cssClasses = undefined;
  });

  test('element has css class executed', async () => {
    const execution: ElementExecution = { elementId: 'foo', count: 2, failed: false };

    await actionDispatcher.dispatch(
      ExecutedFeedbackAction.create({ elementExecutions: [execution], oldElementExecutions: [], lastExecutedElementId: node.id })
    );
    expect(node.cssClasses).to.include('executed');
    expect(node.cssClasses).to.include('last');
    await actionDispatcher.dispatch(
      ExecutedFeedbackAction.create({ elementExecutions: [], oldElementExecutions: [execution], lastExecutedElementId: '' })
    );
    expect(node.cssClasses).to.not.include('executed');
  });

  test('element has css class failed', async () => {
    const execution: ElementExecution = { elementId: 'foo', count: 2, failed: true };

    await actionDispatcher.dispatch(
      ExecutedFeedbackAction.create({ elementExecutions: [execution], oldElementExecutions: [], lastExecutedElementId: '' })
    );
    expect(node.cssClasses).to.include('failed');
    await actionDispatcher.dispatch(
      ExecutedFeedbackAction.create({ elementExecutions: [], oldElementExecutions: [execution], lastExecutedElementId: '' })
    );
    expect(node.cssClasses).to.not.include('failed');
  });
});

describe('StoppedFeedbackAction', () => {
  let actionDispatcher: ActionDispatcher;
  stoppedRoot = new GModelRoot();
  const node = new Node();
  node.id = 'foo';
  stoppedRoot.add(node);

  beforeEach(() => {
    const container = createContainer();
    actionDispatcher = container.get<ActionDispatcher>(TYPES.IActionDispatcher);
    actionDispatcher.dispatch(InitializeCanvasBoundsAction.create(Bounds.EMPTY));
    node.cssClasses = undefined;
  });

  test('element has css class stopped', async () => {
    await actionDispatcher.dispatch(StoppedFeedbackAction.create({ oldStoppedElement: '', stoppedElement: 'foo' }));
    expect(node.cssClasses).to.include('stopped');
    await actionDispatcher.dispatch(StoppedFeedbackAction.create({ oldStoppedElement: 'foo' }));
    expect(node.cssClasses).to.not.include('stopped');
  });
});
