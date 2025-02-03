import { JumpAction } from '@axonivy/process-editor-protocol';
import { IvyIcons } from '@axonivy/ui-icons';
import {
  Action,
  IActionDispatcher,
  IActionHandler,
  SelectionService,
  SetModelAction,
  SetUIExtensionVisibilityAction,
  TYPES,
  UpdateModelAction
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { ReactUIExtension } from '../utils/react-ui-extension';
import React from 'react';
import IvyIcon from '../utils/ui-components';

const JSX = { createElement: React.createElement };

@injectable()
export class JumpOutUi extends ReactUIExtension implements IActionHandler {
  static readonly ID = 'jumpOutUi';

  @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;
  @inject(SelectionService) protected selectionService: SelectionService;

  id(): string {
    return JumpOutUi.ID;
  }

  containerClass(): string {
    return 'jump-out-container';
  }

  protected initializeContainer(container: HTMLElement): void {
    super.initializeContainer(container);
    container.style.position = 'absolute';
  }

  protected render(): React.ReactNode {
    return (
      <button className={'jump-out-btn'} onClick={() => this.actionDispatcher.dispatch(JumpAction.create({ elementId: '' }))}>
        <IvyIcon icon={IvyIcons.JumpOut} />
      </button>
    );
  }

  handle(action: Action): void {
    if (SetModelAction.is(action) || UpdateModelAction.is(action)) {
      this.actionDispatcher.dispatch(
        SetUIExtensionVisibilityAction.create({ extensionId: JumpOutUi.ID, visible: this.showJumpOutBtn(action.newRoot.id) })
      );
    }
  }

  showJumpOutBtn(id: string): boolean {
    return id.includes('-');
  }
}
