import {
  ActionDispatcher,
  CommandExecutionContext,
  CommandReturn,
  configureCommand,
  createFeatureSet,
  defaultModule,
  EMPTY_BOUNDS,
  FeedbackActionDispatcher,
  GLSP_TYPES,
  InitializeCanvasBoundsAction,
  SChildElement,
  Selectable,
  selectFeature,
  SModelRoot,
  SNode,
  TYPES
} from '@eclipse-glsp/client';
import { expect } from 'chai';
import { Container, injectable } from 'inversify';
import { describe, it } from 'mocha';

import { jumpFeature } from '../jump/model';
import { SmartActionEdgeCreationTool } from './edge/edge-creation-tool';
import {
  smartActionFeature,
  SSmartActionConnectHandle,
  SSmartActionDeleteHandle,
  SSmartActionJumpIntoHandler
} from './model';
import {
  HideSmartActionToolFeedbackAction,
  HideSmartActionToolFeedbackCommand,
  ShowSmartActionToolFeedbackAction,
  ShowSmartActionToolFeedbackCommand
} from './smart-action-tool-feedback';

let root: SModelRoot;

@injectable()
class ShowSmartActionToolFeedbackCommandMock extends ShowSmartActionToolFeedbackCommand {
  execute(context: CommandExecutionContext): CommandReturn {
    root.id = this.action.elementId ?? '';
    context.root = root;
    return super.execute(context);
  }
}

@injectable()
class HideSmartActionToolFeedbackCommandMock extends HideSmartActionToolFeedbackCommand {
  execute(context: CommandExecutionContext): CommandReturn {
    context.root = root;
    return super.execute(context);
  }
}

class SmartableNode extends SNode implements Selectable {
  features = createFeatureSet([smartActionFeature, selectFeature]);
}

function createContainer(): Container {
  const container = new Container();
  container.load(defaultModule);
  container.bind(GLSP_TYPES.IFeedbackActionDispatcher).to(FeedbackActionDispatcher).inSingletonScope();
  container.bind(SmartActionEdgeCreationTool).toSelf().inSingletonScope();
  configureCommand(container, ShowSmartActionToolFeedbackCommandMock);
  configureCommand(container, HideSmartActionToolFeedbackCommandMock);
  return container;
}

describe('Smart action tool feedback', () => {
  let actionDispatcher: ActionDispatcher;

  beforeEach(() => {
    const container = createContainer();
    actionDispatcher = container.get<ActionDispatcher>(TYPES.IActionDispatcher);
    actionDispatcher.dispatch(new InitializeCanvasBoundsAction(EMPTY_BOUNDS));
    root = new SModelRoot();
  });

  it('Is not shown on not smartable element', async () => {
    const node = new SChildElement();
    node.id = 'notsmartable';
    root.add(node);

    await actionDispatcher.dispatch(new ShowSmartActionToolFeedbackAction('notsmartable'));
    expect(node.children).to.be.empty;
  });

  it('Is shown on smartable elment', async () => {
    const node = new SmartableNode();
    node.id = 'smartable';
    root.add(node);

    await actionDispatcher.dispatch(new ShowSmartActionToolFeedbackAction('smartable'));
    expect(node.children).to.have.lengthOf(2);
    expect(node.children[0]).to.be.instanceOf(SSmartActionDeleteHandle);
    expect(node.children[1]).to.be.instanceOf(SSmartActionConnectHandle);

    await actionDispatcher.dispatch(new HideSmartActionToolFeedbackAction());
    expect(node.children).to.be.empty;
  });

  it('Is shown with additional jump into sub action on sub elment', async () => {
    const node = new SmartableNode();
    node.id = 'sub';
    node.features = createFeatureSet([smartActionFeature, jumpFeature, selectFeature]);
    root.add(node);

    await actionDispatcher.dispatch(new ShowSmartActionToolFeedbackAction('sub'));
    expect(node.children).to.have.lengthOf(3);
    expect(node.children[0]).to.be.instanceOf(SSmartActionDeleteHandle);
    expect(node.children[1]).to.be.instanceOf(SSmartActionConnectHandle);
    expect(node.children[2]).to.be.instanceOf(SSmartActionJumpIntoHandler);

    await actionDispatcher.dispatch(new HideSmartActionToolFeedbackAction());
    expect(node.children).to.be.empty;
  });
});
