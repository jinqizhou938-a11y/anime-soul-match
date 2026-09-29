# -*- coding: utf-8 -*-
"""解析 questions.md -> questions.json（18 题，含选项 delta）"""
import json, re, os

SRC = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\artifacts\questions.md"
OUT = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match\assets\questions.json"

questions = []
cur = None
for line in open(SRC, encoding="utf-8"):
    line = line.strip()
    m = re.match(r"### Q(\d+)", line)
    if m:
        # 主题/风格从行内 ｜ 分隔提取
        parts = [p.strip() for p in line.split("｜")]
        theme = parts[1] if len(parts) > 1 else ""
        style = parts[2] if len(parts) > 2 else ""
        cur = {"id": int(m.group(1)), "theme": theme, "style": style, "text": "", "options": []}
        questions.append(cur)
        continue
    if cur is None:
        continue
    m2 = re.match(r"\*\*「(.+?)」\*\*", line)
    if m2 and not cur["text"]:
        cur["text"] = m2.group(1)
        continue
    if line.startswith("- "):
        body = line[2:]
        mo = re.match(r"([A-E])[\.、]\s*(.+?)\s*\{([^}]+)\}$", body)
        if mo:
            key, text, delta_s = mo.group(1), mo.group(2), mo.group(3)
            delta = {}
            for dv in delta_s.split(","):
                dm = re.match(r"([D\d]+)\s*[:：]\s*([+-]?\d+)", dv.strip())
                if dm:
                    delta[dm.group(1)] = int(dm.group(2))
            cur["options"].append({"key": key, "text": text, "delta": delta})

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=1)

print("questions:", len(questions))
for q in questions:
    print(q["id"], q["theme"], q["style"], len(q["options"]), "opts |", q["text"][:26])
