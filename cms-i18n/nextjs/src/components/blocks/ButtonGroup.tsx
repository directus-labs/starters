import Button, { ButtonProps } from '@/components/blocks/Button';

export interface ButtonGroupProps {
	buttons: ButtonProps[];
	className?: string;
}

const ButtonGroup = ({ buttons, className }: ButtonGroupProps) => {
	return (
		<div className={`flex flex-wrap gap-4 ${className || ''}`}>
			{buttons?.map((button) => <Button key={button.id} {...button} />)}
		</div>
	);
};

export default ButtonGroup;
