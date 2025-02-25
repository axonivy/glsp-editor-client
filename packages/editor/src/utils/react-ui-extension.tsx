import * as React from 'react';
import { EditorContextService, GLSPAbstractUIExtension } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { createRoot, type Root } from 'react-dom/client';
import { SModelRootImpl } from 'sprotty';

@injectable()
export abstract class ReactUIExtension extends GLSPAbstractUIExtension {
  @inject(EditorContextService) protected editorContext: EditorContextService;

  protected nodeRoot: Root;
  protected currentRoot: Readonly<SModelRootImpl>;
  protected currentContextElementIds: string[];

  protected initializeContents(containerElement: HTMLElement): void {
    this.nodeRoot = createRoot(containerElement);
    // once initialized and added to the DOM, we do not remove the UI extension from the DOM again
    // if we were to do that, we should make sure to call this.nodeRoot.unmount()
  }

  protected abstract render(root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): React.ReactNode;

  protected onBeforeShow(containerElement: HTMLElement, root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): void {
    this.currentRoot = root;
    this.currentContextElementIds = contextElementIds;
    super.onBeforeShow(containerElement, root, ...contextElementIds);
    this.update();
  }

  protected update(): void {
    const root = this.currentRoot ?? this.editorContext.modelRoot;
    const contextElementIds = this.currentContextElementIds ?? [];
    if (this.nodeRoot) {
      this.nodeRoot.render(
        <React.Fragment>
          <React.StrictMode>{this.render(root, ...contextElementIds)}</React.StrictMode>
        </React.Fragment>
      );
    }
  }
}
