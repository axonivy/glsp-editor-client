import '../../css/breakpoint.css';

import { ContainerModule } from 'inversify';
import { configureActionHandler, configureCommand, configureView } from 'sprotty';

import { IVY_TYPES } from '../quick-action/quick-action';
import { BreakpointQuickActionProvider } from './breakpoint';
import { ShowBreakpointAction, ShowBreakpointActionHandler } from './breakpoint-action-handler';
import { BreakpointFeedbackCommand } from './breakpoint-feedback-action';
import { SBreakpointHandle } from './model';
import { SBreakpointHandleView } from './view';

const breakpointModule = new ContainerModule((bind, _unbind, isBound) => {
  bind(ShowBreakpointActionHandler).toSelf().inSingletonScope();
  configureActionHandler({ bind, isBound }, ShowBreakpointAction.KIND, ShowBreakpointActionHandler);
  configureCommand({ bind, isBound }, BreakpointFeedbackCommand);
  configureView({ bind, isBound }, SBreakpointHandle.TYPE, SBreakpointHandleView);
  bind(IVY_TYPES.QuickActionProvider).to(BreakpointQuickActionProvider);
});

export default breakpointModule;
