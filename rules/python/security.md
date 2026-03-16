---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python セキュリティ

> このファイルは [common/security.md](../common/security.md) を Python 固有の内容で拡張します。

## シークレット管理

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # 不在の場合は KeyError を発生
```

## セキュリティスキャン

- 静的セキュリティ分析に **bandit** を使用:
  ```bash
  bandit -r src/
  ```

## 参考

Djangoを使用している場合、Django固有のセキュリティガイドラインはスキル `django-security` を参照。
