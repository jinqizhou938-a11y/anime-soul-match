# -*- coding: utf-8 -*-
"""生成临时测试页（gender/quiz/result），注入 hash 跳转，供 shot.py 验证各视图渲染"""
import os, shutil

SRC = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match\动漫灵魂鉴定.html"
DST = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match\_shots"
html = open(SRC, encoding="utf-8").read()

def make(name, inject):
    out = html.replace("</body>", inject + "</body>")
    p = os.path.join(DST, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(out)
    print("made:", p)

make("t_gender.html", '<script>location.hash="#/gender";</script>')
make("t_quiz.html", '<script>location.hash="#/quiz";</script>')
answers = {str(i):"A" for i in range(1,19)}
answers_js = "{" + ",".join(["%s:'A'" % i for i in range(1,19)]) + "}"
make("t_result.html", '<script>S={gender:"\u7537",answers:' + answers_js + ',qi:17};location.hash="#/result";</script>')
