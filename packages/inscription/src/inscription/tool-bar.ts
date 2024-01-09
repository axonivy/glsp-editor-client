import { ToolBarButtonLocation, ToolBarButtonProvider } from '@axonivy/process-editor';
import { IvyIcons } from '@axonivy/editor-icons/lib';
import { injectable } from 'inversify';
import { ToggleInscriptionAction } from './action';

@injectable()
export class InscriptionButtonProvider implements ToolBarButtonProvider {
  button() {
    return {
      icon: IvyIcons.LayoutSidebarRightCollapse,
      title: 'Inscription',
      sorting: 'Z',
      action: () => ToggleInscriptionAction.create({}),
      id: 'btn_inscription_toggle',
      location: ToolBarButtonLocation.Right,
      readonly: true
    };
  }
}
