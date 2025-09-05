---
allowed-tools: Bash(git:*)
description: 新しいgitブランチを作成し、適切な命名規則に従ってセットアップする

---

# Git ブランチ作成

新しいgitブランチを作成し、適切な命名規則に従ってセットアップします。

## 実行手順

1. **現在の状況確認**
   - `git status`で作業ディレクトリの状況を確認
   - `git branch -a`で既存のブランチを確認
   - `git 
   - 未コミットの変更がある場合は警告を表示

2. **ブランチ名の検証**
   - 適切な命名規則に従っているかチェック
   - 推奨される命名パターン:
     - `feature/機能名`
     - `fix/修正内容`
     - `refactor/リファクタリング内容`
     - `docs/ドキュメント更新内容`
     - `test/テスト追加内容`

3. **ブランチ作成とチェックアウト**
   - `git checkout -b <ブランチ名>`でブランチ作成とチェックアウトを同時実行
   - 成功確認のため`git branch`で現在のブランチを表示

4. **リモートブランチとの連携準備**
   - 必要に応じて`git push -u origin <ブランチ名>`でリモートブランチを設定
   - プッシュするかユーザーに確認

## 命名規則

### 推奨されるブランチ名の例

- **機能追加**: `feature/user-authentication`, `feature/payment-integration`
- **バグ修正**: `fix/login-error`, `fix/memory-leak`
- **リファクタリング**: `refactor/api-structure`, `refactor/database-queries`
- **ドキュメント**: `docs/api-documentation`, `docs/readme-update`
- **テスト**: `test/unit-tests`, `test/integration-tests`
- **設定変更**: `config/ci-pipeline`, `config/build-settings`

### 避けるべきブランチ名

- 日本語文字（gitの互換性問題）
- スペースを含む名前
- 特殊文字（`@`, `#`, `%`など）
- 既存のブランチと同名

## 実行例

```bash
# 現在の状況確認
git status
git branch -a

# ブランチ作成（例：ユーザー認証機能の開発）
git checkout -b feature/user-authentication

# リモートブランチ設定（オプション）
git push -u origin feature/user-authentication
```

## 注意事項

- **作業ディレクトリがクリーンでない場合**は、先にコミットまたはstashを推奨
- **既存のブランチ名と重複**しないよう事前確認
- **リモートリポジトリへのプッシュ**は必要に応じて実行（デフォルトでは確認する）
- **メインブランチからの分岐**を推奨（main/masterブランチから作成）

## オプション機能

- ブランチ作成後に初期コミットを作成するかの選択
- 関連するIssue番号がある場合のブランチ名への組み込み
- チーム固有の命名規則がある場合の適用