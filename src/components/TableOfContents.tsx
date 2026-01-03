import type { Heading } from "@/lib/types";

interface TableOfContentsProps {
	headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
	const filteredHeadings = headings.filter((h) => h.level >= 2 && h.level <= 3);

	if (filteredHeadings.length === 0) {
		return null;
	}

	return (
		<nav className="sticky top-8">
			<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
				Table of Contents
			</h3>
			<ul className="space-y-2">
				{filteredHeadings.map((heading) => (
					<li
						key={heading.id}
						className={heading.level === 3 ? "ml-4" : ""}
					>
						<a
							href={`#${heading.id}`}
							className="text-sm text-gray-400 hover:text-cyan-400 transition-colors block py-1"
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
