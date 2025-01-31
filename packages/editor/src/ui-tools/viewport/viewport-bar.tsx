import {
  Action,
  type IActionHandler,
  isViewport,
  type IToolManager,
  SetUIExtensionVisibilityAction,
  SetViewportAction,
  TYPES,
  SelectionService,
  type IActionDispatcher
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { CenterButton, FitToScreenButton, OriginScreenButton } from './button';

import { QuickActionUI } from '../quick-action/quick-action-ui';
import { EnableViewportAction, SetViewportZoomAction } from '@axonivy/process-editor-protocol';
import { ReactUIExtension } from '../../utils/react-ui-extension';
import React from 'react';
import { default as ViewportBarComponent } from './ViewportBar';

@injectable()
export class ViewportBar extends ReactUIExtension implements IActionHandler {
  static readonly ID = 'ivy-viewport-bar';

  @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;
  @inject(TYPES.IToolManager) protected readonly toolManager: IToolManager;
  @inject(SelectionService) protected selectionService: SelectionService;

  protected zoomLevel = '100%';

  id(): string {
    return ViewportBar.ID;
  }

  containerClass(): string {
    return ViewportBar.ID;
  }

  protected initializeContainer(container: HTMLElement): void {
    super.initializeContainer(container);
    container.onwheel = ev => (ev.ctrlKey ? ev.preventDefault() : true);
  }

  protected render(): React.ReactNode {
    return (
      <ViewportBarComponent
        triggers={[
          new OriginScreenButton(),
          new FitToScreenButton(),
          new CenterButton(() => [...this.selectionService.getSelectedElementIDs()])
        ]}
        onAction={action => this.onAction(action)}
        zoomLevel={this.zoomLevel}
      />
    );
  }

  protected async onAction(action: Action): Promise<void> {
    await this.actionDispatcher.dispatch(action);
    const model = this.editorContext.modelRoot;
    if (isViewport(model)) {
      this.actionDispatcher.dispatchAll([
        SetUIExtensionVisibilityAction.create({
          extensionId: QuickActionUI.ID,
          visible: true,
          contextElementsId: [...this.selectionService.getSelectedElementIDs()]
        }),
        SetViewportAction.create(model.id, model, {})
      ]);
    }
  }

  handle(action: Action) {
    if (EnableViewportAction.is(action)) {
      this.actionDispatcher.dispatch(SetUIExtensionVisibilityAction.create({ extensionId: ViewportBar.ID, visible: true }));
    }
    if (SetViewportAction.is(action)) {
      this.updateZoomLevel(action.newViewport.zoom);
    } else if (SetViewportZoomAction.is(action)) {
      this.updateZoomLevel(action.zoom);
    }
  }

  private updateZoomLevel(zoom: number): void {
    this.zoomLevel = (zoom * 100).toFixed(0).toString() + '%';
    this.update();
  }
}
