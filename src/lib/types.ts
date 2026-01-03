export interface ArticleFrontmatter {
	title: string;
	description: string;
	date: string;
	tags: string[];
	published?: boolean;
}

export interface Article {
	slug: string;
	frontmatter: ArticleFrontmatter;
	content: string;
}

export interface ArticleWithHtml extends Article {
	html: string;
	headings: Heading[];
}

export interface Heading {
	id: string;
	text: string;
	level: number;
}
