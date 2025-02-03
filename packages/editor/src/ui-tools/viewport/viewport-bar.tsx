import {
  Action,
  IActionHandler,
  isViewport,
  IToolManager,
  SetUIExtensionVisibilityAction,
  SetViewportAction,
  TYPES,
  SelectionService,
  type IActionDispatcher
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { CenterButton, FitToScreenButton, OriginScreenButton, ViewportBarButton } from './button';

import { QuickActionUI } from '../quick-action/quick-action-ui';
import { EnableViewportAction, SetViewportZoomAction } from '@axonivy/process-editor-protocol';
import { ReactUIExtension } from '../../utils/react-ui-extension';
import React from 'react';
import IvyIcon from '../../utils/ui-components';

const JSX = { createElement: React.createElement };

@injectable()
export class ViewportBar extends ReactUIExtension implements IActionHandler {
  static readonly ID = 'ivy-viewport-bar';

  @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;
  @inject(TYPES.IToolManager) protected readonly toolManager: IToolManager;
  @inject(SelectionService) protected selectionService: SelectionService;

  protected zoomLevel = '100%';
  protected zoomLevelElement?: HTMLElement;

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
      <div className='viewport-bar'>
        <div className='viewport-bar-tools'>
          {this.createViewportButton(new OriginScreenButton())}
          {this.createViewportButton(new FitToScreenButton())}
          {this.createViewportButton(new CenterButton(() => [...this.selectionService.getSelectedElementIDs()]))}
          <label>{this.zoomLevel}</label>
        </div>
      </div>
    );
  }

  protected createViewportButton(toolButton: ViewportBarButton): React.ReactNode {
    return (
      <button
        id={toolButton.id}
        title={toolButton.title}
        onClick={() => {
          this.actionDispatcher.dispatch(toolButton.action()).then(() => {
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
          });
        }}
      >
        <IvyIcon icon={toolButton.icon} />
      </button>
    );
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
    if (this.zoomLevelElement) {
      this.zoomLevelElement.textContent = this.zoomLevel;
    }
  }
}
