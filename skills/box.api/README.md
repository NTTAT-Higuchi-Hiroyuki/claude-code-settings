# Box File Access Skill for Claude Code

Box URLからファイルを取得・更新するClaude Codeスキルです。

## 機能

- Box URLからファイル内容を読み取り
- Box APIを使用したファイル更新
- ファイルメタデータの取得

## インストール

### 1. 依存関係のインストール

```bash
cd ~/.claude/skills/box
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. 環境変数の設定

`.zshrc` または `.bashrc` に以下を追加：

```bash
export BOX_ACCESS_TOKEN="your_box_access_token_here"
export BOX_TIMEOUT="30"  # オプション（デフォルト: 30秒）
```

設定を反映：

```bash
source ~/.zshrc  # または source ~/.bashrc
```

## 使用方法

### ファイル読み取り

```bash
/box https://app.box.com/file/123456789
```

### ファイル情報取得

```bash
/box https://app.box.com/file/123456789 info
```

### ファイル更新

```bash
/box https://app.box.com/file/123456789 update "新しい内容"
```

## Box Access Tokenの取得方法

1. [Box Developer Console](https://app.box.com/developers/console) にアクセス
2. アプリケーションを作成（OAuth 2.0 with JWT または Developer Token）
3. Developer Tokenを生成（開発/テスト用）
4. トークンを環境変数に設定

**注意**: Developer Tokenは60分で期限切れになります。長期使用にはOAuth 2.0を推奨します。

## 対応ファイル形式

- テキストファイル (.txt)
- マークダウン (.md)
- JSON (.json)
- その他テキストベースのファイル

## 制限事項

- 最大ファイルサイズ: 50MB
- テキストファイルのみサポート
- フォルダ操作は未対応

## トラブルシューティング

### 認証エラー

```
BOX_ACCESS_TOKEN環境変数を確認してください
```

→ 環境変数が正しく設定されているか確認

### ファイルが見つからない

```
指定されたファイルが見つかりません
```

→ Box URLが正しいか、アクセス権限があるか確認

### タイムアウトエラー

```
リクエストがタイムアウトしました
```

→ `BOX_TIMEOUT` 環境変数を増やす（例: `export BOX_TIMEOUT="60"`）

## 開発

### テスト実行

```bash
# 全テスト
npm test

# ユニットテストのみ
npm run test:unit

# カバレッジレポート
npm run test:coverage
```

### 型チェック

```bash
npm run typecheck
```

### リント

```bash
npm run lint
```

## ライセンス

MIT
