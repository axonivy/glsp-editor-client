import { TableUtil, render } from 'test-utils';
import { useTableColBrowser } from './TableColBrowser';
import { describe, test } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('TableColBrowser', () => {
  test('select can be undefined', async () => {
    const { result } = renderHook(() => useTableColBrowser(() => {}));
    render(<>{result.current.content}</>, {
      wrapperProps: { data: { config: { query: { sql: { stmt: 'hi', select: undefined } } } } }
    });
    await TableUtil.assertRowCount(1);
  });
});
