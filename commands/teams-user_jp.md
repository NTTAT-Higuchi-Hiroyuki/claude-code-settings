---
allowed-tools: Bash, Read, Write
description: "Teams webでユーザーを検索し、プロフィールカードから属性情報（名前・メール・役職・部署・電話番号・所在地・在席状況）を取得します"
argument-hint: <名前またはメールアドレス>
---

# Teams ユーザー情報取得スキル

Playwrightを使用してTeams webにアクセスし、指定したユーザーのプロフィールカード情報を取得します。

## 入力

ユーザーの呼び出し: $ARGUMENTS

- メールアドレス形式（例: `john.doe@company.co.jp`）
- 名前形式（例: `甲原` または `甲原春花`）

## 実行手順

### ステップ 1: Playwright の確認・インストール

**実行ディレクトリ**: `/tmp/teams-runner/`

```bash
ls /tmp/teams-runner/node_modules/playwright 2>/dev/null && echo "playwright ready" || echo "playwright missing"
```

未インストールの場合：
```bash
mkdir -p /tmp/teams-runner && cd /tmp/teams-runner && npm init -y && npm install playwright && npx playwright install chromium
```

### ステップ 2: 候補リスト取得スクリプトの生成と実行

まず候補を列挙するスクリプトを実行する。`REPLACE_WITH_QUERY` を実際の引数に置き換えること。

```javascript
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const QUERY = 'REPLACE_WITH_QUERY';
const SESSION_DIR = path.join(os.homedir(), '.claude', 'teams-browser-session');

const browser = await chromium.launchPersistentContext(SESSION_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  args: ['--start-maximized'],
});

const page = await browser.newPage();

await page.goto('https://teams.microsoft.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

const startTime = Date.now();
while ((Date.now() - startTime) < 600000) {
  const url = page.url();
  if (url.includes('teams.microsoft.com/v2') && !url.includes('login')) { console.log('Teams到達: ' + url); break; }
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  if (elapsed % 15 === 0) console.log(`サインイン待機中 (${elapsed}s) ... ${url.substring(0, 80)}`);
  await page.waitForTimeout(2000);
}
await page.waitForTimeout(5000);

await page.keyboard.press('Control+g');
await page.waitForTimeout(2000);

const searchInput = await page.$('[data-tid="AUTOSUGGEST_INPUT"], input[placeholder*="検索"], input[type="search"]');
if (!searchInput) {
  await page.screenshot({ path: '/tmp/teams-debug-screenshot.png' });
  console.log('ERROR: 検索バーが見つかりませんでした');
  console.log('DEBUG_SCREENSHOT:/tmp/teams-debug-screenshot.png');
  await browser.close();
  process.exit(1);
}

await searchInput.click();
await page.waitForTimeout(500);
await searchInput.fill(QUERY);
await page.waitForTimeout(2500);

// orgid を含むユーザーエントリをすべて取得（TOPHITS・PEOPLE 両対応）
const userOptions = await page.$$('[data-tid*="orgid"]');

if (userOptions.length === 0) {
  await page.screenshot({ path: '/tmp/teams-debug-screenshot.png' });
  console.log('ERROR: ユーザーが見つかりませんでした: ' + QUERY);
  console.log('DEBUG_SCREENSHOT:/tmp/teams-debug-screenshot.png');
  await browser.close();
  process.exit(1);
}

const candidates = [];
for (const opt of userOptions) {
  const label = await opt.getAttribute('aria-label') || '';
  if (label) candidates.push(label);
}

console.log('CANDIDATES:' + JSON.stringify(candidates));
await browser.close();
```

### ステップ 3: 候補の確認とユーザー選択

スクリプト実行後、出力の `CANDIDATES:` を解析する。

- **候補が1件のみ** → そのままステップ 4 へ進む
- **候補が複数件** → 以下の形式で候補一覧をユーザーに提示し、**どの方の情報を取得するか質問して待つ**:

```
「[クエリ]」に該当するユーザーが複数見つかりました。どの方の情報を取得しますか？

1. 高橋真由美 (MAYUMI.TAKAHASHI) - 主任技師
2. 高橋慎治 (SHINJI.TAKAHASHI) - 担当課長
3. 高橋紀之 (NORIYUKI.TAKAHASHI) - 主幹技師
...

番号または氏名でお答えください。
```

ユーザーが選択したら、その氏名（フルネーム）でステップ 4 のスクリプトを実行する。

### ステップ 4: プロフィール取得スクリプトの生成と実行

選択されたユーザー名（または最初から1件の場合はそのユーザー名）を `REPLACE_WITH_QUERY` に設定して実行する。

