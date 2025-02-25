import { InscriptionClientJsonRpc, IvyScriptLanguage } from '@axonivy/process-editor-inscription-core';
import { ClientContextProvider, MonacoEditorUtil, QueryProvider, initQueryClient } from '@axonivy/process-editor-inscription-view';
import type { InscriptionContext } from '@axonivy/process-editor-inscription-protocol';
import { JumpAction, MoveIntoViewportAction, SwitchThemeAction } from '@axonivy/process-editor-protocol';
import {
  Action,
  GArgument,
  GModelRoot,
  type IActionHandler,
  ISelectionListener,
  SelectAction,
  SelectAllAction,
  SelectionService,
  TYPES,
  isNotUndefined,
  isOpenable,
  type IActionDispatcher
} from '@eclipse-glsp/client';
import { webSocketConnection, type Connection } from '@axonivy/jsonrpc';
import type { MonacoLanguageClient } from 'monaco-languageclient';
import { QueryClient } from '@tanstack/react-query';
import { inject, injectable, postConstruct } from 'inversify';

import { OpenAction } from 'sprotty-protocol';
import InscriptionView from './InscriptionView';
import { EnableInscriptionAction, ToggleInscriptionAction } from './action';
import * as React from 'react';
import { ReactUIExtension } from '@axonivy/process-editor';

@injectable()
export class InscriptionUi extends ReactUIExtension implements IActionHandler, ISelectionListener {
  static readonly ID = 'inscription-ui';

  @inject(SelectionService) protected readonly selectionService: SelectionService;
  @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;

  private inscriptionElement?: string;
  private action?: EnableInscriptionAction;
  private inscriptionContext: InscriptionContext;
  private inscriptionClient?: Promise<InscriptionClientJsonRpc>;
  private resolvedInscriptionClient?: InscriptionClientJsonRpc;
  private queryClient: QueryClient;

  public id(): string {
    return InscriptionUi.ID;
  }

  @postConstruct()
  protected init(): void {
    this.selectionService.onSelectionChanged(event => this.selectionChanged(event.root, event.selectedElements));
  }

  public containerClass(): string {
    return 'inscription-ui-container';
  }

  protected resolveInscriptionClient(client: InscriptionClientJsonRpc) {
    this.resolvedInscriptionClient = client;
    return client;
  }

  protected initializeContents(containerElement: HTMLElement) {
    super.initializeContents(containerElement);
    this.changeUiVisiblitiy(false);
    this.inscriptionContext = this.initInscriptionContext();
    this.queryClient = initQueryClient();
    this.inscriptionClient = this.startInscriptionClient().then(client => this.resolveInscriptionClient(client));
  }

  protected render(): React.ReactNode {
    const element = this.inscriptionElement;
    if (!element) {
      return;
    }
    if (!this.resolvedInscriptionClient) {
      this.inscriptionClient?.then(() => this.update());
      return;
    }
    return (
      <ClientContextProvider client={this.resolvedInscriptionClient}>
        <QueryProvider client={this.queryClient}>
          <InscriptionView
            app={this.inscriptionContext.app}
            pmv={this.inscriptionContext.pmv}
            pid={element}
            outline={{
              selection: this.selectionService.getSelectedElementIDs()[0],
              onClick: id => this.selectFromOutline(id)
            }}
          />
        </QueryProvider>
      </ClientContextProvider>
    );
  }

  async startInscriptionClient(): Promise<InscriptionClientJsonRpc> {
    const model = this.selectionService.getModelRoot();
    const webSocketAddress = this.action?.connection?.server ?? GArgument.getString(model, 'webSocket') ?? 'ws://localhost:8081/';
    if (this.action?.connection?.ivyScript) {
      IvyScriptLanguage.startClient(this.action?.connection?.ivyScript, MonacoEditorUtil.getInstance());
    } else {
      this.startIvyScriptWebSocketClient(webSocketAddress);
    }
    if (this.action?.connection?.inscription) {
      return InscriptionClientJsonRpc.startClient(this.action.connection.inscription);
    }
    return this.startInscriptionWebSocketClient(webSocketAddress);
  }

