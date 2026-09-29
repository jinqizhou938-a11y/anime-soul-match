/* 灵魂鉴定所 · 动漫人格匹配 — 应用逻辑 */
'use strict';

/* ===== 数据 ===== */
var ROLES = window.__ROLES__ || [];
var QUESTIONS = window.__QUESTIONS__ || [];

/* 14 维展示名（设计文档 §四 风格） */
var DIMS = [
  "梦与地的距离", "冷静与远见", "为谁燃烧", "羁绊之深", "热血外放",
  "心中秤砣", "反叛之骨", "面对终焉", "爱的方式", "努力的执念",
  "胜负之心", "审美之眼", "温柔与锋利", "幽默与玩世"
];

/* 原型主题色 */
var ARCH_COLORS = {
  "热血梦想家":"#E8877B","冷静谋士":"#5B7FA6","温柔治愈者":"#8FB98A","孤高强者":"#7D8CAA",
  "元气笨蛋":"#E4B45E","傲娇":"#C97A90","无口冷面":"#8B9BB5","玩世不恭":"#B0A48F",
  "大和抚子·温柔大姐姐":"#D89BB4","战斗少女·女战士":"#C77D6E","病娇偏执":"#A65878",
  "枭雄反派":"#5E5470","殉道理想家":"#6E7FB0","沉默守护者":"#78909C","敏感纤细":"#B49AC9"
};
function archColor(r){ return ARCH_COLORS[r] || "#C97A90"; }

/* 原型说明 */
var ARCH_DESC = {
  "热血梦想家":"把一生押在热望上的人",
  "冷静谋士":"以棋局之心看待世界",
  "温柔治愈者":"用善意接住每一次坠落",
  "孤高强者":"站在自己的峰顶，不问来路",
  "元气笨蛋":"笑着奔跑，世界也会跟着笑",
  "傲娇":"嘴硬心软，别扭地在意着",
  "无口冷面":"话不多，但做得多",
  "玩世不恭":"把认真藏进玩笑里",
  "大和抚子·温柔大姐姐":"如水温柔，亦如山可靠",
  "战斗少女·女战士":"为守护而战，燃而不熄",
  "病娇偏执":"爱到极致，便是深渊",
  "枭雄反派":"为了目的，不惜改写规则",
  "殉道理想家":"以身为薪，照亮前路",
  "沉默守护者":"在你身后，安静地撑着伞",
  "敏感纤细":"把世界的重量都装进心里"
};

/* ===== 状态与路由 ===== */
var S = { gender:null, answers:{}, qi:0 };
var $app = document.getElementById("app");
var $toast = document.getElementById("toast");
var toastTimer = null;
function toast(msg){
  $toast.textContent = msg; $toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(function(){ $toast.classList.remove("show"); }, 2400);
}
function router(){
  var h = location.hash || "#/";
  if (h.indexOf("#/r/") === 0) { renderShared(decodeURIComponent(h.slice(4))); return; }
  if (h === "#/gender") { renderGender(); return; }
  if (h === "#/quiz") { renderQuiz(); return; }
  if (h === "#/result") { renderResult(); return; }
  renderHome();
}
window.addEventListener("hashchange", router);

