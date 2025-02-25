import { cn, Flex, IvyIcon, Separator, Toolbar, ToolbarContainer } from '@axonivy/ui-components';
import { IvyIcons } from '@axonivy/ui-icons';
import { Action } from '@eclipse-glsp/client';
import React from 'react';
import ActionButton, { type ActionTrigger } from './ActionButton';
import './tool-bar.css';

export type ToolBarButton = ActionTrigger & {
  sorting: string;
  location: ToolBarButtonLocation;
  readonly?: boolean;
  switchFocus?: boolean;
  showTitle?: boolean;
  isNotMenu?: boolean;
};

export enum ToolBarButtonLocation {
  Left = 'left',
  Middle = 'middle',
  Right = 'right'
}

export type ToolBarButtonClickEvent = {
  action: Action;
  source: ToolBarButton;
  reference?: HTMLButtonElement;
};

type ToolBarProps = {
  left?: ToolBarButton[];
  edit?: ToolBarButton[];
  middle?: ToolBarButton[];
  right?: ToolBarButton[];
  activeButtonId?: string;
  onClick: (event: ToolBarButtonClickEvent) => void;
};

const ToolBar = React.memo(({ left = [], edit = [], middle = [], right = [], activeButtonId, onClick }: ToolBarProps) => {
  const createButton = React.useCallback(
    (source: ToolBarButton) => {
      let ref: HTMLButtonElement | null = null;
      const button = (
        <ActionButton
          ref={element => {
            ref = element;
          }}
          key={source.id}
          className={cn('tool-bar-button', source.id === activeButtonId ? 'clicked' : '')}
          trigger={source}
          onAction={action => onClick({ action, source, reference: ref ?? undefined })}
        >
          {source.showTitle && !source.isNotMenu && <IvyIcon icon={IvyIcons.Chevron} />}
        </ActionButton>
      );
      if (source.showTitle) {
        return (
          <span className='tool-bar-title-button'>
            <label>{source.title}</label>
            {button}
          </span>
        );
      } else {
        return button;
      }
    },
    [activeButtonId, onClick]
  );

  return (
    <Toolbar className='tool-bar-header'>
      <Flex className='left-buttons'>
        <Flex gap={1}>{left.map(createButton)}</Flex>
        {edit.length > 0 && (
          <ToolbarContainer maxWidth={650}>
            <Flex>
              <Separator orientation='vertical' style={{ height: '26px' }} />
              <Flex gap={1} className='edit-buttons'>
                {edit.map(createButton)}
              </Flex>
            </Flex>
          </ToolbarContainer>
        )}
      </Flex>
      <Flex className='middle-buttons'>
        <Flex gap={1}>{middle.map(createButton)}</Flex>
      </Flex>
      <Flex className='right-buttons'>
        <Flex gap={1}>{right.map(createButton)}</Flex>
      </Flex>
    </Toolbar>
  );
});

export default ToolBar;
