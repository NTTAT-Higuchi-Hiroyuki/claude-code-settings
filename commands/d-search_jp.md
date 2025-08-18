---
allowed-tools: Bash(gemini:*)
description: "Gemini CLIを使用してディープウェブ検索を実行し、詳細なレポートを生成します。"
---

## Gemini ディープ検索

`gemini`はgoogle gemini cliです。ウェブ検索に使用できます。

### あなたのタスク（このワークフローに従う必要があります）

1. 検索フェーズ: gemini CLIを使用して複数の検索を並行実行します。

- Gemini CLIの`google_web_search`ツールを使用してください
- `>/search [引数]`のようなコマンドを受け取ります。
  - 受け取った引数について、以下のようにGemini CLIのgoogle_web_searchツールを使用して検索してください。
  - !`gemini -m gemini-2.5-flash -p "google_web_search: [引数]'"`
- 2-3個のキーワードを（組み合わせではなく）個別に並行検索
- 検索結果からURLのみを抽出（HTMLコンテンツは処理しない）
- 使用するモデルは"gemini-2.5-flash"のみ

2. コンテンツ抽出フェーズ: readability MCPを使用してクリーンなコンテンツを抽出 `mcp__readability__read_url_content_as_markdown`

- ステップ1からの最も関連性の高いURLに適用
- HTMLタグを削除し、メインコンテンツのみを抽出
- 重要: このツールを使用する前に検索結果を要約または処理しないでください（トークン消費を最小化するため）

3. レポート生成フェーズ: 抽出されたマークダウンコンテンツを包括的なレポートに統合

- 複数のソースからの情報を統合
- 構造化されたマークダウンレポートを作成

### 重要ルール

- Claudeのトークン消費を最小化するため、ALL stepsをTask Tool内で実行
- 内蔵の`Web Search`ツールを使用しないでください
- 生のHTML検索結果を直接処理または要約しないでください
- 処理前に必ずreadabilityを使用してコンテンツを抽出
- 最終的な詳細レポートをマークダウンファイルに含める
- 