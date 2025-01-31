import { JumpAction } from '@axonivy/process-editor-protocol';
import { IvyIcons } from '@axonivy/ui-icons';
import {
  Action,
  type IActionDispatcher,
  type IActionHandler,
  SelectionService,
  SetModelAction,
  SetUIExtensionVisibilityAction,
  TYPES,
  UpdateModelAction
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { ReactUIExtension } from '../utils/react-ui-extension';
import React from 'react';
import { Button } from '@axonivy/ui-components';

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
    return <Button className='jump-out-btn' icon={IvyIcons.JumpOut} onClick={() => this.handleJumpOutClick()} />;
  }

  protected handleJumpOutClick(): void {
    this.actionDispatcher.dispatch(JumpAction.create({ elementId: '' }));
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
