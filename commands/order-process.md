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
  - Bash
  - Bash(rm /tmp/order_fields.json)
  - Bash(python3:*)
  - Bash(cp:*)
  - Bash(cat:*)
  - Bash(textutil:*)
  - Bash(node:*)
  - Read
  - Write
  - Edit
---

# 発注処理自動化

仕様書（Word）と見積書（PDF）のBox URLを入力として受け取り、ファイルをダウンロードして、
契約依頼チェックリストと契約依頼連絡シートのExcelファイルを自動生成します。

## テンプレートファイル（Box）

| ファイル名 | Box URL |
|-----------|---------|
| 契約依頼連絡シート（新規契約用）.xlsx | https://nttat.app.box.com/file/2167139622855 |
| 契約依頼チェックリスト（新規契約用）.xlsx | https://nttat.app.box.com/file/2167139634855 |

---

## 実行手順

### Step 0: テンプレートの取得（Box）

テンプレートを `発注処理/templates/` にダウンロードする。
既にファイルが存在する場合はスキップしてよい。

```bash
ls 発注処理/templates/*.xlsx 2>/dev/null && echo "templates exist" || echo "need download"
```

**ファイルが存在しない場合**、以下の手順でBoxからダウンロードする：

1. `list_pages` でChromeページを確認し、Box (`nttat.app.box.com`) が開いていればそのpage_idを使用、なければ `new_page` で新規タブを開く

2. 2ファイルを順番に `navigate_page` → `evaluate_script` でダウンロードする：

   **ファイル①: 契約依頼連絡シート（新規契約用）.xlsx**
   - URL: `https://nttat.app.box.com/file/2167139622855`
   - ナビゲート後、以下のスクリプトでダウンロードボタンをクリックする：
   ```javascript
   () => {
     const selectors = [
       '[data-testid="download-item"]',
       'button[aria-label*="ダウンロード"]',
       'button[aria-label*="Download"]',
       '[data-resin-target="download"]'
     ];
     for (const sel of selectors) {
       const el = document.querySelector(sel);
       if (el) { el.click(); return { clicked: sel }; }
     }
     return { clicked: null };
   }
   ```

   **ファイル②: 契約依頼チェックリスト（新規契約用）.xlsx**
   - URL: `https://nttat.app.box.com/file/2167139634855`
   - 同様にダウンロードボタンをクリックする

3. ダウンロード完了後、`発注処理/templates/` に移動する：
   ```bash
   mkdir -p 発注処理/templates
   mv ~/Downloads/"契約依頼連絡シート（新規契約用）.xlsx" 発注処理/templates/
   mv ~/Downloads/"契約依頼チェックリスト（新規契約用）.xlsx" 発注処理/templates/
   ls -lh 発注処理/templates/
   ```

4. **Boxログインが必要な場合:** `take_screenshot` でログイン画面を確認し、ユーザーに手動ログインを依頼してから再試行する

---

### Step 1: 入力ファイルのBox URLを確認

以下の2つのBox URLをユーザーに確認してください：

1. **発注仕様書のURL**（Wordファイル .docx）
2. **見積書のURL**（PDFファイル .pdf）

URLが $ARGUMENTS に含まれている場合はそれを使用する。
含まれていない場合は、ユーザーに質問して入力を待つ：

```
以下のBox URLを教えてください：
1. 発注仕様書（Word）のURL:
2. 見積書（PDF）のURL:
```

---

### Step 2: 入力ファイルのダウンロード（Box）

取得したURLをもとに、2ファイルを順番にBoxからダウンロードする。

```bash
mkdir -p 発注処理/input
```

1. `list_pages` でChromeページを確認し、Box (`nttat.app.box.com`) が開いていればそのpage_idを使用、なければ `new_page` で新規タブを開く

2. **仕様書（Word）のダウンロード**
   - Step 1 で受け取ったURL に `navigate_page` でアクセス
   - `take_screenshot` でページ状態を確認（ログイン画面の場合はユーザーに手動ログインを依頼）
   - 以下のスクリプトでダウンロードボタンをクリックする：
   ```javascript
   () => {
     const selectors = [
       '[data-testid="download-item"]',
       'button[aria-label*="ダウンロード"]',
       'button[aria-label*="Download"]',
       '[data-resin-target="download"]'
     ];
     for (const sel of selectors) {
       const el = document.querySelector(sel);
       if (el) { el.click(); return { clicked: sel }; }
     }
     return { clicked: null };
   }
   ```

3. **見積書（PDF）のダウンロード**
   - Step 1 で受け取ったURL に `navigate_page` でアクセス
   - 同様にダウンロードボタンをクリックする

4. ダウンロード完了後、`発注処理/input/` に移動する：
   ```bash
   # ダウンロードされた最新の .docx と .pdf を input/ に移動
   DOCX=$(ls -t ~/Downloads/*.docx 2>/dev/null | head -1)
   PDF=$(ls -t ~/Downloads/*.pdf 2>/dev/null | head -1)
   [ -n "$DOCX" ] && mv "$DOCX" 発注処理/input/
   [ -n "$PDF" ] && mv "$PDF" 発注処理/input/
   ls -lh 発注処理/input/
   ```

