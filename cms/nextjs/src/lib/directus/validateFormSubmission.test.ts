import assert from 'node:assert/strict';
import test from 'node:test';
import type { FormField } from '@/types/directus-schema';
import {
	MAX_FORM_FILE_BYTES,
	MAX_FORM_REQUEST_BYTES,
	MAX_FORM_REQUEST_ENTRIES,
	parseFormRequest,
	validateFormSubmission,
} from './validateFormSubmission';

const field = (overrides: Partial<FormField>): FormField => ({
	id: 'field-id',
	name: 'field',
	type: 'text',
	...overrides,
});

test('rejects oversized multipart requests before parsing', async () => {
	const request = new Request('https://site.example.test/api/forms/submit', {
		method: 'POST',
		headers: { 'content-length': String(MAX_FORM_REQUEST_BYTES + 1) },
		body: new FormData(),
	});

	const result = await parseFormRequest(request);
	assert.deepEqual(result, { success: false, error: 'Form submission is too large', status: 413 });
});

test('rejects multipart requests with excessive entries', async () => {
	const formData = new FormData();
	for (let index = 0; index <= MAX_FORM_REQUEST_ENTRIES; index++) {
		formData.set(`field-${index}`, 'value');
	}
	const request = new Request('https://site.example.test/api/forms/submit', { method: 'POST', body: formData });

	const result = await parseFormRequest(request);
	assert.equal(result.success, false);
	if (!result.success) assert.equal(result.status, 413);
});

test('returns parsed data for bounded multipart requests', async () => {
	const formData = new FormData();
	formData.set('formId', 'form-id');
	const request = new Request('https://site.example.test/api/forms/submit', { method: 'POST', body: formData });

	const result = await parseFormRequest(request);
	assert.equal(result.success, true);
	if (result.success) assert.equal(result.data.get('formId'), 'form-id');
});

test('rejects empty required checkbox controls', () => {
	const checkbox = field({ name: 'consent', type: 'checkbox', required: true });
	const group = field({ name: 'topics', type: 'checkbox_group', required: true });
	const formData = new FormData();
	formData.set('consent', 'false');
	formData.set('topics', '[]');

	assert.equal(validateFormSubmission([checkbox], formData).success, false);
	assert.equal(validateFormSubmission([group], formData).success, false);
});

test('rejects values outside configured choices', () => {
	const choices = [
		{ text: 'Basic', value: 'basic' },
		{ text: 'Pro', value: 'pro' },
	];
	const select = field({ name: 'plan', type: 'select', required: true, choices });
	const group = field({ name: 'plans', type: 'checkbox_group', choices });
	const formData = new FormData();
	formData.set('plan', 'enterprise');
	formData.set('plans', JSON.stringify(['basic', 'enterprise']));

	assert.equal(validateFormSubmission([select], formData).success, false);
	assert.equal(validateFormSubmission([group], formData).success, false);
});

test('accepts configured choices and checked required controls', () => {
	const choices = [{ text: 'Basic', value: 'basic' }];
	const fields = [
		field({ name: 'consent', type: 'checkbox', required: true }),
		field({ name: 'plan', type: 'select', required: true, choices }),
		field({ name: 'plans', type: 'checkbox_group', required: true, choices }),
	];
	const formData = new FormData();
	formData.set('consent', 'true');
	formData.set('plan', 'basic');
	formData.set('plans', JSON.stringify(['basic']));

	assert.equal(validateFormSubmission(fields, formData).success, true);
});

test('matches the licensed Directus five-megabyte upload limit', () => {
	const upload = field({ name: 'upload', type: 'file' });
	const accepted = new FormData();
	accepted.set('upload', new File([new Uint8Array(MAX_FORM_FILE_BYTES)], 'accepted.bin'));
	const rejected = new FormData();
	rejected.set('upload', new File([new Uint8Array(MAX_FORM_FILE_BYTES + 1)], 'rejected.bin'));

	assert.equal(MAX_FORM_FILE_BYTES, 5_000_000);
	assert.equal(validateFormSubmission([upload], accepted).success, true);
	assert.equal(validateFormSubmission([upload], rejected).success, false);
});
