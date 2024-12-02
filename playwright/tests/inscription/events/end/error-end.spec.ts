import { test } from '@playwright/test';
import { InscriptionView, type Inscription } from '../../../page-objects/inscription/inscription-view';
import { GeneralTest, ErrorThrowTest, runTest } from '../../parts';
import type { CreateProcessResult } from '../../../glsp-protocol';
import { createProcess } from '../../../glsp-protocol';

test.describe('Error End', () => {
  let view: Inscription;
  let testee: CreateProcessResult;

  test.beforeAll(async () => {
    testee = await createProcess('ErrorEnd', { location: { x: 200, y: 200 } });
  });

  test.beforeEach(async ({ page }) => {
    view = await InscriptionView.selectElement(page, testee.elementId);
  });

  test('Header', async () => {
    await view.expectHeaderText('Error End');
  });

  test('General', async () => {
    await runTest(view, GeneralTest);
  });

  test('Error', async () => {
    await runTest(view, ErrorThrowTest);
  });
});
