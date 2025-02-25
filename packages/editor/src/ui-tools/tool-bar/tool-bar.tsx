import {
  Action,
  DisposableCollection,
  EnableDefaultToolsAction,
  EnableToolPaletteAction,
  type IActionHandler,
  type IEditModeListener,
  ISelectionListener,
  MouseListener,
  SelectAllAction,
  SelectionService,
  SetUIExtensionVisibilityAction,
  TYPES,
  isNotUndefined,
  type IActionDispatcher
} from '@eclipse-glsp/client';
import { inject, injectable, multiInject, postConstruct } from 'inversify';

import { IVY_TYPES } from '../../types';
import type { Menu } from '../menu/menu';
import {
  DefaultSelectButton,
  MarqueeToolButton,
  RedoToolButton,
  type ToolBarButtonProvider,
  UndoToolButton,
  compareButtons
} from './button';
import { ShowToolBarOptionsMenuAction } from './options/action';
import { ToolBarOptionsMenu } from './options/options-menu-ui';
import { ShowToolBarMenuAction, ToolBarMenu } from './tool-bar-menu';
import { UpdatePaletteItems } from '@axonivy/process-editor-protocol';
import { ReactUIExtension } from '../../utils/react-ui-extension';
import { SModelRootImpl } from 'sprotty';
import React from 'react';
import { type ToolBarButtonClickEvent, default as ToolBarComponent } from './ToolBar';
import { ToolBarButtonLocation, type ToolBarButton } from '@axonivy/process-editor-view';

@injectable()
export class ToolBar extends ReactUIExtension implements IActionHandler, IEditModeListener, ISelectionListener {
  static readonly ID = 'ivy-tool-bar';

  @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;
  @inject(SelectionService) protected readonly selectionService: SelectionService;
  @multiInject(IVY_TYPES.ToolBarButtonProvider) protected toolBarButtonProvider: ToolBarButtonProvider[];

  protected lastButtonClickEvent?: ToolBarButtonClickEvent;
  protected lastMenuAction?: string;
  protected toolBarMenu?: Menu;

  protected toDisposeOnDisable = new DisposableCollection();
  protected toDisposeOnHide = new DisposableCollection();

  id(): string {
    return ToolBar.ID;
  }

  @postConstruct()
  protected init() {
    this.toDisposeOnDisable.push(this.editorContext.onEditModeChanged(() => this.editModeChanged()));
  }

  containerClass() {
    return ToolBar.ID;
  }

  protected initializeContents(containerElement: HTMLElement) {
    super.initializeContents(containerElement);
    containerElement.onwheel = ev => (ev.ctrlKey ? ev.preventDefault() : true);
  }

  protected onBeforeShow(containerElement: HTMLElement, root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): void {
    super.onBeforeShow(containerElement, root, ...contextElementIds);
    this.toDisposeOnHide.push(this.selectionService.onSelectionChanged(() => this.selectionChanged()));
  }

  hide() {
    super.hide();
    this.toDisposeOnHide.dispose();
  }

  protected render(): React.ReactNode {
    return (
      <ToolBarComponent
        activeButtonId={this.lastButtonClickEvent?.source.id ?? DefaultSelectButton.id}
        left={[DefaultSelectButton, MarqueeToolButton, ...this.getProvidedToolBarButtons(ToolBarButtonLocation.Left)]}
        edit={this.editorContext.isReadonly ? [] : [UndoToolButton, RedoToolButton]}
        middle={this.getProvidedToolBarButtons(ToolBarButtonLocation.Middle)}
        right={this.getProvidedToolBarButtons(ToolBarButtonLocation.Right)}
        onClick={evt => {
          this.dispatchAction([evt.action]);
          if (evt.source.switchFocus) {
            this.changeActiveButton(evt);
          }
        }}
      />
    );
  }

  protected getProvidedToolBarButtons(location: ToolBarButtonLocation): ToolBarButton[] {
    return this.toolBarButtonProvider
      .map(provider => provider.button())
      .filter(isNotUndefined)
      .filter(button => button.location === location)
      .filter(button => !this.editorContext.isReadonly || button.readonly)
      .sort(compareButtons);
  }

  private dispatchAction(actions: Action[]): void {
    this.actionDispatcher.dispatchAll(actions.concat(SelectAllAction.create(false)));
  }

  handle(action: Action) {
    if (EnableToolPaletteAction.is(action)) {
      return SetUIExtensionVisibilityAction.create({ extensionId: ToolBar.ID, visible: true });
    }
    if (EnableDefaultToolsAction.is(action)) {
      this.changeActiveButton();
      this.restoreFocus();
    }
    if (ShowToolBarOptionsMenuAction.is(action)) {
      this.toggleOptionsMenu(action);
    }
    if (ShowToolBarMenuAction.is(action)) {
      this.toggleToolBarMenu(action);
    }
    if (UpdatePaletteItems.is(action)) {
      if (this.containerElement) {
        this.update();
      }
    }
    return;
  }

  async toggleToolBarMenu(action: ShowToolBarMenuAction): Promise<void> {
    const items = await action.paletteItems();
    if (items.length !== 0 && action.id !== this.lastMenuAction) {
      this.toolBarMenu = new ToolBarMenu(this.actionDispatcher, action, items);
      const menu = this.toolBarMenu.create(this.containerElement);
      if (this.lastButtonClickEvent?.reference) {
        const menuRight = menu.offsetLeft + menu.offsetWidth;
        const buttonCenter = this.lastButtonClickEvent.reference.offsetLeft + this.lastButtonClickEvent.reference.offsetWidth / 2;
        menu.style.setProperty('--menu-arrow-pos', `${menuRight - buttonCenter - 6}px`);
      }
      this.setLastMenuAction(action.id);
    } else {
      this.changeActiveButton();
      this.setLastMenuAction(undefined);
      // Reset focus to diagram
      document.getElementById(this.options.baseDiv)?.querySelector<HTMLDivElement>('div[tabindex]')?.focus();
    }
  }

  toggleOptionsMenu(action: ShowToolBarOptionsMenuAction): void {
    if (action.id !== this.lastMenuAction) {
      this.toolBarMenu = new ToolBarOptionsMenu(this.actionDispatcher, action);
      this.toolBarMenu.create(this.containerElement);
      this.setLastMenuAction(action.id);
    } else {
      this.changeActiveButton();
      this.setLastMenuAction(undefined);
    }
  }

  setLastMenuAction(id?: string): void {
    this.lastMenuAction = id;
  }

  changeActiveButton(evt?: ToolBarButtonClickEvent): void {
    this.lastButtonClickEvent = evt;
    this.hideMenus();
    this.update();
  }

  hideMenus(): void {
    this.toolBarMenu?.remove();
    this.toolBarMenu = undefined;
  }

  editModeChanged(): void {
    if (this.containerElement) {
      this.changeActiveButton();
    }
  }

  selectionChanged(): void {
    // placeholder
  }

  disable(): void {
    this.toDisposeOnDisable.dispose();
  }
}

@injectable()
export class ToolBarFocusMouseListener extends MouseListener {
  constructor(@inject(ToolBar) private readonly toolBar: ToolBar) {
    super();
  }

  mouseDown(): Action[] {
    this.toolBar.changeActiveButton();
    this.toolBar.setLastMenuAction();
    return [];
  }
}
