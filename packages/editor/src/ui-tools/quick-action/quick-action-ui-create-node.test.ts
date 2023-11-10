import { SModelRoot, PaletteItem, EnableToolPaletteAction, configureActionHandler } from '@eclipse-glsp/client';
import { Container } from 'inversify';
import { assertQuickAction, assertQuickActionUi, createContainer, createRoot } from '../../test-utils/quick-action-ui.test-util';
import { IvyIcons } from '@axonivy/editor-icons/lib';
import { ElementsPaletteHandler } from '../tool-bar/node/action-handler';
import ivyToolBarModule from '../tool-bar/di.config';
import { QuickActionUI } from './quick-action-ui';
import { beforeAll, describe, test } from 'vitest';

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
    const container = createNodeContainer();
    quickActionUi = container.get<QuickActionUI>(QuickActionUI);
    root = createRoot(container);
  });

  test('activity', () => {
    quickActionUi.show(root, 'foo');
    assertQuickActionUi(8, { x: 200, y: 150 });
    assertQuickAction(0, 'Delete', IvyIcons.Delete);
    assertQuickAction(1, 'Information (I)', IvyIcons.Information);
    assertQuickAction(2, 'Wrap to embedded process (W)', IvyIcons.WrapToSubprocess);
    assertQuickAction(3, 'Select color', IvyIcons.Color);
    assertQuickAction(4, 'Events (A)', IvyIcons.EventsGroup);
    assertQuickAction(5, 'Gateways (A)', IvyIcons.GatewaysGroup);
    assertQuickAction(6, 'Activities (A)', IvyIcons.ActivitiesGroup);
    assertQuickAction(7, 'Connect', IvyIcons.Connector);
  });

  test('hidden for comment', () => {
    quickActionUi.show(root, 'comment');
    assertQuickActionUi(5);
    assertQuickAction(0, 'Delete');
    assertQuickAction(3, 'Select color');
    assertQuickAction(4, 'Connect');
  });

  test('hidden for end event', () => {
    quickActionUi.show(root, 'end');
    assertQuickActionUi(3);
    assertQuickAction(0, 'Delete');
    assertQuickAction(2, 'Select color');
  });
});
