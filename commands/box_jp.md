---
allowed-tools: Bash, Read, Write
description: "BoxのURLにブラウザ経由でアクセスし、ファイルの取得・更新を行います（Box API・コネクタ不要）"
---

# Box ブラウザ操作スキル

Playwrightを使用してブラウザ経由でBoxにアクセスし、ファイルの取得・更新を行います。
Box APIやコネクタなしで動作します。

## 対応操作

- **fetch**: BoxのURLからファイルをダウンロード
- **upload**: Boxのフォルダにローカルファイルをアップロード
- **list**: Boxのフォルダ内のファイル一覧を取得

## 実行手順

### ステップ 1: 入力の解析

ユーザーの入力から操作タイプとパラメータを解析する：

```
/box fetch <BoxのURL> [保存先パス]
/box upload <BoxフォルダのURL> <ローカルファイルパス>
/box list <BoxフォルダのURL>
```

BoxのURLの種類を判定する：
- `https://app.box.com/file/...` → ファイルURL（fetch向け）
- `https://app.box.com/folder/...` → フォルダURL（upload/list向け）
- `https://*.app.box.com/s/...` → 共有リンク（fetch/list向け）
- `https://[企業名].app.box.com/...` → 企業アカウントURL

保存先パスが省略された場合は `~/Downloads/` をデフォルトとする。

### ステップ 2: Playwright の確認・インストール

**実行ディレクトリ**: `/tmp/box-runner/`（ローカルインストール）

```bash
# 確認
ls /tmp/box-runner/node_modules/playwright 2>/dev/null && echo "playwright ready" || echo "playwright missing"
```

未インストールの場合：
```bash
mkdir -p /tmp/box-runner && cd /tmp/box-runner && npm init -y && npm install playwright
npx playwright install chromium
```

### ステップ 3: Box セッションの管理

**セッションプロファイルディレクトリ**: `~/.claude/box-browser-session/`

このディレクトリにBoxのログインセッションを永続化する。

```bash
ls ~/.claude/box-browser-session/ 2>/dev/null && echo "session exists" || echo "no session"
```

セッションがない場合でも初回ログインが必要。`headless: false` でブラウザを起動し、
Microsoft ADFS (SSO) 含むリダイレクトチェーンが完了してBoxページに到達するまで待機する。

**重要**: `waitForURL` ではなくポーリングループで `nttat.app.box.com` への到達を確認すること。
Microsoft の「サインインの状態を維持しますか？」ダイアログ（`#idSIButton9`）は自動クリックする。

### ステップ 4: 操作スクリプトの生成と実行

スクリプトを `/tmp/box-runner/box-playwright-op.mjs` に生成してから実行する。
実行後は一時ファイルを削除する。

#### fetch（ファイルダウンロード）のスクリプト例

