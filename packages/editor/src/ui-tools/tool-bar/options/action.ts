import { Action } from '@eclipse-glsp/client';

export interface ShowToolBarOptionsMenuAction extends Action {
  kind: typeof ShowToolBarOptionsMenuAction.KIND;
  id: 'options_menu';
  customIconState: () => boolean;
  grid: () => boolean;
  theme?: () => string;
}

export namespace ShowToolBarOptionsMenuAction {
  export const KIND = 'showToolBarOptionsMenu';

  export function create(options: {
    customIconState: () => boolean;
    grid: () => boolean;
    theme?: () => string;
  }): ShowToolBarOptionsMenuAction {
    return {
      kind: KIND,
      id: 'options_menu',
      ...options
    };
  }

  export function is(object: unknown): object is ShowToolBarOptionsMenuAction {
    return Action.hasKind(object, KIND);
  }
}
