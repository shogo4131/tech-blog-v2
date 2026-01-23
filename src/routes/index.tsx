import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleCard } from "@/components/ArticleCard";
import { Header } from "@/components/Header";
import { getAllTags, getArticles } from "@/lib/articles";
import { config } from "@/lib/config";

export const Route = createFileRoute("/")({
	loader: () => {
		return {
			articles: getArticles(),
			tags: getAllTags(),
		};
	},
	head: () => ({
		meta: [
			{ title: "Tech Blog" },
			{
				name: "description",
				content: "A tech blog about web development and programming",
			},
			{ property: "og:title", content: "Tech Blog" },
			{
				property: "og:description",
				content: "A tech blog about web development and programming",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: config.baseUrl },
			{
				property: "og:image",
				content: `${config.baseUrl}/ogimage/home.png`,
			},
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:image",
				content: `${config.baseUrl}/ogimage/home.png`,
			},
		],
	}),
	component: HomePage,
});

function HomePage() {
	const { articles, tags } = Route.useLoaderData();

	return (
		<div className="min-h-screen">
			<Header
				title="Tech Blog"
				subtitle="Web development and programming insights"
			/>

			<main className="max-w-6xl mx-auto px-6 py-12">
				<div className="lg:grid lg:grid-cols-4 lg:gap-12">
					<div className="lg:col-span-3">
						<h2 className="text-xl font-semibold text-white mb-6">
							Latest Articles
						</h2>
						{articles.length === 0 ? (
							<p className="text-gray-400">No articles yet.</p>
						) : (
							<div className="space-y-6">
								{articles.map((article) => (
									<ArticleCard key={article.slug} article={article} />
								))}
							</div>
						)}
					</div>

					<aside className="hidden lg:block">
						<div className="sticky top-8">
							<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
								Tags
							</h3>
							{tags.length === 0 ? (
								<p className="text-gray-500 text-sm">No tags yet.</p>
							) : (
								<div className="flex flex-wrap gap-2">
									{tags.map(({ tag, count }) => (
										<Link
											key={tag}
											to="/tags/$tag"
											params={{ tag }}
											className="text-sm px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
										>
											{tag}
											<span className="text-gray-500 ml-1">({count})</span>
										</Link>
									))}
								</div>
							)}
						</div>
					</aside>
				</div>
			</main>

			<footer className="border-t border-gray-800 mt-12">
				<div className="max-w-6xl mx-auto px-6 py-8">
					<p className="text-gray-500 text-sm text-center">
						&copy; {new Date().getFullYear()} Tech Blog. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
