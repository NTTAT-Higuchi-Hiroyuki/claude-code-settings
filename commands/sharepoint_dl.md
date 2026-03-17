---
description: "SharePointでキーワード検索し、最新のファイルをダウンロードします"
argument-hint: <keyword> [download-dir]
allowed-tools:
  - mcp__chrome-devtools__list_pages
  - mcp__chrome-devtools__new_page
  - mcp__chrome-devtools__navigate_page
  - mcp__chrome-devtools__take_screenshot
  - mcp__chrome-devtools__evaluate_script
  - mcp__chrome-devtools__click
  - mcp__chrome-devtools__type_text
  - mcp__chrome-devtools__wait_for
  - mcp__chrome-devtools__press_key
  - mcp__chrome-devtools__list_network_requests
  - mcp__chrome-devtools__get_network_request
  - Bash
---

# SharePoint ダウンロード

引数: $ARGUMENTS

## 概要

指定されたキーワードで SharePoint を検索し、最新のファイルをダウンロードします。

---

## Step 1: 引数の解析

$ARGUMENTS を以下のように解析してください：
- 第1引数（必須）: 検索キーワード（例: `基本契約書`）
- 第2引数（任意）: ダウンロード先ディレクトリ（省略時はカレントディレクトリ `./`）

キーワードが指定されていない場合はエラーを表示して終了してください。

---

## Step 2: Chrome ページの準備

1. `list_pages` でChromeの現在のページ一覧を取得する
2. SharePoint (`sharepoint.com`) が含まれるページが既にあれば、そのpage_idを使用する
3. なければ `new_page` で新しいタブを開き、そのpage_idを記録する

---

## Step 3: SharePoint 検索

1. 検索キーワードをURLエンコードする（例: `基本契約書` → `%E5%9F%BA%E6%9C%AC%E5%A5%91%E7%B4%84%E6%9B%B8`）

2. 以下のURLに `navigate_page` でアクセスする：
   ```
   https://nttadvancedtechnology.sharepoint.com/sites/portal/_layouts/15/search.aspx?q=<URLエンコードキーワード>
   ```

3. `take_screenshot` でページ状態を確認する

4. **ログイン画面が表示された場合:**
   - ユーザーに「SharePointへのログインが必要です。ブラウザでログインを完了してから Enter を押してください」と案内する
   - ログイン完了後に Step 3-2 から再試行する

---

## Step 4: 検索結果の待機と取得

1. `wait_for` でページの読み込み完了を待機する（最大30秒）

2. `evaluate_script` で以下のスクリプトを実行して検索結果を取得する：

```javascript
(function() {
  // Modern SharePoint search results - 複数セレクタ戦略
  const strategies = [
    // 戦略1: data-automationid属性を使用（モダンSharePoint）
    function() {
      const cards = document.querySelectorAll('[data-automationid="SearchResultCard"]');
      return Array.from(cards).map(card => {
        const link = card.querySelector('a[href]');
        const titleEl = card.querySelector('[data-automationid="resultTitle"]') || card.querySelector('a');
        const dateEl = card.querySelector('[data-automationid="modifiedDate"]') ||
                       card.querySelector('[data-automationid="resultDate"]') ||
                       card.querySelector('time');
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          url: link ? link.href : '',
          date: dateEl ? (dateEl.getAttribute('datetime') || dateEl.textContent.trim()) : ''
        };
      }).filter(r => r.url && r.title);
    },
    // 戦略2: クラス名ベース（クラシックSharePoint）
    function() {
      const items = document.querySelectorAll('.ms-srch-item, .ms-searchCenter-result');
      return Array.from(items).map(item => {
        const link = item.querySelector('a.ms-srch-item-title, a[href*="sharepoint"]');
        const date = item.querySelector('.ms-srch-item-summary, .ms-srch-item-description');
        return {
          title: link ? link.textContent.trim() : '',
          url: link ? link.href : '',
          date: date ? date.textContent.trim() : ''
        };
      }).filter(r => r.url && r.title);
    },
    // 戦略3: 汎用リンク検索（フォールバック）
    function() {
      const allLinks = Array.from(document.querySelectorAll('a[href*="/sites/"][href*=".xlsx"], a[href*="/sites/"][href*=".docx"], a[href*="/sites/"][href*=".pdf"], a[href*="/:x:/"], a[href*="/:w:/"], a[href*="/:p:/"]'));
      return allLinks.map(link => ({
        title: link.textContent.trim() || link.href.split('/').pop(),
        url: link.href,
        date: ''
      })).filter(r => r.url && r.title);
    }
  ];

  for (const strategy of strategies) {
    try {
      const results = strategy();
      if (results.length > 0) {
        return JSON.stringify({ success: true, results: results, strategy: strategies.indexOf(strategy) + 1 });
      }
    } catch(e) {}
  }

  // ページのHTML構造をデバッグ用に返す
  return JSON.stringify({
    success: false,
    debug: {
      title: document.title,
      url: location.href,
      bodyText: document.body ? document.body.innerText.substring(0, 500) : 'no body'
    }
  });
})();
```

