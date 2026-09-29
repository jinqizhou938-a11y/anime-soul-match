# -*- coding: utf-8 -*-
"""从 pool.md + 男女候选池提取 200 个角色的匹配数据（主原型/次原型/性格速写/向量），输出 roles.json
角色向量 = 主原型模板 + 0.35×次原型模板；核心层精标角色用人工精标向量覆盖。
"""
import json, re, os

BASE = r"C:\Users\Lenovo\AppData\Local\Doubao\User Data\Default\.doubao\agent_mode\workspace\.sessions\38444809317252354\agents"
POOL = os.path.join(BASE, r"s_000cQJQXiV6\artifacts\pool.md")
MALE = os.path.join(BASE, r"s_000cQSlvUPN\artifacts\male_characters.md")
FEMALE = os.path.join(BASE, r"s_000cQSlvhh7\artifacts\female_characters.md")
ROOT = r"C:\Users\Lenovo\Doubao\chats\2026-09-29\new-chat\anime-soul-match"
OUT = os.path.join(ROOT, "assets", "roles.json")

# 15 原型模板向量（设计文档 §五，T1-T15 顺序）
PROTO = {
    "热血梦想家": [9,3,7,8,9,8,6,7,6,9,8,4,6,5],
    "冷静谋士": [6,9,6,5,4,5,8,7,4,7,7,4,4,4],
    "温柔治愈者": [5,5,6,8,4,6,3,5,6,6,2,8,9,3],
    "孤高强者": [5,7,6,3,3,6,5,8,3,8,8,3,3,2],
    "元气笨蛋": [7,2,5,8,9,6,5,6,7,9,8,3,7,7],
    "傲娇": [5,6,5,7,6,7,6,5,3,7,7,5,5,4],
    "无口冷面": [4,7,5,3,2,5,6,6,2,6,6,5,4,2],
    "玩世不恭": [4,6,6,6,6,6,8,6,4,4,2,5,6,9],
    "大和抚子·温柔大姐姐": [5,5,7,8,4,6,3,5,5,5,2,7,9,4],
    "战斗少女·女战士": [6,6,8,7,7,7,5,7,5,8,7,4,5,3],
    "病娇偏执": [4,5,8,9,6,2,7,5,9,5,5,4,3,3],
    "枭雄反派": [6,9,5,4,6,2,9,8,3,8,9,5,2,5],
    "殉道理想家": [9,6,9,5,6,5,9,7,3,7,6,4,3,2],
    "沉默守护者": [6,8,9,7,3,7,5,8,6,8,6,4,7,2],
    "敏感纤细": [5,5,4,6,3,5,4,3,3,5,4,9,7,2],
}

# 核心层精标向量（设计文档 §七，20 人）
PRECISE = {
    "鲁路修·兰佩路基": [8,9,7,6,4,6,9,7,5,8,7,5,4,3],
    "蒙奇·D·路飞": [9,2,7,9,9,8,6,7,6,9,8,4,6,5],
    "利威尔·阿克曼": [5,8,6,4,3,7,4,8,4,8,8,3,4,2],
    "夜神月": [6,9,5,2,5,2,9,7,4,8,8,4,2,4],
    "坂田银时": [4,6,6,6,6,6,8,6,4,4,2,5,6,9],
    "漩涡鸣人": [9,4,7,9,9,8,5,7,7,10,7,3,8,6],
    "樱木花道": [7,2,5,8,9,6,5,6,9,9,8,3,7,7],
    "灶门炭治郎": [7,5,7,8,6,9,3,6,5,8,6,6,9,3],
    "碇真嗣": [5,5,4,6,3,5,4,2,2,4,3,7,6,2],
    "卫宫切嗣": [9,8,10,3,4,5,8,7,3,7,6,3,3,2],
    "三笠·阿克曼": [6,7,9,8,4,7,4,8,8,8,7,3,6,2],
    "御坂美琴": [6,6,6,8,7,8,6,5,3,8,8,4,6,4],
    "蕾姆": [5,5,9,9,4,6,4,7,9,7,4,5,6,3],
    "芙莉莲": [5,7,5,6,3,5,4,6,3,5,3,9,5,4],
    "绫波丽": [3,7,6,5,2,5,5,6,2,5,4,6,4,1],
    "式波·明日香·兰格雷": [5,6,5,7,6,6,5,5,4,7,8,4,4,3],
    "玛奇玛": [5,9,5,4,6,2,7,7,4,8,7,4,2,3],
    "亚丝娜／结城明日奈": [6,6,7,8,5,7,4,6,6,7,6,6,8,3],
    "猫猫": [4,9,6,5,3,7,7,6,3,7,6,6,5,4],
    "我妻由乃": [4,5,8,9,6,2,7,5,9,5,5,4,3,3],
}

def load_lines(p):
    with open(p, encoding="utf-8") as f:
        return [l.rstrip("\n") for l in f]

