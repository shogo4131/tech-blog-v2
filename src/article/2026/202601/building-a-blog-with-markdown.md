---
title: Markdownでブログを構築する
description: remark/rehypeを使ったMarkdown処理とshikiによるシンタックスハイライトの実装方法を解説します。
date: 2026-01-02
tags:
  - Markdown
  - React
  - shiki
published: true
---

## はじめに

技術ブログを構築する際、Markdownは記事を書くための最も人気のある形式の一つです。この記事では、Reactアプリケーションでmarkdownを処理する方法を解説します。

## unified/remark/rehypeスタック

Markdownの処理には、unifiedエコシステムを使用します：

```bash
pnpm add unified remark-parse remark-gfm remark-rehype rehype-stringify
```

### 処理パイプラインの構築

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const result = await processor.process(markdownContent);
console.log(String(result));
```

## シンタックスハイライト with shiki

コードブロックに美しいシンタックスハイライトを適用するには、shikiを使用します：

```typescript
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['github-dark'],
  langs: ['typescript', 'javascript', 'bash'],
});

const html = highlighter.codeToHtml(code, {
  lang: 'typescript',
  theme: 'github-dark',
});
```

### サポートする言語

shikiは多くのプログラミング言語をサポートしています：

| 言語 | 拡張子 |
|------|--------|
| TypeScript | `.ts`, `.tsx` |
| JavaScript | `.js`, `.jsx` |
| Python | `.py` |
| Rust | `.rs` |
| Go | `.go` |

## Frontmatterの処理

記事のメタデータはfrontmatterで管理します：

```yaml
---
title: 記事のタイトル
description: 記事の説明
date: 2026-01-02
tags:
  - Tag1
  - Tag2
---
```

gray-matterを使ってパースできます：

```typescript
import matter from 'gray-matter';

const { data, content } = matter(rawMarkdown);
// data: frontmatterオブジェクト
// content: Markdownコンテンツ
```

## まとめ

- **unified/remark/rehype**: Markdown処理の標準的なツールチェーン
- **shiki**: VS Code品質のシンタックスハイライト
- **gray-matter**: frontmatterのパース

これらのツールを組み合わせることで、美しく機能的なテックブログを構築できます。

> Next.jsやRemixなど、他のフレームワークでも同様のアプローチが使えます。