```javascript
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';
import fs from 'fs';

const BOX_URL = 'REPLACE_WITH_URL';
const SAVE_DIR = path.resolve('REPLACE_WITH_SAVE_DIR'.replace('~', os.homedir()));
const SESSION_DIR = path.join(os.homedir(), '.claude', 'box-browser-session');

fs.mkdirSync(SESSION_DIR, { recursive: true });
fs.mkdirSync(SAVE_DIR, { recursive: true });

// BoxのURLかどうかを判定（企業ドメインに合わせて調整）
const isBoxPage = (url) => {
  const u = url.toString();
  return u.includes('.app.box.com') && !u.includes('/login') && !u.includes('/sso');
};

const browser = await chromium.launchPersistentContext(SESSION_DIR, {
  headless: false,
  acceptDownloads: true,
  downloadsPath: SAVE_DIR,
  args: ['--start-maximized'],
});

const page = await browser.newPage();

console.log('BoxファイルURLにアクセス中...');
console.log('');
console.log('===========================================');
console.log('  ブラウザウィンドウでSSOログインをしてください');
console.log('  BoxのページにたどりついたらClaudeが自動処理します');
console.log('  （最大5分間待機します）');
console.log('===========================================');
console.log('');

await page.goto(BOX_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);

// Boxページに到達するまでポーリング（Microsoft ADFS SSOに対応）
let reached = false;
const startTime = Date.now();
const TIMEOUT = 300000; // 5分

while (!reached && (Date.now() - startTime) < TIMEOUT) {
  const currentUrl = page.url();

  // Microsoft「サインインを維持」ダイアログを自動クリック
  try {
    const yesBtn = await page.$('#idSIButton9, input[value="はい"], input[value="Yes"]');
    if (yesBtn) {
      console.log('Microsoft「サインイン維持」ダイアログを自動承認...');
      await yesBtn.click();
      await page.waitForTimeout(3000);
      continue;
    }
  } catch (e) { /* 無視 */ }

  if (isBoxPage(currentUrl)) {
    reached = true;
    console.log('Boxページに到達: ' + currentUrl);
  } else {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    if (elapsed % 10 === 0) {
      console.log(`待機中 (${elapsed}秒経過) ... ${currentUrl.substring(0, 80)}`);
    }
    await page.waitForTimeout(1000);
  }
}

if (!reached) {
  const screenshotPath = '/tmp/box-debug-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('ERROR: 5分経過してもBoxページに到達できませんでした');
  console.log('DEBUG_SCREENSHOT:' + screenshotPath);
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(3000);
console.log('ダウンロードボタンを探します...');

let downloaded = false;

// 方法1: data-testid="download-item"
const downloadBtn1 = await page.$('[data-testid="download-item"]');
if (downloadBtn1) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60000 }),
    downloadBtn1.click(),
  ]);
  const savePath = path.join(SAVE_DIR, download.suggestedFilename());
  await download.saveAs(savePath);
  console.log('SUCCESS:' + savePath);
  downloaded = true;
}

// 方法2: aria-label="Download" ボタン
if (!downloaded) {
  const downloadBtn2 = await page.$('button[aria-label*="ダウンロード"], button[aria-label*="Download"]');
  if (downloadBtn2) {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      downloadBtn2.click(),
    ]);
    const savePath = path.join(SAVE_DIR, download.suggestedFilename());
    await download.saveAs(savePath);
    console.log('SUCCESS:' + savePath);
    downloaded = true;
  }
}

// 方法3: 省略メニュー（...）からダウンロード
if (!downloaded) {
  const moreMenu = await page.$('[aria-label="More options"], [aria-label="その他のオプション"], [data-testid="more-options"]');
  if (moreMenu) {
    await moreMenu.click();
    await page.waitForTimeout(1000);
    const dlOption = await page.$('text="Download"') || await page.$('text="ダウンロード"');
    if (dlOption) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        dlOption.click(),
      ]);
      const savePath = path.join(SAVE_DIR, download.suggestedFilename());
      await download.saveAs(savePath);
      console.log('SUCCESS:' + savePath);
      downloaded = true;
    }
  }
}

if (!downloaded) {
  const screenshotPath = '/tmp/box-debug-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const buttons = await page.$$eval('button, [role="button"], a[href]', els =>
    els.slice(0, 30).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim()?.slice(0, 50),
      ariaLabel: el.getAttribute('aria-label'),
      dataTestId: el.getAttribute('data-testid'),
    }))
  );
  console.log('DEBUG_SCREENSHOT:' + screenshotPath);
  console.log('DEBUG_BUTTONS:' + JSON.stringify(buttons, null, 2));
  console.log('ERROR: ダウンロードボタンが見つかりませんでした');
}

await browser.close();
```

#### upload（ファイルアップロード）のスクリプト例

