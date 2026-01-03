import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
	article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
	return (
		<article className="group">
			<Link
				to="/article/$slug"
				params={{ slug: article.slug }}
				className="block p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 hover:bg-gray-900 transition-all duration-200"
			>
				<time className="text-sm text-gray-500">
					{new Date(article.frontmatter.date).toLocaleDateString("ja-JP", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</time>
				<h2 className="text-xl font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors">
					{article.frontmatter.title}
				</h2>
				<p className="text-gray-400 mt-3 line-clamp-2">
					{article.frontmatter.description}
				</p>
				{article.frontmatter.tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-4">
						{article.frontmatter.tags.map((tag) => (
							<span
								key={tag}
								className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</Link>
		</article>
	);
}