def split_row(l):
    l2 = l.strip()
    if not l2:
        return None
    if "｜" in l2:
        return [c.strip() for c in l2.split("｜")]
    if l2.startswith("|"):
        body = l2.strip("|").strip()
        return [c.strip() for c in body.split("|")]
    return None

def parse_pool(lines):
    roles = []
    for l in lines:
        cells = split_row(l)
        if cells is None or len(cells) < 9:
            continue
        if cells[0] in ("中文名", "---", ""):
            continue
        try:
            heat = int(cells[7])
        except ValueError:
            continue
        roles.append({
            "name": cells[0], "work": cells[2], "gender": cells[3],
            "role": cells[6], "heat": heat, "tier": cells[8]
        })
    return roles

def parse_cand(lines):
    cands = []
    for l in lines:
        cells = split_row(l)
        if cells is None or len(cells) < 5:
            continue
        name_raw = re.sub(r"^\d+[\.、]\s*", "", cells[0])
        name = name_raw.split("（")[0].split("(")[0].strip()
        if not name or name == "中文名":
            continue
        desc = cells[3] if len(cells) > 3 else ""
        last = cells[-1]
        m = re.match(r"^([^（(]+)(?:（([^）]+)）|\(([^)]+)\))?", last)
        role = m.group(1).strip() if m else ""
        sub = (m.group(2) or m.group(3) or "").strip() if m else ""
        sub = re.sub(r"^次[：:]\s*", "", sub).strip()
        cands.append({
            "name": name, "work": cells[1] if len(cells) > 1 else "",
            "desc": desc, "role": role, "sub": sub
        })
    return cands

def norm(s):
    return re.sub(r"[\s／/·・]", "", s).lower()

def norm_tokens(s):
    return re.findall(r"[\u4e00-\u9fff]+|[a-z][a-z.\u02bb]*", norm(s))

def name_hit(pool_name, cand):
    # 分段 token 相交 或 归一字符串互相包含
    if not pool_name or not cand["name"]:
        return False
    pn, cn = norm(pool_name), norm(cand["name"])
    if pn == cn:
        return True
    pt = set(norm_tokens(pool_name))
    ct = set(norm_tokens(cand["name"]))
    if pt & ct:
        return True
    return (len(pn) >= 3 and pn in cn) or (len(cn) >= 3 and cn in pn)

def work_hit(pool_work, cand):
    if not pool_work or not cand["work"]:
        return False
    pw, cw = norm(pool_work), norm(cand["work"])
    return pw == cw or (len(pw) >= 2 and pw in cw) or (len(cw) >= 2 and cw in pw)

def match_role(pool_r, cands):
    best, best_score = None, -1
    for c in cands:
        if not name_hit(pool_r["name"], c):
            continue
        score = (2 if work_hit(pool_r["work"], c) else 0) + 1
        if score > best_score:
            best, best_score = c, score
    return best

pool = parse_pool(load_lines(POOL))
male_cand = parse_cand(load_lines(MALE))
female_cand = parse_cand(load_lines(FEMALE))

ALIAS = {"菲伦": "佩/菲伦"}

roles_out, missing, no_desc = [], [], []
for r in pool:
    rr = dict(r)
    if rr["name"] in ALIAS:
        rr["name"] = ALIAS[rr["name"]]
    cand = match_role(rr, male_cand if r["gender"] == "男" else female_cand)
    if cand is None:
        missing.append(r["name"])
        sub, desc = "", ""
    else:
        sub, desc = cand["sub"], cand["desc"]
    if not desc:
        no_desc.append(r["name"])
    # 向量：精标优先（统一点字符），其次主原型模板 + 0.35×次原型模板
    dims = None
    for pk, pv in PRECISE.items():
        if re.sub(r"[·・]", "", pk) == re.sub(r"[·・]", "", r["name"]):
            dims = pv
            break
    if dims is None:
        tm = PROTO.get(r["role"])
        ts = PROTO.get(sub) if sub else None
        if tm is None:
            tm = [5]*14
        if ts:
            dims = [min(10, max(1, round(tm[i] + 0.35*ts[i]))) for i in range(14)]
        else:
            dims = [int(x) for x in tm]
    roles_out.append({
        "name": r["name"], "work": r["work"], "gender": r["gender"],
        "role": r["role"], "sub": sub, "desc": desc,
        "heat": r["heat"], "tier": r["tier"], "dims": dims
    })

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(roles_out, f, ensure_ascii=False, indent=1)

print("total:", len(roles_out))
print("male:", len([r for r in roles_out if r["gender"] == "男"]))
print("female:", len([r for r in roles_out if r["gender"] == "女"]))
print("missing:", missing)
print("no_desc_count:", len(no_desc), no_desc[:10])
print("precise:", sum(1 for r in roles_out if r["name"] in PRECISE))
