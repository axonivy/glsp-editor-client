import { CenterAction, FitToScreenAction } from '@eclipse-glsp/client';
import { IvyIcons } from '@axonivy/ui-icons';
import { OriginViewportAction } from '@axonivy/process-editor-protocol';
import type { ViewportBarButton } from '@axonivy/process-editor-view';

export class CenterButton implements ViewportBarButton {
  constructor(
    public readonly elementIds: () => string[],
    public readonly icon = IvyIcons.Center,
    public readonly id = 'centerBtn',
    public readonly title = 'Center (M)',
    public readonly action = () => CenterAction.create(elementIds())
  ) {}
}

export class OriginScreenButton implements ViewportBarButton {
  constructor(
    public readonly icon = IvyIcons.WindowMinimize,
    public readonly id = 'originBtn',
    public readonly title = 'Origin screen (O)',
    public readonly action = () => OriginViewportAction.create()
  ) {}
}

export class FitToScreenButton implements ViewportBarButton {
  constructor(
    public readonly icon = IvyIcons.FitToScreen,
    public readonly id = 'fitToScreenBtn',
    public readonly title = 'Fit to screen (F)',
    public readonly action = () => FitToScreenAction.create([], { padding: 10 })
  ) {}
}
