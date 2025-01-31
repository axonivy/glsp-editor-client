/** @jsx svg */
import {
  GArgument,
  RectangularNodeView,
  type RenderingContext,
  GLabel,
  GLabelView,
  svg,
  hasArgs,
  isBoundsAware
} from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import type { VNode, VNodeStyle } from 'snabbdom';

import { LaneNode } from '../model';

@injectable()
export class LaneNodeView extends RectangularNodeView {
  render(node: LaneNode, context: RenderingContext): VNode {
    if (this.isEmbeddedLane(node)) {
      const topRightRadius = node.isFirstChild() ? 4 : 0;
      const bottomRightRadius = node.isLastChild() ? 4 : 0;
      // We adapt the height by 1px so it properly fits into the lane pool without overflowing by 1px. However, we cannot change the
      // height during hidden rendering as any action that fires a lot of local bounds requests (e.g. resizing) will make the lane
      // shrink by 1px on each request
      const heightAdapt = context.targetKind === 'hidden' ? 0 : 1;
      const path = `M0,0
      h${Math.max(node.size.width - topRightRadius, 0)}
      q${topRightRadius},0 ${topRightRadius},${topRightRadius}
      v${Math.max(node.size.height - heightAdapt - topRightRadius - bottomRightRadius, 0)}
      q0,${bottomRightRadius} -${bottomRightRadius},${bottomRightRadius}
      h-${Math.max(node.size.width - bottomRightRadius, 0)}
      z`;
      return (
        <g>
          <path class-sprotty-node class-selected={node.selected} d={path} {...{ style: this.laneStyle(node) }}></path>
          {context.renderChildren(node)}
        </g>
      );
    }
    return (
      <g>
        <rect
          class-sprotty-node
          class-selected={node.selected}
          x='0'
          y='0'
          rx='4px'
          ry='4px'
          width={Math.max(node.size.width, 0)}
          height={Math.max(node.size.height, 0)}
          {...{ style: this.laneStyle(node) }}
        ></rect>
        {this.getDecoratorLine(node)}
        {context.renderChildren(node)}
      </g>
    );
  }

  private isEmbeddedLane(node: LaneNode): boolean {
    return node.parent instanceof LaneNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getDecoratorLine(node: LaneNode): VNode | undefined {
    return;
  }

  protected laneStyle(node: LaneNode): VNodeStyle {
    if (node.color) {
      return { '--lane-color': node.color };
    }
    return {};
  }
}

@injectable()
export class PoolNodeView extends LaneNodeView {
  protected getDecoratorLine(node: LaneNode): VNode {
    const poolLaneSpace = this.getPoolLaneSpace(node);
    const nodeHeight = node.size.height;
    const path = `M${poolLaneSpace},0 v${nodeHeight} h-${poolLaneSpace - 4} q-4,0 -4,-4 v-${nodeHeight - 8} q0,-4 4,-4 z`;
    return <path class-sprotty-node class-pool-label-rect d={path} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override laneStyle(node: LaneNode): VNodeStyle {
    return {};
  }

  private getPoolLaneSpace(node: LaneNode) {
    let poolLaneSpace = 24;
    if (hasArgs(node) && node.args) {
      poolLaneSpace = GArgument.getNumber(node, 'poolLabelSpace') ?? 24;
    }
    return poolLaneSpace - 1;
  }
}

@injectable()
export class RotateLabelView extends GLabelView {
  render(label: Readonly<GLabel>): VNode | undefined {
    let height = label.bounds.height;
    if (isBoundsAware(label.parent)) {
      height = label.parent.bounds.height;
    }
    const rotate = `rotate(270) translate(-${height / 2} ${label.bounds.width / 2})`;
    return (
      <text class-sprotty-label transform={rotate}>
        {label.text.split('\n').map((line, index) => (
          <tspan key={index} dy={index === 0 ? 0 : '1.2em'} x={0} style={line ? {} : { visibility: 'hidden' }}>
            {line ? line : '.'}
          </tspan>
        ))}
      </text>
    );
  }
}
