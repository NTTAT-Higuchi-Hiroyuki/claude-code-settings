#!/usr/bin/env node

import { BoxSkillHandler } from './boxSkillHandler';
import { BoxSkillOptions } from './types';

/**
 * Main entry point for Box skill
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      showHelp();
      process.exit(0);
    }

    // Get access token from environment
    const accessToken = process.env.BOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ エラー: BOX_ACCESS_TOKEN環境変数が設定されていません。');
      console.error('\n設定方法:');
      console.error('  export BOX_ACCESS_TOKEN="your_box_access_token"');
      process.exit(1);
    }

    // Get timeout from environment (optional)
    const timeout = process.env.BOX_TIMEOUT ? parseInt(process.env.BOX_TIMEOUT) * 1000 : undefined;

    const url = args[0];
    const action = (args[1] || 'read') as 'read' | 'update' | 'info';
    const content = args[2];

    // Create options
    const options: BoxSkillOptions = {
      url,
      action,
      content
    };

    // Execute skill
    const handler = new BoxSkillHandler(accessToken, timeout);
    const result = await handler.execute(options);

    if (result.success) {
      console.log('✅', result.message);

      if (action === 'read' && result.data?.content) {
        console.log('\n--- ファイル内容 ---');
        console.log(result.data.content);
        console.log('--- 以上 ---');
      } else if (action === 'info') {
        // Info message already includes formatted output
      }
    } else {
      console.error('❌', result.message);
      if (result.error) {
        console.error('   ', result.error);
      }
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ 予期しないエラーが発生しました:', error.message);
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Box File Access Skill for Claude Code

使用方法:
  box <Box URL> [action] [content]

引数:
  <Box URL>     Boxファイルのurl (必須)
                例: https://app.box.com/file/123456789
                または: https://app.box.com/s/abc123
                または: 123456789 (ファイルIDのみ)

  [action]      実行するアクション (省略可、デフォルト: read)
                - read   : ファイルを読み取る
                - update : ファイルを更新する
                - info   : ファイル情報を表示する

  [content]     更新する内容 (updateアクション時に必須)

環境変数:
  BOX_ACCESS_TOKEN    Box APIアクセストークン (必須)
  BOX_TIMEOUT         タイムアウト秒数 (省略可、デフォルト: 30)

使用例:
  # ファイルを読み取る
  box https://app.box.com/file/123456789

  # ファイル情報を表示
  box https://app.box.com/file/123456789 info

  # ファイルを更新
  box https://app.box.com/file/123456789 update "新しい内容"

  # 共有リンクから読み取る
  box https://app.box.com/s/abc123def456

環境変数の設定:
  export BOX_ACCESS_TOKEN="your_box_access_token"
  export BOX_TIMEOUT="60"
  `);
}

// Run main function
main();
