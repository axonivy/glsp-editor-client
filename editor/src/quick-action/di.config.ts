import '../../css/quick-action.css';

import { configureActionHandler, GLSP_TYPES, TYPES } from '@eclipse-glsp/client';
import { ContainerModule } from 'inversify';

import { QuickActionEdgeCreationTool, QuickActionTriggerEdgeCreationAction } from './edge/edge-creation-tool';
import {
  AutoAlignQuickActionProvider,
  ConnectQuickActionProvider,
  DeleteQuickActionProvider,
  InscribeQuickActionProvider,
  IVY_TYPES
} from './quick-action';
import { QuickActionUI } from './quick-action-ui';

const ivyQuickActionModule = new ContainerModule((bind, _unbind, isBound) => {
  bind(QuickActionUI).toSelf().inSingletonScope();
  bind(TYPES.IUIExtension).toService(QuickActionUI);

  bind(QuickActionEdgeCreationTool).toSelf().inSingletonScope();
  bind(GLSP_TYPES.ITool).toService(QuickActionEdgeCreationTool);
  configureActionHandler({ bind, isBound }, QuickActionTriggerEdgeCreationAction.KIND, QuickActionEdgeCreationTool);

  bind(IVY_TYPES.QuickActionProvider).to(DeleteQuickActionProvider);
  bind(IVY_TYPES.QuickActionProvider).to(InscribeQuickActionProvider);
  bind(IVY_TYPES.QuickActionProvider).to(ConnectQuickActionProvider);
  bind(IVY_TYPES.QuickActionProvider).to(AutoAlignQuickActionProvider);
});

export default ivyQuickActionModule;
