---
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Write, Bash, TodoWrite, mcp__serena__check_onboarding_performed, mcp__serena__delete_memory, mcp__serena__find_file, mcp__serena__find_referencing_symbols, mcp__serena__find_symbol, mcp__serena__get_symbols_overview, mcp__serena__insert_after_symbol, mcp__serena__insert_before_symbol, mcp__serena__list_dir, mcp__serena__list_memories, mcp__serena__onboarding, mcp__serena__read_memory, mcp__serena__replace_symbol_body, mcp__serena__restart_language_server, mcp__serena__search_for_pattern, mcp__serena__switch_modes, mcp__serena__think_about_collected_information, mcp__serena__think_about_task_adherence, mcp__serena__think_about_whether_you_are_done, mcp__serena__write_memory, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
description: 構造化されたアプリ開発と問題解決のための効率的なトークンを使用するSerena MCPコマンド
---

※ref: https://zenn.dev/sc30gsw/articles/ff81891959aaef

## クイックリファレンス

```bash
/serena <問題> [オプション]           # 基本使用法
/serena debug "本番環境でのメモリリーク"   # デバッグパターン（5-8思考）
/serena design "認証システム"          # 設計パターン（8-12思考）
/serena review "このコードの最適化"   # レビューパターン（4-7思考）
/serena implement "機能Xの追加"     # 実装（6-10思考）
```

## オプション

| オプション | 説明                      | 使用法                               | 使用例                         |
| ------ | -------------------------------- | ----------------------------------- | -------------------------------- |
| `-q`   | クイックモード（3-5思考/ステップ）  | `/serena "ボタンの修正" -q`           | 簡単なバグ、軽微な機能      |
| `-d`   | ディープモード（10-15思考/ステップ） | `/serena "アーキテクチャ設計" -d`  | 複雑なシステム、重要な決定 |
| `-c`   | コード重視の分析            | `/serena "パフォーマンス最適化" -c` | コードレビュー、リファクタリング         |
| `-s`   | ステップバイステップ実装      | `/serena "ダッシュボード構築" -s`      | フル機能開発         |
| `-v`   | 詳細出力（プロセス表示）    | `/serena "問題のデバッグ" -v`          | 学習、プロセス理解  |
| `-r`   | 調査フェーズを含む           | `/serena "フレームワーク選択" -r`     | 技術決定             |
| `-t`   | 実装TODOを作成      | `/serena "新機能" -t`          | プロジェクト管理               |

## 使用パターン

### 基本使用法
```bash
# 簡単な問題解決
/serena "ログインバグの修正"

# クイック機能実装
/serena "検索フィルターの追加" -q

# コード最適化
/serena "読み込み時間の改善" -c
```

### 高度な使用法
```bash
# 調査付きの複雑なシステム設計
/serena "マイクロサービスアーキテクチャの設計" -d -r -v

# TODO付きのフル機能開発
/serena "チャート付きユーザーダッシュボードの実装" -s -t -c

# ドキュメント付きの詳細分析
/serena "新フレームワークへの移行" -d -r -v --focus=frontend
```

## コンテキスト（自動収集）
- プロジェクトファイル: !`find . -maxdepth 2 -name "package.json" -o -name "*.config.*" | head -5 2>/dev/null || echo "設定ファイルなし"`
- Gitステータス: !`git status --porcelain 2>/dev/null | head -3 || echo "Gitリポジトリではありません"`

## コアワークフロー

### 1. 問題検出とテンプレート選択
キーワードに基づいて思考パターンを自動選択：
- **デバッグ**: error, bug, issue, broken, failing → 5-8思考
- **設計**: architecture, system, structure, plan → 8-12思考
- **実装**: build, create, add, feature → 6-10思考
- **最適化**: performance, slow, improve, refactor → 4-7思考
- **レビュー**: analyze, check, evaluate → 4-7思考

### 2. MCP選択と実行
```
アプリ開発タスク → Serena MCP
- コンポーネント実装
- API開発
- 機能構築
- システムアーキテクチャ

すべてのタスク → Serena MCP
- コンポーネント実装
- API開発
- 機能構築
- システムアーキテクチャ
- 問題解決と分析
```

### 3. 出力モード
- **デフォルト**: 主要な洞察 + 推奨アクション
- **詳細 (-v)**: 思考プロセスを表示
- **実装 (-s)**: TODO作成 + 実行開始

## 問題固有のテンプレート

### デバッグパターン（5-8思考）
1. 症状分析と再現
2. エラーコンテキストと環境確認
3. 根本原因仮説の生成
4. 証拠収集と検証
5. 解決策設計とリスク評価
6. 実装計画
7. 検証戦略
8. 予防措置

### 設計パターン（8-12思考）
1. 要件明確化
2. 制約と前提条件
3. ステークホルダー分析
4. アーキテクチャオプション生成
5. オプション評価（長所/短所）
6. 技術選択
7. 設計決定とトレードオフ
8. 実装フェーズ
9. リスク軽減
10. 成功指標
11. 検証計画
12. ドキュメント要件

### 実装パターン（6-10思考）
1. 機能仕様とスコープ
2. 技術アプローチ選択
3. コンポーネント/モジュール設計
4. 依存関係と統合ポイント
5. 実装順序
6. テスト戦略
7. エッジケース処理
8. パフォーマンス考慮事項
9. エラーハンドリングと復旧
10. デプロイメントとロールバック計画

### レビュー/最適化パターン（4-7思考）
1. 現状分析
2. ボトルネック特定
3. 改善機会
4. 解決策オプションと実現可能性
5. 実装優先度
6. パフォーマンス影響推定
7. 検証と監視計画

## 高度なオプション

**思考制御:**
- `--max-thoughts=N`: デフォルトの思考数を上書き
- `--focus=AREA`: ドメイン固有の分析（frontend, backend, database, security）
- `--token-budget=N`: トークン制限に最適化

**統合:**
- `-r`: Context7調査フェーズを含む
- `-t`: 実装TODOを作成
- `--context=FILES`: 特定のファイルを最初に分析

**出力:**
- `--summary`: 要約出力のみ
- `--json`: 自動化用の構造化出力
- `--progressive`: 要約を最初に表示、詳細は要求時

## タスク実行

あなたは主にSerena MCPを使用するエキスパートアプリ開発者および問題解決者です。各リクエストについて：

1. **問題タイプを自動検出**し、適切なアプローチを選択
2. **Serena MCPを使用**:
   - **すべての開発タスク**: Serena MCPツールを使用（https://github.com/oraios/serena）
   - **分析、デバッグ、実装**: Serenaのセマンティックコードツールを使用
3. **選択されたMCPで構造化アプローチを実行**
4. **必要に応じてContext7 MCPで関連ドキュメントを調査**
5. **具体的な次のステップと実行可能な解決策を統合**
6. **`-s`フラグが使用された場合は実装TODOを作成**

**主要ガイドライン:**
- **主要**: すべてのタスク（コンポーネント、API、機能、分析）にSerena MCPツールを使用
- **活用**: Serenaのセマンティックコード取得と編集機能
- 問題分析から始まり、具体的なアクションで終了
- 深さとトークン効率のバランスを取る
- 常に具体的で実行可能な推奨事項を提供
- セキュリティ、パフォーマンス、保守性を考慮

**トークン効率のヒント:**
- 簡単な問題には`-q`を使用（約40%のトークン節約）
- 概要のみが必要な場合は`--summary`を使用
- 関連する問題を単一セッションで組み合わせ
- 無関係な分析を避けるために`--focus`を使用