/* ===== 工具 ===== */
function el(html){ var d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild; }
function esc(s){ return String(s||"").replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function ic(name){
  var paths={
    star:'<path d="M12 2l2.9 6.26 6.86.6-5.17 4.57 1.52 6.73L12 16.9l-6.11 3.26 1.52-6.73L2.24 8.86l6.86-.6z"/>',
    flower:'<path d="M12 2a4.6 4.6 0 0 1 4.6 4.6 4.6 4.6 0 0 1-4.6 4.6A4.6 4.6 0 0 1 7.4 6.6 4.6 4.6 0 0 1 12 2zm0 7.2c2.54 0 4.6 2.06 4.6 4.6a4.6 4.6 0 0 1-4.6 4.6 4.6 4.6 0 0 1-4.6-4.6 4.6 4.6 0 0 1 4.6-4.6z" transform="rotate(0 12 12)"/>',
    paper:'<path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 1.5V8h4.5L14 3.5z"/>',
    heart:'<path d="M12 21s-7.5-4.9-9.5-9.2C.9 8.6 3 5.4 6.4 5.4c2.2 0 3.9 1.2 5.6 3.1 1.7-1.9 3.4-3.1 5.6-3.1 3.4 0 5.5 3.2 3.9 6.4C19.5 16.1 12 21 12 21z"/>',
    link:'<path d="M9 15a4 4 0 0 0 5.66 0l2-2a4 4 0 0 0-5.66-5.66l-1.06 1.06 1.42 1.42 1.06-1.06a2 2 0 0 1 2.82 2.82l-2 2A2 2 0 0 1 9.88 13.5l-1.42 1.42A4 4 0 0 0 9 15z"/><path d="M15 9a4 4 0 0 0-5.66 0l-2 2a4 4 0 0 0 5.66 5.66l1.06-1.06-1.42-1.42-1.06 1.06a2 2 0 0 1-2.82-2.82l2-2A2 2 0 0 1 14.12 10.5l1.42-1.42A4 4 0 0 0 15 9z"/>',
    share:'<path d="M13 12.5v-5a1 1 0 0 1 1.64-.77l6.9 5.5a1 1 0 0 1 0 1.54l-6.9 5.5a1 1 0 0 1-1.64-.77v-5a1 1 0 0 0-1-1h-3.86a8 8 0 0 0-6.4 3.18 10.5 10.5 0 0 1 9.42-4.68z"/>',
    download:'<path d="M12 3v10.5m0 0l-4-4m4 4l4-4M5 20h14"/>',
    back:'<path d="M19 12H5m0 0l6-6m-6 6l6 6"/>'
  };
  return '<svg class="ic" viewBox="0 0 24 24">' + (paths[name]||"") + '</svg>';
}
function sealSvg(name, color, size){
  var ch = (name||"魂").charAt(0);
  return '<svg viewBox="0 0 64 64" style="width:'+size+'px;height:'+size+'px">' +
    '<circle cx="32" cy="32" r="29" fill="none" stroke="'+color+'" stroke-width="2.4"/>' +
    '<circle cx="32" cy="32" r="21" fill="none" stroke="'+color+'" stroke-width="1" opacity=".45"/>' +
    '<circle cx="13.6" cy="13.6" r="2.2" fill="'+color+'" opacity=".65"/>' +
    '<circle cx="50.4" cy="13.6" r="2.2" fill="'+color+'" opacity=".65"/>' +
    '<circle cx="13.6" cy="50.4" r="2.2" fill="'+color+'" opacity=".65"/>' +
    '<circle cx="50.4" cy="50.4" r="2.2" fill="'+color+'" opacity=".65"/>' +
    '<text x="32" y="40" text-anchor="middle" font-size="22" font-weight="700" fill="'+color+'">'+esc(ch)+'</text>' +
  '</svg>';
}

/* ===== 首页 ===== */
function renderHome(){
  $app.innerHTML =
  '<section class="hero">' +
    '<div class="hero-bg"></div>' +
    '<div class="hero-inner">' +
      '<div class="hero-kicker">' + ic("flower") + 'THE SOUL EXCHANGE · 与灵魂的一场对话</div>' +
      '<h1>灵魂鉴定所<span class="sub">穿过千万个故事，遇见另一个自己</span></h1>' +
      '<p class="lead">关于活着的命题，从来不需要标准答案。作答完毕，我们会在千万个动漫故事里，为你寻回灵魂最相近的那一个角色。</p>' +
      '<button class="btn" onclick="location.hash=\'#/gender\'">' + ic("heart") + ' 开始鉴定</button>' +
      '<div class="hero-note">片刻作答 · 结果可生成分享卡</div>' +
      '<div class="hero-flow">' +
        '<span><i>1</i>选择你的性别</span>' +
        '<span><i>2</i>作答人生命题</span>' +
        '<span><i>3</i>遇见灵魂同类</span>' +
      '</div>' +
    '</div>' +
  '</section>';
}

/* ===== 性别选择 ===== */
function renderGender(){
  $app.innerHTML =
  '<div class="wrap page">' +
    '<div class="page-title"><h2>先告诉鉴定所，你的性别</h2><p>我们会走进属于你的那一半故事，寻找与你灵魂最近的人</p></div>' +
    '<div class="gender-grid">' +
      '<div class="gender-card" onclick="pickGender(\'男\')">' +
        '<div class="glyph">' + sealSvg("魂", "#C97A90", 56) + '</div>' +
        '<h3>男性</h3><p>热血梦想家、冷静谋士、孤高强者、玩世不恭……<br>在知名日漫男角色中为你寻人</p>' +
        '<span class="tag">路飞 · 鲁路修 · 银时 · 五条悟 · 利威尔</span>' +
      '</div>' +
      '<div class="gender-card female" onclick="pickGender(\'女\')">' +
        '<div class="glyph">' + sealSvg("心", "#5B7FA6", 56) + '</div>' +
        '<h3>女性</h3><p>温柔治愈者、战斗少女、病娇偏执、元气笨蛋……<br>在知名日漫女角色中为你寻人</p>' +
        '<span class="tag">亚丝娜 · 蕾姆 · 三笠 · 芙莉莲 · 御坂美琴</span>' +
      '</div>' +
    '</div>' +
  '</div>';
}
function pickGender(g){ S.gender = g; location.hash = "#/quiz"; }

/* ===== 答题 ===== */
function renderQuiz(){
  var q = QUESTIONS[S.qi];
  if (!q) { location.hash = "#/result"; return; }
  var cur = S.answers[q.id];
  var opts = q.options.map(function(o){
    var cls = o.key === cur ? "opt sel" : "opt";
    return '<button class="'+cls+'" data-k="'+o.key+'" onclick="pickOption('+q.id+',\''+o.key+'\')">' +
      '<span class="k">'+o.key+'</span><span>'+esc(gtxt(o.text))+'</span></button>';
  }).join("");
  $app.innerHTML =
  '<div class="wrap">' +
    '<div class="quiz-head"><span class="qno">第 ' + pad(q.id) + ' 问</span>' +
    '<div class="progress"><i id="pbar" style="width:' + Math.round(S.qi/QUESTIONS.length*100) + '%"></i></div>' +
    '<span class="qno" style="font-weight:500">' + (S.qi+1) + ' / ' + QUESTIONS.length + '</span></div>' +
    '<div class="q-card"><div class="qtext">' + esc(gtxt(q.text)) + '</div>' +
    '<div class="options">' + opts + '</div>' +
    '<div class="quiz-nav">' +
      (S.qi > 0
        ? '<button class="back-link" onclick="prevQ()">' + ic("back") + ' 上一问</button>'
        : '<span></span>') +
      '<button class="next-btn" id="nbtn" ' + (cur ? "" : "disabled") + ' onclick="nextQ()">' +
      (S.qi === QUESTIONS.length-1 ? "查看结果" : "下一问") + '</button>' +
    '</div></div>' +
  '</div>';
}
function gtxt(s){
  if (S.gender === "男") return String(s||"").replace(/他(?!们)/g, "她");
  return s;
}
function pad(n){ return n < 10 ? "0"+n : ""+n; }
function pickOption(qid, key){ S.answers[qid] = key; var btn = document.querySelector('.opt[data-k="'+key+'"]'); if(btn){ document.querySelectorAll(".opt.sel").forEach(function(b){b.classList.remove("sel");}); btn.classList.add("sel"); } document.getElementById("nbtn").disabled = false; }
function prevQ(){ if (S.qi > 0) { S.qi--; renderQuiz(); } }
function nextQ(){
  var q = QUESTIONS[S.qi];
  if (!S.answers[q.id]) return;
  if (S.qi === QUESTIONS.length-1) { location.hash = "#/result"; return; }
  S.qi++; renderQuiz();
  window.scrollTo(0,0);
}

/* ===== 计分与匹配（中心化余弦 · 设计文档算法）===== */
function userVec(){
  var u = [5,5,5,5,5,5,5,5,5,5,5,5,5,5];
  QUESTIONS.forEach(function(q){
    var k = S.answers[q.id]; if (!k) return;
    var opt = q.options.filter(function(o){return o.key===k;})[0];
    if (!opt) return;
    Object.keys(opt.delta).forEach(function(d){
      var idx = parseInt(d.slice(1),10) - 1;
      if (idx >= 0 && idx < 14) u[idx] = Math.min(10, Math.max(1, u[idx] + opt.delta[d]));
    });
  });
  return u;
}
function pearson(u, c){
  var ub = 0, cb = 0, i;
  for (i=0;i<14;i++){ ub += u[i]; cb += c[i]; }
  ub /= 14; cb /= 14;
  var num=0, du=0, dc=0;
  for (i=0;i<14;i++){
    var ud = u[i]-ub, cd = c[i]-cb;
    num += ud*cd; du += ud*ud; dc += cd*cd;
  }
  if (du === 0 || dc === 0) return 0;
  return num / Math.sqrt(du*dc);
}
function matchAll(){
  var uv = userVec();
  var pool = ROLES.filter(function(r){ return r.gender === S.gender; });
  var res = pool.map(function(r){
    return { role:r, r: pearson(uv, r.dims) };
  });
  res.sort(function(a,b){ return b.r - a.r; });
  /* 并列微差（|Δr|<0.02）用知名度 heat 决胜 */
  var changed = true;
  while (changed){
    changed = false;
    for (var i=0;i<res.length-1;i++){
      if (Math.abs(res[i].r - res[i+1].r) < 0.02 && res[i+1].role.heat > res[i].role.heat){
        var t = res[i]; res[i] = res[i+1]; res[i+1] = t; changed = true;
      }
    }
  }
  return { uv:uv, res:res };
}
function pct(r){ return Math.min(99, Math.max(42, Math.round((r+1)/2*100))); }

/* ===== 共鸣与差异 ===== */
function resonate(uv, cv){
  var diff = [], i;
  for (i=0;i<14;i++) diff.push({ d:i, v:Math.abs(uv[i]-cv[i]) });
  diff.sort(function(a,b){ return a.v - b.v; });
  var same = diff.slice(0,2), opp = diff.slice(-2).reverse();
  return { same:same, opp:opp };
}

/* ===== 结果页 ===== */
function renderResult(shared){
  var R = matchAll();
  var top1 = R.res[0].role, top1r = R.res[0].r, p1 = pct(top1r);
  var rs = resonate(R.uv, top1.dims);
  var top3 = R.res.slice(1,4).map(function(x){ return { role:x.role, p:pct(x.r) }; });
  var arch = top1.role + (top1.sub ? " · " + top1.sub : "");
  var notes = shared
    ? '<div class="page-title" style="margin-bottom:0"><p style="color:var(--sakura-deep)">这份结果是朋友分享给你的 · 灵魂共鸣检测报告</p></div>'
    : '';
  var sameHtml = rs.same.map(function(s){
    return '<div class="row good"><span class="dot"></span><span><b class="dname">'+DIMS[s.d]+'</b> · 你们在此如出一辙</span></div>';
  }).join("");
  var oppHtml = rs.opp.map(function(s){
    return '<div class="row diff"><span class="dot"></span><span><b class="dname">'+DIMS[s.d]+'</b> · 你们在这里走向了不同的方向</span></div>';
  }).join("");
  var t3 = top3.map(function(x,i){
    var ords = ["2nd","3rd","4th"];
    return '<div class="top3-item"><div class="rank">'+ords[i]+'</div><div class="nm">'+esc(x.role.name)+'</div><div class="wk">'+esc(x.role.work)+'</div><div class="mt">共鸣度 '+x.p+'%</div></div>';
  }).join("");

  $app.innerHTML =
  '<div class="wrap">' + notes +
    '<div class="result-top">' +
      '<div class="r-kicker">灵魂共鸣检测报告</div>' +
      '<h2>与你最接近的动漫角色</h2>' +
      '<div class="r-sub">每一次选择，都是灵魂的形状</div>' +
      '<div class="match-ring" id="ring" style="--p:'+p1+'">' +
        '<div class="inner"><b>'+p1+'%</b><span>SOUL MATCH</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="hero-card">' +
      '<div class="char-seal">' + sealSvg(top1.name, archColor(top1.role), 104) + '</div>' +
      '<div class="char-name">'+esc(top1.name)+'</div>' +
      '<div class="char-work">来自「'+esc(top1.work)+'」</div>' +
      (top1.quote ? '<div class="char-quote">「'+esc(top1.quote)+'」</div>' : '') +
      '<div class="char-desc">'+esc(top1.desc || "")+'</div>' +
      '<div class="char-tags"><span class="arche">'+esc(top1.role)+'</span>' +
        '<span>'+esc(ARCH_DESC[top1.role]||"")+'</span></div>' +
    '</div>' +
    '<div class="block"><h3><span class="num">01</span>你的灵魂棱镜</h3>' +
      '<div class="radar-wrap"><canvas id="radar" width="420" height="420" style="width:100%;height:auto"></canvas></div>' +
      '<div style="text-align:center;font-size:12.5px;color:var(--ink-soft);margin-top:6px"><span style="display:inline-flex;align-items:center;gap:5px"><i style="width:10px;height:10px;border-radius:50%;background:var(--sakura);display:inline-block"></i>你</span>' +
      '<span style="display:inline-flex;align-items:center;gap:5px;margin-left:18px"><i style="width:10px;height:10px;border-radius:50%;background:var(--indigo);display:inline-block"></i>'+esc(top1.name)+'</span></div>' +
    '</div>' +
    '<div class="block"><h3><span class="num">02</span>灵魂共鸣 · 差异</h3>' +
      '<div class="resonance">' + sameHtml + oppHtml + '</div>' +
    '</div>' +
    '<div class="block"><h3><span class="num">03</span>候补灵魂 · 相近者</h3>' +
      '<div class="top3">' + t3 + '</div>' +
    '</div>' +
    '<div class="share-actions">' +
      '<button class="btn small" onclick="downloadCard()">'+ic("download")+' 保存分享卡</button>' +
      '<button class="btn small ghost" onclick="copyLink()">'+ic("link")+' 复制结果链接</button>' +
    '</div>' +
    '<div class="restart"><a onclick="restart()">重新鉴定 · 再答一次</a></div>' +
  '</div>';

  drawRadar(document.getElementById("radar"), R.uv, top1.dims, top1.name);
  document.getElementById("ring").style.setProperty("--p", p1);
}
function restart(){ S = { gender:null, answers:{}, qi:0 }; location.hash = "#/"; }
function goBackQuiz(){ location.hash = "#/quiz"; }

/* ===== 雷达图 ===== */
var SHORT_DIMS = ["理想","理性","牺牲","羁绊","热血","正义","反叛","生死","爱意","执念","胜负","审美","温柔","幽默"];
function drawRadar(cv, uv, roleV, roleName){
  var dpr = window.devicePixelRatio || 1;
  var size = 420;
  cv.width = size * dpr; cv.height = size * dpr;
  var ctx = cv.getContext("2d");
  ctx.scale(dpr, dpr);
  var cx = size/2, cy = size/2, R = 152, n = 14;
  function pt(i, v){
    var a = -Math.PI/2 + i * 2*Math.PI/n;
    var r = R * v / 10;
    return [cx + r*Math.cos(a), cy + r*Math.sin(a)];
  }
  /* 网格 */
  ctx.lineWidth = 1;
  for (var g=1; g<=5; g++){
    ctx.beginPath();
    for (var i=0;i<=n;i++){
      var p = pt(i % n, g*2);
      if (i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]);
    }
    ctx.strokeStyle = g===5 ? "#D9CFC6" : "#EDE5DC"; ctx.stroke();
  }
  for (i=0;i<n;i++){
    var p0 = pt(i,0), p1 = pt(i,10);
    ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]);
    ctx.strokeStyle = "#EDE5DC"; ctx.stroke();
  }
  /* 标签 */
  ctx.font = "12px 'Noto Sans SC',sans-serif";
  ctx.fillStyle = "#6E6472";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (i=0;i<n;i++){
    var lp = pt(i, 11.4);
    ctx.fillText(SHORT_DIMS[i], lp[0], lp[1]);
  }
  function path(vals, color, width, fill){
    ctx.beginPath();
    for (var i=0;i<=n;i++){
      var p = pt(i % n, vals[i % n]);
      if (i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]);
    }
    ctx.closePath();
    if (fill){ ctx.globalAlpha = .18; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke();
  }
  path(roleV, "#5B7FA6", 2.5, false);
  path(uv, "#E8A0B4", 2.5, true);
  /* 数值点 */
  for (i=0;i<n;i++){
    var up = pt(i, uv[i]);
    ctx.beginPath(); ctx.arc(up[0], up[1], 3.2, 0, 2*Math.PI);
    ctx.fillStyle = "#E8A0B4"; ctx.fill();
  }
}

