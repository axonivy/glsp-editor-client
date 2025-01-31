/** @jsx svg */
import { ATTR_BBOX_ELEMENT, GShapeElement, RectangularNodeView, type RenderingContext, svg } from '@eclipse-glsp/client';
import { inject, injectable, optional } from 'inversify';
import type { VNode } from 'snabbdom';
import { createExecutionBadge } from '../../execution/views';

import { CustomIconToggleActionHandler } from '../../ui-tools/tool-bar/options/action-handler';
import { getActivityIconDecorator } from '../icon/views';
import { ActivityNode } from '../model';

@injectable()
export class ActivityNodeView extends RectangularNodeView {
  @inject(CustomIconToggleActionHandler) @optional() protected customIconHandler?: CustomIconToggleActionHandler;

  render(node: ActivityNode, context: RenderingContext): VNode | undefined {
    if (!this.isVisible(node, context)) {
      return undefined;
    }
    const rcr = this.getRoundedCornerRadius(node);
    return (
      <g>
        <rect
          attrs={{ [ATTR_BBOX_ELEMENT]: true }}
          class-sprotty-node
          class-mouseover={node.hoverFeedback}
          class-selected={node.selected}
          x={0}
          y={0}
          rx={rcr}
          ry={rcr}
          width={node.bounds.width}
          height={node.bounds.height}
          style={{ stroke: node.color }}
        />
        {context.renderChildren(node)}
        {getActivityIconDecorator(node, this.customIconHandler?.isShowCustomIcons ? node.customIcon : node.type)}
        {this.getNodeDecorator(node)}
        {createExecutionBadge(node, node.bounds.width)}
      </g>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getNodeDecorator(node: ActivityNode): VNode | undefined {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getRoundedCornerRadius(node: GShapeElement): number {
    return 5;
  }
}

@injectable()
export class SubActivityNodeView extends ActivityNodeView {
  protected getNodeDecorator(node: ActivityNode): VNode {
    const diameter = 12;
    const radius = diameter / 2;
    const padding = 2;
    const innerPadding = 3;
    return (
      <svg x={node.bounds.width / 2 - radius} y={node.bounds.height - diameter - 1} height={diameter} width={diameter}>
        <rect class-sprotty-node class-sprotty-task-node x={1} y={1} rx={2} ry={2} width={diameter - padding} height={diameter - padding} />
        <line class-sprotty-node-decorator x1={radius} y1={innerPadding} x2={radius} y2={diameter - innerPadding} />
        <line class-sprotty-node-decorator x1={innerPadding} y1={radius} x2={diameter - innerPadding} y2={radius} />
      </svg>
    );
  }
}
