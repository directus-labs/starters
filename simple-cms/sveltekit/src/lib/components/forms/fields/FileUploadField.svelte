<script lang="ts">
	import { Input } from '$lib/components/ui/command';

	interface FileUploadFieldProps {
		name: string;
		form: any;
	}

	const { name, form }: FileUploadFieldProps = $props();

	const { form: formData } = form;

	const onFileChange = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		formData[name] = file;
	};
</script>

<Input type="file" id={name} onchange={onFileChange} />
