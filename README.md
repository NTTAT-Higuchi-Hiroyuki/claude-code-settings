# Claude Code設定のベストプラクティス

Claude Codeの設定とカスタマイズのベストプラクティスを集めたリポジトリです。今後もこのリポジトリを更新・改善し、より良いものにしていきます。

**注意:** このリポジトリの設定の一部は、日本語ユーザー向けに特別に設定されています。あなたの環境に適切に翻訳・適応するためにLLMをご利用ください。

このリポジトリの設定ファイルは、`~/.claude/`ディレクトリ以下に配置されるように設計されています。これらの設定ファイルを適切な場所に配置することで、Claude Codeの動作をカスタマイズし、効率的な開発環境を構築できます。

## プロジェクト構造

```
claude-code-settings/
├── CLAUDE.md            # ~/.claude/ 配置用のグローバルユーザーガイドライン
├── settings.json        # Claude Code設定ファイル
├── commands/            # カスタムコマンド定義
│   ├── code-review.md   # 詳細分析を含むコードレビューの実行
│   ├── d-search.md      # gemini-cliを使用した深いコードベース解析
│   ├── design.md        # 技術設計フェーズの実行
│   ├── marp.md          # Marpプレゼンテーション作成コマンド
│   ├── requirements.md  # 要件定義フェーズの実行
│   ├── search.md        # gemini-cliを使用したGoogle Web検索
│   ├── spec.md          # 完全な仕様駆動開発ワークフロー
│   ├── tasks.md         # タスク分解フェーズの実行
│   └── textlint.md      # textlintによるファイル校正・修正
└── symlinks/            # 外部ツール設定ファイルのシンボリックリンク
    ├── settings.json    # MCP設定を含むClaude Code設定
    └── config/
        └── ccmanager/
            └── config.json    # ccmanager: Claude Codeプロジェクト＆gitワークツリー管理
```

## symlinksフォルダについて

`symlinks/`フォルダには、Claude Codeに関連する様々な外部ツールの設定ファイルが含まれています。Claude Codeは頻繁に更新され、設定変更が多いため、すべての設定ファイルを一つのフォルダに集約することで編集が格段に楽になります。関連ファイルが通常`~/.claude/`ディレクトリ外に配置される場合でも、統一管理のためにシンボリックリンクとしてここに配置するのが便利です。

実際の環境では、これらのファイルは指定された場所にシンボリックリンクとして配置します。

## 主要な機能

### 1. 仕様駆動開発ワークフロー

このプロジェクトの最大の特徴は、4段階の仕様駆動開発ワークフローです：

1. **要件定義** (`/requirements`) - ユーザーリクエストを明確な機能要件に変換
2. **設計** (`/design`) - 技術設計とアーキテクチャを策定
3. **タスク分解** (`/tasks`) - タスクを実装可能な単位に分割
4. **実装** - タスクリストに基づいた体系的な実装

**注意:** これらのスラッシュコマンドで生成される設計ドキュメントは、各コマンドで設定されたプロンプトにより日本語で出力されます。

### 2. 効率的な開発ルール

- **並列処理の活用**: 複数の独立したプロセスを同時実行
- **英語で思考、日本語で回答**: 内部処理は英語、ユーザー回答は日本語
- **Context7 MCPの活用**: 常に最新のライブラリ情報を参照
- **徹底した検証**: Write/Edit後は必ずReadで検証

## ファイル詳細

### CLAUDE.md

プロジェクト固有のガイドラインを定義します。以下の内容を含みます：

- **トップレベルルール**: 基本的な操作ルール
- **プログラミングルール**: コーディング規約（TypeScript使用時など）
- **開発スタイル**: 詳細な仕様駆動開発ワークフロー

### settings.json

Claude Codeの動作を制御する設定ファイル：

#### 環境変数設定 (`env`)
```json
{
  "DISABLE_TELEMETRY": "1",        // テレメトリ無効
  "DISABLE_ERROR_REPORTING": "1",   // エラーレポート無効
  "API_TIMEOUT_MS": "600000"        // APIタイムアウト（10分）
}
```

#### アクセス許可設定 (`permissions`)

**allow（許可リスト）**:
- ファイル読み取り: `Read(**)`
- 特定ディレクトリへの書き込み: `Write(src/**)`, `Write(docs/**)`, `Write(.tmp/**)`
- Git操作: `git init`, `git add`, `git commit`, `git push origin*`
- パッケージ管理: `npm install`, `pnpm install`
- MCP関連: Context7、Playwrightなどのツール使用

**deny（禁止リスト）**:
- 危険なコマンド: `sudo`, `rm -rf`
- セキュリティ関連: `.env.*`ファイル、`id_rsa`などの読み取り
- 直接データベース操作: `psql`, `mysql`など

#### フック設定 (`hooks`)

**PostToolUse**（ツール使用後の自動処理）
- コマンド履歴の記録（Bash、Read、Writeなど）
- Markdownファイル編集時のtextlint自動実行

**Notification**（通知設定 - macOS）
- 作業進捗通知の表示

