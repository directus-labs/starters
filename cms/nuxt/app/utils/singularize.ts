export function singularize(word: string): string {
	// Handle common plural endings
	if (word.endsWith('ies')) {
		return word.slice(0, -3) + 'y';
	} else if (word.endsWith('ses')) {
		return word.slice(0, -2);
	} else if (word.endsWith('s') && !word.endsWith('ss')) {
		return word.slice(0, -1);
	}

	// Handle special cases
	const specialCases: Record<string, string> = {
		people: 'person',
		children: 'child',
		men: 'man',
		women: 'woman',
		feet: 'foot',
		teeth: 'tooth',
		geese: 'goose',
	};

	return specialCases[word] || word;
}
