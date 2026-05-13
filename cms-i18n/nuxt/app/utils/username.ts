import type { DirectusUser } from '#shared/types/schema';

interface UserNameOptions {
	abbrev?: boolean;
}

export function userName(user: Partial<DirectusUser>, { abbrev = false }: UserNameOptions = {}): string {
	if (!user) {
		return 'Unknown User' as string;
	}

	if (user.first_name && user.last_name) {
		return `${user.first_name} ${abbrev ? user.last_name[0] + '.' : user.last_name}`;
	}

	if (user.first_name) {
		return user.first_name;
	}

	if (user.email) {
		return user.email;
	}

	return 'Unknown User' as string;
}

export function userInitials(user: Partial<DirectusUser>): string {
	if (!user) {
		return 'NA' as string;
	}

	if (user.first_name && user.last_name) {
		return `${user.first_name[0]}${user.last_name[0]}`;
	}

	if (user.first_name) {
		return user.first_name[0] || 'NA';
	}

	if (user.email) {
		return user.email[0] || 'NA';
	}

	return 'NA' as string;
}
