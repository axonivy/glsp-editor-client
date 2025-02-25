import { SModelRoot, PaletteItem, EnableToolPaletteAction, configureActionHandler } from '@eclipse-glsp/client';
import { Container } from 'inversify';
import { describe, it, beforeAll } from 'vitest';

import { QuickActionUI } from './quick-action-ui';
import ivyToolBarModule from '../tool-bar/di.config';
import {
  assertQuickAction,
  assertQuickActionUi,
  createContainer,
  createRoot,
  setupSprottyDiv
} from '../../test-utils/quick-action-ui-util';
import { ElementsPaletteHandler } from '../tool-bar/node/action-handler';
import { StreamlineIcons } from '../../StreamlineIcons';

class ElementsPaletteHandlerMock extends ElementsPaletteHandler {
  public getElementPaletteItems(): PaletteItem[] | undefined {
    return [
      { id: 'event-group', icon: 'event-group', label: 'Events', sortString: 'A', actions: [] },
      { id: 'gateway-group', icon: 'gateway-group', label: 'Gateways', sortString: 'B', actions: [] },
      { id: 'activity-group', icon: 'activity-group', label: 'Activities', sortString: 'C', actions: [] },
      { id: 'bpmn-activity-group', icon: 'bpmn-activity-group', label: 'BPMN Activities', sortString: 'D', actions: [] },
      { id: 'swimlane-group', icon: 'swimlane-group', label: 'Swimlanes', sortString: 'X', actions: [] },
      { id: 'unknown-group', icon: 'unknown-group', label: 'Unknown', sortString: 'Y', actions: [] }
    ];
  }
}

function createNodeContainer(): Container {
  const container = createContainer();
  container.unload(ivyToolBarModule);
  container.bind(ElementsPaletteHandlerMock).toSelf().inSingletonScope();
  configureActionHandler(container, EnableToolPaletteAction.KIND, ElementsPaletteHandler);
  return container;
}

describe('QuickActionUi - Create Nodes', () => {
  let quickActionUi: QuickActionUI;
  let root: SModelRoot;

  beforeAll(() => {
    setupSprottyDiv();
    const container = createNodeContainer();
    quickActionUi = container.get<QuickActionUI>(QuickActionUI);
    root = createRoot(container);
  });

  it('create nodes quick actions are rendered for activity element', () => {
    quickActionUi.show(root, 'foo');
    assertQuickActionUi(8, { x: 200, y: 150 });
    assertQuickAction(0, 'Delete', `si si-${StreamlineIcons.Delete}`);
    assertQuickAction(1, 'Information (I)', `si si-${StreamlineIcons.Information}`);
    assertQuickAction(2, 'Wrap to embedded process (W)', `si si-${StreamlineIcons.WrapToSubprocess}`);
    assertQuickAction(3, 'Select color', `si si-${StreamlineIcons.Color}`);
    assertQuickAction(4, 'Events (A)', `si si-${StreamlineIcons.EventsGroup}`);
    assertQuickAction(5, 'Gateways (A)', `si si-${StreamlineIcons.GatewaysGroup}`);
    assertQuickAction(6, 'Activities (A)', `si si-${StreamlineIcons.ActivitiesGroup}`);
    assertQuickAction(7, 'Connect', `si si-${StreamlineIcons.Connector}`);
  });

  it('create nodes quick actions are not rendered for comment element', () => {
    quickActionUi.show(root, 'comment');
    assertQuickActionUi(5);
    assertQuickAction(0, 'Delete');
    assertQuickAction(3, 'Select color');
    assertQuickAction(4, 'Connect');
  });

  it('create nodes quick actions are not rendered for end element', () => {
    quickActionUi.show(root, 'end');
    assertQuickActionUi(3);
    assertQuickAction(0, 'Delete');
    assertQuickAction(2, 'Select color');
  });
});
