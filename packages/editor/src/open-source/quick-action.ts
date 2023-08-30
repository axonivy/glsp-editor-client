import { SModelElement } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { GoToSourceAction } from '@axonivy/process-editor-protocol';
import { QuickAction, SingleQuickActionProvider } from '../ui-tools/quick-action/quick-action';
import { hasGoToSourceFeature } from '../jump/model';
import { StreamlineIcons } from '../StreamlineIcons';

@injectable()
export class GoToSourceQuickActionProvider extends SingleQuickActionProvider {
  singleQuickAction(element: SModelElement): QuickAction | undefined {
    if (hasGoToSourceFeature(element)) {
      return {
        icon: StreamlineIcons.GoToSource,
        title: 'Go To Source (S)',
        location: 'Middle',
        sorting: 'B',
        action: GoToSourceAction.create(element.id),
        readonlySupport: true,
        shortcut: 'KeyS'
      };
    }
    return undefined;
  }
}
