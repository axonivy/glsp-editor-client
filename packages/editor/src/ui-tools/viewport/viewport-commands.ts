import {
  Bounds,
  Command,
  CommandExecutionContext,
  CommandReturn,
  BoundsAwareViewportCommand,
  Dimension,
  FitToScreenAction,
  FitToScreenCommand,
  isBoundsAware,
  isViewport,
  Point,
  SModelRoot,
  TYPES,
  Viewport
} from '@eclipse-glsp/client';
import { inject } from 'inversify';
import { ToolBar } from '../tool-bar/tool-bar';
import { MoveIntoViewportAction, OriginViewportAction, SetViewportZoomAction } from '@axonivy/process-editor-protocol';

export class OriginViewportCommand extends BoundsAwareViewportCommand {
  static readonly KIND = OriginViewportAction.KIND;

  constructor(@inject(TYPES.Action) protected action: OriginViewportAction) {
    super(action.animate);
  }

  getElementIds(): string[] {
    return [];
  }

  getNewViewport(bounds: Bounds, model: SModelRoot): Viewport | undefined {
    return { zoom: 1, scroll: { x: 0, y: -48 } };
  }
}

export class IvyFitToScreenCommand extends FitToScreenCommand {
  static readonly KIND = FitToScreenAction.KIND;

  constructor(@inject(TYPES.Action) protected readonly action: FitToScreenAction) {
    super(action);
  }

  getNewViewport(bounds: Bounds, model: SModelRoot): Viewport | undefined {
    if (!Dimension.isValid(model.canvasBounds)) {
      return undefined;
    }
    const c = Bounds.center(bounds);
    const delta = this.action.padding === undefined ? 0 : 2 * this.action.padding;
    const toolBarHeight = this.toolBarHeight();
    let zoom = Math.min(
      model.canvasBounds.width / (bounds.width + delta),
      (model.canvasBounds.height - toolBarHeight) / (bounds.height + delta)
    );
    if (this.action.maxZoom !== undefined) {
      zoom = Math.min(zoom, this.action.maxZoom);
    }
    if (zoom === Infinity) {
      zoom = 1;
    }
    return {
      scroll: {
        x: c.x - (0.5 * model.canvasBounds.width) / zoom,
        y: c.y - (0.5 * (model.canvasBounds.height + toolBarHeight)) / zoom
      },
      zoom: zoom
    };
  }

  private toolBarHeight(): number {
    const toolBar = document.querySelector('[id$="_' + ToolBar.ID + '"]');
    return toolBar ? toolBar.getBoundingClientRect().height : 0;
  }

  protected initialize(model: SModelRoot): void {
    if (isViewport(model)) {
      this.oldViewport = {
        scroll: model.scroll,
        zoom: model.zoom
      };
      const allBounds: Bounds[] = [];
      if (allBounds.length === 0) {
        model.index.all().forEach(element => {
          if (isBoundsAware(element)) {
            allBounds.push(this.boundsInViewport(element, element.bounds, model));
          }
        });
      }
      if (allBounds.length !== 0) {
        const bounds = allBounds.reduce((b0, b1) => Bounds.combine(b0, b1));
        if (Dimension.isValid(bounds)) {
          this.newViewport = this.getNewViewport(bounds, model);
        }
      }
    }
  }
}

export class MoveIntoViewportCommand extends BoundsAwareViewportCommand {
  static readonly KIND = MoveIntoViewportAction.KIND;

  constructor(@inject(TYPES.Action) protected action: MoveIntoViewportAction) {
    super(action.animate);
  }

  getElementIds(): string[] {
    return this.action.elementIds;
  }

  getNewViewport(bounds: Bounds, model: SModelRoot): Viewport | undefined {
    if (!Dimension.isValid(model.canvasBounds)) {
      return undefined;
    }
    return moveIntoViewport(
      model.canvasBounds,
      isViewport(model) ? model.scroll : Point.ORIGIN,
      Bounds.center(bounds),
      this.action.retainZoom && isViewport(model) ? model.zoom : 1
    );
  }
}

export function moveIntoViewport(viewPort: Bounds, currentScrollPos: Point, elementPos: Point, zoom: number): Viewport {
  return {
    scroll: {
      x: calculateScroll(viewPort.width, currentScrollPos.x, elementPos.x, zoom),
      y: calculateScroll(viewPort.height, currentScrollPos.y, elementPos.y, zoom)
    },
    zoom: zoom
  };
}

function calculateScroll(viewPort: number, currentScrollPos: number, elementPos: number, zoom: number): number {
  const effectivePos = elementPos - currentScrollPos;
  return effectivePos > viewPort || effectivePos < 0 ? elementPos - (0.5 * viewPort) / zoom : currentScrollPos;
}

export class IvySetViewportZoomCommand extends Command {
  static readonly KIND = SetViewportZoomAction.KIND;

  constructor(@inject(TYPES.Action) protected readonly action: SetViewportZoomAction) {
    super();
  }

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    if (isViewport(model)) {
      model.zoom = this.action.zoom;
    }
    return model;
  }

  undo(context: CommandExecutionContext): CommandReturn {
    context.logger.error(this, 'Cannot undo a ivy viewport zoom command');
    return context.root;
  }
  redo(context: CommandExecutionContext): CommandReturn {
    context.logger.error(this, 'Cannot redo a ivy viewport zoom command');
    return context.root;
  }
}
