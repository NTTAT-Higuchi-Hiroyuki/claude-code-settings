---
allowed-tools:
  - mcp__chrome-devtools__list_pages
  - mcp__chrome-devtools__new_page
  - mcp__chrome-devtools__navigate_page
  - mcp__chrome-devtools__take_screenshot
  - mcp__chrome-devtools__evaluate_script
  - mcp__chrome-devtools__wait_for
  - mcp__chrome-devtools__upload_file
  - Bash
description: "BoxのURLにブラウザ経由でアクセスし、ファイルの取得・更新を行います（Box API・コネクタ不要）"
---

# Box ブラウザ操作スキル

Chrome DevTools MCP を使用してブラウザ経由でBoxにアクセスし、ファイルの取得・更新を行います。
Box APIやコネクタなしで動作します。Playwright・追加インストール不要。

## 対応操作

- **fetch**: BoxのURLからファイルをダウンロード
- **upload**: Boxのフォルダにローカルファイルをアップロード
- **list**: Boxのフォルダ内のファイル一覧を取得

## 実行手順

### ステップ 1: 入力の解析

`$ARGUMENTS` から操作タイプとパラメータを解析する：

```
/box_jp fetch <BoxのURL> [保存先パス]
/box_jp upload <BoxフォルダのURL> <ローカルファイルパス>
/box_jp list <BoxフォルダのURL>
```

BoxのURLの種類を判定する：
- `https://app.box.com/file/...` → ファイルURL（fetch向け）
- `https://app.box.com/folder/...` → フォルダURL（upload/list向け）
- `https://*.app.box.com/s/...` → 共有リンク
- `https://[企業名].app.box.com/...` → 企業アカウントURL（例: `nttat.app.box.com`）

保存先パスが省略された場合は `~/Downloads/` をデフォルトとする。

---

### ステップ 2: Chromeページの準備

1. `list_pages` で現在開いているページを確認する
2. Box (`app.box.com` または企業ドメイン) のページが既に開いていればそのpage_idを使用する
3. なければ `new_page` で新しいタブを開く

---

### ステップ 3: Boxへのアクセスとログイン確認

1. 対象URLに `navigate_page` でアクセスする
2. `take_screenshot` でページ状態を確認する
3. **ログイン画面が表示された場合:**
   - 「Boxへのログインが必要です。ブラウザでログインを完了してから完了とお伝えください」と案内する
   - ユーザーからログイン完了の連絡を受けたら、対象URLに再度 `navigate_page` でアクセスして続行する

---

### ステップ 4-A: fetch（ダウンロード）

1. ページ読み込み完了を待機する（Box のファイルプレビューが表示されるまで）

2. `evaluate_script` でダウンロードボタンを探してクリックする：

```javascript
() => {
  const selectors = [
    '[data-testid="download-item"]',
    'button[aria-label*="Download"]',
    'button[aria-label*="ダウンロード"]',
    '[aria-label*="Download file"]',
    '[data-resin-target="download"]',
    'button[class*="download"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) { el.click(); return { clicked: sel }; }
  }
  // 省略メニュー（...）を探す
  const moreBtn = document.querySelector(
    '[aria-label="More options"], [aria-label="その他"], [data-testid="more-options-button"]'
  );
  if (moreBtn) {
    moreBtn.click();
    return { clicked: 'more-options', note: '再度evaluate_scriptでDownloadメニュー項目をクリックしてください' };
  }
  return {
    clicked: null,
    buttons: Array.from(document.querySelectorAll('button, [role="button"]'))
      .slice(0, 20).map(b => ({ text: b.textContent.trim().substring(0, 40), aria: b.getAttribute('aria-label'), testid: b.getAttribute('data-testid') }))
  };
}
```

3. `clicked: null` の場合は `take_screenshot` でUI状態を確認し、ボタンを特定して再試行する

4. ダウンロード後、Bash で保存先を確認する：
   ```bash
   ls -t ~/Downloads/ | head -5
   ```

5. **保存先ディレクトリが指定されている場合:**
   ```bash
   mv ~/Downloads/"<ファイル名>" "<指定ディレクトリ>/"
   ```

6. ダウンロード完了とファイルパスをユーザーに報告する

---

### ステップ 4-B: upload（アップロード）

1. `navigate_page` でフォルダURLにアクセスする
2. `take_screenshot` でページ状態を確認する
3. `evaluate_script` でアップロードボタンをクリックする：

```javascript
() => {
  const selectors = [
    'button[data-testid="upload-button"]',
    '[aria-label*="Upload"]',
    '[aria-label*="アップロード"]',
    'button[class*="upload"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) { el.click(); return { clicked: sel }; }
  }
  return { clicked: null };
}
```

4. アップロードメニューが開いたら「ファイルをアップロード」をクリックする（必要に応じて再度 `evaluate_script`）

5. `evaluate_script` でファイル入力要素のuidを取得する：

```javascript
() => {
  const input = document.querySelector('input[type="file"]');
  return input ? { found: true, accept: input.getAttribute('accept') } : { found: false };
}
```

6. `upload_file` ツールでファイルをセットする（`uid` はページスナップショットから取得）

7. アップロード完了を確認する：`take_screenshot` でプログレスバーや完了メッセージを確認する

---

### ステップ 4-C: list（フォルダ一覧）

1. `navigate_page` でフォルダURLにアクセスする
2. `take_screenshot` でページ状態を確認する
3. `evaluate_script` でファイル一覧を取得する：

```javascript
() => {
  const selectors = [
    '[data-testid="file-name"]',
    '[data-resin-target="name"]',
    '.item-name',
    '[role="gridcell"] a',
    '[class*="ItemName"]',
    '[class*="item-name"]'
  ];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) {
      return {
        selector: sel,
        items: Array.from(els).map(el => el.textContent?.trim()).filter(Boolean)
      };
    }
  }
  return { items: [], debug: document.title };
}
```

4. 取得したファイル一覧を整形してユーザーに表示する

---

### トラブルシューティング

| 問題 | 対処方法 |
|------|----------|
| ログイン画面 | ブラウザでSSOログインを完了させてください |
| ダウンロードボタンが見つからない | `take_screenshot` でUI確認。省略メニュー（...）を先にクリック |
| アップロードが完了しない | `take_screenshot` でプログレスを確認。ファイルサイズが大きい場合は待機を延長 |
| ファイル一覧が空 | `take_screenshot` でフォルダが正しいか確認。ページ読み込み中の場合は再試行 |
| セッション切れ | Chromeで手動ログインし直して再実行 |

## 注意事項

- ChromeでBoxにログイン済みであれば追加認証は不要です
- 企業SSO（Microsoft ADFS等）の場合、初回のみブラウザで手動ログインが必要です
- Box の利用規約に準拠した範囲でご利用ください