**Stop**（作業完了時の処理）
- 完了通知の表示

#### MCPサーバー設定 (`enabledMcpjsonServers`)
- GitHub連携（複数アカウント対応）
- Context7（ドキュメント取得）
- Playwright（ブラウザ自動化）
- Readability（Web記事読み取り）
- textlint（日本語校正）

### カスタムコマンド (commands/)

| コマンド         | 説明                                        |
| --------------- | -------------------------------------------------- |
| `/spec`         | 完全な仕様駆動開発ワークフロー |
| `/requirements` | 要件定義フェーズの実行            |
| `/design`       | 技術設計フェーズの実行                   |
| `/tasks`        | タスク分解フェーズの実行                     |
| `/code-review`  | 詳細分析を含むコードレビューの実行         |
| `/search`       | gemini-cliを使用したGoogle Web検索                 |
| `/d-search`     | gemini-cliを使用した深いコードベース解析            |
| `/marp`         | Marpプレゼンテーション作成コマンド                 |
| `/textlint`     | textlintによるファイル校正・修正     |

## セットアップ

### 0.　事前準備

1. npxのインストール
2. uvxmのインストール
3. BurntToastのインストール(Windowsの場合)

```bash
Install-Module -Name BurntToast -Force -Scope CurrentUser
```

### 2. Claude Codeへの設定適用

リポジトリの内容を`~/.claude/`と同期させるためにシンボリックリンクを作成します。

#### 方法: リポジトリを~/.claude/にリンク（Windows　WSL環境）

```bash
# リポジトリと同期させるためのシンボリックリンクを作成 
ln -s "$(pwd)" ~/.claude/claude-code-settings
# すでに運用済みのユーザClaude設定のバックアップを取ります。
mkdir -p ~/.claude/claude-code-settings/backup
mv ~/.claude/CLAUDE*.md ~/.claude/claude-code-settings/backup
mv  ~/.claude/settings.json ~/.claude/claude-code-settings/backup
mv  ~/.claude/commands ~/.claude/claude-code-settings/backup
mv  ~/.claude/agents ~/.claude/claude-code-settings/backup

# 個別ファイルをリンク
ln -s ~/.claude/claude-code-settings/CLAUDE.md ~/.claude/
ln -s ~/.claude/claude-code-settings/commands ~/.claude/
ln -s ~/.claude/claude-code-settings/agents ~/.claude/

# WSL2用設定ファイルをリンク（wsl2の場合）
ln -s ~/.claude/claude-code-settings/settings_wsl2.json ~/.claude/settings.json

# MacOS用設定ファイルをリンク（MacOSの場合）
ln -s ~/.claude/claude-code-settings/settings_macos.json ~/.claude/settings.json
```

#### 方法: リポジトリを~/.claude/にリンク（MacOS環境）

```bash
# リポジトリと同期させるためのシンボリックリンクを作成 
ln -s "$(pwd)" ~/.claude/claude-code-settings
# すでに運用済みのユーザClaude設定のバックアップを取ります。
mkdir -p ~/.claude/claude-code-settings/backup
mv ~/.claude/CLAUDE*.md ~/.claude/claude-code-settings/backup
mv  ~/.claude/settings.json ~/.claude/claude-code-settings/backup
mv  ~/.claude/commands ~/.claude/claude-code-settings/backup

# 個別ファイルをリンク
ln -s ~/.claude/claude-code-settings/CLAUDE.md ~/.claude/
ln -s ~/.claude/claude-code-settings/commands ~/.claude/
ln -s ~/.claude/claude-code-settings/agents ~/.claude/

# WSL2用設定ファイルをリンク（wsl2の場合）
ln -s ~/.claude/claude-code-settings/settings_wsl2.json ~/.claude/settings.json

# MacOS用設定ファイルをリンク（MacOSの場合）
ln -s ~/.claude/claude-code-settings/settings_macos.json ~/.claude/settings.json
```

### 3. プロジェクト固有のMCP設定

`.mcp.json`をプロジェクトトップディレクトリにコピーして利用してください。
不要なmcpがあれば、`.mcp.json`から削除してください。
最低限必要なのは、Context7, Github, Serenaです。
また、以下の変数部分は書き換えが必要です。

・ ${GITHUB_PERSONAL_ACCESS_TOKEN}：GitHubのPersonal Access Tokenを設定してください。
・ ${DATABASE_URI}：プロジェクト内でPostgresql互換のデータベースを使っている場合のURIを設定してください。
・ ${PROJECT_PATH}：プロジェクトのフルパスを設定してください。

このアプローチでは、Claude Code関連のすべての設定ファイルを`~/.claude/`ディレクトリに集中化して管理しやすくします。

## 参考資料

- [Claude Code overview](https://docs.anthropic.com/en/docs/claude-code)
- [Model Context Protocol (MCP)](https://docs.anthropic.com/en/docs/mcp)
- [textlint](https://textlint.github.io/)
- [CCManager](https://github.com/kbwo/ccmanager)
- [Context7](https://context7.com/)

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