3. 結果が `success: false` の場合は `take_screenshot` で状況を確認し、ページ読み込み中であれば待機後に再試行する

---

## Step 5: 最新ファイルの特定

取得した検索結果から最新のファイルを特定してください：

1. **日付情報がある場合:** 日付を比較してもっとも新しいファイルを選択する
2. **日付情報がない場合:** 検索結果の最初のファイルを選択する（SharePointはデフォルトで関連度順）

ユーザーに以下を表示してください：
- 発見したファイル数
- 選択したファイルの名前・URL・日付

---

## Step 6: ファイル名の取得

ダウンロード前に、ファイルの正確な名前を取得してください：

1. 検索結果URLに `.xlsx`, `.docx`, `.pdf` 等の拡張子が含まれている場合は、URLからファイル名を抽出する
   - 例: `.../%E5%9F%BA%E6%9C%AC%E5%A5%91%E7%B4%84%E4%B8%80%E8%A6%A7%20.xlsx?...` → `基本契約一覧 .xlsx`（URLデコード）

2. URLからファイル名が取れない場合は、検索結果のタイトルに `.xlsx` 等の拡張子を付けて使用する

このファイル名を `$TARGET_FILENAME` として記録しておく。

---

## Step 7: ファイルのダウンロード

以下の手順でダウンロードしてください：

### 方法A: SharePoint REST API（推奨）

1. 検索結果URLから `sourcedoc` パラメータ（ファイルGUID）を取得する
   - `Doc.aspx?sourcedoc=%7B<GUID>%7D` 形式のURL → GUIDを抽出
   - または `/:x:/r/` 形式のURL → まず `Doc.aspx` URLにナビゲートしてURLを確認する

2. 以下のURLに `navigate_page` でアクセスする（`ERR_ABORTED` が返れば成功）:
   ```
   https://nttadvancedtechnology.sharepoint.com/sites/<サイト名>/_api/web/GetFileById('<GUID>')/$value
   ```
   サイト名は検索結果URLの `/sites/<サイト名>/` から取得する。

3. ダウンロード後、Bash で `$value` ファイルを正しいファイル名にリネームする:
   ```bash
   mv ~/Downloads/\$value ~/Downloads/"<$TARGET_FILENAME>"
   ```

### 方法B: ファイルプレビューページからダウンロード（方法Aが使えない場合）

1. `navigate_page` でファイルURLにアクセスする（`action=download` に変更）
2. `take_screenshot` でページを確認する
3. `evaluate_script` でダウンロードボタンを探してクリックする：
```javascript
(function() {
  const selectors = [
    'button[aria-label*="ダウンロード"]',
    'button[aria-label*="Download"]',
    'a[data-automationid="downloadCommand"]',
    '[data-automationid="downloadCommand"]',
    'a[href*="download=1"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) { el.click(); return { clicked: sel }; }
  }
  const allButtons = Array.from(document.querySelectorAll('button, a')).filter(
    el => el.textContent.includes('ダウンロード') || el.textContent.includes('Download')
  );
  if (allButtons.length > 0) {
    allButtons[0].click();
    return { clicked: allButtons[0].textContent.trim() };
  }
  return { clicked: null };
})();
```

---

## Step 8: ダウンロード先の処理

1. `Bash` で最新ダウンロードファイルを確認する:
   ```bash
   ls -t ~/Downloads/ | head -5
   ```

2. **ダウンロード先ディレクトリが指定されている場合:**
   - `Bash` でファイルを移動する：
     ```bash
     mv ~/Downloads/"<$TARGET_FILENAME>" "<指定ディレクトリ>/"
     ```
   - 最終保存先: `<指定ディレクトリ>/<$TARGET_FILENAME>`

3. **ダウンロード先が未指定の場合:**
   - ファイルは `~/Downloads/<$TARGET_FILENAME>` に保存済み

4. ユーザーにダウンロード完了と最終保存先パスを報告する

---

## エラーハンドリング

| 状況 | 対応 |
|------|------|
| ログイン画面 | 手動ログインを促し、完了後に再実行 |
| 検索結果0件 | キーワードを確認するよう案内 |
| ダウンロード失敗 | ファイルURLをユーザーに表示し手動ダウンロードを案内 |
| タイムアウト | `take_screenshot` で状況確認、再試行またはユーザーに状況報告 |
