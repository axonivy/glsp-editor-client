import { ToolBarButtonLocation, type ToolBarButton } from '@axonivy/process-editor-view';
import { IvyIcons } from '@axonivy/ui-icons';
import {
  EnableDefaultToolsAction,
  EnableToolsAction,
  type IGridManager,
  MarqueeMouseTool,
  RedoAction,
  TYPES,
  UndoAction
} from '@eclipse-glsp/client';
import { inject, injectable, optional } from 'inversify';
import { SwitchThemeActionHandler } from '../../theme/action-handler';
import { ShowToolBarOptionsMenuAction } from './options/action';
import { CustomIconToggleActionHandler } from './options/action-handler';

export interface ToolBarButtonProvider {
  button(): ToolBarButton | undefined;
}

export function compareButtons(a: ToolBarButton, b: ToolBarButton): number {
  const sortStringBased = a.sorting.localeCompare(b.sorting);
  if (sortStringBased !== 0) {
    return sortStringBased;
  }
  return a.title.localeCompare(b.title);
}

export const DefaultSelectButton: ToolBarButton = {
  icon: IvyIcons.SelectionTool,
  title: 'Selection Tool',
  sorting: 'A',
  action: () => EnableDefaultToolsAction.create(),
  id: 'btn_default_tools',
  location: ToolBarButtonLocation.Left,
  readonly: true,
  switchFocus: true
};

export const MarqueeToolButton: ToolBarButton = {
  icon: IvyIcons.MultiSelection,
  title: 'Marquee Tool (Shift)',
  sorting: 'B',
  action: () => EnableToolsAction.create([MarqueeMouseTool.ID]),
  id: 'btn_marquee_tools',
  location: ToolBarButtonLocation.Left,
  readonly: true,
  switchFocus: true
};

export const UndoToolButton: ToolBarButton = {
  icon: IvyIcons.Undo,
  title: 'Undo',
  sorting: 'C',
  action: () => UndoAction.create(),
  id: 'btn_undo_tools',
  location: ToolBarButtonLocation.Left
};

export const RedoToolButton: ToolBarButton = {
  icon: IvyIcons.Redo,
  title: 'Redo',
  sorting: 'D',
  action: () => RedoAction.create(),
  id: 'btn_redo_tools',
  location: ToolBarButtonLocation.Left
};

@injectable()
export class OptionsButtonProvider implements ToolBarButtonProvider {
  @inject(CustomIconToggleActionHandler) protected customIconHandler: CustomIconToggleActionHandler;
  @inject(TYPES.IGridManager) protected gridManager: IGridManager;
  @inject(SwitchThemeActionHandler) @optional() protected switchThemeHandler?: SwitchThemeActionHandler;

  button() {
    const customIconState = () => this.customIconHandler.isShowCustomIcons;
    const grid = () => this.gridManager.isGridVisible;
    const handler = this.switchThemeHandler;
    const theme = handler ? () => handler.theme() : undefined;
    return {
      icon: IvyIcons.Settings,
      title: 'Settings',
      sorting: 'Y',
      action: () => ShowToolBarOptionsMenuAction.create({ customIconState, grid, theme }),
      id: 'btn_options_menu',
      location: ToolBarButtonLocation.Right,
      readonly: true,
      switchFocus: true
    };
  }
}
