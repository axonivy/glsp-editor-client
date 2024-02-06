import { IVY_TYPES, ToolBar, ivyToolBarModule, overrideIvyViewerOptions } from '@axonivy/process-editor';
import { EnableViewportAction, MoveIntoViewportAction, SetViewportZoomAction, SwitchThemeAction } from '@axonivy/process-editor-protocol';
import {
  Action,
  CenterAction,
  EnableToolPaletteAction,
  GLSPActionDispatcher,
  IDiagramStartup,
  NavigationTarget,
  SelectAction,
  TYPES
} from '@eclipse-glsp/client';
import { ContainerModule, inject, injectable, Container, interfaces } from 'inversify';
import { IvyDiagramOptions } from './di.config';
import { isInPreviewMode, isInViewerMode } from './url-helper';

const ContainerSymbol = Symbol('ContainerSymbol');

@injectable()
export class ViewerDiagramStartup implements IDiagramStartup {
  @inject(GLSPActionDispatcher)
  protected actionDispatcher: GLSPActionDispatcher;

  @inject(TYPES.IDiagramOptions)
  protected options: IvyDiagramOptions;

  @inject(ContainerSymbol)
  protected container: interfaces.Container;

  async postModelInitialization(): Promise<void> {
    await this.dispatchAfterModelInitialized();
    if (isInViewerMode() || isInPreviewMode()) {
      this.setViewerMode();
    } else {
      this.actionDispatcher.dispatch(EnableToolPaletteAction.create());
    }
    if (!isInPreviewMode()) {
      this.actionDispatcher.dispatch(EnableViewportAction.create());
    }
  }

  protected async dispatchAfterModelInitialized(): Promise<void> {
    const actions: Action[] = [];
    if (this.isNumeric(this.options.zoom)) {
      actions.push(SetViewportZoomAction.create({ zoom: +this.options.zoom / 100 }));
      actions.push(...this.showElement((ids: string[]) => CenterAction.create(ids, { animate: false, retainZoom: true })));
    } else {
      actions.push(
        ...this.showElement((ids: string[]) => MoveIntoViewportAction.create({ elementIds: ids, animate: false, retainZoom: true }))
      );
    }
    actions.push(SwitchThemeAction.create({ theme: this.options.theme }));
    return this.actionDispatcher.dispatchAll(actions);
  }

  protected showElement(action: (elementIds: string[]) => Action): Action[] {
    if (this.options.highlight) {
      return [action([this.options.highlight])];
    }
    if (this.options.selectElementIds) {
      const elementIds = this.options.selectElementIds.split(NavigationTarget.ELEMENT_IDS_SEPARATOR);
      return [SelectAction.create({ selectedElementsIDs: elementIds }), action(elementIds)];
    }
    return [];
  }

  protected isNumeric(num: any): boolean {
    return !isNaN(parseFloat(num)) && isFinite(num);
  }

  protected setViewerMode(): void {
    this.container.get<ToolBar>(IVY_TYPES.ToolBar).disable();
    this.container.unload(ivyToolBarModule);
    overrideIvyViewerOptions(this.container, { hideSensitiveInfo: true });
  }
}

export const ivyStartupDiagramModule = new ContainerModule(bind => {
  bind(TYPES.IDiagramStartup)
    .toDynamicValue(ctx => {
      const child = ctx.container.createChild();
      child.bind(ViewerDiagramStartup).toSelf().inSingletonScope();
      child.bind(ContainerSymbol).toConstantValue(ctx.container);
      return child.get(ViewerDiagramStartup);
    })
    .inSingletonScope();
});
