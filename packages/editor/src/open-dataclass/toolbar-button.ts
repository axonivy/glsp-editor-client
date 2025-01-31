import { injectable } from 'inversify';
import { type ToolBarButtonProvider } from '../ui-tools/tool-bar/button';
import { OpenDataClassAction } from '@axonivy/process-editor-protocol';
import { IvyIcons } from '@axonivy/ui-icons';
import { ToolBarButtonLocation } from '@axonivy/process-editor-view';

@injectable()
export class OpenDataClassButtonProvider implements ToolBarButtonProvider {
  button() {
    return {
      icon: IvyIcons.DatabaseLink,
      title: 'Open Data Class (C)',
      id: 'btn_open_data_class',
      sorting: 'E',
      action: () => OpenDataClassAction.create(),
      location: ToolBarButtonLocation.Right,
      readonly: true
    };
  }
}
