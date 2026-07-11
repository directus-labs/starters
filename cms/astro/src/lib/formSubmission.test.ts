import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FormField } from '@/types/directus-schema';
import { MAX_FORM_FILE_BYTES, parseFormId, validateFormSubmission } from '@/lib/directus/validateFormSubmission';

const fields: FormField[] = [
  { id: 'consent', name: 'consent', type: 'checkbox', label: 'Consent', required: true },
  {
    id: 'topics',
    name: 'topics',
    type: 'checkbox_group',
    label: 'Topics',
    required: true,
    choices: [{ text: 'One', value: 'one' }],
  },
  {
    id: 'tier',
    name: 'tier',
    type: 'select',
    label: 'Tier',
    required: true,
    choices: [{ text: 'Basic', value: 'basic' }],
  },
];

test('form IDs cannot escape the Directus forms collection path', () => {
  assert.equal(parseFormId('../../users/me'), null);
  assert.equal(parseFormId('not-a-uuid'), null);
  assert.equal(parseFormId('93023385-f574-4040-9ead-42b717db2015'), '93023385-f574-4040-9ead-42b717db2015');
});

test('server validation enforces required controls and canonical choices', async (t) => {
  const valid = new FormData();
  valid.set('consent', 'true');
  valid.set('topics', JSON.stringify(['one']));
  valid.set('tier', 'basic');
  assert.equal(validateFormSubmission(fields, valid).success, true);

  const cases = [
    ['unchecked required consent', { consent: 'false', topics: JSON.stringify(['one']), tier: 'basic' }],
    ['empty required checkbox group', { consent: 'true', topics: '[]', tier: 'basic' }],
    ['forged checkbox option', { consent: 'true', topics: JSON.stringify(['forged']), tier: 'basic' }],
    ['forged select option', { consent: 'true', topics: JSON.stringify(['one']), tier: 'forged' }],
  ] as const;

  for (const [name, values] of cases) {
    await t.test(name, () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(values)) formData.set(key, value);
      assert.equal(validateFormSubmission(fields, formData).success, false);
    });
  }
});

test('combined uploads stay below the default Vercel request ceiling', () => {
  const formData = new FormData();
  formData.set('first', new File([new Uint8Array(MAX_FORM_FILE_BYTES / 2 + 1)], 'first.bin'));
  formData.set('second', new File([new Uint8Array(MAX_FORM_FILE_BYTES / 2 + 1)], 'second.bin'));

  const result = validateFormSubmission([], formData);
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error, /Combined file uploads/);
});
