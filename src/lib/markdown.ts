import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { unified } from "unified";
import type { Heading } from "./types";

let highlighter: HighlighterCore | null = null;

async function getHighlighter(): Promise<HighlighterCore> {
	if (!highlighter) {
		highlighter = await createHighlighterCore({
			themes: [import("shiki/themes/github-dark.mjs")],
			langs: [
				import("shiki/langs/typescript.mjs"),
				import("shiki/langs/javascript.mjs"),
				import("shiki/langs/tsx.mjs"),
				import("shiki/langs/jsx.mjs"),
				import("shiki/langs/bash.mjs"),
				import("shiki/langs/json.mjs"),
				import("shiki/langs/css.mjs"),
				import("shiki/langs/html.mjs"),
				import("shiki/langs/markdown.mjs"),
				import("shiki/langs/yaml.mjs"),
			],
			engine: createJavaScriptRegexEngine(),
		});
	}
	return highlighter;
}

interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
}

function extractText(node: HastNode): string {
	if (node.type === "text" && node.value) return node.value;
	if (node.children) return node.children.map(extractText).join("");
	return "";
}

function extractHeadings(tree: HastNode): Heading[] {
	const headings: Heading[] = [];

	function visit(node: HastNode) {
		if (
			node.type === "element" &&
			node.tagName &&
			/^h[1-6]$/.test(node.tagName)
		) {
			const level = Number.parseInt(node.tagName.charAt(1), 10);
			const id = (node.properties?.id as string) || "";
			const text = extractText(node);
			headings.push({ id, text, level });
		}
		if (node.children) {
			for (const child of node.children) {
				visit(child);
			}
		}
	}

	visit(tree);
	return headings;
}

const supportedLangs = [
	"typescript",
	"javascript",
	"tsx",
	"jsx",
	"bash",
	"json",
	"css",
	"html",
	"markdown",
	"yaml",
];

async function highlightCodeBlocks(
	tree: HastNode,
	hl: HighlighterCore,
): Promise<void> {
	async function visit(node: HastNode): Promise<void> {
		if (node.type === "element" && node.tagName === "pre") {
			const codeNode = node.children?.find(
				(c: HastNode) => c.tagName === "code",
			);
			if (codeNode) {
				const className =
					((codeNode.properties?.className as string[]) || [])[0] || "";
				const lang = className.replace("language-", "") || "text";
				const code = extractText(codeNode);

				const finalLang = supportedLangs.includes(lang) ? lang : "text";

				const highlighted = hl.codeToHtml(code, {
					lang: finalLang,
					theme: "github-dark",
				});

				node.type = "raw";
				node.value = highlighted;
				delete node.children;
				delete node.tagName;
			}
		}
		if (node.children) {
			for (const child of node.children) {
				await visit(child);
			}
		}
	}

	await visit(tree);
}

export async function parseMarkdown(content: string): Promise<{
	html: string;
	headings: Heading[];
}> {
	const hl = await getHighlighter();
	let headings: Heading[] = [];

	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, { behavior: "wrap" })
		.use(() => (tree: HastNode) => {
			headings = extractHeadings(tree);
		})
		.use(() => async (tree: HastNode) => {
			await highlightCodeBlocks(tree, hl);
		})
		.use(rehypeStringify, { allowDangerousHtml: true });

	const result = await processor.process(content);

	return {
		html: String(result),
		headings,
	};
}
