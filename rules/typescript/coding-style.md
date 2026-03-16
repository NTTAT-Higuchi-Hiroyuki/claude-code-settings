---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を TypeScript/JavaScript 固有の内容で拡張します。

## イミュータビリティ

スプレッド演算子でイミュータブルな更新を行う:

```typescript
// NG: ミューテーション
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// OK: イミュータビリティ
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## エラー処理

async/await と try-catch を使用:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## 入力バリデーション

スキーマベースのバリデーションに Zod を使用:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Console.log

- プロダクションコードに `console.log` 文を使用しない
- 代わりに適切なロギングライブラリを使用
- 自動検出についてはフックを参照