/* ===== 分享卡（Canvas 1080×1440 竖版）===== */
function shareCardBlob(cb){
  var R = matchAll();
  var top1 = R.res[0].role, p1 = pct(R.res[0].r);
  var W = 1080, H = 1440;
  var c = document.createElement("canvas");
  c.width = W; c.height = H;
  var ctx = c.getContext("2d");
  /* 背景 */
  var bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,"#FBF3EC"); bg.addColorStop(.55,"#F7E9EE"); bg.addColorStop(1,"#EFE3F0");
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  /* 远山与新月 */
  ctx.fillStyle = "rgba(91,127,166,.14)";
  ctx.beginPath(); ctx.moveTo(0,150);
  ctx.lineTo(250,88); ctx.lineTo(420,150); ctx.lineTo(620,84); ctx.lineTo(840,152); ctx.lineTo(1080,80); ctx.lineTo(1080,210); ctx.lineTo(0,210);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,190);
  ctx.lineTo(360,132); ctx.lineTo(720,196); ctx.lineTo(1080,140); ctx.lineTo(1080,250); ctx.lineTo(0,250);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(228,201,144,.7)"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(880,170,36,0,2*Math.PI); ctx.stroke();
  ctx.fillStyle = "#F7E9EE";
  ctx.beginPath(); ctx.arc(870,160,30,0,2*Math.PI); ctx.fill();
  /* 花瓣 */
  ctx.fillStyle = "rgba(232,160,180,.35)";
  for (var f=0; f<14; f++){
    var fx = 60 + f*74 + (f%3)*22, fy = 300 + (f%5)*96 + (f%2)*30;
    ctx.beginPath();
    ctx.arc(fx, fy, f%2?6:8, 0, 2*Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(232,160,180,.2)";
  for (f=0; f<9; f++){
    ctx.beginPath();
    ctx.arc(960 - f*70, 470 + (f%3)*80, 5, 0, 2*Math.PI);
    ctx.fill();
  }
  /* 顶部品牌 */
  ctx.fillStyle = "#C97A90"; ctx.textAlign = "center";
  ctx.font = "600 30px 'Noto Sans SC',sans-serif";
  ctx.fillText("灵 魂 鉴 定 所 · 动 漫 人 格 匹 配", W/2, 300);
  ctx.strokeStyle = "rgba(201,122,144,.35)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W/2-210,330); ctx.lineTo(W/2+210,330); ctx.stroke();
  ctx.fillStyle = "#B9AFC4"; ctx.font = "400 22px 'Noto Sans SC',sans-serif";
  ctx.fillText("THE SOUL EXCHANGE · 与灵魂的一场对话", W/2, 366);
  /* 封印 */
  var sealX = W/2, sealY = 470, sealR = 92;
  ctx.strokeStyle = "#C97A90"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(sealX, sealY, sealR, 0, 2*Math.PI); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(201,122,144,.55)";
  ctx.beginPath(); ctx.arc(sealX, sealY, sealR-16, 0, 2*Math.PI); ctx.stroke();
  var ch = (top1.name||"魂").charAt(0);
  ctx.fillStyle = "#C97A90"; ctx.font = "700 62px 'Noto Serif SC',serif"; ctx.textBaseline = "middle";
  ctx.fillText(ch, sealX, sealY+6);
  /* 角色名 */
  ctx.fillStyle = "#3A3440"; ctx.font = "900 84px 'Noto Serif SC',serif";
  ctx.fillText(top1.name, W/2, 640);
  ctx.fillStyle = "#5B7FA6"; ctx.font = "500 32px 'Noto Sans SC',sans-serif";
  ctx.fillText("来自「"+top1.work+"」", W/2, 700);
  /* 台词 */
  if (top1.quote){
    var q = "「" + top1.quote + "」";
    ctx.fillStyle = "#C97A90"; ctx.font = "600 30px 'Noto Serif SC',serif";
    var qw = ctx.measureText(q).width;
    if (qw > W-140){ ctx.font = "600 24px 'Noto Serif SC',serif"; qw = ctx.measureText(q).width; }
    ctx.fillText(q, W/2, 742);
    ctx.strokeStyle = "rgba(201,122,144,.3)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2-Math.min(qw,360)/2-20, 776); ctx.lineTo(W/2+Math.min(qw,360)/2+20, 776); ctx.stroke();
  }
  /* 原型 */
  ctx.fillStyle = "#C97A90"; ctx.font = "500 26px 'Noto Sans SC',sans-serif";
  ctx.fillText("人格原型 · " + top1.role, W/2, 816);
  /* 匹配度 */
  ctx.fillStyle = "#C97A90"; ctx.font = "900 120px 'Noto Serif SC',serif";
  ctx.fillText(p1+"%", W/2, 880);
  ctx.fillStyle = "#6E6472"; ctx.font = "400 24px 'Noto Sans SC',sans-serif";
  ctx.fillText("灵 魂 共 鸣 度", W/2, 936);
  /* 速写 */
  ctx.fillStyle = "#6E6472"; ctx.font = "400 27px 'Noto Sans SC',sans-serif";
  var desc = (top1.desc||"").slice(0,18);
  ctx.fillText(desc, W/2, 1000);
  /* 小雷达（简化 14 轴）*/
  var rcx = W/2, rcy = 1150, rr = 130, nn = 14;
  ctx.strokeStyle = "rgba(110,100,114,.25)"; ctx.lineWidth = 2;
  for (var g2=1; g2<=4; g2++){
    ctx.beginPath();
    for (var j=0;j<=nn;j++){
      var a = -Math.PI/2 + (j%nn)*2*Math.PI/nn;
      var px2 = rcx + rr*(g2/4)*Math.cos(a), py2 = rcy + rr*(g2/4)*Math.sin(a);
      if (j===0) ctx.moveTo(px2,py2); else ctx.lineTo(px2,py2);
    }
    ctx.closePath(); ctx.stroke();
  }
  function rpath(vals, color){
    ctx.beginPath();
    for (var j=0;j<=nn;j++){
      var a = -Math.PI/2 + (j%nn)*2*Math.PI/nn;
      var px2 = rcx + rr*(vals[j%nn]/10)*Math.cos(a), py2 = rcy + rr*(vals[j%nn]/10)*Math.sin(a);
      if (j===0) ctx.moveTo(px2,py2); else ctx.lineTo(px2,py2);
    }
    ctx.closePath();
    ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
  }
  rpath(R.uv, "#E8A0B4"); rpath(top1.dims, "#5B7FA6");
  /* 尾注 */
  ctx.fillStyle = "#B9AFC4"; ctx.font = "400 22px 'Noto Sans SC',sans-serif";
  ctx.fillText("你的人生里，住着这样一个灵魂", W/2, 1360);
  ctx.fillText("你也来鉴定 · 找到你的灵魂同类", W/2, 1398);
  c.toBlob(function(blob){ cb(blob, top1, p1); }, "image/png");
}
function downloadCard(){
  shareCardBlob(function(blob, top1, p1){
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "灵魂鉴定-" + top1.name + "-" + p1 + "%.png";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 800);
    toast("分享卡已保存到下载目录");
  });
}
/* ===== 分享链接 ===== */
function buildCode(){
  return btoa(unescape(encodeURIComponent(JSON.stringify({ g:S.gender, a:S.answers }))));
}
function copyLink(){
  var code = buildCode();
  var url = location.href.split("#")[0] + "#/r/" + code;
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ toast("结果链接已复制，分享给朋友吧"); },
      function(){ legacyCopy(url); });
  } else { legacyCopy(url); }
}
function legacyCopy(text){
  var ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); toast("结果链接已复制，分享给朋友吧"); }
  catch(e){ toast("复制失败，请长按网址手动复制：\n"+text); }
  ta.remove();
}
function renderShared(code){
  var data;
  try { data = JSON.parse(decodeURIComponent(escape(atob(code)))); }
  catch(e){ renderHome(); toast("分享链接已失效，请重新鉴定"); return; }
  if (!data || !data.g || !data.a) { renderHome(); return; }
  S = { gender:data.g, answers:data.a, qi:QUESTIONS.length-1 };
  renderResult(true);
}

/* ===== 启动 ===== */
router();


