---
allowed-tools:
  - mcp__chrome-devtools__list_pages
  - mcp__chrome-devtools__new_page
  - mcp__chrome-devtools__select_page
  - mcp__chrome-devtools__navigate_page
  - mcp__chrome-devtools__take_screenshot
  - mcp__chrome-devtools__evaluate_script
  - mcp__chrome-devtools__wait_for
  - mcp__chrome-devtools__press_key
  - mcp__chrome-devtools__type_text
description: "Teams webでユーザーを検索し、プロフィールカードから属性情報（名前・メール・役職・部署・電話番号・所在地・在席状況）を取得します"
argument-hint: <名前またはメールアドレス>
---

# Teams ユーザー情報取得スキル

Chrome DevTools を使用して Teams web にアクセスし、指定したユーザーのプロフィールカード情報を取得します。

## 入力

ユーザーの呼び出し: $ARGUMENTS

- メールアドレス形式（例: `john.doe@company.co.jp`）
- 名前形式（例: `甲原` または `甲原春花`）

## 実行手順

### ステップ 1: Teams ページの確認・取得

`list_pages` で開いているページを確認する。

- `teams.microsoft.com` が含まれるページがあれば `select_page` でそれを選択する
- なければ `new_page` で `https://teams.microsoft.com/` を開く

`take_screenshot` でページ状態を確認する。

- ログイン画面が表示されている場合 → ユーザーに手動ログインを依頼し、完了を告げてもらってから続行する
- Teams が読み込まれていない場合 → `evaluate_script` で URL を確認し、`teams.microsoft.com/v2/` になるまで待つ：

```javascript
() => ({ url: location.href, ready: location.href.includes('teams.microsoft.com/v2') && !location.href.includes('login') })
```

### ステップ 2: 候補リスト取得

`press_key` で `Control+g` を押して検索バーを開く。

2秒後、`evaluate_script` で検索バーを探してフォーカスする：

```javascript
() => {
  const input = document.querySelector('[data-tid="AUTOSUGGEST_INPUT"], input[placeholder*="検索"], input[type="search"]');
  if (!input) return { found: false };
  input.focus();
  return { found: true, placeholder: input.placeholder };
}
```

検索バーが見つかったら `type_text` でクエリを入力する（`$ARGUMENTS` の値を使用）。

2.5秒待った後、`evaluate_script` で候補を取得する：

```javascript
() => {
  const opts = Array.from(document.querySelectorAll('[data-tid*="orgid"]'));
  return opts.map(el => el.getAttribute('aria-label') || '').filter(Boolean);
}
```

候補が0件の場合は `take_screenshot` でUI状態を確認し、エラーを報告する。

### ステップ 3: 候補の確認とユーザー選択

- **候補が1件のみ** → そのままステップ 4 へ進む
- **候補が複数件** → 以下の形式で一覧を提示し、選択を待つ：

```
「[クエリ]」に該当するユーザーが複数見つかりました。どの方の情報を取得しますか？

1. 高橋真由美 (MAYUMI.TAKAHASHI) - 主任技師
2. 高橋慎治 (SHINJI.TAKAHASHI) - 担当課長
3. 高橋紀之 (NORIYUKI.TAKAHASHI) - 主幹技師
...

番号または氏名でお答えください。
```

ユーザーが選択したら、その氏名をターゲット名としてステップ 4 に進む。

### ステップ 4: ユーザーのチャットを開く

`evaluate_script` でターゲットユーザーの要素をクリックする（`TARGET_NAME` を実際の名前に置き換え）：

```javascript
() => {
  const opts = Array.from(document.querySelectorAll('[data-tid*="orgid"]'));
  const target = opts.find(el => (el.getAttribute('aria-label') || '').includes('TARGET_NAME'));
  if (!target) return { clicked: false };
  target.click();
  return { clicked: true, label: target.getAttribute('aria-label') };
}
```

`wait_for` でチャット画面に切り替わるまで待つ（ターゲット名の文字列が表示されるのを待つ）。

