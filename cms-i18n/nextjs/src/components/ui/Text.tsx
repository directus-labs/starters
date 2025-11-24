import { cn } from '@/lib/utils';

export interface TextProps {
	content: string;
	className?: string;
	'data-directus'?: string;
}

const Text = ({ content, className, 'data-directus': dataDirectus }: TextProps) => {
	return (
		<div
			className={cn('prose dark:prose-invert', className)}
			dangerouslySetInnerHTML={{ __html: content }}
			data-directus={dataDirectus}
		/>
	);
};

export default Text;
