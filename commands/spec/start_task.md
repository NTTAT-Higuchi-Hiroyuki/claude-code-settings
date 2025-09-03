---
allowed-tools: Read, Grep, Glob, Write, Bash(git:*), mcp__*
description: Integrate task, requirements and design for comprehensive planning
argument-hint: "optional タスクの焦点もしくは改良の指示"
---

# Start Task Command

Orchestrate a comprehensive planning session by integrating task breakdown, requirements, and technical design documents into an actionable todo list.

## Context

- Task focus: $ARGUMENTS
- 要件定義書: @.tmp/requirements.md
- 設計書: @.tmp/design.md
- テスト設計書: @.tmp/test-design.md
- タスクリスト: @.tmp/tasks.md
- Git status: Attempt to get git status (continue if fails)

## Task
Create a focused planning session for the first non-completed task, integrating requirements and design context:

### Phase 1: ドキュメントの検出

1. Check for existence of tasks.md, requirements.md, and design.md
2. If missing critical files, prompt user to run appropriate commands first:
   - Missing requirements.md → suggest `/spec;requirements_jp [feature description]`
   - Missing design.md → suggest `/spec:design_jp`
   - Missing tasks.md → suggest `/spec:tasks_jp`
   - Missing test-design.md → suggest `/spec:test-design_jp`
3. Read and analyze all available specification documents

### Phase 2: Gitステータスとタスクの状況の確認

1. `git status`で変更されたファイルをリスト
2. `git diff --stat`で変更の統計情報を確認
3. `git diff`で具体的な変更内容を分析
4. **Focus**: Identify the first non-completed task from tasks.md (タスクが存在しない場合はユーザーに通知する)

### Phase 3: Task-Focused Integration

1. **Single Task Focus**: Work only with the first non-completed task found
2. **Requirements Coverage**: Map this specific task to relevant requirements
3. **Design Alignment**: Verify this task aligns with technical design approach
4. **Task Breakdown**: Identify sub-steps needed for this specific task

### Phase 3: Focused Todo List Creation

1. Use TodoWrite tool to create todo list for ONLY the first non-completed task
2. Break down this single task into smaller actionable items based on:
   - Requirements context
   - Technical design constraints
   - Implementation complexity
3. Do NOT create todos for the entire project - focus only on the current task
4. Add any missing implementation steps discovered for this specific task

### Phase 4: Focused Plan Presentation

1. Present focused todo list for the single task showing:
   - Task breakdown with requirement/design context
   - Clear sub-steps for this specific task
   - Implementation approach based on design constraints
2. **User Review Required**: Present task-focused plan and wait for user approval
3. Keep todo list active for tracking progress on this specific task

### Phase 5: Task Completion Tracking

**IMPORTANT**: After the task implementation is complete (when all todo items are marked as completed):
1. **Auto-mark Task Complete**: When all todo items for the current task are completed, automatically mark the corresponding task as complete in .tmp/tasks.md
2. **Update Task Status**: Change the markdown checkbox from `- [ ]` to `- [x]` for the completed task
3. **Task Completion Logic**: 
   - Monitor todo list completion status
   - When all todos for the focused task are marked completed, update tasks.md
   - Find the specific task line in tasks.md and mark it as completed
   - Preserve all task metadata (complexity, priority, dependencies, etc.)
4. **Confirmation**: Inform user that the task has been marked as complete in .tmp/tasks.md

## Quality Gates

- Single task focus is maintained throughout planning
- Current task aligns with requirements and design constraints
- Todo list is actionable with clear sub-steps for the focused task
- Task dependencies are identified and addressed
- Implementation approach is clear and feasible
- Plan provides sufficient detail to begin implementation
- Task completion is automatically tracked in .tmp/tasks.md when all todos are completed
- Task status updates preserve all metadata and formatting in tasks.md