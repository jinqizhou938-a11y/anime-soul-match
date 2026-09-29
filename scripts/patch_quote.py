# -*- coding: utf-8 -*-
"""在结果页与分享卡中加入角色经典台词"""
import io, os

ROOT = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match"

def patch(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    for old, new in pairs:
        assert old in s, "NOT FOUND in %s: %s" % (path, old[:60])
        s = s.replace(old, new, 1)
    io.open(path, "w", encoding="utf-8").write(s)
    print("patched:", path)

# 1) skeleton.html：台词样式
sk = os.path.join(ROOT, "site", "skeleton.html")
patch(sk, [(
".char-work{color:var(--indigo);font-size:14px;margin-top:4px;letter-spacing:.06em}",
".char-work{color:var(--indigo);font-size:14px;margin-top:4px;letter-spacing:.06em}\n"
".char-quote{font-family:'Noto Serif SC',serif;color:var(--sakura-deep);font-size:17px;font-weight:600;line-height:1.8;margin-top:16px;padding:12px 22px;border-radius:14px;background:var(--sakura-faint);position:relative;max-width:480px;margin-left:auto;margin-right:auto}\n"
".char-quote::before{content:'\\201C';position:absolute;left:10px;top:2px;font-size:26px;color:rgba(201,122,144,.4);font-family:'Noto Serif SC',serif}\n"
".char-quote::after{content:'\\201D';position:absolute;right:10px;bottom:-4px;font-size:26px;color:rgba(201,122,144,.4);font-family:'Noto Serif SC',serif}"
)])

# 2) app.js：主结果页 hero-card 挂台词
aj = os.path.join(ROOT, "site", "app.js")
patch(aj, [(
"      '<div class=\"char-work\">来自「'+esc(top1.work)+'」</div>' +\n"
"      '<div class=\"char-desc\">'+esc(top1.desc || \"\")+'</div>' +",
"      '<div class=\"char-work\">来自「'+esc(top1.work)+'」</div>' +\n"
"      (top1.quote ? '<div class=\"char-quote\">「'+esc(top1.quote)+'」</div>' : '') +\n"
"      '<div class=\"char-desc\">'+esc(top1.desc || \"\")+'</div>' +"
), (
"  ctx.fillStyle = \"#5B7FA6\"; ctx.font = \"500 32px 'Noto Sans SC',sans-serif\";\n"
"  ctx.fillText(\"来自「\"+top1.work+\"」\", W/2, 700);\n"
"  /* 原型 */\n"
"  ctx.fillStyle = \"#C97A90\"; ctx.font = \"500 26px 'Noto Sans SC',sans-serif\";\n"
"  ctx.fillText(\"人格原型 · \" + top1.role, W/2, 756);",
"  ctx.fillStyle = \"#5B7FA6\"; ctx.font = \"500 32px 'Noto Sans SC',sans-serif\";\n"
"  ctx.fillText(\"来自「\"+top1.work+\"」\", W/2, 700);\n"
"  /* 台词 */\n"
"  if (top1.quote){\n"
"    var q = \"「\" + top1.quote + \"」\";\n"
"    ctx.fillStyle = \"#C97A90\"; ctx.font = \"600 30px 'Noto Serif SC',serif\";\n"
"    var qw = ctx.measureText(q).width;\n"
"    if (qw > W-140){ ctx.font = \"600 24px 'Noto Serif SC',serif\"; qw = ctx.measureText(q).width; }\n"
"    ctx.fillText(q, W/2, 742);\n"
"    ctx.strokeStyle = \"rgba(201,122,144,.3)\"; ctx.lineWidth = 2;\n"
"    ctx.beginPath(); ctx.moveTo(W/2-Math.min(qw,360)/2-20, 776); ctx.lineTo(W/2+Math.min(qw,360)/2+20, 776); ctx.stroke();\n"
"  }\n"
"  /* 原型 */\n"
"  ctx.fillStyle = \"#C97A90\"; ctx.font = \"500 26px 'Noto Sans SC',sans-serif\";\n"
"  ctx.fillText(\"人格原型 · \" + top1.role, W/2, 816);"
)])

print("done")
