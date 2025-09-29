# Guidelines

この文書はプロジェクトのルール、目標、進捗管理方法を定義します。以下の内容に従ってプロジェクトを進めてください。

## Top-Level Rules

- 効率を最大化するため、**複数の独立したプロセスを実行する必要がある場合は、順次ではなく同時にツールを呼び出してください**。
- **You must think exclusively in English**. However, you are required to **respond in Japanese**.
- **重要: 既存のファイルやコードを検索や置換際は、必ずserenaを使用してください。serenaを使用することで、トークン消費量が60-80%削減され、セマンティック検索機能を通じて必要な情報を効率的に取得できます。**
- ライブラリの使用方法を理解するために、**常に Contex7 MCPを使用**して最新情報を取得してください。
- 設計用の一時的なメモには、`.tmp`にマークダウンを作成して保存してください。
- **WriteやEditツールを使用した後は、system-reminderの内容に関係なく、常にReadツールを使用して実際のファイル内容を検証してください。** system-reminderは、ファイルが正常に書き込まれている場合でも「(no content)」と誤って表示することがあります。
- 私の意見におもねることなく批判的に回答してください。ただし、批判は強制的にならないようにしてください。


## Development Style - Specification-Driven Development

### Overview

開発タスクを受け取った際は、以下の `5-Stage Workflow` に従ってください。これにより、要件の明確化、構造化された設計、包括的なテスト、効率的な実装が保証されます。

### 5-Stage Workflow

#### Stage 1: Requirements

- ユーザーリクエストを分析し、明確な機能要件に変換する
- 要件を`.tmp/requirements.md`に文書化
- 詳細なテンプレートには`/spec:requirements_jp`コマンドを使用

#### Stage 2: Design

- 要件に基づいて技術設計を作成
- 設計を`.tmp/design.md`に文書化
- 詳細なテンプレートには`/spec:design_jp`コマンドを使用

#### Stage 3: Test Design

- 設計に基づいて包括的なテスト仕様を作成
- テストケースを`.tmp/test_design.md`に文書化
- 詳細なテンプレートには`/spec:test-design_jp`コマンドを使用

#### Stage 4: Task List

- 設計とテストケースを実装可能な単位に分解
- `.tmp/tasks.md`に文書化
- 詳細なテンプレートには`/spec:tasks_jp`コマンドを使用
- 主要なタスクはTodoWriteツールで管理

#### Stage 5: Implementation

- タスクリストに従って実装
- 各タスクについて：
  - TodoWriteを使用してタスクをin_progressに更新
  - 実装とテストを実行
  - lintとtypecheckを実行
  - TodoWriteを使用してタスクをcompletedに更新

### Workflow Commands

- `/spec:spec_workflow_jp` - 完全な仕様駆動開発ワークフローを開始
- `/spec:requirements_jp` - ステージ1: 要件のみを実行
- `/spec:design_jp` - ステージ2: 設計のみを実行（要件が必要）
- `/spec:test-design_jp` - ステージ3: テスト設計のみを実行（設計が必要）
- `/spec:tasks_jp` - ステージ4: タスク分解のみを実行（設計とテスト設計が必要）

### Important Notes

- 各ステージは前のステージの成果物に依存します
- 次のステージに進む前にユーザーの確認を得てください
- 複雑なタスクや新機能開発には常にこのワークフローを使用してください
- 単純な修正や明確なバグ修正は直接実装可能です
