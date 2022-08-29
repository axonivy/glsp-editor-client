import { RectangularNodeView, RenderingContext, SShapeElement, svg } from '@eclipse-glsp/client';
import { inject, injectable, optional } from 'inversify';
import { VNode } from 'snabbdom';
import { createExecutionBadge } from '../../execution/views';

import { CustomIconToggleActionHandler } from '../../ui-tools/tool-bar/options/action-handler';
import { getActivityIconDecorator } from '../icon/views';
import { ActivityNode } from '../model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class ActivityNodeView extends RectangularNodeView {
  @inject(CustomIconToggleActionHandler) @optional() protected customIconHandler?: CustomIconToggleActionHandler;

  render(node: ActivityNode, context: RenderingContext): VNode {
    const rcr = this.getRoundedCornerRadius(node);
    const width = Math.max(0, node.bounds.width);
    const height = Math.max(0, node.bounds.height);
    return (
      <g>
        <rect
          class-sprotty-node={true}
          class-mouseover={node.hoverFeedback}
          class-selected={node.selected}
          x={0}
          y={0}
          rx={rcr}
          ry={rcr}
          width={width}
          height={height}
          style={{ stroke: node.color }}
        ></rect>
        {context.renderChildren(node)}
        {getActivityIconDecorator(this.customIconHandler?.isShowCustomIcons ? node.customIcon : node.icon, node.color)}
        {this.getNodeDecorator(node)}
        {createExecutionBadge(node, width)}
      </g>
    );
  }

  protected getNodeDecorator(node: ActivityNode): VNode {
    return <g></g>;
  }

  protected getRoundedCornerRadius(node: SShapeElement): number {
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
        <rect
          class-sprotty-node={true}
          class-sprotty-task-node={true}
          x={1}
          y={1}
          rx={2}
          ry={2}
          width={diameter - padding}
          height={diameter - padding}
        />
        <line class-sprotty-node-decorator x1={radius} y1={innerPadding} x2={radius} y2={diameter - innerPadding} />
        <line class-sprotty-node-decorator x1={innerPadding} y1={radius} x2={diameter - innerPadding} y2={radius} />
      </svg>
    );
  }
}
