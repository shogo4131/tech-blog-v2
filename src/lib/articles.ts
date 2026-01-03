import { parseMarkdown } from "./markdown";
import type { Article, ArticleFrontmatter, ArticleWithHtml } from "./types";

const articleModules = import.meta.glob<string>("/src/article/**/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
});

function extractSlugFromPath(path: string): string {
	const match = path.match(/\/([^/]+)\.md$/);
	return match ? match[1] : "";
}

function parseFrontmatter(content: string): {
	data: Record<string, unknown>;
	content: string;
} {
	const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { data: {}, content };
	}

	const [, frontmatterStr, body] = match;
	const data: Record<string, unknown> = {};

	const lines = frontmatterStr.split("\n");
	let currentKey = "";
	let inArray = false;
	let arrayItems: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		if (trimmed.startsWith("- ")) {
			if (inArray && currentKey) {
				arrayItems.push(trimmed.slice(2).trim());
			}
			continue;
		}

		if (inArray && currentKey) {
			data[currentKey] = arrayItems;
			inArray = false;
			arrayItems = [];
		}

		const colonIndex = trimmed.indexOf(":");
		if (colonIndex > 0) {
			currentKey = trimmed.slice(0, colonIndex).trim();
			const value = trimmed.slice(colonIndex + 1).trim();

			if (value === "") {
				inArray = true;
				arrayItems = [];
			} else if (value === "true") {
				data[currentKey] = true;
			} else if (value === "false") {
				data[currentKey] = false;
			} else if (!Number.isNaN(Number(value))) {
				data[currentKey] = Number(value);
			} else {
				data[currentKey] = value.replace(/^["']|["']$/g, "");
			}
		}
	}

	if (inArray && currentKey) {
		data[currentKey] = arrayItems;
	}

	return { data, content: body };
}

export function getArticles(): Article[] {
	const articles: Article[] = [];

	for (const [path, rawContent] of Object.entries(articleModules)) {
		const slug = extractSlugFromPath(path);
		const { data, content } = parseFrontmatter(rawContent);

		const frontmatter = data as unknown as ArticleFrontmatter;

		if (frontmatter.published === false && import.meta.env.PROD) {
			continue;
		}

		articles.push({
			slug,
			frontmatter,
			content,
		});
	}

	return articles.sort(
		(a, b) =>
			new Date(b.frontmatter.date).getTime() -
			new Date(a.frontmatter.date).getTime(),
	);
}

export function getArticle(slug: string): Article | undefined {
	const articles = getArticles();
	return articles.find((article) => article.slug === slug);
}

export async function getArticleWithHtml(
	slug: string,
): Promise<ArticleWithHtml | undefined> {
	const article = getArticle(slug);
	if (!article) return undefined;

	const { html, headings } = await parseMarkdown(article.content);

	return {
		...article,
		html,
		headings,
	};
}

export function getArticlesByTag(tag: string): Article[] {
	const articles = getArticles();
	return articles.filter((article) =>
		article.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
	);
}

export function getAllTags(): { tag: string; count: number }[] {
	const articles = getArticles();
	const tagCounts = new Map<string, number>();

	for (const article of articles) {
		for (const tag of article.frontmatter.tags) {
			const normalizedTag = tag.toLowerCase();
			tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
		}
	}

	return Array.from(tagCounts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}