```javascript
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const QUERY = 'REPLACE_WITH_QUERY';
const SESSION_DIR = path.join(os.homedir(), '.claude', 'teams-browser-session');

const browser = await chromium.launchPersistentContext(SESSION_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  args: ['--start-maximized'],
});

const page = await browser.newPage();

await page.goto('https://teams.microsoft.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

const startTime = Date.now();
while ((Date.now() - startTime) < 600000) {
  const url = page.url();
  if (url.includes('teams.microsoft.com/v2') && !url.includes('login')) { console.log('Teams到達: ' + url); break; }
  await page.waitForTimeout(2000);
}
await page.waitForTimeout(5000);

await page.keyboard.press('Control+g');
await page.waitForTimeout(2000);

const searchInput = await page.$('[data-tid="AUTOSUGGEST_INPUT"], input[placeholder*="検索"], input[type="search"]');
await searchInput.click();
await page.waitForTimeout(500);
await searchInput.fill(QUERY);
await page.waitForTimeout(2500);

// orgid を含むユーザーエントリを取得
const userOptions = await page.$$('[data-tid*="orgid"]');
if (userOptions.length === 0) {
  await page.screenshot({ path: '/tmp/teams-debug-screenshot.png' });
  console.log('ERROR: ユーザーが見つかりませんでした: ' + QUERY);
  console.log('DEBUG_SCREENSHOT:/tmp/teams-debug-screenshot.png');
  await browser.close();
  process.exit(1);
}

const userOption = userOptions[0];
const userAriaLabel = await userOption.getAttribute('aria-label') || '';
console.log('選択ユーザー: ' + userAriaLabel);

const nameMatch = userAriaLabel.match(/ユーザー\s+(.+?)\s*[\(（]/);
const titleMatch = userAriaLabel.match(/[\)）]\s*(.+?)(?:、|$)/);
const extractedName = nameMatch ? nameMatch[1].trim() : QUERY;
const extractedTitle = titleMatch ? titleMatch[1].trim() : '';

await userOption.click();
await page.waitForTimeout(4000);

// chat-title-avatar クリックでプロフィールカードを開く
const avatarEl = await page.$('[data-tid="chat-title-avatar"]');
if (avatarEl && await avatarEl.isVisible()) {
  await avatarEl.click();
  await page.waitForTimeout(3000);
} else {
  const emblemEl = await page.$('[data-tid="chat-header-emblem"]');
  if (emblemEl && await emblemEl.isVisible()) { await emblemEl.click(); await page.waitForTimeout(3000); }
}

await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/teams-profile-screenshot.png' });
console.log('PROFILE_SCREENSHOT:/tmp/teams-profile-screenshot.png');

const profileData = await page.evaluate(() => {
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
});

profileData.displayName = extractedName;
if (!profileData.jobTitle && extractedTitle) profileData.jobTitle = extractedTitle;

console.log('PROFILE_DATA:' + JSON.stringify(profileData, null, 2));
await browser.close();
```

### ステップ 5: 結果の報告

1. `PROFILE_DATA:` → JSONをパースしてプロフィール情報を整形して表示
2. `PROFILE_SCREENSHOT:` → Read ツールで画像を読み込み、スクリーンショットの情報も補完する
3. `DEBUG_SCREENSHOT:` → UIの状態を確認してトラブルシューティング
4. `ERROR:` → エラー内容を表示して対処法を提案
5. 一時ファイルを削除する：
   ```bash
   rm -f /tmp/teams-runner/teams-user-op.mjs
   ```

### 最終出力フォーマット

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
| サインインタイムアウト | ブラウザウィンドウでMicrosoft SSOを完了させてください |
| 検索バーが見つからない | `DEBUG_SCREENSHOT` でUI状態を確認。`Control+g` が機能していない可能性あり |
| ユーザーが見つからない | 名前の表記を変えるかメールアドレスで再試行 |
| プロフィールカードが開かない | `chat-title-avatar` の代わりに `chat-header-emblem` を試す |
| セッションが切れた | `rm -rf ~/.claude/teams-browser-session/` で削除して再ログイン |
| Playwright未インストール | `mkdir -p /tmp/teams-runner && cd /tmp/teams-runner && npm init -y && npm install playwright && npx playwright install chromium` |

## 注意事項

- 初回実行時はブラウザが表示され、Microsoft 365へのSSOログインが必要です
- ログインセッションは `~/.claude/teams-browser-session/` に保存されます（機密情報として扱う）
- 取得できる情報はTeamsのプロフィールカードに表示されているものに限られます

think hard
