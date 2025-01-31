/** @jsx svg */
import type { Bounds } from '@eclipse-glsp/client';
import { svg } from '@eclipse-glsp/client';
import type { VNode } from 'snabbdom';
import virtualize from 'sprotty/lib/lib/virtualize';

import { IconStyle, resolveIcon } from './icons';
import { ActivityTypes } from '../view-types';
import type { ActivityNode } from '../model';

const WORKFLOW_ACTIVITY_TYPES = [
  ActivityTypes.USER,
  ActivityTypes.SCRIPT,
  ActivityTypes.HD,
  ActivityTypes.TRIGGER,
  ActivityTypes.SUB_PROCESS
];

export function getActivityIconDecorator(node: ActivityNode, iconUri: string): VNode | undefined {
  const bounds = { height: 20, width: 20, x: 10, y: node.bounds.height / 2 - 10 };
  const icon = iconDecorator(iconUri, bounds, false, '');
  if (icon) {
    return (
      <g class-activity-icon data-actitiy-type={activityColorType(node.type)}>
        <rect height={30} width={30} x={5} y={node.bounds.height / 2 - 15} />
        {icon}
      </g>
    );
  }
  return;
}

const activityColorType = (type: string): 'workflow' | 'interface' | 'bpmn' => {
  if (type.endsWith('BpmnElement')) {
    return 'bpmn';
  }
  if (WORKFLOW_ACTIVITY_TYPES.includes(type)) {
    return 'workflow';
  }
  return 'interface';
};

export function getIconDecorator(iconUri: string, radius: number, color: string): VNode | undefined {
  const bounds = { height: 14, width: 18, x: radius - 9, y: radius - 7 };
  return iconDecorator(iconUri, bounds, true, color);
}

function iconDecorator(iconUri: string, bounds: Bounds, smallIcon: boolean, color: string): VNode | undefined {
  const icon = resolveIcon(iconUri);
  if (icon.style === IconStyle.SI) {
    return (
      <svg class-sprotty-icon-svg viewBox='0 0 20 20' height={bounds.height} width={bounds.width} x={bounds.x} y={bounds.y}>
        <path style={{ fill: color }} d={icon.res} />
      </svg>
    );
  }
  if (icon.style === IconStyle.IMG) {
    const foreignObjectContents = virtualize(`<img src="${icon.res}"></img>`);
    return (
      <foreignObject
        requiredFeatures='http://www.w3.org/TR/SVG11/feature#Extensibility'
        height={bounds.height}
        width={bounds.width}
        x={bounds.x}
        y={bounds.y}
        class-sprotty-icon
        class-icon-small={smallIcon}
      >
        {foreignObjectContents}
      </foreignObject>
    );
  }
  return;
}
