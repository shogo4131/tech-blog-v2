---
title: Getting Started with TanStack Start
description: TanStack Startを使ってモダンなWebアプリケーションを構築する方法を解説します。
date: 2026-01-03
tags:
  - TanStack
  - React
  - TypeScript
published: true
---

## TanStack Startとは

TanStack Startは、TanStack Routerをベースにしたフルスタックのリアクトフレームワークです。型安全なルーティング、サーバーサイドレンダリング、静的生成など、モダンなWebアプリケーション開発に必要な機能を提供します。

## 主な特徴

TanStack Startには以下のような特徴があります：

- **型安全なルーティング**: ファイルベースのルーティングで、自動的に型が生成されます
- **サーバー関数**: セキュアなサーバーサイド処理を簡単に実装できます
- **静的プリレンダリング**: ビルド時にページを生成してパフォーマンスを最適化
- **Cloudflare Workers対応**: エッジでの高速なデプロイが可能

## ルートの作成

TanStack Startでルートを作成する方法を見てみましょう：

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/hello')({
  component: () => <h1>Hello, World!</h1>,
});
```

ファイル名がそのままURLパスになります。例えば `routes/about.tsx` は `/about` にマッピングされます。

## データローディング

ルートにはローダー関数を定義できます：

```typescript
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId);
    return { user };
  },
  component: UserPage,
});

function UserPage() {
  const { user } = Route.useLoaderData();
  return <div>{user.name}</div>;
}
```

## まとめ

TanStack Startは、型安全性とパフォーマンスを両立した優れたフレームワークです。特にTypeScriptを使った開発において、その恩恵を最大限に受けることができます。

次回は、TanStack Startでのサーバー関数の使い方について詳しく解説します。
