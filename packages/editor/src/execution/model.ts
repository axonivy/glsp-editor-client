import type { GModelElement } from '@eclipse-glsp/client';

export const executionFeature = Symbol('executionFeature');

export interface Executable {
  executionCount?: number;
}

export function isExecutable(element: GModelElement): element is GModelElement {
  return element.hasFeature(executionFeature);
}
