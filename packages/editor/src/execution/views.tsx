/** @jsx svg */
import { svg } from '@eclipse-glsp/client';
import type { VNode } from 'snabbdom';
import type { Executable } from './model';

export function createExecutionBadge(node: Executable, width: number): VNode | undefined {
  if (node.executionCount) {
    return (
      <g>
        <rect class-execution-badge rx='7' ry='7' x={width - 11} y={-7} width={22} height={14}></rect>
        <text class-execution-text x={width} dy='.4em'>
          {node.executionCount}
        </text>
      </g>
    );
  }
  return;
}
