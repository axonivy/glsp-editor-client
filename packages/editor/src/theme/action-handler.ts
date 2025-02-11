import { SwitchThemeAction, type ThemeMode } from '@axonivy/process-editor-protocol';
import { Action, type IActionHandler } from '@eclipse-glsp/client';
import { injectable } from 'inversify';

@injectable()
export class SwitchThemeActionHandler implements IActionHandler {
  theme(): ThemeMode {
    return (document.documentElement.dataset.theme as ThemeMode) ?? SwitchThemeActionHandler.prefsColorScheme();
  }

  handle(action: Action) {
    if (SwitchThemeAction.is(action)) {
      const root = document.documentElement;
      root.dataset.theme = action.theme;
      root.classList.remove('light', 'dark');
      root.classList.add(action.theme);
    }
  }

  static prefsColorScheme(): ThemeMode {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
