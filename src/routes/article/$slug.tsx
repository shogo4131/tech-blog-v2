import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TableOfContents } from "@/components/TableOfContents";
import { getArticleWithHtml } from "@/lib/articles";
import { config } from "@/lib/config";

export const Route = createFileRoute("/article/$slug")({
	ssr: false,
	loader: async ({ params }) => {
		const article = await getArticleWithHtml(params.slug);
		if (!article) {
			throw notFound();
		}
		return { article };
	},
	head: ({ loaderData, params }) => {
		if (!loaderData?.article) {
			return {
				meta: [{ title: "Article | Tech Blog" }],
			};
		}
		const { article } = loaderData;
		const ogImageUrl = `${config.baseUrl}/api/og?title=${encodeURIComponent(article.frontmatter.title)}&date=${article.frontmatter.date}&tags=${article.frontmatter.tags.join(",")}`;
		const pageUrl = `${config.baseUrl}/article/${params.slug}`;
		return {
			meta: [
				{ title: `${article.frontmatter.title} | Tech Blog` },
				{ name: "description", content: article.frontmatter.description },
				{ property: "og:title", content: article.frontmatter.title },
				{
					property: "og:description",
					content: article.frontmatter.description,
				},
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: pageUrl },
				{
					property: "article:published_time",
					content: article.frontmatter.date,
				},
				{ property: "og:image", content: ogImageUrl },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:image", content: ogImageUrl },
			],
		};
	},
	component: ArticlePage,
	notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
				<p className="text-gray-400 mb-8">
					The article you are looking for does not exist.
				</p>
				<Link to="/" className="text-cyan-400 hover:text-cyan-300 underline">
					Back to Home
				</Link>
			</div>
		</div>
	);
}

function ArticlePage() {
	const { article } = Route.useLoaderData();

	return (
		<div className="min-h-screen">
			<header className="border-b border-gray-800">
				<div className="max-w-6xl mx-auto px-6 py-4">
					<Link
						to="/"
						className="text-gray-400 hover:text-white transition-colors"
					>
						&larr; Back to Home
					</Link>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-6 py-12">
				<div className="lg:grid lg:grid-cols-4 lg:gap-12">
					<article className="lg:col-span-3">
						<header className="mb-12">
							<time className="text-gray-500">
								{new Date(article.frontmatter.date).toLocaleDateString(
									"ja-JP",
									{
										year: "numeric",
										month: "long",
										day: "numeric",
									},
								)}
							</time>
							<h1 className="text-4xl font-bold text-white mt-2">
								{article.frontmatter.title}
							</h1>
							<p className="text-xl text-gray-400 mt-4">
								{article.frontmatter.description}
							</p>
							{article.frontmatter.tags.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-6">
									{article.frontmatter.tags.map((tag) => (
										<Link
											key={tag}
											to="/tags/$tag"
											params={{ tag: tag.toLowerCase() }}
											className="text-sm px-3 py-1 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
										>
											{tag}
										</Link>
									))}
								</div>
							)}
						</header>

						<div
							className="prose max-w-none"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content is sanitized
							dangerouslySetInnerHTML={{ __html: article.html }}
						/>
					</article>

					<aside className="hidden lg:block">
						<TableOfContents headings={article.headings} />
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
