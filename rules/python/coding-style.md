---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Python 固有の内容で拡張します。

## 標準

- **PEP 8** の規約に従う
- すべての関数シグネチャに**型アノテーション**を使用

## イミュータビリティ

イミュータブルなデータ構造を優先:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## フォーマット

- コードフォーマットに **ruff** を使用
- リンティングに **ruff** を使用

## 参考

包括的なPythonのイディオムとパターンについては、スキル `python-patterns` を参照。
