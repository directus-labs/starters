import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const config: Config = {
	darkMode: 'class',
	content: [
		'./components/**/*.{vue,js,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./app.vue',
		'./plugins/**/*.{js,ts}',
	],
	theme: {
		extend: {
			fontFamily: {
				heading: ['Poppins', 'sans-serif'],
				sans: ['Inter', 'sans-serif'],
				code: ['Fira Mono', 'monospace'],
			},
			fontSize: {
				tagline: ['24px', '33.6px'],
				headline: ['56px', '64px'],
				h1: ['56px', '78.4px'],
				h2: ['36px', '50.4px'],
				h3: ['24px', '33.6px'],
				description: ['16px', '22.4px'],
				regular: ['16px', '24px'],
				bold: ['16px', '22.4px'],
				nav: ['16px', '22.4px'],
				code: ['14px', '16.8px'],
			},
			colors: {
				background: {
					DEFAULT: 'var(--background-color)',
					muted: 'var(--background-color-muted)',
					variant: 'var(--background-variant-color)',
				},
				foreground: 'var(--foreground-color)',
				primary: 'var(--accent-color-light)',
				input: 'var(--input-color)',
				secondary: 'var(--accent-color-dark)',
				accent: 'var(--accent-color)',
				soft: 'var(--accent-color-soft)',
				blue: {
					DEFAULT: '#172940',
				},
				gray: {
					DEFAULT: '#F5F8FB',
					muted: '#A5B0BD',
					dark: '#42566E',
				},
			},
			typography: {
				DEFAULT: {
					css: {
						color: 'var(--foreground-color)',
						a: {
							color: 'var(--accent-color)',
							textDecoration: 'none',
							'&:hover': {
								textDecoration: 'underline',
							},
						},
						h1: {
							fontFamily: 'Poppins',
							fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
							fontWeight: '400',
							lineHeight: '1.2',
						},
						h2: {
							fontFamily: 'Poppins',
							fontSize: 'clamp(2rem, 4vw, 2.5rem)',
							fontWeight: '400',
							lineHeight: '1.3',
						},
						h3: {
							fontFamily: 'Poppins',
							fontSize: 'clamp(1.5rem, 3vw, 2rem)',
							fontWeight: '400',
							lineHeight: '1.4',
						},
						p: {
							fontFamily: 'Inter',
							fontSize: 'clamp(1rem, 2vw, 1.25rem)',
							fontWeight: '400',
							lineHeight: '1.75',
						},
					},
				},
				dark: {
					css: {
						color: 'var(--foreground-color)',
						a: {
							color: 'var(--accent-color)',
							'&:hover': {
								textDecoration: 'underline',
							},
						},
					},
				},
			},
		},
	},
	plugins: [tailwindcssAnimate, typography],
};

export default config;
