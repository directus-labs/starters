'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import Link from 'next/link';
import useKeyboardShortcut from '@/hooks/useKeyboardShortcut';

type SearchResult = {
	id: string;
	title: string;
	description: string;
	type: string;
	link: string;
};

const SearchModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);

	useKeyboardShortcut(['k'], () => setIsOpen(true));

	const fetchResults = async (search: string) => {
		if (search.length < 3) {
			setResults([]);
			setSearched(false);

			return;
		}

		setLoading(true);
		setSearched(true);
		try {
			const res = await fetch(`/api/search?search=${encodeURIComponent(search)}`);
			const data: SearchResult[] = await res.json();
			setResults(data.filter((result) => result.link));
		} catch (error) {
			console.error('Error fetching search results:', error);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	const handleResultClick = () => {
		setIsOpen(false);
		setQuery('');
		setResults([]);
		setSearched(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Search">
					<Search className="size-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogTitle>Search</DialogTitle>
				<Input
					placeholder="Search for pages, posts, or sections..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						fetchResults(e.target.value);
					}}
					className="w-full my-4"
				/>
				{loading && <p className="text-gray-500">Loading...</p>}
				{!loading && searched && results.length === 0 && <p className="text-gray-500">No results found.</p>}
				<ul className="space-y-2">
					{!loading &&
						results.length > 0 &&
						results.map((result) => (
							<Link key={result.id} href={result.link!} onClick={handleResultClick}>
								<li className="flex items-center gap-4 p-2 rounded hover:bg-gray-100 cursor-pointer">
									<Badge variant="default">{result.type}</Badge>
									<div>
										<p className="font-medium">{result.title}</p>
										<p className="text-sm text-gray-500">{result.description}</p>
									</div>
								</li>
							</Link>
						))}
				</ul>
			</DialogContent>
		</Dialog>
	);
};

export default SearchModal;
