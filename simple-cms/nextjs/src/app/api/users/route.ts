import { fetchAuthenticatedUser } from '@/lib/directus/fetchers';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const user = await fetchAuthenticatedUser();

		if (!user) {
			return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
		}

		return NextResponse.json({ isAuthenticated: true, user });
	} catch (error) {
		console.error('Error checking authentication:', error);

		return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
	}
}
