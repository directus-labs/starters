'use client';
import * as React from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

// next-themes handles SSR itself: it injects a script that applies the stored or system theme
// before hydration, so children render on the server and there's no flash of the wrong theme.
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
			{children}
		</NextThemesProvider>
	);
}