```javascript
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';
import fs from 'fs';

const FOLDER_URL = 'REPLACE_WITH_FOLDER_URL';
const LOCAL_FILE = path.resolve('REPLACE_WITH_LOCAL_FILE'.replace('~', os.homedir()));
const SESSION_DIR = path.join(os.homedir(), '.claude', 'box-browser-session');

if (!fs.existsSync(LOCAL_FILE)) {
  console.log('ERROR: ファイルが存在しません: ' + LOCAL_FILE);
  process.exit(1);
}

fs.mkdirSync(SESSION_DIR, { recursive: true });

const browser = await chromium.launchPersistentContext(SESSION_DIR, {
  headless: false,
  args: ['--start-maximized'],
});

const page = await browser.newPage();

// ログイン状態を確認
await page.goto('https://app.box.com', { waitUntil: 'networkidle', timeout: 30000 });
if (page.url().includes('login') || page.url().includes('account/login')) {
  console.log('Boxにログインしてください。ログイン完了後、自動的に処理を続行します...');
  await page.waitForURL(url => !url.includes('login'), { timeout: 120000 });
  console.log('ログイン完了');
}

// フォルダURLへ移動
await page.goto(FOLDER_URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// アップロードボタンを探す（方法1: Uploadボタン直接クリック）
const uploadBtn = await page.$('button[data-testid="upload-button"], [aria-label*="Upload"], [aria-label*="アップロード"]');
if (uploadBtn) {
  await uploadBtn.click();
  await page.waitForTimeout(1000);
  // ファイル入力要素を探す
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(LOCAL_FILE);
    await page.waitForTimeout(5000); // アップロード完了を待機
    console.log('SUCCESS: アップロード完了 - ' + path.basename(LOCAL_FILE));
  }
} else {
  // 方法2: ドロップゾーンへのファイルドロップ
  console.log('アップロードボタンが見つかりません。手動でアップロードしてください。');
}

await browser.close();
```

#### list（フォルダ一覧）のスクリプト例

```javascript
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const FOLDER_URL = 'REPLACE_WITH_FOLDER_URL';
const SESSION_DIR = path.join(os.homedir(), '.claude', 'box-browser-session');

const browser = await chromium.launchPersistentContext(SESSION_DIR, {
  headless: true,
  args: ['--start-maximized'],
});

const page = await browser.newPage();

await page.goto(FOLDER_URL, { waitUntil: 'networkidle', timeout: 30000 });

// ログインチェック
if (page.url().includes('login')) {
  console.log('ERROR: ログインが必要です。先に /box fetch または /box upload でログインしてください。');
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(2000);

// ファイル名を取得
const items = await page.$$eval(
  '[data-testid="file-name"], .item-name, [role="gridcell"] a',
  els => els.map(el => el.textContent?.trim()).filter(Boolean)
);

if (items.length === 0) {
  console.log('EMPTY: フォルダが空またはアイテムを取得できませんでした');
} else {
  console.log('FILES:' + JSON.stringify(items));
}

await browser.close();
```

### ステップ 5: 実行と結果の報告

1. スクリプトを `/tmp/box-runner/box-playwright-op.mjs` に書き出す
2. Bashで実行する（`/tmp/box-runner/` ディレクトリから）：
   ```bash
   cd /tmp/box-runner && node box-playwright-op.mjs 2>&1
   ```
3. 出力を解析してユーザーに結果を報告する：
   - `SUCCESS:` で始まる行 → 成功メッセージとファイルパスを表示
   - `ERROR:` で始まる行 → エラー内容を表示してトラブルシューティングを提案
   - `FILES:` で始まる行 → JSONパースしてファイル一覧を表示
   - `DEBUG_SCREENSHOT:` で始まる行 → Read ツールで画像を確認してUIを調査
4. 一時ファイルを削除する：
   ```bash
   rm -f /tmp/box-runner/box-playwright-op.mjs
   ```

### トラブルシューティング

| 問題 | 対処方法 |
|------|----------|
| タイムアウト（5分経過） | ブラウザ上でSSOを完了させてください。`DEBUG_SCREENSHOT` で状態を確認 |
| ダウンロードボタンが見つからない | `DEBUG_SCREENSHOT` を Read ツールで確認しUIを調査。`DEBUG_BUTTONS` でセレクタを特定 |
| アップロードが完了しない | ファイルサイズが大きい場合は `waitForTimeout` を延長（例: 30000ms） |
| セッションが切れた | `rm -rf ~/.claude/box-browser-session/` で削除して再ログイン |
| Playwright未インストール | `mkdir -p /tmp/box-runner && cd /tmp/box-runner && npm init -y && npm install playwright` |
| Microsoft ADFS無限ループ | `isBoxPage` の判定ドメインを企業URLに合わせて修正（例: `nttat.app.box.com`） |

## 注意事項

- 初回実行時はブラウザが表示され、Boxへのログインが必要です
- ログイン情報は `~/.claude/box-browser-session/` に保存されます（機密情報として扱う）
- 企業のSSO認証の場合、ブラウザ上での手動操作が必要になる場合があります
- Box の利用規約に準拠した範囲でご利用ください

think hard
