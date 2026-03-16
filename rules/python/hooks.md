---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python フック

> このファイルは [common/hooks.md](../common/hooks.md) を Python 固有の内容で拡張します。

## PostToolUse フック

`~/.claude/settings.json` で設定:

- **black/ruff**: 編集後に `.py` ファイルを自動フォーマット
- **mypy/pyright**: `.py` ファイル編集後に型チェックを実行

## 警告

- 編集されたファイルの `print()` 文に対して警告（代わりに `logging` モジュールを使用）
