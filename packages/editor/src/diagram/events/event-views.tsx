/** @jsx svg */
import { CircularNodeView, type RenderingContext, hiddenBoundingRect, svg } from '@eclipse-glsp/client';
import { inject, injectable, optional } from 'inversify';
import type { VNode } from 'snabbdom';
import { createExecutionBadge } from '../../execution/views';

import { CustomIconToggleActionHandler } from '../../ui-tools/tool-bar/options/action-handler';
import { getIconDecorator } from '../icon/views';
import { EventNode } from '../model';

@injectable()
export class EventNodeView extends CircularNodeView {
  @inject(CustomIconToggleActionHandler) @optional() protected customIconHandler?: CustomIconToggleActionHandler;

  render(node: EventNode, context: RenderingContext): VNode {
    const radius = this.getRadius(node);
    return (
      <g>
        {hiddenBoundingRect(node, context)}
        <circle
          class-sprotty-node
          class-mouseover={node.hoverFeedback}
          class-selected={node.selected}
          r={radius}
          cx={radius}
          cy={radius}
          style={{ stroke: node.color }}
        ></circle>
        {this.getEventDecorator(radius)}
        {getIconDecorator(this.customIconHandler?.isShowCustomIcons ? node.customIcon : node.type, radius, node.color)}
        {context.renderChildren(node)}
        {createExecutionBadge(node, 2 * radius)}
      </g>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getEventDecorator(radius: number): VNode | undefined {
    return;
  }
}

@injectable()
export class IntermediateEventNodeView extends EventNodeView {
  protected getEventDecorator(radius: number): VNode {
    return <circle class-sprotty-node class-sprotty-task-node r={radius - 3} cx={radius} cy={radius}></circle>;
  }
}
