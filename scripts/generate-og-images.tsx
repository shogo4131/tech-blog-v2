declare module "react" {
	interface HTMLAttributes<T> {
		tw?: string;
	}
}

import {
	readFileSync,
	writeFileSync,
	mkdirSync,
	existsSync,
	readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const PROJECT_ROOT = process.cwd();
const ARTICLE_DIR = join(PROJECT_ROOT, "src/article");
const OUTPUT_DIR = join(PROJECT_ROOT, "public/ogimage");
const FONT_PATH = join(PROJECT_ROOT, "public/fonts/NotoSansCJKjp-Bold.otf");
const ICON_PATH = join(PROJECT_ROOT, "public/icon.png");

function getIconBase64(): string {
	const iconBuffer = readFileSync(ICON_PATH);
	return `data:image/png;base64,${iconBuffer.toString("base64")}`;
}

interface ArticleFrontmatter {
	title: string;
	description: string;
	date: string;
	tags: string[];
	published?: boolean;
}

interface Article {
	slug: string;
	frontmatter: ArticleFrontmatter;
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

function findMarkdownFiles(dir: string): string[] {
	const files: string[] = [];

	function walk(currentDir: string) {
		const entries = readdirSync(currentDir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(currentDir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.name.endsWith(".md")) {
				files.push(fullPath);
			}
		}
	}

	walk(dir);
	return files;
}

function getArticles(): Article[] {
	const markdownFiles = findMarkdownFiles(ARTICLE_DIR);
	const articles: Article[] = [];

	for (const filePath of markdownFiles) {
		const content = readFileSync(filePath, "utf-8");
		const { data } = parseFrontmatter(content);
		const frontmatter = data as unknown as ArticleFrontmatter;

		if (frontmatter.published === false) {
			continue;
		}

		const slug = filePath.match(/\/([^/]+)\.md$/)?.[1] ?? "";

		articles.push({
			slug,
			frontmatter,
		});
	}

	return articles;
}

function OgImageTemplate({
	title,
	date,
	iconBase64,
}: { title: string; date?: string; iconBase64: string }) {
	return (
		<div
			tw="flex flex-col justify-center items-start w-full h-full p-16"
			style={{
				background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
				fontFamily: "Noto Sans CJK JP",
			}}
		>
			<div tw="flex text-5xl font-bold text-white leading-tight max-w-[900px]">
				{title}
			</div>
			{date && <div tw="flex mt-6 text-2xl text-gray-400">{date}</div>}
			<div tw="flex absolute bottom-10 left-16 items-center">
				<img
					src={iconBase64}
					width={48}
					height={48}
					tw="mr-4"
					style={{ borderRadius: "50%" }}
				/>
				<div tw="text-2xl text-gray-300">Shogo Fukami</div>
			</div>
		</div>
	);
}

async function generateOgImage(
	outputPath: string,
	title: string,
	date?: string,
	iconBase64?: string,
): Promise<void> {
	const font = readFileSync(FONT_PATH);
	const icon = iconBase64 ?? getIconBase64();

	const svg = await satori(
		<OgImageTemplate title={title} date={date} iconBase64={icon} />,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "Noto Sans CJK JP",
					data: font,
					weight: 700,
					style: "normal",
				},
			],
		},
	);

	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: 1200 },
	});
	const png = resvg.render().asPng();

	const dir = dirname(outputPath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	writeFileSync(outputPath, png);
	console.log(`Generated: ${outputPath}`);
}

async function main() {
	console.log("Generating OG images...\n");

	// Ensure output directory exists
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const articles = getArticles();

	// Generate home page OG image
	await generateOgImage(join(OUTPUT_DIR, "home.png"), "Tech Blog");

	// Generate article OG images
	for (const article of articles) {
		await generateOgImage(
			join(OUTPUT_DIR, `${article.slug}.png`),
			article.frontmatter.title,
			article.frontmatter.date,
		);
	}

	console.log(`\nDone! Generated ${1 + articles.length} images.`);
}

main().catch(console.error);