  private async startIvyScriptWebSocketClient(webSocketAddress: string) {
    const initScript = async (connection: Connection) => IvyScriptLanguage.startClient(connection, MonacoEditorUtil.getInstance());
    const reconnectScript = async (connection: Connection, oldClient: MonacoLanguageClient) => {
      try {
        await oldClient.stop(0);
      } catch (error) {
        console.warn(error);
      }
      return initScript(connection);
    };
    webSocketConnection<MonacoLanguageClient>(IvyScriptLanguage.webSocketUrl(webSocketAddress)).listen({
      onConnection: initScript,
      onReconnect: reconnectScript,
      logger: console
    });
  }

  private async startInscriptionWebSocketClient(webSocketAddress: string) {
    const initInscription = async (connection: Connection) => {
      this.inscriptionClient = InscriptionClientJsonRpc.startClient(connection).then(client => this.resolveInscriptionClient(client));
      return this.inscriptionClient;
    };
    const reconnectInscription = async (connection: Connection, oldClient: InscriptionClientJsonRpc) => {
      try {
        await oldClient.stop();
      } catch (error) {
        console.warn(error);
      }
      return initInscription(connection);
    };
    return webSocketConnection<InscriptionClientJsonRpc>(InscriptionClientJsonRpc.webSocketUrl(webSocketAddress)).listen({
      onConnection: initInscription,
      onReconnect: reconnectInscription,
      logger: console
    });
  }

  handle(action: Action) {
    if (EnableInscriptionAction.is(action)) {
      this.action = action;
      this.initialize();
    }
    if (ToggleInscriptionAction.is(action)) {
      if (!this.inscriptionElement) {
        this.inscriptionElement = this.selectionService.getModelRoot().id;
        this.update();
      }
      this.changeUiVisiblitiy(action.force);
    }
    if (Action.is(action) && action.kind === OpenAction.KIND) {
      this.changeUiVisiblitiy(true);
    }
    if (SwitchThemeAction.is(action)) {
      this.update();
      MonacoEditorUtil.setTheme(action.theme);
    }
    return;
  }

  private initInscriptionContext() {
    const model = this.selectionService.getModelRoot();
    if (this.action?.inscriptionContext) {
      return this.action.inscriptionContext;
    }
    return {
      app: GArgument.getString(model, 'app') ?? 'designer',
      pmv: GArgument.getString(model, 'pmv') ?? ''
    };
  }

  private changeUiVisiblitiy(force?: boolean) {
    if (force !== undefined) {
      this.setContainerVisible(force);
    } else {
      this.toggleContainerVisible();
    }
    window.dispatchEvent(new CustomEvent('resize'));
  }

  selectionChanged(root: Readonly<GModelRoot>, selectedElements: string[]): void {
    const selected = selectedElements
      .map(id => root.index.getById(id))
      .filter(isNotUndefined)
      .filter(isOpenable)[0];
    if (selected) {
      this.inscriptionElement = selected.id;
    } else {
      this.inscriptionElement = this.inscriptionElement ? root.id : undefined;
      if (!this.isOutlineOpen()) {
        this.changeUiVisiblitiy(false);
      }
    }
    this.update();
  }

  private isOutlineOpen() {
    return this.containerElement.querySelector('.ui-outline') !== null;
  }

  selectFromOutline(id: string) {
    const actions = [
      SelectAction.create({ selectedElementsIDs: [id], deselectedElementsIDs: true }),
      MoveIntoViewportAction.create({ elementIds: [id] })
    ];
    const parent = id.substring(0, id.lastIndexOf('-'));
    if (this.selectionService.getModelRoot().id !== parent) {
      this.actionDispatcher.dispatch(JumpAction.create({ elementId: parent, noViewportUpdate: true }));
      this.actionDispatcher.dispatch(SelectAllAction.create(false));
      this.actionDispatcher.dispatchAfterNextUpdate(...actions);
    } else {
      this.actionDispatcher.dispatchAll(actions);
    }
  }
}
