# -*- coding: utf-8 -*-
"""构建最终单文件 HTML：skeleton + roles/questions 数据 + app.js"""
import json, os

ROOT = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match"
SKELETON = os.path.join(ROOT, "site", "skeleton.html")
APPJS = os.path.join(ROOT, "site", "app.js")
ROLES = os.path.join(ROOT, "assets", "roles.json")
QUESTIONS = os.path.join(ROOT, "assets", "questions.json")
OUT = os.path.join(ROOT, "动漫灵魂鉴定.html")

html = open(SKELETON, encoding="utf-8").read()
roles = open(ROLES, encoding="utf-8").read()
questions = open(QUESTIONS, encoding="utf-8").read()
appjs = open(APPJS, encoding="utf-8").read()

data_block = "window.__ROLES__ = " + roles + ";\nwindow.__QUESTIONS__ = " + questions + ";"
assert "/*__DATA__*/" in html, "data placeholder missing"
assert "/*__APPJS__*/" in html, "appjs placeholder missing"
html = html.replace("/*__DATA__*/", data_block).replace("/*__APPJS__*/", appjs)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

print("built:", OUT)
print("size:", os.path.getsize(OUT), "bytes")
