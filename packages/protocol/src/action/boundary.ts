import type { Operation } from '@eclipse-glsp/protocol';
import { Action, hasStringProp } from '@eclipse-glsp/protocol';

export interface AttachBoundaryOperation extends Operation {
  kind: typeof AttachBoundaryOperation.KIND;
  elementId: string;
  eventKind: string;
}

export namespace AttachBoundaryOperation {
  export const KIND = 'attachBoundary';

  export function is(object: unknown): object is AttachBoundaryOperation {
    return Action.hasKind(object, KIND) && hasStringProp(object, 'elementId') && hasStringProp(object, 'eventKind');
  }

  export function create(options: { elementId: string; eventKind: string }): AttachBoundaryOperation {
    return {
      kind: KIND,
      isOperation: true,
      ...options
    };
  }
}