---

### Step 3: ファイル確認・テキスト抽出

入力ディレクトリのファイルを確認し、テキストを抽出してください。

```bash
python3 発注処理/scripts/extract_text.py 発注処理/input
```

### Step 4: 情報の分析と整理

抽出したテキストから以下の情報を読み取り、整理してください。

**仕様書（Word）から読み取る情報：**
- 契約件名
- 契約区分（委任/請負 → 冒頭の「[標準様式] 委任」などで判断）
- 契約期間（開始日・終了日）
- 業務実施場所（AT社内・委託先事業所・在宅の組み合わせ）
- 実施責任者（所属・氏名・電話）

**PDF見積書から読み取る情報：**
- 契約先名（発行元の会社名）
- 見積金額（税抜）
- 見積番号

### Step 5: SharePointからの情報自動取得

SharePointから以下の2つの情報を自動取得する。
Step 4 で特定した **契約先名** を使って各ファイルを検索する。

#### Step 5-A: 基本契約の確認

**① SharePoint で「基本契約一覧」を検索・ダウンロード**

1. `list_pages` で SharePoint (`sharepoint.com`) ページを確認し、なければ `new_page` で新規タブを開く
2. 以下のURLに `navigate_page` でアクセスする（キーワードはURLエンコード済み）：
   ```
   https://nttadvancedtechnology.sharepoint.com/sites/portal/_layouts/15/search.aspx?q=%E5%9F%BA%E6%9C%AC%E5%A5%91%E7%B4%84%E4%B8%80%E8%A6%A7
   ```
3. `take_screenshot` でページを確認し、ログインが必要ならユーザーに案内する
4. `evaluate_script` で検索結果の最初のファイルURLとGUIDを取得する：
   ```javascript
   () => {
     const allLinks = Array.from(document.querySelectorAll('a[href*="sharepoint.com"]'));
     const fileLinks = allLinks.filter(a => {
       const href = a.href;
       return href.includes('/sites/') && (href.includes('viewer.aspx') || href.includes('Doc.aspx') || href.includes('sourcedoc='));
     });
     return fileLinks.slice(0, 3).map(a => ({ title: a.textContent.trim(), href: a.href }));
   }
   ```
5. 取得したURLから `sourcedoc` パラメータのGUIDを抽出し、REST APIでダウンロードする：
   ```
   https://nttadvancedtechnology.sharepoint.com/sites/<サイト名>/_api/web/GetFileById('<GUID>')/$value
   ```
6. ダウンロード後、Bashでリネームして `発注処理/tmp/` に保存する：
   ```bash
   mkdir -p 発注処理/tmp
   # ファイル名はURLのパスや検索結果タイトルから判断する（例: 基本契約一覧.xlsx）
   mv /Users/higu/Downloads/\$value "発注処理/tmp/基本契約一覧.xlsx" 2>/dev/null || true
   ls 発注処理/tmp/
   ```

**② Excelから契約先名を検索**

```python
import openpyxl, sys

wb = openpyxl.load_workbook('発注処理/tmp/基本契約一覧.xlsx', data_only=True)
company = sys.argv[1]  # 契約先名
results = []
for ws in wb.worksheets:
    for row in ws.iter_rows(values_only=True):
        row_text = ' '.join(str(c) for c in row if c)
        if company in row_text:
            results.append(row)
print(results[:3])
```

```bash
python3 -c "
import openpyxl
wb = openpyxl.load_workbook('発注処理/tmp/基本契約一覧.xlsx', data_only=True)
company = '契約先名をここに入れる'
for ws in wb.worksheets:
    for row in ws.iter_rows(values_only=True):
        row_text = ' '.join(str(c) for c in row if c is not None)
        if company in row_text:
            print(row)
"
```

- **見つかった場合**: `基本契約_選択 = "有"` とし、`基本契約_コメント` に契約書名と締結日を設定する
- **見つからない場合**: `基本契約_選択 = "無"` とする

---

#### Step 5-B: 電子契約の確認

**① CECTRUST-LIGHT発注取引先一覧 を検索**

1. 以下のURLに `navigate_page` でアクセスする：
   ```
   https://nttadvancedtechnology.sharepoint.com/sites/portal/_layouts/15/search.aspx?q=CECTRUST-LIGHT%E7%99%BA%E6%B3%A8%E5%8F%96%E5%BC%95%E5%85%88%E4%B8%80%E8%A6%A7
   ```
2. Step 5-A と同じ手順で最新ファイルをダウンロードし、`発注処理/tmp/CECTRUST取引先一覧.xlsx` として保存する
3. Excelから契約先名を検索する（Step 5-A の Python コードと同様）

**② DocuSign利用可能な発注先一覧 を検索（①で見つからない場合のみ）**

1. 以下のURLに `navigate_page` でアクセスする：
   ```
   https://nttadvancedtechnology.sharepoint.com/sites/portal/_layouts/15/search.aspx?q=DocuSign%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA%E7%99%BA%E6%B3%A8%E5%85%88%E4%B8%80%E8%A6%A7
   ```
