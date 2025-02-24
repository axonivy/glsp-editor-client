import type { RequestData } from '@axonivy/process-editor-inscription-protocol';
import { produce } from 'immer';
import type { DataUpdater } from '../../../types/lambda';
import { useConfigDataContext, type ConfigDataContext } from '../../../context/useDataContext';

export function useRequestData(): ConfigDataContext<RequestData> & {
  updateRequest: DataUpdater<RequestData['request']>;
  updatePermission: DataUpdater<RequestData['permission']>;
  resetData: () => void;
} {
  const { setConfig, ...config } = useConfigDataContext();

  const updateRequest: DataUpdater<RequestData['request']> = (field, value) => {
    setConfig(
      produce((draft: RequestData) => {
        draft.request[field] = value;
      })
    );
  };

  const updatePermission: DataUpdater<RequestData['permission']> = (field, value) => {
    setConfig(
      produce((draft: RequestData) => {
        draft.permission[field] = value;
      })
    );
  };

  const resetData = () =>
    setConfig(
      produce(draft => {
        draft.request = config.initConfig.request;
        draft.permission = config.initConfig.permission;
      })
    );

  return {
    ...config,
    updateRequest,
    updatePermission,
    resetData
  };
}
