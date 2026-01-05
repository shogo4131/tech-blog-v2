import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticleCard } from "@/components/ArticleCard";
import { getAllTags, getArticlesByTag } from "@/lib/articles";
import { config } from "@/lib/config";

export const Route = createFileRoute("/tags/$tag")({
	ssr: false,
	loader: ({ params }) => {
		const articles = getArticlesByTag(params.tag);
		const allTags = getAllTags();

		if (articles.length === 0) {
			throw notFound();
		}

		return { articles, tag: params.tag, allTags };
	},
	head: ({ loaderData, params }) => {
		if (!loaderData?.tag) {
			return {
				meta: [{ title: "Tags | Tech Blog" }],
			};
		}
		const ogImageUrl = `${config.baseUrl}/ogimage/home.png`;
		const pageUrl = `${config.baseUrl}/tags/${params.tag}`;
		return {
			meta: [
				{ title: `${loaderData.tag} | Tech Blog` },
				{
					name: "description",
					content: `Articles tagged with ${loaderData.tag}`,
				},
				{ property: "og:title", content: `#${loaderData.tag}` },
				{
					property: "og:description",
					content: `Articles tagged with ${loaderData.tag}`,
				},
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: pageUrl },
				{ property: "og:image", content: ogImageUrl },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:image", content: ogImageUrl },
			],
		};
	},
	component: TagPage,
	notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">Tag Not Found</h1>
				<p className="text-gray-400 mb-8">No articles found with this tag.</p>
				<Link to="/" className="text-cyan-400 hover:text-cyan-300 underline">
					Back to Home
				</Link>
			</div>
		</div>
	);
}

function TagPage() {
	const { articles, tag, allTags } = Route.useLoaderData();

	return (
		<div className="min-h-screen">
			<header className="border-b border-gray-800">
				<div className="max-w-6xl mx-auto px-6 py-8">
					<Link
						to="/"
						className="text-gray-400 hover:text-white transition-colors text-sm"
					>
						&larr; Back to Home
					</Link>
					<h1 className="text-3xl font-bold text-white mt-4">
						<span className="text-gray-400">#</span>
						{tag}
					</h1>
					<p className="text-gray-400 mt-2">
						{articles.length} article{articles.length !== 1 ? "s" : ""} found
					</p>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-6 py-12">
				<div className="lg:grid lg:grid-cols-4 lg:gap-12">
					<div className="lg:col-span-3">
						<div className="space-y-6">
							{articles.map((article) => (
								<ArticleCard key={article.slug} article={article} />
							))}
						</div>
					</div>

					<aside className="hidden lg:block">
						<div className="sticky top-8">
							<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
								All Tags
							</h3>
							<div className="flex flex-wrap gap-2">
								{allTags.map(({ tag: t, count }) => (
									<Link
										key={t}
										to="/tags/$tag"
										params={{ tag: t }}
										className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
											t === tag
												? "bg-cyan-500 text-white"
												: "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
										}`}
									>
										{t}
										<span
											className={
												t === tag ? "text-cyan-100 ml-1" : "text-gray-500 ml-1"
											}
										>
											({count})
										</span>
									</Link>
								))}
							</div>
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