2. 同じ手順でダウンロードし、`発注処理/tmp/DocuSign発注先一覧.xlsx` として保存する
3. 契約先名を検索する

**③ 判定**

- **①または②で見つかった場合**: `電子契約_選択 = "有：DocuSign→契約締結日・請書日付で発注先要望がある場合は右欄に記入"` とし、ファイルに記載された締結日要望などがあれば `電子契約_コメント` に設定する
- **両者で見つからない場合**: `電子契約_選択 = "無"` とし、`電子契約_コメント = ""` とする

---

### Step 6: ユーザーへの確認

以下の情報をユーザーに確認してください（ドキュメントから判断できないもの）：

1. **作成者名**（あなた自身の氏名・略称・メールアドレスいずれでも可）
2. **取適法の業務区分**：以下から選んでください
   - 2-1：システム構築・開発（支援）
   - 2-2：システム運用・保守
   - 3-1：調査・分析・企画
   - その他
3. **相見積の有無**（複数社から見積を取っているか）

※ 基本契約・電子契約はStep 5で自動取得済み。ただし取得結果をユーザーに提示し、内容の確認を求めること。

#### Step 6-A: Teamsでフルネームを自動取得

ユーザーから作成者名の入力を受け取ったら、`/teams-user_jp` スキルを使ってフルネームを取得する。

1. Teams で入力値を検索し、プロフィールカードから **表示名**（フルネーム）を取得する
2. 候補が複数ある場合はユーザーに確認して選択してもらう
3. 取得した表示名を `作成者名` としてJSONに設定する

> Teams から取得できない場合はユーザーが入力した値をそのまま使用する。

### Step 7: 連絡シートの選択肢判断

業務実施場所の情報をもとに、以下の特約を判断してください：

**情報管理の徹底及び環境保護に関する取り扱いの特約：**
- AT社内常駐あり → `有：仕様書にAT社内で作業することが記載されている（社内常駐する）`
- AT社内だが常駐しない → `無：仕様書にAT社内で作業することが記載されているが不要（常駐しない）`
- AT社内作業なし → `無：AT社内で作業は行わない`

**情報管理徹底の特約：**
- 客先常駐あり → `有：仕様書に客先で作業することが記載されている（客先常駐する）`
- 客先作業なし → `無：客先で作業は行わない`

**在宅勤務に関する取り扱いの特約：**
- 在宅勤務あり（セキュアドPC貸与） → `有：セキュアドPC[VDI]（AT社）貸与での在宅勤務をする（仕様書に記載有）`
- 在宅勤務なし → `無：特約添付不要`

### Step 8: JSON生成と確認

収集した情報をもとに以下のJSON構造を作成し、ユーザーに内容を提示して確認を求めてください。

```json
{
  "meta": {
    "作成年月日": "YYYY-MM-DD",
    "作成者名": "氏名"
  },
  "contract": {
    "契約件名": "...",
    "契約先名": "...",
    "契約区分": "委任契約",
    "契約期間_開始": "YYYY-MM-DD",
    "契約期間_終了": "YYYY-MM-DD",
    "見積金額_税抜": 0
  },
  "checklist": {
    "相見積": false,
    "契約書案_添付": false
  },
  "contact_sheet": {
    "契約件名_選択": "指定有→右欄に記入",
    "契約件名_コメント": "（契約件名）",
    "取適法判断_選択": "取適法対象",
    "取適法判断_コメント": "2-1：システム構築・開発（支援）",
    "建業法対象_選択": "対象外",
    "基本契約_選択": "無",
    "基本契約_コメント": "",
    "お客様情報保護特約_選択": "無",
    "情報管理環境保護特約_選択": "無：AT社内で作業は行わない",
    "情報管理徹底特約_選択": "無：客先で作業は行わない",
    "在宅勤務特約_選択": "無：特約添付不要",
    "サプライチェーン_選択": "有（遵守）",
    "その他特約_選択": "無",
    "交通費精算_選択": "無",
    "単金精算_選択": "無",
    "電子契約_選択": "有：DocuSign→契約締結日・請書日付で発注先要望がある場合は右欄に記入",
    "電子契約_コメント": "",
    "発注先名義人_コメント": "住所：\n部署名：\n役職：\n氏名：",
    "三条書面_選択": "発出予定なし",
    "再委託_選択": "無"
  }
}
```

### Step 9: Excel生成

ユーザーの確認が取れたら、JSONをファイルに保存してスクリプトを実行してください。

```bash
# JSONをtemp fileに書き出し
cat > /tmp/order_fields.json << 'JSON_EOF'
（Step 8 で作成したJSONをここに貼る）
JSON_EOF

# Excelファイルを生成（Step 0 でダウンロードしたテンプレートを使用）
python3 発注処理/scripts/fill_excel.py /tmp/order_fields.json 発注処理/output \
  --template-dir 発注処理/templates

# 一時ファイルを削除
rm /tmp/order_fields.json
```

### Step 10: 完了報告

生成されたファイルを確認し、ユーザーに以下を報告してください：
- 生成したファイルの一覧とパス
- 自動入力した主要項目のサマリー
- 手動確認が必要な項目（取適法の詳細判断など）
