# -*- coding: utf-8 -*-
"""删除系统分享，只保留分享图 + 结果链接"""
import io

PATH = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match\site\app.js"
s = io.open(PATH, encoding="utf-8").read()

# 1) 删除 share-actions 中的 nativeShare 按钮
old_btn = """      '<button class="btn small ghost" onclick="copyLink()">'+ic("link")+' 复制结果链接</button>' +
      (navigator.canShare && navigator.canShare({files:[new File(["x"],"x.txt")]}) ? '<button class="btn small ghost" onclick="nativeShare()">'+ic("share")+' 系统分享</button>' : '') +
    '</div>' +"""
new_btn = """      '<button class="btn small ghost" onclick="copyLink()">'+ic("link")+' 复制结果链接</button>' +
    '</div>' +"""
assert old_btn in s, "btn block not found"
s = s.replace(old_btn, new_btn, 1)

# 2) 删除 nativeShare 函数
old_fn = """function nativeShare(){
  shareCardBlob(function(blob, top1, p1){
    var file = new File([blob], "灵魂鉴定-" + top1.name + "-" + p1 + "%.png", { type:"image/png" });
    navigator.share({ files:[file], title:"灵魂鉴定所", text:"我的人生里，住着「"+top1.name+"」这个灵魂——共鸣度 "+p1+"%。" })
      .catch(function(e){ toast("系统分享不可用，已改为复制链接"); copyLink(); });
  });
}

"""
assert old_fn in s, "nativeShare fn not found"
s = s.replace(old_fn, "", 1)

io.open(PATH, "w", encoding="utf-8").write(s)
print("ok, nativeShare removed")
