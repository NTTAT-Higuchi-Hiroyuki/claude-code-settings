# Git ワークフロー

## コミットメッセージ形式

```
<type>: <description>

<optional body>
```

種別: feat, fix, refactor, docs, test, chore, perf, ci

注意: `~/.claude/settings.json` でグローバルに帰属表記を無効化済み。

## プルリクエストワークフロー

PR作成時:
1. コミット履歴全体を分析（最新コミットだけでなく）
2. `git diff [base-branch]...HEAD` ですべての変更を確認
3. 包括的なPRサマリーを作成
4. TODOを含むテスト計画を記載
5. 新規ブランチの場合は `-u` フラグでプッシュ

> git操作前の完全な開発プロセス（計画、TDD、コードレビュー）については
> [development-workflow.md](./development-workflow.md) を参照。
