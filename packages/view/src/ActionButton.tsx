import { Button } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { Action } from '@eclipse-glsp/client';
import React from 'react';

export interface ActionTrigger {
  icon: IvyIcons;
  id: string;
  title: string;
  action: () => Action;
}

type ActionButtonProps = React.PropsWithChildren<{
  trigger: ActionTrigger;
  onAction: (action: Action, source: ActionTrigger) => void;
  className?: string | undefined;
}>;

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({ trigger, className, onAction, children }, ref) => (
  <Button
    ref={ref}
    id={trigger.id}
    title={trigger.title}
    icon={trigger.icon}
    className={className}
    onClick={() => onAction(trigger.action(), trigger)}
  >
    {children}
  </Button>
));

export default React.memo(ActionButton);