### ステップ 5: プロフィールカードを開く

`evaluate_script` でチャットヘッダーのアバターをクリックする：

```javascript
() => {
  const el = document.querySelector('[data-tid="chat-title-avatar"]')
          || document.querySelector('[data-tid="chat-header-emblem"]');
  if (!el) return { clicked: false };
  el.click();
  return { clicked: true, selector: el.getAttribute('data-tid') };
}
```

3秒待った後、`take_screenshot` でプロフィールカードの表示を確認する。

### ステップ 6: プロフィール情報の抽出

`evaluate_script` でプロフィールデータを取得する：

```javascript
() => {
  const data = {};
  let cardEl = null;
  for (const sel of ['[data-tid="profile-card"]', '[class*="profileCard"]', '[class*="persona-card"]', '[class*="contact-card"]', '[class*="personaCard"]']) {
    cardEl = document.querySelector(sel);
    if (cardEl && cardEl.textContent.trim().length > 50) { data._cardFound = sel; break; }
  }
  const root = cardEl || document.body;

  const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
  for (const el of root.querySelectorAll('a[href^="mailto:"], a[href*="@"]')) {
    const m = (el.getAttribute('href') || '').match(/mailto:(.+)/);
    if (m) { data.email = m[1].trim(); break; }
  }
  if (!data.email) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent.trim();
      if (emailPattern.test(t) && t.length < 100) { data.email = t.match(emailPattern)[0]; break; }
    }
  }

  for (const label of root.querySelectorAll('dt, [class*="label"], [class*="Label"]')) {
    const t = label.textContent.trim();
    const v = (label.nextElementSibling || {}).textContent?.trim() || '';
    if (!v || v.length > 200) continue;
    if (/メール|mail|email/i.test(t)) data.email = v;
    else if (/チャット|chat/i.test(t)) data.chat = v;
    else if (/携帯|mobile|cell/i.test(t)) data.mobilePhone = v;
    else if (/勤務先|business.*phone|work.*phone/i.test(t)) data.businessPhone = v;
    else if (/作業場所|office.*loc|location/i.test(t)) data.officeLocation = v;
    else if (/役職|job.*title/i.test(t)) data.jobTitle = v;
    else if (/部署|department|division/i.test(t)) data.department = v;
  }

  for (const sel of ['[data-tid="presence-status"]', '[class*="presence"]', '[class*="availability"]', '[class*="Presence"]']) {
    const el = root.querySelector(sel);
    if (el) { const p = el.textContent.trim() || el.getAttribute('aria-label'); if (p) { data.presence = p; break; } }
  }

  const whEl = root.querySelector('[class*="workingHours"], [class*="working-hours"]');
  if (whEl) data.workingHours = whEl.textContent.trim();

  return data;
}
```

スクリーンショットの視覚情報でも不足項目を補完する。

### ステップ 7: 結果の報告

取得したデータを以下のフォーマットで出力する：

```
## ユーザー情報: [名前]

| 項目 | 値 |
|------|---|
| 表示名 | |
| メール | |
| 役職 | |
| 部署 | |
| 作業場所 | |
| 勤務先電話 | |
| 携帯電話 | |
| 在席状況 | |
| 稼働時間 | |
```

情報が取得できなかった項目は「-」と表示する。

### トラブルシューティング

| 問題 | 対処方法 |
|------|----------|
| ログイン画面が表示される | Chrome で Microsoft 365 にログインしてください |
| 検索バーが見つからない | `take_screenshot` でUI状態を確認。`Control+g` が機能していない可能性あり |
| ユーザーが見つからない | 名前の表記を変えるかメールアドレスで再試行 |
| プロフィールカードが開かない | `chat-title-avatar` の代わりに `chat-header-emblem` を試す |
| Teams が開いていない | `new_page` で `https://teams.microsoft.com/` を開いてログインする |

## 注意事項

- Chrome で Microsoft 365 にログイン済みであることが前提です
- 取得できる情報は Teams のプロフィールカードに表示されているものに限られます

think hard
