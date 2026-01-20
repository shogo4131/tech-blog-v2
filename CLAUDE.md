# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

React 19、TanStack Start (SSR)、Tailwind CSS 4で構築された技術ブログ。記事はYAMLフロントマター付きのMarkdownで作成。Cloudflare Workersにデプロイ。

## コマンド

```bash
pnpm dev          # ポート3000で開発サーバーを起動
pnpm build        # 本番ビルド
pnpm preview      # 本番ビルドをローカルでプレビュー
pnpm test         # vitestでテスト実行
pnpm lint         # Biomeでリント
pnpm format       # Biomeでフォーマット（タブ使用）
pnpm deploy       # ビルドしてCloudflareにデプロイ
```

## アーキテクチャ

### テックブログ

- Markdownファイルは`src/article/YYYY/YYYYMM/`にYAMLフロントマター付きで保存
- フロントマターのフィールド: `title`, `description`, `date`, `tags[]`, `published`（オプション、デフォルトはtrue）
- `published: false`の記事は本番環境で非表示
- 記事はビルド時にViteの`import.meta.glob()`で読み込み

### ルーティング（TanStack Router - ファイルベース）

- `src/routes/__root.tsx` - ルートレイアウト
- `src/routes/index.tsx` - 記事とタグ一覧のホームページ
- `src/routes/article/$slug.tsx` - 記事詳細ページ
- `src/routes/tags/$tag.tsx` - タグでフィルタリングされた記事
- `src/routeTree.gen.ts` - 自動生成ファイル、編集禁止

### 主要ディレクトリ

- `src/lib/` - コアユーティリティ: 記事読み込み（`articles.ts`）、Markdown処理（`markdown.ts`）、型定義（`types.ts`）
- `src/components/` - 再利用可能なReactコンポーネント

### Markdown処理

remark/rehypeを使用したunifiedパイプライン。シンタックスハイライトはShiki（GitHub Darkテーマ）。対応言語: TypeScript, JavaScript, TSX, JSX, Bash, JSON, CSS, HTML, Markdown, YAML。

## コード規約

- TypeScript strictモード、パスエイリアス `@/*` → `./src/*`
- Biomeでフォーマット（タブ、ダブルクォート）とリント
- ダークテーマUI（黒背景、白文字）
- 日本語の日付フォーマット（`ja-JP`ロケール）
