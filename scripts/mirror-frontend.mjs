import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const REMOTE_SOURCE =
  "https://testingcf.jsdelivr.net/gh/Ramiel-s/HypnosisAPP5/dist/%E5%82%AC%E7%9C%A0APP%E5%89%8D%E7%AB%AF/index.html";
const DEFAULT_SOURCE = "public/frontends/hypnosis-app/source.html";
const DEFAULT_OUTPUT = "public/frontends/hypnosis-app/index.html";
const MCHAN_STATIC_SOURCE = "public/frontends/mchan/index.html";
const MCHAN_BOARD_DEFINITIONS = [
  { id: "notice", name: "公告区", description: "系统提示、版规和公共信息。原作者：Ramiel" },
  { id: "guide", name: "新手引导区", description: "操作提示、界面说明和任务线索。" },
  { id: "general", name: "综合讨论区", description: "普通讨论与当日动态。" },
  { id: "showcase", name: "成果展示区", description: "可公开查看的进展记录。" },
  { id: "help", name: "求助区", description: "问题、委托和反馈。" }
];
const DEFAULT_PREVIEW_ROLES = {
  "西园寺爱丽莎": {
    "好感度": 0,
	    "警戒度": 0,
		    "服从度": 0,
		    "性欲": 0,
		    "快感值": 0,
		    "档案": {
		      "照片": "",
		      "姓名": "西园寺爱丽莎",
		      "年龄": "17",
		      "社团/职业": "归宅部 / 西园寺财团千金",
		      "身高": "168cm",
		      "体重": "55kg",
		      "三围": "B104 / W58 / H88（L罩杯）",
		      "头发": "金色双马尾用昂贵发饰束起，发尾卷出柔软弧度，刘海刻意露出额头与耳侧小发卡，近看能闻到淡淡花果香。",
		      "面部": "宝蓝色上挑猫眼、睫毛浓密，妆容精致但不显厚重；笑时像在审视别人，生气时下巴会微微抬高。",
		      "上衣": "私改制服外套与贴身白衬衫，领口丝带端正，胸前布料被丰满曲线撑紧，袖口和胸针都带着大小姐式讲究。",
		      "下衣": "高腰短裙停在大腿中段，裙褶整齐，黑色过膝袜包住修长双腿，皮鞋擦得发亮。"
		    },
		    "心理": "我当然是这个班级最耀眼的人，大家看着我也是理所当然。{{user}}那边没什么值得在意的，倒是阿宅今天会不会又露出那种慌张表情？",
	    "阴蒂敏感度": 100,
    "小穴敏感度": 100,
    "菊穴敏感度": 100,
    "尿道敏感度": 100,
    "乳头敏感度": 100,
    "临时催眠效果": {},
    "永久催眠效果": {},
    "阴蒂高潮次数": 0,
    "小穴高潮次数": 0,
    "菊穴高潮次数": 0,
    "尿道高潮次数": 0,
    "乳头高潮次数": 0
  },
  "月咏深雪": {
    "好感度": 0,
	    "警戒度": 0,
		    "服从度": 0,
		    "性欲": 0,
		    "快感值": 0,
		    "档案": {
		      "照片": "",
		      "姓名": "月咏深雪",
		      "年龄": "17",
		      "社团/职业": "班级委员长 / 图书委员",
		      "身高": "165cm",
		      "体重": "52kg",
		      "三围": "B88 / W56 / H90",
		      "头发": "黑色长发顺直垂到背中，发梢微微内扣，刘海整齐分开，耳侧碎发总被她无意识地撩到耳后。",
		      "面部": "白皙端正的清楚系脸庞，深色眼睛安静温和，鼻梁秀气，嘴角常保持礼貌弧度，疲惫时眼下会有很淡阴影。",
		      "上衣": "制服衬衫扣到最上方，深色领结系得规整，外套没有多余褶皱，怀里常抱着讲义、文库本或班级资料。",
		      "下衣": "及膝百褶裙线条平整，黑色连裤袜包住纤细双腿，站姿端庄保守，整体带着安静的书卷气。"
		    },
		    "心理": "先把讲义和班务处理妥当，不要让课堂秩序乱掉。{{user}}看起来只是普通同学，我保持礼貌就好，没必要给出多余的私人距离。",
	    "阴蒂敏感度": 100,
    "小穴敏感度": 100,
    "菊穴敏感度": 150,
    "尿道敏感度": 100,
    "乳头敏感度": 100,
    "临时催眠效果": {},
    "永久催眠效果": {},
    "阴蒂高潮次数": 0,
    "小穴高潮次数": 0,
    "菊穴高潮次数": 0,
    "尿道高潮次数": 0,
    "乳头高潮次数": 0
  },
  "犬冢夏美": {
    "好感度": 0,
	    "警戒度": 0,
		    "服从度": 0,
		    "性欲": 0,
		    "快感值": 0,
		    "档案": {
		      "照片": "",
		      "姓名": "犬冢夏美",
		      "年龄": "17",
		      "社团/职业": "田径部",
		      "身高": "148cm",
		      "体重": "40kg",
		      "三围": "B72 / W52 / H76（A罩杯）",
		      "头发": "黑色短发随意扎成低马尾，额前碎发总被汗水弄乱，发绳朴素，跑动时发尾会轻快地甩起来。",
		      "面部": "圆亮的眼睛像小型犬一样直率，鼻尖和脸颊常带运动后的红，笑起来露出虎牙感，不高兴时表情也藏不住。",
		      "上衣": "校服衬衫常穿得松散，领口微开，袖口挽起，外套经常系在腰间或搭在肩上，带着运动后的热气。",
		      "下衣": "短裙下是紧实有力的腿线，常搭运动短袜或跑鞋，膝盖和小腿偶尔有训练留下的细小擦痕。"
		    },
		    "心理": "好饿，炒面面包要是又卖光我真的会生气。{{user}}在旁边的话顺手闹一下也没关系吧，反正他看起来挺耐拍的。",
	    "阴蒂敏感度": 100,
    "小穴敏感度": 100,
    "菊穴敏感度": 100,
    "尿道敏感度": 100,
    "乳头敏感度": 150,
    "临时催眠效果": {},
    "永久催眠效果": {},
    "阴蒂高潮次数": 0,
    "小穴高潮次数": 0,
    "菊穴高潮次数": 0,
    "尿道高潮次数": 0,
    "乳头高潮次数": 0
  }
};

const sourceArg = process.argv[2] || process.env.HYPNOOS_FRONTEND_SOURCE || DEFAULT_SOURCE;
const source = sourceArg === "remote" ? REMOTE_SOURCE : sourceArg;
const output = process.argv[3] || DEFAULT_OUTPUT;
const DEFAULT_ST_LOAD_ORIGIN = process.env.ST_LOAD_ORIGIN || "http://127.0.0.1:5173";
const LOCAL_VENDOR = {
  zod: "/public/vendor/zod.mjs",
  lodash: "/public/vendor/lodash.mjs",
  jquery: "/public/vendor/jquery.mjs",
  scheduler: "/public/vendor/scheduler.mjs"
};

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return htmlEscape(value).replace(/`/g, "&#96;");
}

function sanitizeGeneratedFrontend(html) {
  return String(html ?? "")
    .replace(/\\n\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,[A-Za-z0-9+/=]+/g, "")
    .replace(/\n\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,[A-Za-z0-9+/=]+/g, "")
    .replace(/\\n\/\/# sourceURL=webpack-internal:\/\/\/[^\\']*/g, "")
    .replace(/\n\/\/# sourceURL=webpack-internal:\/\/\/[^\n']*/g, "")
    .replaceAll("currency === 'MC_ENERGY' ? 'PT' : 'MC'", "currency === 'MC_ENERGY' ? 'MC能量' : '円'")
    .replaceAll('" PT"', '"円"')
    .replaceAll('\\" PT\\"', '\\"円\\"')
    .replaceAll("'PT'", "'円'")
    .replaceAll('"PT"', '"円"')
    .replaceAll(" + ${totalPointsCost} PT", "")
    .replaceAll(" + ${totalPointsCost}円", "")
    .replaceAll(", +${missingPoints} PT", "")
    .replaceAll(", +${missingPoints}円", "")
    .replaceAll(
      'children: [quickSupplyQty, \\"円\\"]',
      'children: [\\"¥\\", (quickSupplyQty * 1000).toLocaleString()]'
    );
}

async function readSource(input) {
  if (/^https?:\/\//i.test(input)) {
    const response = await fetch(input, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${input}`);
    return response.text();
  }
  return readFile(input, "utf8");
}

function prepareFrontendHtml(html, baseUrl, options = {}) {
  const charset = /<meta[^>]+charset=/i.test(String(html || "")) ? "" : `<meta charset="utf-8">`;
  const bootGuard = `<style id="st-hypnoos-boot-style">
html.st-hypnoos-booting body{background:#05070f}
html.st-hypnoos-booting #app{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
html.st-hypnoos-booting body::before{content:"";position:fixed;inset:0;z-index:2147483646;background:#05070f}
html.st-hypnoos-booting.st-hypnoos-boot-failed body::after{content:"前端加载失败，请刷新或检查控制台错误";position:fixed;left:50%;top:50%;z-index:2147483647;transform:translate(-50%,-50%);max-width:min(320px,calc(100vw - 40px));border:1px solid rgba(244,114,182,.35);border-radius:16px;background:rgba(15,23,42,.96);box-shadow:0 20px 50px rgba(0,0,0,.45);padding:14px 16px;color:#f8fafc;font:600 13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center}
</style><script>
document.documentElement.classList.add("st-hypnoos-booting");
window.__ST_HYPNOOS_PATCH_READY__ = false;
window.setTimeout(() => {
  if (!window.__ST_HYPNOOS_PATCH_READY__) document.documentElement.classList.add("st-hypnoos-boot-failed");
}, 6000);
</script>`;
  const shim = `<script>
    const __hypnoosLocalHost = ["localhost", "127.0.0.1", "::1", ""].includes(window.location.hostname);
    let __hypnoosTopLevel = true;
    try {
      __hypnoosTopLevel = window.self === window.top;
    } catch {
      __hypnoosTopLevel = false;
    }
    const __hypnoosFrontendPath = /\\/public\\/frontends\\/hypnosis-app\\//.test(window.location.pathname) || window.location.protocol === "file:";
    window.__ST_LOCAL_PREVIEW__ = Boolean(__hypnoosLocalHost && __hypnoosTopLevel && __hypnoosFrontendPath);
    window.__ST_WORKBENCH_PREVIEW__ = window.__ST_LOCAL_PREVIEW__;
    if (window.__ST_LOCAL_PREVIEW__) {
      window.SillyTavern = window.SillyTavern || {
        getCurrentChatId: () => "workbench-preview",
        getContext: () => ({ chat: [], characterId: "workbench-preview", name1: "User", name2: "Character" })
      };
    }
    const OPERATION_BLOCK_RE = /<本轮APP操作>[\\s\\S]*?<\\/本轮APP操作>/g;
    const OPERATION_SOURCE_KEYS = ["来源", "应用", "模块", "source", "app"];
    const OPERATION_ACTION_KEYS = ["操作", "动作", "类型", "action", "type"];
    window.__ST_OPERATION_INPUT_LOG__ = Array.isArray(window.__ST_OPERATION_INPUT_LOG__) ? window.__ST_OPERATION_INPUT_LOG__ : [];
	    const cleanOperationText = (value) => String(value ?? "").replace(/[<>]/g, "").trim();
	    const readOperationKey = (object, keys, fallback = "") => {
	      if (!object || typeof object !== "object" || Array.isArray(object)) return fallback;
	      for (const key of keys) {
        const value = object[key];
        if (value !== null && value !== undefined && String(value).trim()) return String(value).trim();
      }
      return fallback;
    };
    const operationValueToDenseText = (value, depth = 0) => {
      if (value === null || value === undefined || value === "") return "";
      if (Array.isArray(value)) {
        return value.map((item) => operationValueToDenseText(item, depth + 1)).filter(Boolean).join("；");
      }
      if (typeof value === "object") {
        const parts = [];
        for (const [key, item] of Object.entries(value)) {
          const text = operationValueToDenseText(item, depth + 1);
          if (text) parts.push(cleanOperationText(key) + "=" + text);
        }
        return parts.join(depth > 0 ? "，" : "；");
	      }
	      return cleanOperationText(value);
	    };
	    const unwrapOperationStatData = (value) => {
	      if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	      if (value.stat_data && typeof value.stat_data === "object") return value.stat_data;
	      return value;
	    };
	    const scoreOperationStatData = (value) => {
	      const root = unwrapOperationStatData(value);
	      if (!root || typeof root !== "object" || Array.isArray(root)) return -1;
	      const system = root["系统"];
	      const roles = root["角色"];
	      let score = 0;
	      if (system && typeof system === "object" && !Array.isArray(system)) {
	        score += 20;
	        for (const key of ["MC能量", "_MC能量", "MC能量上限", "_MC能量上限", "持有零花钱", "催眠APP订阅等级", "_催眠APP订阅等级"]) {
	          if (system[key] !== undefined) score += 3;
	        }
	      }
	      if (roles && typeof roles === "object" && !Array.isArray(roles)) score += 8;
	      return score;
	    };
	    const readOperationStatData = () => {
	      const candidates = [];
	      const windows = [];
	      for (const readWindow of [() => window, () => window.parent, () => window.top]) {
	        try {
	          const view = readWindow();
	          if (view && !windows.includes(view)) windows.push(view);
	        } catch {}
	      }
	      const options = [{ type: "message", message_id: "latest" }, { type: "chat" }, undefined];
	      for (const view of windows) {
	        for (const option of options) {
	          try {
	            const mvu = view.Mvu?.getMvuData?.(option);
	            const root = unwrapOperationStatData(mvu);
	            if (root) candidates.push(root);
	          } catch {}
	          try {
	            if (typeof view.getVariables === "function") {
	              const vars = option === undefined ? view.getVariables() : view.getVariables(option);
	              const root = unwrapOperationStatData(vars);
	              if (root) candidates.push(root);
	            }
	          } catch {}
	        }
	      }
	      let best = null;
	      for (const candidate of candidates) {
	        const score = scoreOperationStatData(candidate);
	        if (score < 0) continue;
	        if (!best || score > best.score) best = { candidate, score };
	      }
	      return best?.candidate ?? null;
	    };
	    const readOperationVariableSnapshot = () => {
	      const variables = readOperationStatData();
	      const system = variables?.["系统"];
	      if (!system || typeof system !== "object" || Array.isArray(system)) return null;
	      const roles = variables?.["角色"];
	      const snapshot = {};
	      const copyField = (label, ...keys) => {
	        for (const key of keys) {
	          if (system[key] !== undefined && system[key] !== null && system[key] !== "") {
	            snapshot[label] = system[key];
	            return;
	          }
	        }
	      };
	      copyField("MC能量", "MC能量", "_MC能量");
	      copyField("MC能量上限", "MC能量上限", "_MC能量上限");
	      copyField("持有零花钱", "持有零花钱");
	      copyField("催眠APP订阅等级", "催眠APP订阅等级", "_催眠APP订阅等级");
	      const alisaFavor = roles?.["西园寺爱丽莎"]?.["好感度"];
	      if (alisaFavor !== undefined && alisaFavor !== null) snapshot["西园寺爱丽莎好感度"] = alisaFavor;
	      const rules = variables?.["校规"] || system["校规"];
	      if (rules && typeof rules === "object" && !Array.isArray(rules)) snapshot["当前校规数"] = Object.keys(rules).length;
	      return Object.keys(snapshot).length ? snapshot : null;
	    };
	    const addOperationVariableFields = (fields, names) => {
	      for (const name of names) fields.add(name);
	    };
	    const pickOperationVariableFields = (payload) => {
	      const action = cleanOperationText(readOperationKey(payload, OPERATION_ACTION_KEYS, ""));
	      const item = cleanOperationText(payload?.["项目"] ?? payload?.["功能"] ?? payload?.["命令"] ?? "");
	      const text = operationValueToDenseText({ action, item, payload });
	      const fields = new Set();
	      if (/启动催眠|追加催眠/.test(action)) addOperationVariableFields(fields, ["MC能量"]);
		      if (/购买VIP等级/.test(action)) addOperationVariableFields(fields, ["持有零花钱", "催眠APP订阅等级"]);
	      if (/领取成就|领取奖励|完成任务|任务完成|成就奖励|任务奖励/.test(action)) addOperationVariableFields(fields, ["持有零花钱"]);
	      if (/资源兑换/.test(action)) {
	        if (/提升MC能量上限/.test(item) || /MC能量上限/.test(text)) addOperationVariableFields(fields, ["持有零花钱", "MC能量上限"]);
	        if (/补充MC能量/.test(item) || (/MC能量/.test(text) && /资金|零花钱|円|¥/.test(text))) addOperationVariableFields(fields, ["持有零花钱", "MC能量", "MC能量上限"]);
	      }
	      if (/申请立校规|废止初始校规/.test(action)) addOperationVariableFields(fields, ["持有零花钱", "催眠APP订阅等级", "西园寺爱丽莎好感度", "当前校规数"]);
	      return [...fields];
	    };
	    const stripOperationVariableFields = (payload) => {
	      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
	      const base = { ...payload };
	      for (const key of ["相关变量", "当前变量余额", "当前余额", "变量余额", "相关资源"]) delete base[key];
	      return base;
	    };
	    const normalizeOperationPayload = (payload) => {
	      if (typeof payload === "string") {
	        return { source: "APP", action: "记录", details: { 内容: payload } };
	      }
      const object = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : { 内容: payload };
      const source = readOperationKey(object, OPERATION_SOURCE_KEYS, "APP");
      const action = readOperationKey(object, OPERATION_ACTION_KEYS, "操作");
      const details = {};
      const skipKeys = new Set([...OPERATION_SOURCE_KEYS, ...OPERATION_ACTION_KEYS]);
      for (const [key, value] of Object.entries(object)) {
        if (skipKeys.has(key)) continue;
        const text = operationValueToDenseText(value);
        if (text) details[key] = value;
      }
      return { source, action, details };
    };
    const operationTagName = (value) => cleanOperationText(value).replace(/\\s+/g, "") || "APP";
    const formatOperationLine = (record) => {
      const fields = Object.entries(record.details || {})
        .map(([key, value]) => {
          const text = operationValueToDenseText(value);
          return text ? cleanOperationText(key) + "=" + text : "";
        })
        .filter(Boolean);
      return "- " + cleanOperationText(record.action || "操作") + (fields.length ? "｜" + fields.join("｜") : "");
    };
    const operationEntryPayload = (entry) => entry && typeof entry === "object" && Object.prototype.hasOwnProperty.call(entry, "payload") ? entry.payload : entry;
    const operationTopPriority = (entry) => {
      const payload = operationEntryPayload(entry);
      const record = normalizeOperationPayload(payload);
      const source = cleanOperationText(record.source || "");
      const action = cleanOperationText(record.action || "");
      const detailText = operationValueToDenseText(record.details || {});
      const haystack = [source, action, detailText].join(" ");
      if (/^(时钟|地图|学校地图)$/.test(source)) return 0;
      if (/建议剧情开始时间|建议时间|当前时间|推进到该时间|建议剧情地点|请求新增地点|当前地点变量|建议地点/.test(haystack)) return 0;
      return 10;
    };
    const sortOperationEntries = (entries) => (Array.isArray(entries) ? entries.slice() : [])
      .sort((a, b) => {
        const priority = operationTopPriority(a) - operationTopPriority(b);
        if (priority) return priority;
        return Number(a?.at || 0) - Number(b?.at || 0);
      });
    const operationRecordKey = (payload) => {
      const record = normalizeOperationPayload(payload);
      const fields = Object.entries(record.details || {})
        .map(([key, value]) => {
          const text = operationValueToDenseText(value);
          return text ? cleanOperationText(key) + "=" + text : "";
        })
        .filter(Boolean)
        .sort();
      return [cleanOperationText(record.source || "APP"), cleanOperationText(record.action || "操作"), fields.join("|")].join("\\u0001");
    };
		    const makeOperationEntry = (payload) => {
		      const cleanPayload = stripOperationVariableFields(payload);
		      const key = operationRecordKey(cleanPayload);
		      return {
		        id: "op-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
		        at: Date.now(),
		        key,
		        payload: cleanPayload
		      };
		    };
    const describeOperationEntry = (entry) => {
      const payload = operationEntryPayload(entry);
      const record = normalizeOperationPayload(payload);
      const key = entry?.key || operationRecordKey(payload);
      const fields = Object.entries(record.details || {})
        .map(([name, value]) => {
          const text = operationValueToDenseText(value);
          return text ? cleanOperationText(name) + "=" + text : "";
        })
        .filter(Boolean);
      return {
        id: String(entry?.id || key),
        key: String(key),
        at: Number(entry?.at || 0),
        source: cleanOperationText(record.source || "APP"),
        action: cleanOperationText(record.action || "操作"),
        summary: fields.join("｜") || "无附加信息",
        line: formatOperationLine(record)
      };
    };
	    const selectOperationVariables = (entries) => {
	      const snapshot = readOperationVariableSnapshot();
	      if (!snapshot) return null;
	      const fields = new Set();
	      for (const entry of entries) {
	        const payload = operationEntryPayload(entry);
	        for (const field of pickOperationVariableFields(payload)) fields.add(field);
	      }
	      const selected = {};
	      for (const field of fields) {
	        if (snapshot[field] !== undefined && snapshot[field] !== null && snapshot[field] !== "") selected[field] = snapshot[field];
	      }
	      return Object.keys(selected).length ? selected : null;
	    };
	    const buildOperationBlock = (entries = window.__ST_OPERATION_INPUT_LOG__) => {
	      const groups = new Map();
	      const sortedEntries = sortOperationEntries(entries);
	      for (const entry of sortedEntries) {
	        const record = normalizeOperationPayload(operationEntryPayload(entry));
	        const source = record.source || "APP";
	        if (!groups.has(source)) groups.set(source, []);
	        groups.get(source).push(record);
	      }
	      const lines = ["<本轮APP操作>"];
	      const variables = selectOperationVariables(sortedEntries);
	      if (variables) {
	        lines.push("<相关变量>");
	        for (const [key, value] of Object.entries(variables)) {
	          const text = operationValueToDenseText(value);
	          if (text) lines.push(cleanOperationText(key) + ": " + text);
	        }
	        lines.push("</相关变量>");
	      }
	      for (const [source, records] of groups) {
	        const tag = operationTagName(source);
	        lines.push("<" + tag + ">");
	        for (const record of records) lines.push(formatOperationLine(record));
        lines.push("</" + tag + ">");
      }
      lines.push("</本轮APP操作>");
      return lines.join("\\n");
    };
    const stripOperationBlocks = (value) => String(value || "").replace(OPERATION_BLOCK_RE, "").replace(/[ \\t]*\\n{3,}/g, "\\n\\n").trim();
    const writeOperationBlockToInput = (input, block) => {
      const current = "value" in input ? input.value : input.textContent;
      const base = String(current || "").replace(/\\s*$/, "");
      const next = base ? base + "\\n" + block : block;
      if ("value" in input) input.value = next;
      else input.textContent = next;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus?.();
    };
    const emitOperationQueueChanged = () => {
      try {
        window.dispatchEvent(new CustomEvent("HYPNOOS_OPERATION_QUEUE_CHANGED", {
          detail: {
            count: window.__ST_OPERATION_INPUT_LOG__.length,
            block: window.__ST_OPERATION_INPUT_LOG__.length ? buildOperationBlock() : ""
          }
        }));
      } catch {}
    };
    const findOperationInput = () => {
      const docs = [];
      const docReaders = [
        () => window.parent?.document,
        () => window.top?.document,
        () => document
      ];
      for (const readDoc of docReaders) {
        try {
          const candidate = readDoc();
          if (candidate && !docs.includes(candidate)) docs.push(candidate);
        } catch {}
      }
      const primarySelectors = [
        "#send_textarea",
        "textarea#send_textarea",
        "textarea[name='send_textarea']",
        "textarea[data-testid='send-textarea']"
      ];
      const isLikelyTavernSendDoc = (doc) => {
        if (doc === document) return true;
        try {
          return Boolean(
            doc.defaultView?.SillyTavern ||
            doc.defaultView?.getContext ||
            doc.defaultView?.getVariables
          );
        } catch {
          return false;
        }
      };
      for (const doc of docs) {
        if (!isLikelyTavernSendDoc(doc)) continue;
        for (const selector of primarySelectors) {
          const input = doc.querySelector(selector);
          if (input) return input;
        }
      }
      return null;
    };
    const OPERATION_DUPLICATE_WARN_KEY = "hypnoos.operation.confirm.noDuplicateWarn.v1";
    const hasExistingOperationBlock = (input) => OPERATION_BLOCK_RE.test(String(("value" in input ? input.value : input.textContent) || ""));
    const shouldWarnDuplicateOperation = (input) => {
      try {
        if (localStorage.getItem(OPERATION_DUPLICATE_WARN_KEY) === "true") return false;
      } catch {}
      OPERATION_BLOCK_RE.lastIndex = 0;
      return Boolean(input && hasExistingOperationBlock(input));
    };
    const showOperationDuplicateWarning = () => new Promise((resolve) => {
      const existing = document.querySelector(".st-operation-warning");
      if (existing) existing.remove();
      const overlay = document.createElement("div");
      overlay.className = "st-operation-warning";
      overlay.innerHTML = '<div class="st-operation-warning-card">' +
        '<strong>输入框里已经有本轮APP操作</strong>' +
        '<p>如果本回合还没发送或没清空上一次内容，再次确认会把新的操作继续追加进去，可能造成重复结算。</p>' +
        '<div class="st-operation-warning-actions">' +
          '<button data-action="cancel">取消</button>' +
          '<button data-action="mute">继续且不再提醒</button>' +
          '<button data-action="continue">继续写入</button>' +
        '</div>' +
      '</div>';
      const finish = (value) => {
        overlay.remove();
        resolve(value);
      };
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) finish(false);
        const action = event.target?.dataset?.action;
        if (action === "cancel") finish(false);
        if (action === "mute") {
          try { localStorage.setItem(OPERATION_DUPLICATE_WARN_KEY, "true"); } catch {}
          finish(true);
        }
        if (action === "continue") finish(true);
      });
      document.body.appendChild(overlay);
    });
    window.__ST_CLEAR_OPERATION_INPUT_LOG__ = () => {
      window.__ST_OPERATION_INPUT_LOG__ = [];
      emitOperationQueueChanged();
    };
    window.__ST_GET_PENDING_OPERATION_INPUT_LOG__ = () => sortOperationEntries(window.__ST_OPERATION_INPUT_LOG__);
    window.__ST_GET_PENDING_OPERATION_VIEW__ = () => sortOperationEntries(window.__ST_OPERATION_INPUT_LOG__).map(describeOperationEntry);
    window.__ST_BUILD_PENDING_OPERATION_BLOCK__ = () => window.__ST_OPERATION_INPUT_LOG__.length ? buildOperationBlock() : "";
    window.__ST_BUILD_OPERATION_BLOCK_FROM_PAYLOADS__ = (payloads) => {
      const list = Array.isArray(payloads) ? payloads : [payloads];
      return buildOperationBlock(list.filter((payload) => payload !== undefined).map(makeOperationEntry));
    };
    window.__ST_REMOVE_PENDING_OPERATION__ = (idOrKey) => {
      const value = String(idOrKey || "");
      const before = window.__ST_OPERATION_INPUT_LOG__.length;
      window.__ST_OPERATION_INPUT_LOG__ = window.__ST_OPERATION_INPUT_LOG__.filter((entry) => {
        const view = describeOperationEntry(entry);
        return view.id !== value && view.key !== value;
      });
      const changed = before !== window.__ST_OPERATION_INPUT_LOG__.length;
      if (changed) emitOperationQueueChanged();
      return changed;
    };
    window.__ST_APPEND_OPERATION_TO_INPUT__ = async (payload) => {
      const entry = makeOperationEntry(payload);
      const duplicate = window.__ST_OPERATION_INPUT_LOG__.some((item) => describeOperationEntry(item).key === entry.key);
      if (duplicate) {
        emitOperationQueueChanged();
        console.info("[HypnoOS] APP操作已在暂存列表中，忽略重复点击", payload);
        return false;
      }
      window.__ST_OPERATION_INPUT_LOG__.push(entry);
      emitOperationQueueChanged();
      console.info("[HypnoOS] APP操作已暂存，等待主界面确认", payload);
      return true;
    };
    window.__ST_FLUSH_OPERATION_TO_INPUT__ = async () => {
      if (!window.__ST_OPERATION_INPUT_LOG__.length) {
        emitOperationQueueChanged();
        return false;
      }
      const block = buildOperationBlock();
      const input = findOperationInput();
      if (input) {
        if (shouldWarnDuplicateOperation(input)) {
          const proceed = await showOperationDuplicateWarning();
          if (!proceed) return false;
        }
        writeOperationBlockToInput(input, block);
        window.__ST_OPERATION_INPUT_LOG__ = [];
        emitOperationQueueChanged();
        return true;
      }
      try {
        const target = window.parent && window.parent !== window ? window.parent : window.top;
        if (target && target !== window) {
          target.postMessage({ type: "HYPNOOS_APPEND_OPERATION", block }, "*");
        }
      } catch {}
      console.info("[HypnoOS] 已记录APP操作", block);
      return false;
    };
  </script>`;
  const base = "";
  let outputHtml = String(html || "");
  if (/<head[^>]*>/i.test(outputHtml)) {
    outputHtml = outputHtml.replace(/<head([^>]*)>/i, `<head$1>${charset}${base}${bootGuard}${shim}`);
  } else {
    outputHtml = `${charset}${base}${bootGuard}${shim}${outputHtml}`;
  }
  outputHtml = patchKnownGlobals(outputHtml);
  outputHtml = patchBundledHypnosisApp(outputHtml);
  outputHtml = ensureAppMountElement(outputHtml);
  outputHtml = injectInternalMchanApp(outputHtml, options.mchanStatic);
  outputHtml = injectWorkbenchInputProbe(outputHtml);
  outputHtml = moveHeadScriptsAfterApp(outputHtml);
  return outputHtml;
}

function ensureAppMountElement(html) {
  let outputHtml = String(html || "");
  if (/\sid=(["'])app\1/i.test(outputHtml)) return outputHtml;
  if (/<body\b[^>]*>/i.test(outputHtml)) {
    return outputHtml.replace(/<body([^>]*)>/i, `<body$1><div id="app"></div>`);
  }
  return `${outputHtml}<div id="app"></div>`;
}

function moveHeadScriptsAfterApp(html) {
  let outputHtml = String(html || "");
  const headMatch = outputHtml.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return outputHtml;
  const scripts = [];
  const nextHeadInner = headMatch[1].replace(/<script\b[\s\S]*?<\/script>/gi, (script) => {
    scripts.push(script);
    return "";
  });
  if (!scripts.length) return outputHtml;
  outputHtml = outputHtml.replace(headMatch[0], headMatch[0].replace(headMatch[1], nextHeadInner));
  outputHtml = ensureAppMountElement(outputHtml);
  const appPattern = /(<body\b[^>]*>\s*<div\s+id=(["'])app\2><\/div>)/i;
  if (appPattern.test(outputHtml)) {
    return outputHtml.replace(appPattern, (match) => `${match}${scripts.join("")}`);
  }
  return outputHtml.replace(/<body([^>]*)>/i, (_match, attrs) => `<body${attrs}><div id="app"></div>${scripts.join("")}`);
}

function patchKnownGlobals(html) {
  let outputHtml = html;
  const imports = [];
  if (outputHtml.includes("module.exports = z;") && !outputHtml.includes("npm/zod/+esm") && !outputHtml.includes(LOCAL_VENDOR.zod)) {
    imports.push(`import * as z from "${LOCAL_VENDOR.zod}";`);
  }
  if (outputHtml.includes("module.exports = _;") && !outputHtml.includes("npm/lodash/+esm") && !outputHtml.includes(LOCAL_VENDOR.lodash)) {
    imports.push(`import _ from "${LOCAL_VENDOR.lodash}";`);
  }
  if (/\$(?:\s*\(|\.)/.test(outputHtml) && !outputHtml.includes("npm/jquery/+esm") && !outputHtml.includes(LOCAL_VENDOR.jquery)) {
    imports.push(`import $ from "${LOCAL_VENDOR.jquery}";`);
  }
  if (imports.length) {
    outputHtml = outputHtml.replace(
      /<script(\s+type=["']module["'][^>]*)>/i,
      `<script$1>${imports.join("\n")}\n`
    );
  }
  if (/\b(getVariables|updateVariablesWith|getCurrentMessageId|getChatMessages|setChatMessages)\b/.test(outputHtml) && !outputHtml.includes("__ST_WORKBENCH_VARIABLES__")) {
    outputHtml = outputHtml.replace(
      /\nvar __webpack_modules__ = \{/,
      `\n${previewVariableRuntime()}\nvar __webpack_modules__ = {`
    );
  }
  outputHtml = outputHtml
    .replaceAll("https://testingcf.jsdelivr.net/npm/zod/+esm", LOCAL_VENDOR.zod)
    .replaceAll("https://cdn.jsdelivr.net/npm/zod/+esm", LOCAL_VENDOR.zod)
    .replaceAll("https://testingcf.jsdelivr.net/npm/lodash/+esm", LOCAL_VENDOR.lodash)
    .replaceAll("https://cdn.jsdelivr.net/npm/lodash/+esm", LOCAL_VENDOR.lodash)
    .replaceAll("https://testingcf.jsdelivr.net/npm/jquery/+esm", LOCAL_VENDOR.jquery)
    .replaceAll("https://cdn.jsdelivr.net/npm/jquery/+esm", LOCAL_VENDOR.jquery)
    .replaceAll("https://testingcf.jsdelivr.net/npm/scheduler/+esm", LOCAL_VENDOR.scheduler)
    .replaceAll("https://cdn.jsdelivr.net/npm/scheduler/+esm", LOCAL_VENDOR.scheduler);
  return outputHtml;
}

function patchBundledHypnosisApp(html) {
  let outputHtml = String(html || "")
    .replaceAll(
      "const [bodyStatsUnlocked, setBodyStatsUnlocked] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);",
      "const [bodyStatsUnlocked, setBodyStatsUnlocked] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);"
    )
    .replaceAll("setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);", "setBodyStatsUnlocked(true);")
    .replaceAll("setBodyStatsUnlocked(false);", "setBodyStatsUnlocked(true);")
    .replaceAll(
      "const [vipUnlocked, setVipUnlocked] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);",
      "const [vipUnlocked, setVipUnlocked] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);"
    )
    .replaceAll("setVipUnlocked(unlocks.bodyStatsUnlocked);", "setVipUnlocked(true);")
    .replaceAll("setVipUnlocked(false);", "setVipUnlocked(true);")
    .replaceAll(
      "return FEATURES.map(f => ({",
      "return FEATURES.filter(f => f.id !== 'vip1_stats').map(f => ({"
    )
    .replaceAll(
      "        let vip1StatsUnlocked = Boolean(store.purchases?.vip1_stats);\\n        // 兼容旧数据：曾经订阅过（能解锁 vip1_stats）但未写入永久解锁标记时，自动补写一次。\\n        if (!vip1StatsUnlocked && subscriptionActive) {\\n            await updateStoreWith(s => ({ ...s, purchases: { ...s.purchases, vip1_stats: true } }));\\n            vip1StatsUnlocked = true;\\n        }\\n        return { debugEnabled, bodyStatsUnlocked: (0,_access__WEBPACK_IMPORTED_MODULE_2__.getBodyStatsUnlocked)({ debugEnabled, vip1StatsUnlocked }) };",
      "        return { debugEnabled, bodyStatsUnlocked: true };"
    )
    .replaceAll(
      "            // “角色状态可视化(vip1_stats)”购买/订阅成功一次后永久解锁，用于主屏幕显示“身体检测”APP。\\n            purchases: { ...store.purchases, vip1_stats: true },",
      "            purchases: { ...store.purchases },"
    );
  outputHtml = patchEvalModuleSources(outputHtml, (code) => patchLegacyCurrencyModule(patchStatusBarModule(patchAppEntryModule(patchAppRootModule(patchMvuBridgeModule(patchHypnosisDataServiceModule(patchHypnosisAppModule(patchHypnosisSendModule(patchHypnosisTypesModule(patchAchievementAppModule(code)))))))))));
  outputHtml = outputHtml.replaceAll(
    'children: [quickSupplyQty, \\"円\\"]',
    'children: [\\"¥\\", (quickSupplyQty * 1000).toLocaleString()]'
  );
  return outputHtml;
}

function patchEvalModuleSources(html, transform) {
  const sourceText = String(html || "");
  let output = "";
  let cursor = 0;
  while (true) {
    const evalStart = sourceText.indexOf("eval(", cursor);
    if (evalStart < 0) {
      output += sourceText.slice(cursor);
      break;
    }
    const quote = sourceText[evalStart + 5];
    if (quote !== "'" && quote !== "\"") {
      output += sourceText.slice(cursor, evalStart + 5);
      cursor = evalStart + 5;
      continue;
    }
    let literalEnd = -1;
    let callEnd = -1;
    for (let i = evalStart + 6; i < sourceText.length; i += 1) {
      const ch = sourceText[i];
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch !== quote) continue;
      const close = sourceText.slice(i + 1).match(/^\s*\);/);
      if (!close) continue;
      literalEnd = i;
      callEnd = i + 1 + close[0].length;
      break;
    }
    if (literalEnd < 0) {
      output += sourceText.slice(cursor, evalStart + 5);
      cursor = evalStart + 5;
      continue;
    }
    output += sourceText.slice(cursor, evalStart);
    const raw = sourceText.slice(evalStart + 6, literalEnd);
    let code;
    try {
      code = Function("return " + quote + raw + quote)();
    } catch {
      output += sourceText.slice(evalStart, callEnd);
      cursor = callEnd;
      continue;
    }
    const nextCode = transform(code);
    output += nextCode === code ? sourceText.slice(evalStart, callEnd) : "eval(" + jsonForInlineScript(nextCode) + ");";
    cursor = callEnd;
  }
  return output;
}

function patchLegacyCurrencyModule(code) {
  let output = code.replace(/rewardMcPoints:\s*(\d+)/g, (_, value) => `rewardMoney: ${Number(value) * 1000}`);
  output = output.replaceAll("rewardMcPoints", "rewardMoney");
  output = output.replaceAll("自动续订：关", "买断制");
  output = output.replaceAll("自动续订：开", "买断制");
  output = output.replaceAll("自动续订", "买断制");
  output = output.replaceAll("订阅中心（每周）", "VIP买断");
  output = output.replaceAll("订阅中心 (每周)", "VIP买断");
  output = output.replaceAll("每周", "买断");
  output = output.replace(/([¥￥]\s*[\d,]+)\/周/g, "$1");
  output = output.replaceAll("订阅 ¥", "买断 ¥");
  output = output.replaceAll("订阅¥", "买断¥");
  output = output.replaceAll("订阅 ￥", "买断 ￥");
  output = output.replaceAll("`${label} ¥${price.toLocaleString()}/周`", "`买断 ¥${price.toLocaleString()}`");
  output = output.replaceAll("订阅已买断制", "VIP买断制");
  output = output.replaceAll("订阅中", "已买断");
  output = output.replaceAll("具体指令随VIP订阅开放", "具体指令随VIP买断开放");
  output = output.replaceAll("订阅后自动解锁", "买断后自动解锁");
  output = output.replaceAll("订阅变更由AI根据本轮APP操作结算", "VIP变更由AI根据本轮APP操作结算");
  output = output.replaceAll("订阅请求已记录，等待AI结算", "VIP购买请求已记录，等待AI结算");
  output = output.replaceAll('children: "订阅"', 'children: "购买"');
  output = output.replaceAll("children: '订阅'", "children: '购买'");
  output = output.replaceAll("'订阅'", "'购买'");
  output = output.replaceAll('"订阅"', '"购买"');
  output = output.replaceAll("未订阅", "未买断");
  output = output.replaceAll("已订阅", "已买断");
  output = output.replaceAll("MC点数", "MC能量");
  output = output.replaceAll("充值 1 MC能量", "补充 1 MC能量");
  output = output.replaceAll("userData.mcPoints < purchasePricePoints", "false");
  output = output.replaceAll("feature.purchasePricePoints", "0");
  output = output.replaceAll("purchasePricePoints", "purchasePriceMoney");
  output = output.replaceAll("userData.totalConsumedMc", "0");
  output = output.replaceAll("ctx.totalConsumedMc >= getSubscriptionUnlockThreshold(ctx.tier)", "true");
  output = output.replaceAll("u.totalConsumedMc >= 100", "u.money >= 100000");
  output = output.replaceAll("u.totalConsumedMc >= 10", "false");
  output = output.replaceAll("'MC_POINTS'", "'MC_ENERGY'");
  output = output.replaceAll('"MC_POINTS"', '"MC_ENERGY"');
  output = output.replaceAll(" MC点", "円");
  output = output.replaceAll(
    'children: [quickSupplyQty, "円"]',
    'children: ["¥", (quickSupplyQty * 1000).toLocaleString()]'
  );
  output = output.replaceAll("续订", "购买");
  return output;
}

function replaceBetween(source, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const end = source.indexOf(endMarker, start);
  if (end < 0) return source;
  return source.slice(0, start) + replacement + source.slice(end);
}

function patchHypnosisSendModule(code) {
  if (!code.includes("function buildHypnosisSendMessage")) return code;
  return code
    .replace(
      "        lines.push('    备注:');\n        lines.push(indentLines(f.userNote ?? '', 6));\n",
      ""
    )
    .replace(
      "    lines.push(`本次催眠的持续时间: ${durationMinutes}分钟`);\n    lines.push('备注:');\n    lines.push(indentLines(globalNote ?? '', 2));\n",
      ""
    );
}

function patchAchievementAppModule(code) {
  if (!code.includes("handleClaimAchievement") || !code.includes("AchievementApp")) return code;
  let output = code.replace(
    "    const [notice, setNotice] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const refreshTimerRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);",
    `    const [notice, setNotice] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [achievementFilter, setAchievementFilter] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('ALL');
    const [questFilter, setQuestFilter] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('UNFINISHED');
    const [newQuestCountInput, setNewQuestCountInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('1');
    const [newQuestBias, setNewQuestBias] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const refreshTimerRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);`
  );
  output = output.replace(
    `        requestRefresh();
        let stops = [];`,
    `        requestRefresh();
        const rewardStateListener = () => requestRefresh();
        window.addEventListener("HYPNOOS_REWARD_STATE_CHANGED", rewardStateListener);
        let stops = [];`
  );
  output = output.replace(
    `            stops.forEach(s => s.stop());`,
    `            window.removeEventListener("HYPNOOS_REWARD_STATE_CHANGED", rewardStateListener);
            stops.forEach(s => s.stop());`
  );
  output = replaceBetween(
    output,
    "    // --- Handlers ---",
    "    // Helper: Sort Achievements",
	    `    // --- Handlers ---
	    const fallbackAppendOperationIntent = (payload) => {
	        const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
	        const buildBlock = globalThis.__ST_BUILD_OPERATION_BLOCK_FROM_PAYLOADS__;
	        const block = typeof buildBlock === 'function'
	            ? buildBlock([payload])
	            : '<本轮APP操作>\\n' + text.trim() + '\\n</本轮APP操作>';
        const docs = [];
        for (const candidate of [globalThis.parent?.document, globalThis.top?.document, globalThis.document]) {
            try {
                if (candidate && !docs.includes(candidate))
                    docs.push(candidate);
            }
            catch {
                // ignore inaccessible parent frames
            }
        }
        const isLikelyTavernSendDoc = (doc) => {
            if (doc === globalThis.document)
                return true;
            try {
                return Boolean(doc.defaultView?.SillyTavern || doc.defaultView?.getContext || doc.defaultView?.getVariables);
            }
            catch {
                return false;
            }
        };
        for (const doc of docs) {
            if (!isLikelyTavernSendDoc(doc))
                continue;
            const input = doc.querySelector("#send_textarea, textarea#send_textarea, textarea[name='send_textarea'], textarea[data-testid='send-textarea']");
            if (!input)
                continue;
            const current = 'value' in input ? input.value : input.textContent;
            const base = String(current || '').replace(/<本轮APP操作>[\\s\\S]*?<\\/本轮APP操作>/g, '').trim();
            const next = base ? base.replace(/\\s*$/, '') + '\\n' + block : block;
            if ('value' in input)
                input.value = next;
            else
                input.textContent = next;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        console.info('[HypnoOS] 已记录APP操作', block);
        return false;
    };
    const recordOperationIntent = (payload) => {
        const append = globalThis.__ST_APPEND_OPERATION_TO_INPUT__;
        if (typeof append === 'function') {
            void append(payload);
            return;
        }
        fallbackAppendOperationIntent(payload);
    };
    const handleClaimAchievement = async (ach) => {
        if (ach.isClaimed)
            return;
        recordOperationIntent({
            来源: '成就和任务',
            操作: '领取成就',
            成就ID: ach.id,
            成就: ach.title,
            条件: ach.description,
	            奖励: \`持有零花钱 +¥\${Number(ach.rewardMoney ?? 0).toLocaleString()}\`,
        });
    };
    const handleAcceptQuest = async (quest) => {
        recordOperationIntent({
            来源: '成就和任务',
            操作: '接取任务',
            任务ID: quest.id,
            任务: quest.title,
            条件: quest.description,
	            奖励: \`持有零花钱 +¥\${Number(quest.rewardMoney ?? 0).toLocaleString()}\`,
        });
    };
    const handleCancelQuest = async (quest) => {
        recordOperationIntent({
            来源: '成就和任务',
            操作: '取消任务',
            任务ID: quest.id,
            任务: quest.title,
            条件: quest.description,
        });
    };
	    const handleClaimQuest = async (quest) => {
	        return;
	    };
	    const normalizeNewQuestCount = (value) => {
	        const parsed = Number.parseInt(String(value ?? ''), 10);
	        const maxCount = Math.max(0, 3 - activeQuestCount);
	        if (maxCount <= 0)
	            return 0;
	        if (!Number.isFinite(parsed))
	            return 1;
	        return Math.max(1, Math.min(maxCount, parsed));
	    };
	    const handleRequestNewQuests = () => {
	        const count = normalizeNewQuestCount(newQuestCountInput);
	        if (count <= 0) {
	            return;
	        }
	        const bias = String(newQuestBias || '').trim();
	        recordOperationIntent({
	            来源: '成就和任务',
	            操作: '新增任务',
	            数量: \`\${count}个\`,
	            当前已接任务数: \`\${activeQuestCount}个\`,
	            剩余可新增数量: \`\${Math.max(0, 3 - activeQuestCount)}个\`,
	            倾向: bias || '由AI根据当前上下文剧情决定并随机补全',
	            任务来源: '系统突然出现的任务，不是{{user}}主动发布、设计或提前知道的目标，也不代表{{user}}主动关联到任务对象。',
	            初始状态: '直接写入任务变量，作为已接/进行中的任务',
	            生成规则: '根据当前上下文剧情新增若干由系统突然刷出的进行中任务；写入/任务，包含完成条件、奖励金钱和已完成=false；不要写入前端静态列表，也不要标记为已完成。用户没指定的必要内容由AI随机生成，可适当优化用户描述，让任务更贴合当前剧情。',
	        });
    };
`
  );
  output = replaceBetween(
    output,
    "    // Helper: Sort Achievements",
    "    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(\"div\",",
    `    // Helper: Sort Achievements (Unlocked & Unclaimed -> Locked -> Claimed)
    const classifyAchievement = (achievement) => {
        const text = \`\${achievement.title || ''} \${achievement.description || ''}\`;
        const rolePattern = /角色|目标|任意角色|好感|警戒|服从|性欲|快感|敏感|高潮|催眠|西园寺|爱丽莎|月咏|深雪|犬冢|夏美/;
        const selfPattern = /自己|主角|用户|玩家|{{user}}|<user>|MC|能量|买断|VIP|可疑度|零花钱|资金|持有|金钱/;
        if (rolePattern.test(text))
            return 'ROLE';
        if (selfPattern.test(text))
            return 'SELF';
        return 'OTHER';
    };
    const matchesAchievementFilter = (achievement) => {
        const unlocked = achievement.checkCondition(userData);
        if (achievementFilter === 'SELF')
            return classifyAchievement(achievement) === 'SELF';
        if (achievementFilter === 'ROLE')
            return classifyAchievement(achievement) === 'ROLE';
        if (achievement.isClaimed)
            return false;
        if (achievementFilter === 'UNCLAIMED')
            return unlocked && !achievement.isClaimed;
        return true;
    };
    const sortedAchievements = [...achievements].sort((a, b) => {
        const aUnlocked = a.checkCondition(userData);
        const bUnlocked = b.checkCondition(userData);
        if (aUnlocked && !a.isClaimed && (!bUnlocked || b.isClaimed))
            return -1;
        if (bUnlocked && !b.isClaimed && (!aUnlocked || a.isClaimed))
            return 1;
        if (!aUnlocked && !a.isClaimed && b.isClaimed)
            return -1;
        if (!bUnlocked && !b.isClaimed && a.isClaimed)
            return 1;
        return 0;
    });
	    const visibleAchievements = sortedAchievements.filter(matchesAchievementFilter);
	    const activeQuestCount = quests.filter(q => q.status === 'ACTIVE' || q.status === 'COMPLETED').length;
	    const remainingQuestSlots = Math.max(0, 3 - activeQuestCount);
	    const visibleQuests = quests.filter(q => {
	        if (questFilter === 'ACTIVE')
	            return q.status === 'ACTIVE';
	        return q.status === 'AVAILABLE';
	    });
	`
  );
  output = replaceBetween(
    output,
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex p-4 gap-4 z-10", children: [`,
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 overflow-y-auto`,
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-3 p-4 gap-2 z-10", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: () => setActiveTab('ACHIEVEMENTS'), className: \`py-2.5 rounded-xl font-medium text-[12px] transition-all duration-300 flex items-center justify-center gap-1.5 \${activeTab === 'ACHIEVEMENTS' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}\`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], { size: 15 }), "成就"] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: () => setActiveTab('QUESTS'), className: \`py-2.5 rounded-xl font-medium text-[12px] transition-all duration-300 flex items-center justify-center gap-1.5 \${activeTab === 'QUESTS' ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}\`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_9__["default"], { size: 15 }), "任务"] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: () => setActiveTab('NEW_QUEST'), className: \`py-2.5 rounded-xl font-medium text-[12px] transition-all duration-300 flex items-center justify-center gap-1.5 \${activeTab === 'NEW_QUEST' ? 'bg-gradient-to-r from-cyan-600 to-sky-600 shadow-lg text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}\`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_6__["default"], { size: 15 }), "新增"] })] }), `
  );
  output = output.replace(
    `!loading && notice && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/80", children: notice })), !loading && activeTab === 'ACHIEVEMENTS' &&`,
    `!loading && notice && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/80", children: notice })), !loading && activeTab === 'ACHIEVEMENTS' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "成就筛选" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", { value: achievementFilter, onChange: e => setAchievementFilter(e.target.value), className: "bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "ALL", children: "全部" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "SELF", children: "自己" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "ROLE", children: "其他角色" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "UNCLAIMED", children: "可领取" })] })] })), !loading && activeTab === 'NEW_QUEST' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3 animate-fade-in", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 space-y-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "text-sm font-bold text-white", children: "新增任务" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "mt-1 text-xs text-white/55 leading-relaxed", children: "根据当前上下文剧情，让 AI 新增若干未完成任务。前端只记录意图，不直接改变量。" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "数量" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "number", inputMode: "numeric", min: 1, max: 10, step: 1, value: newQuestCountInput, onChange: e => setNewQuestCountInput(e.target.value), onBlur: () => setNewQuestCountInput(String(normalizeNewQuestCount(newQuestCountInput))), className: "mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "倾向" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("textarea", { value: newQuestBias, onChange: e => setNewQuestBias(e.target.value), placeholder: "例如：围绕当前场景、某个角色、赚取金钱、降低可疑度...", className: "mt-1 h-24 w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-white placeholder-white/30 outline-none focus:border-cyan-300/60" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleRequestNewQuests, className: "w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-black text-white shadow-lg active:scale-[0.98]", children: "写入新增任务请求" })] })] })), !loading && activeTab === 'ACHIEVEMENTS' &&`
  );
  output = output.replace("sortedAchievements.map(ach =>", "visibleAchievements.map(ach =>");
  output = output.replace(
    `!loading && activeTab === 'QUESTS' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3 animate-fade-in", children: [`,
    `!loading && activeTab === 'QUESTS' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3 animate-fade-in", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "任务筛选" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", { value: questFilter, onChange: e => setQuestFilter(e.target.value), className: "bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "UNFINISHED", children: "未完成" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "ACTIVE", children: "已接任务" })] })] }),`
  );
  output = output.replace(
    `children: "根据当前上下文剧情，让 AI 新增若干未完成任务。前端只记录意图，不直接改变量。"`,
    `children: "根据当前上下文剧情，让 AI 生成系统突然刷出的进行中任务；不是{{user}}主动发布或设计。最多同时3个，满了会禁用。"`
  );
  output = output.replace(
    `min: 1, max: 10, step: 1, value: newQuestCountInput, onChange: e => setNewQuestCountInput(e.target.value), onBlur: () => setNewQuestCountInput(String(normalizeNewQuestCount(newQuestCountInput))), className:`,
    `min: 1, max: Math.max(1, remainingQuestSlots), step: 1, disabled: remainingQuestSlots <= 0, value: newQuestCountInput, onChange: e => setNewQuestCountInput(e.target.value), onBlur: () => setNewQuestCountInput(String(normalizeNewQuestCount(newQuestCountInput))), className:`
  );
  output = output.replace(
    `onClick: handleRequestNewQuests, className: "w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-black text-white shadow-lg active:scale-[0.98]", children: "写入新增任务请求"`,
    `onClick: handleRequestNewQuests, disabled: remainingQuestSlots <= 0, style: remainingQuestSlots <= 0 ? { opacity: 0.45, cursor: 'not-allowed' } : undefined, className: "w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-black text-white shadow-lg active:scale-[0.98]", children: remainingQuestSlots <= 0 ? "已接任务已满" : "写入新增任务请求"`
  );
  output = output.replace(
    `const statusLabel = q.status === 'COMPLETED'
                                    ? '可提交'`,
    `const statusLabel = q.status === 'COMPLETED'
                                    ? '待自动结算'`
  );
  output = output.replace(
    `const canClaim = q.status === 'COMPLETED';`,
    `const canClaim = false;`
  );
  output = output.replace(
    `const canCancel = q.status === 'ACTIVE' || q.status === 'COMPLETED';`,
    `const canCancel = q.status === 'ACTIVE';`
  );
  output = output.replaceAll("quests.map(q =>", "visibleQuests.map(q =>");
  output = output.replaceAll("quests.length === 0", "visibleQuests.length === 0");
	  output = output
	    .replaceAll(`className: "flex justify-between items-start"`, `className: "flex items-start justify-between gap-3"`)
    .replaceAll(`className: "flex items-start gap-3"`, `className: "flex min-w-0 flex-1 items-start gap-3"`)
    .replaceAll(`className: "bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-1 animate-pulse"`, `className: "shrink-0 min-w-[92px] justify-center whitespace-nowrap bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-1 animate-pulse"`)
    .replaceAll(`className: "text-xs font-bold text-indigo-400/50"`, `className: "shrink-0 whitespace-nowrap text-right text-xs font-bold text-indigo-400/50"`)
    .replaceAll(`className: "flex flex-col items-end"`, `className: "flex shrink-0 flex-col items-end"`)
    .replaceAll(`className: "flex flex-col items-end gap-2"`, `className: "flex shrink-0 flex-col items-end gap-2"`)
	    .replaceAll(`className: "bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-white/10"`, `className: "shrink-0 min-w-[64px] whitespace-nowrap text-center bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-white/10"`)
	    .replaceAll(`className: "bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-semibold py-1 px-2 rounded-lg border border-white/10 flex items-center gap-1"`, `className: "shrink-0 whitespace-nowrap bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-semibold py-1 px-2 rounded-lg border border-white/10 flex items-center gap-1"`);
	  output = output.replaceAll("rewardMcPoints", "rewardMoney");
	  output = output
	    .replaceAll(`children: ["领 ", ach.rewardMoney, " PT"]`, `children: ["领 ¥", Number(ach.rewardMoney ?? 0).toLocaleString()]`)
	    .replaceAll(`children: ["\\u9886 ", ach.rewardMoney, " PT"]`, `children: ["领 ¥", Number(ach.rewardMoney ?? 0).toLocaleString()]`)
	    .replaceAll(`children: ["+", ach.rewardMoney, " PT"]`, `children: ["¥", Number(ach.rewardMoney ?? 0).toLocaleString()]`)
	    .replaceAll(`children: ["奖励：+", q.rewardMoney, " PT"]`, `children: ["奖励：¥", Number(q.rewardMoney ?? 0).toLocaleString()]`)
	    .replaceAll(`children: ["\\u5956\\u52B1\\uFF1A+", q.rewardMoney, " PT"]`, `children: ["奖励：¥", Number(q.rewardMoney ?? 0).toLocaleString()]`)
	    .replaceAll(`children: userData.mcPoints`, `children: "¥" + Number(userData.money ?? 0).toLocaleString()`);
	  return output;
	}

function patchAppEntryModule(code) {
  if (!code.includes("function mount()") || !code.includes("resetThisTurnAppOperationLog")) return code;
  let output = code.replace(
    `$(() => {
    void (async () => {
        try {
            await (0,_services_mvuBridge__WEBPACK_IMPORTED_MODULE_5__.waitForMvuReady)({ timeoutMs: 5000, pollMs: 150 });
        }
        catch {
            // ignore
        }
        void _services_mvuBridge__WEBPACK_IMPORTED_MODULE_5__.MvuBridge.resetThisTurnAppOperationLog();
        mount();
        $(window).on('pagehide', unmount);
    })();
});`,
    `const bootHypnoOs = () => {
    void (async () => {
        const isWorkbenchPreview = Boolean(globalThis.__ST_LOCAL_PREVIEW__);
        if (!isWorkbenchPreview) {
            try {
                await (0,_services_mvuBridge__WEBPACK_IMPORTED_MODULE_5__.waitForMvuReady)({ timeoutMs: 5000, pollMs: 150 });
            }
            catch {
                // ignore
            }
        }
        mount();
        try {
            $(window).on('pagehide', unmount);
        }
        catch {
            window.addEventListener('pagehide', unmount);
        }
    })();
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootHypnoOs, { once: true });
}
else {
    bootHypnoOs();
}`
  );
  output = output.replace(
    /        void _services_dataService__WEBPACK_IMPORTED_MODULE_\d+__\.DataService\.updateResources\(data\);\n/,
    "        // Local preview only; AI is responsible for writing resource variables.\n"
  );
  output = output.replace(
    `                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, requestRefresh),`,
    `                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => {
                        requestRefresh();
                        void refreshUserData();
                    }),`
  );
  output = output.replace(
    `    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (currentApp !== _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME)
            return;`,
    `    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const refreshNow = () => void refreshUserData();
        const refreshWhenVisible = () => {
            if (!document.hidden)
                refreshNow();
        };
        refreshNow();
        window.addEventListener("focus", refreshNow);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        window.addEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", refreshNow);
        return () => {
            window.removeEventListener("focus", refreshNow);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
            window.removeEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", refreshNow);
        };
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        void refreshUserData();
    }, [currentApp]);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (currentApp !== _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME)
            return;`
  );
  return output;
}

function patchStatusBarModule(code) {
  if (!code.includes("const StatusBar =") || !code.includes("components/OS/StatusBar")) return code;
  return code.replace(
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-20", children: timeText || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) })`,
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-16 text-[11px] font-black whitespace-nowrap", children: timeText || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) })`
  );
}

function patchAppRootModule(code) {
  if (!code.includes("const App =") || !code.includes("DataService.getUserData")) return code;
  let output = code;
  output = output.replace(
    `const FALLBACK_USER_DATA = {
    mcEnergy: 25,
    mcEnergyMax: 25,
    mcPoints: 25,
    totalConsumedMc: 0,
    money: 6000,
    suspicion: 0,
};`,
    `const FALLBACK_USER_DATA = {
    mcEnergy: 25,
    mcEnergyMax: 25,
    money: 6000,
    suspicion: 0,
};`
  );
  output = output.replace(
    `};
function withTimeout`,
    `};
function getActiveHomeHypnosisInfo(roles) {
    if (!roles || typeof roles !== 'object')
        return null;
    for (const [roleName, roleData] of Object.entries(roles)) {
        if (!roleData || typeof roleData !== 'object' || Array.isArray(roleData))
            continue;
        const temp = roleData["临时催眠效果"];
        if (!temp || typeof temp !== 'object' || Array.isArray(temp))
            continue;
        for (const [title, detail] of Object.entries(temp)) {
            if (!detail || typeof detail !== 'object' || Array.isArray(detail))
                continue;
            const effect = String(detail["效果"] ?? '').trim();
            const endTime = String(detail["结束时间"] ?? '').trim();
            if (effect || endTime)
                return { roleName, title: String(title || '临时催眠').trim() || '临时催眠' };
        }
    }
    return null;
}
function withTimeout`
  );
  output = output.replace(
    `    const [systemDateText, setSystemDateText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);
    const [localNow, setLocalNow] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Date());`,
    `    const [systemDateText, setSystemDateText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);
    const [systemScheduleText, setSystemScheduleText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);
    const [systemScheduleDetailText, setSystemScheduleDetailText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);
    const [systemWeekdayText, setSystemWeekdayText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);
    const [systemDateOnlyText, setSystemDateOnlyText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);
    const [homeHypnosisInfo, setHomeHypnosisInfo] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [localNow, setLocalNow] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Date());`
  );
  output = output.replace(
    `                setSystemDateText(clock.dateText);
                setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);`,
    `                setSystemDateText(clock.dateText);
                setSystemScheduleText(clock.scheduleText);
                setSystemScheduleDetailText(clock.scheduleDetailText);
                setSystemWeekdayText(clock.weekdayText);
                setSystemDateOnlyText(clock.dateOnlyText);
                setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);`
  );
  output = output.replace(
    `                setSystemDateText(clock.dateText);
                setBodyStatsUnlocked(true);`,
    `                setSystemDateText(clock.dateText);
                setSystemScheduleText(clock.scheduleText);
                setSystemScheduleDetailText(clock.scheduleDetailText);
                setSystemWeekdayText(clock.weekdayText);
                setSystemDateOnlyText(clock.dateOnlyText);
                setBodyStatsUnlocked(true);`
  );
  output = output.replaceAll(
    `systemDateText: systemDateText, localNow: localNow`,
    `systemDateText: systemDateText, systemScheduleText: systemScheduleText, systemScheduleDetailText: systemScheduleDetailText, systemWeekdayText: systemWeekdayText, systemDateOnlyText: systemDateOnlyText, localNow: localNow, homeHypnosisInfo: homeHypnosisInfo`
  );
  output = output.replace(
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_OS_StatusBar__WEBPACK_IMPORTED_MODULE_2__.StatusBar, { timeText: systemTimeText })`,
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_OS_StatusBar__WEBPACK_IMPORTED_MODULE_2__.StatusBar, { timeText: "Ramiel" })`
  );
  output = output.replace(
    `                const [clock, unlocks] = await Promise.all([_services_dataService__WEBPACK_IMPORTED_MODULE_6__.DataService.getSystemClock(), _services_dataService__WEBPACK_IMPORTED_MODULE_6__.DataService.getUnlocks()]);`,
    `                const [clock, unlocks, roles] = await Promise.all([
                    _services_dataService__WEBPACK_IMPORTED_MODULE_6__.DataService.getSystemClock(),
                    _services_dataService__WEBPACK_IMPORTED_MODULE_6__.DataService.getUnlocks(),
                    withTimeout(_services_mvuBridge__WEBPACK_IMPORTED_MODULE_7__.MvuBridge.getRoles(), 1600, 'MvuBridge.getRoles').catch(() => null),
                ]);`
  );
  output = output.replace(
    `                setSystemDateOnlyText(clock.dateOnlyText);
                setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);`,
    `                setSystemDateOnlyText(clock.dateOnlyText);
                setHomeHypnosisInfo(getActiveHomeHypnosisInfo(roles));
                setBodyStatsUnlocked(unlocks.bodyStatsUnlocked);`
  );
  output = output.replace(
    `                setSystemDateOnlyText(clock.dateOnlyText);
                setBodyStatsUnlocked(true);`,
    `                setSystemDateOnlyText(clock.dateOnlyText);
                setHomeHypnosisInfo(getActiveHomeHypnosisInfo(roles));
                setBodyStatsUnlocked(true);`
  );
  output = output.replace(
    `const HomeScreen = ({ onLaunchApp, bodyStatsUnlocked, systemTimeText, systemDateText, localNow, }) => {
    const displayTime = systemTimeText || \`\${localNow.getHours()}:\${localNow.getMinutes().toString().padStart(2, '0')}\`;
    const displayDate = systemDateText || localNow.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
    const [notice, setNotice] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);`,
    `const HomeScreen = ({ onLaunchApp, bodyStatsUnlocked, systemTimeText, systemDateText, systemScheduleText, systemScheduleDetailText, systemWeekdayText, systemDateOnlyText, localNow, homeHypnosisInfo, }) => {
    const displayTime = systemTimeText || \`\${localNow.getHours()}:\${localNow.getMinutes().toString().padStart(2, '0')}\`;
    const displayDate = systemDateText || localNow.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
    const displayDateOnly = systemDateOnlyText || displayDate.replace(/\\s*(?:星期|周)[一二三四五六日天]\\s*/g, '').trim() || displayDate;
    const displayWeekday = systemWeekdayText || displayDate.match(/星期[一二三四五六日天]/)?.[0] || displayDate.match(/周[一二三四五六日天]/)?.[0] || '星期三';
    const displaySchedule = systemScheduleText || '当前日程';
    const displayScheduleDetail = systemScheduleDetailText || '';
    const islandScrollRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const islandDragRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)({ dragging: false, startX: 0, startScroll: 0 });
    const stopIslandDrag = () => {
        islandDragRef.current.dragging = false;
    };
    const onIslandPointerDown = (event) => {
        const scroller = islandScrollRef.current;
        if (!scroller)
            return;
        islandDragRef.current = { dragging: true, startX: event.clientX, startScroll: scroller.scrollLeft };
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        catch {}
    };
    const onIslandPointerMove = (event) => {
        const scroller = islandScrollRef.current;
        const drag = islandDragRef.current;
        if (!scroller || !drag.dragging)
            return;
        const delta = event.clientX - drag.startX;
        scroller.scrollLeft = drag.startScroll - delta;
        if (Math.abs(delta) > 2)
            event.preventDefault();
    };
    const homeHypnosisLabel = homeHypnosisInfo ? \`\${homeHypnosisInfo.roleName}\${homeHypnosisInfo.title ? ' · ' + homeHypnosisInfo.title : ''}\` : '';
    const homeIslandElement = (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "st-home-hypnosis-island" + (homeHypnosisInfo ? "" : " is-idle"), onPointerDown: onIslandPointerDown, onPointerMove: onIslandPointerMove, onPointerUp: stopIslandDrag, onPointerCancel: stopIslandDrag, style: { position: "absolute", top: "6px", left: "50%", zIndex: 70, display: "block", width: "156px", height: "27px", transform: "translateX(-50%)", border: "1px solid rgba(216,180,254,.22)", borderRadius: "999px", background: "rgba(2,6,23,.78)", backdropFilter: "blur(14px)", boxShadow: "0 12px 26px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.06)", color: "rgba(245,243,255,.94)", fontSize: "11px", lineHeight: "1.2", overflow: "hidden", pointerEvents: "auto", touchAction: "pan-x", userSelect: "none", cursor: homeHypnosisInfo ? "grab" : "default" }, children: homeHypnosisInfo ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: islandScrollRef, className: "st-home-hypnosis-scroll", style: { display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "flex-start", gap: "7px", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", padding: "0 10px", whiteSpace: "nowrap" }, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", style: { width: "14px", height: "14px", color: "#f0abfc", filter: "drop-shadow(0 0 8px rgba(240,171,252,.55))", flex: "0 0 auto" }, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", { cx: 12, cy: 12, r: 3, fill: "currentColor" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("strong", { style: { fontSize: "12px", color: "#fff", whiteSpace: "nowrap" }, children: "催眠中" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { style: { minWidth: "max-content", whiteSpace: "nowrap", color: "rgba(226,232,240,.76)" }, children: homeHypnosisLabel })] }) : null });
    const makeLineIcon = (body) => ({ size = 28, className = '' }) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { viewBox: "0 0 24 24", width: size, height: size, className: className, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", dangerouslySetInnerHTML: { __html: body } }));
    const ScanRoleIcon = makeLineIcon('<path d="M4 8V5h3"/><path d="M17 5h3v3"/><path d="M20 16v3h-3"/><path d="M7 19H4v-3"/><path d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>');
    const ProfileIcon = makeLineIcon('<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M8.5 16c1.4-3 5.6-3 7 0"/>');
	    const TimetableIcon = makeLineIcon('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M8 14h8"/><path d="M8 18h5"/>');
	    const ClockIcon = makeLineIcon('<circle cx="12" cy="12" r="8"/><path d="M12 7v5l4 2"/><path d="M7 4 4.5 1.5"/><path d="M17 4l2.5-2.5"/>');
	    const MapIcon = makeLineIcon('<path d="M4 18V6l5-2 6 2 5-2v14l-5 2-6-2-5 2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>');
    const SchoolIcon = makeLineIcon('<path d="M3 10l9-5 9 5"/><path d="M5 10v9h14v-9"/><path d="M10 19v-5h4v5"/><path d="M9 10h6"/>');
    const [notice, setNotice] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);`
  );
  output = replaceBetween(
    output,
    "    const apps = [",
    "    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(\"div\", { className: \"relative h-full",
    `    const openInternalApp = (name) => () => {
        if (name === 'scan') window.__ST_OPEN_ADD_ROLE_APP__?.();
        else if (name === 'profile') window.__ST_OPEN_PROFILE_APP__?.();
        else if (name === 'calendar') window.__ST_OPEN_LITE_CALENDAR_APP__?.();
        else if (name === 'timetable') window.__ST_OPEN_TIMETABLE_APP__?.();
        else if (name === 'clock') window.__ST_OPEN_CLOCK_APP__?.();
        else if (name === 'mchan') window.__ST_OPEN_MCHAN_APP__?.();
        else if (name === 'map') window.__ST_OPEN_MAP_APP__?.();
        else if (name === 'school') window.__ST_OPEN_SCHOOL_APP__?.();
    };
    const visibleApps = [
        { id: 'hypno', name: '催眠APP', icon: _components_HypnosisApp__WEBPACK_IMPORTED_MODULE_3__.HypnoLogoSVG, color: 'bg-gradient-to-br from-purple-600 to-pink-600', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HYPNOSIS, disabled: false },
        { id: 'scan-role', name: '扫描角色', icon: ScanRoleIcon, color: 'bg-purple-500', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('scan') },
        { id: 'profile', name: '人物档案', icon: ProfileIcon, color: 'bg-teal-700', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('profile') },
        { id: 'stats', name: '身体检测', icon: lucide_react__WEBPACK_IMPORTED_MODULE_10__["default"], color: 'bg-blue-500', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.BODY_STATS, disabled: false },
        { id: 'calendar', name: '日历', icon: lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], color: 'bg-white text-black', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('calendar') },
        { id: 'timetable', name: '课程表', icon: TimetableIcon, color: 'bg-blue-600', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('timetable') },
        { id: 'clock', name: '时钟', icon: ClockIcon, color: 'bg-sky-500', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('clock') },
        { id: 'help', name: '帮助', icon: lucide_react__WEBPACK_IMPORTED_MODULE_9__["default"], color: 'bg-gray-500', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HELP, disabled: false },
        { id: 'achievements', name: '成就和任务', icon: lucide_react__WEBPACK_IMPORTED_MODULE_14__["default"], color: 'bg-gradient-to-br from-indigo-500 to-purple-600', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.ACHIEVEMENTS, disabled: false },
        { id: 'inventory', name: '库存', icon: lucide_react__WEBPACK_IMPORTED_MODULE_13__["default"], color: 'bg-emerald-600', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.INVENTORY, disabled: false },
        { id: 'mc-anon', name: 'MC匿名版', icon: lucide_react__WEBPACK_IMPORTED_MODULE_12__["default"], color: 'bg-blue-900', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('mchan') },
        { id: 'map', name: '地图', icon: MapIcon, color: 'bg-emerald-500', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('map') },
        { id: 'school', name: '学校', icon: SchoolIcon, color: 'bg-slate-600', mode: _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME, disabled: false, action: openInternalApp('school') },
    ];
`
  );
  output = output.replace(
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 mb-8 text-white/90 drop-shadow-md", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-6xl font-thin tracking-tighter", children: displayTime }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-lg font-medium", children: displayDate })] })`,
    `homeIslandElement, (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 mb-7 text-white/90 drop-shadow-md", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid items-center gap-3", style: { gridTemplateColumns: "168px minmax(0, 1fr)" }, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "min-w-0", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "font-thin tracking-tighter", style: { fontSize: "54px", lineHeight: ".95" }, children: displayTime }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-2 text-lg font-medium leading-tight", children: displayDateOnly })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "min-w-0 rounded-2xl border border-white/15 bg-slate-950/35 px-3 py-2 shadow-xl backdrop-blur-md", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 text-sm font-black whitespace-nowrap", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("i", { className: "h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" }), displayWeekday] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-1 whitespace-nowrap text-[12px] font-bold text-white/90", children: displaySchedule }), displayScheduleDetail && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-0.5 whitespace-nowrap text-[11px] font-semibold text-slate-300", children: displayScheduleDetail })] })] })] })`
  );
  output = output.replace(
    /        void _services_dataService__WEBPACK_IMPORTED_MODULE_\d+__\.DataService\.updateResources\(data\);\n/,
    "        // UI state follows AI-written variables; frontend actions do not persist resource variables.\n"
  );
  output = output.replace(
    `                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, requestRefresh),`,
    `                    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, () => {
                        requestRefresh();
                        void refreshUserData();
                    }),`
  );
  output = output.replace(
    `    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (currentApp !== _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME)
            return;`,
    `    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const refreshNow = () => void refreshUserData();
        const refreshWhenVisible = () => {
            if (!document.hidden)
                refreshNow();
        };
        refreshNow();
        window.addEventListener("focus", refreshNow);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        window.addEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", refreshNow);
        return () => {
            window.removeEventListener("focus", refreshNow);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
            window.removeEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", refreshNow);
        };
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        void refreshUserData();
    }, [currentApp]);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (currentApp !== _types__WEBPACK_IMPORTED_MODULE_8__.AppMode.HOME)
            return;`
  );
  return output;
}

function patchMvuBridgeModule(code) {
  if (!code.includes("function getMessageVariableOption()") || !code.includes("const MvuBridge =")) return code;
  let output = code;
  output = output.replace(
    `function getMessageVariableOption() {
    try {
        return { type: 'message', message_id: getCurrentMessageId() };
    }
    catch {
        return { type: 'message', message_id: 'latest' };
    }
}
async function getMvuData() {
    try {
        const ready = await waitForMvuReady();
        if (!ready)
            return null;
        const option = getMessageVariableOption();
        return { mvu: Mvu.getMvuData(option), option };
    }
    catch (err) {
        console.warn('[HypnoOS] Mvu 未就绪，跳过变量同步', err);
        return null;
    }
}`,
    `function getMessageVariableOption() {
    try {
        const currentMessageId = getCurrentMessageId();
        if (currentMessageId !== undefined && currentMessageId !== null && currentMessageId !== 'latest')
            return { type: 'message', message_id: currentMessageId };
    }
    catch {
        // ignore
    }
    return { type: 'message', message_id: 'latest' };
}
function getVariableReadOptions() {
    const current = getMessageVariableOption();
    const currentMessageId = current?.message_id;
    if (currentMessageId !== undefined && currentMessageId !== null && currentMessageId !== 'latest')
        return [current];
    return dedupeVariableReadOptions([{ type: 'message', message_id: 'latest' }, { type: 'chat' }]);
}
function dedupeVariableReadOptions(options) {
    const seen = new Set();
    const result = [];
    for (const option of options) {
        if (!option)
            continue;
        const key = option.type + ':' + String(option.message_id ?? '');
        if (seen.has(key))
            continue;
        seen.add(key);
        result.push(option);
    }
    return result;
}
async function getMvuData() {
    try {
        const ready = await waitForMvuReady();
        if (!ready)
            return null;
        let firstError = null;
        for (const option of getVariableReadOptions()) {
            try {
                const mvu = Mvu.getMvuData(option);
                if (mvu?.stat_data && typeof mvu.stat_data === 'object')
                    return { mvu, option };
            }
            catch (err) {
                firstError ??= err;
            }
        }
        if (firstError)
            throw firstError;
        return null;
    }
    catch (err) {
        console.warn('[HypnoOS] Mvu 未就绪，跳过变量同步', err);
        return null;
    }
}`
  );
  output = output
    .replaceAll("系统._催眠APP订阅等级", "系统.催眠APP订阅等级")
    .replaceAll("系统._MC能量上限", "系统.MC能量上限")
    .replaceAll("系统._MC能量", "系统.MC能量")
    .replaceAll("系统._hypnoos", "系统.hypnoos");
  output = output.replace(
    `    resetThisTurnAppOperationLog: async () => {`,
    `    syncDailySchedule: async (dailySchedule) => {
        return enqueueMvuWrite(async () => {
            if (typeof globalThis.Mvu === 'undefined')
                return false;
            const data = await getMvuData();
            if (!data)
                return false;
            const { mvu, option } = data;
            let changed = false;
            if (await setIfChanged(mvu, '系统.当天课程表', dailySchedule))
                changed = true;
            const courseText = String(dailySchedule?.当前或待上课程 ?? '').trim() || '无';
            if (await setIfChanged(mvu, '系统.当前/待上课程', courseText))
                changed = true;
            const specialText = String(dailySchedule?.当前或下个特殊日期 ?? '').trim();
            if (specialText && await setIfChanged(mvu, '系统.当前或下个特殊日期', specialText))
                changed = true;
            if (changed) {
                await Mvu.replaceMvuData(mvu, option);
            }
            return changed;
        });
    },
    resetThisTurnAppOperationLog: async () => {`
  );
  output = replaceBetween(
    output,
    "    syncUserResources: async (user) => {",
    "    setTask: async",
    `    syncUserResources: async () => {
        // Resource variables are AI-authored; frontend never writes them.
        return false;
    },
`
  );
  output = replaceBetween(
    output,
    "    syncSubscriptionTier: async (tierLabel) => {",
    "    syncDailySchedule: async",
    `    syncSubscriptionTier: async () => {
        // Subscription variables are AI-authored; frontend never writes them.
        return false;
    },
`
  );
  return output;
}

function patchHypnosisAppModule(code) {
  if (!code.includes("const HypnosisApp") || !code.includes("buildHypnosisSendMessage")) return code;
  let output = code;
  output = output.replace(
    "const HypnosisApp = ({ userData, onUpdateUser, onExit }) => {",
    `const CUSTOM_HYPNOSIS_DRAFT_KEY = 'hypnoos.hypnosis-app.original-ui.v1';
const readCustomHypnosisDraft = () => {
    try {
        const raw = localStorage.getItem(CUSTOM_HYPNOSIS_DRAFT_KEY);
        if (!raw)
            return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    }
    catch {
        return {};
    }
};
const writeCustomHypnosisDraft = (draft) => {
    try {
        localStorage.setItem(CUSTOM_HYPNOSIS_DRAFT_KEY, JSON.stringify(draft));
    }
    catch {
    }
};
const recordOperationIntent = (payload) => {
    const append = globalThis.__ST_APPEND_OPERATION_TO_INPUT__;
	    if (typeof append === 'function') {
	        void append(payload);
	        return;
	    }
	    const buildBlock = globalThis.__ST_BUILD_OPERATION_BLOCK_FROM_PAYLOADS__;
	    const text = typeof buildBlock === 'function'
	        ? buildBlock([payload])
	        : typeof payload === 'string' ? payload : JSON.stringify(payload);
	    void _services_mvuBridge__WEBPACK_IMPORTED_MODULE_5__.MvuBridge.appendThisTurnAppOperationLog(text);
	};
const normalizePositiveInt = (value, fallback = 1) => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return fallback;
    return Math.floor(parsed);
};
const normalizeOptionalPositiveIntInput = (value) => {
    const text = String(value ?? '').trim();
    if (!text)
        return '';
    const parsed = Number.parseInt(text, 10);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return '';
    return String(Math.floor(parsed));
};
const featurePersonInput = (feature) => {
    if (feature.userPersonCount === '')
        return '';
    return normalizeOptionalPositiveIntInput(feature.userPersonCount ?? 1) || '1';
};
const featurePersonCount = (feature) => {
    const input = featurePersonInput(feature);
    return input ? normalizePositiveInt(input, 0) : 0;
};
const featurePartInput = (feature) => {
    if (feature.userPartCount === '')
        return '';
    return normalizeOptionalPositiveIntInput(feature.userPartCount ?? 1) || '1';
};
const featurePartCount = (feature) => {
    const input = featurePartInput(feature);
    if (!input)
        return 0;
    return Math.min(5, normalizePositiveInt(input, 0));
};
const featureDurationInput = (feature, fallbackDuration) => {
    if (feature.userDuration === '')
        return '';
    if (feature.userDuration !== undefined && feature.userDuration !== null)
        return normalizeOptionalPositiveIntInput(feature.userDuration);
    return normalizeOptionalPositiveIntInput(fallbackDuration || 10);
};
const featureDurationMinutes = (feature, fallbackDuration) => {
    const input = featureDurationInput(feature, fallbackDuration);
    return input ? normalizePositiveInt(input, 0) : 0;
};
const featureUsesPartCount = (feature) => feature.id === 'vip1_temp_sensitivity';
const featureUsesPersonCount = (feature) => {
    if (!feature || feature.id === 'vip1_stats')
        return false;
    if (feature.id === 'vip5_open_space_common_sense')
        return false;
    if (feature.costValue <= 0)
        return false;
    return true;
};
const featureUsesDuration = (feature) => feature.costType !== 'ONE_TIME' && !['vip1_temp_sensitivity', 'vip1_estrus', 'vip1_memory_erase'].includes(feature.id);
const HypnosisApp = ({ userData, onUpdateUser, onExit }) => {
    const initialDraft = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => readCustomHypnosisDraft(), []);
    const [activeTemporaryHypnosis, setActiveTemporaryHypnosis] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(Boolean(userData.activeTemporaryHypnosis));
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        let stopped = false;
        const refreshActiveTemporaryHypnosis = async () => {
            try {
                const latest = await _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getUserData();
                if (!stopped)
                    setActiveTemporaryHypnosis(Boolean(latest.activeTemporaryHypnosis));
            }
            catch {
                if (!stopped)
                    setActiveTemporaryHypnosis(Boolean(userData.activeTemporaryHypnosis));
            }
        };
        setActiveTemporaryHypnosis(Boolean(userData.activeTemporaryHypnosis));
        void refreshActiveTemporaryHypnosis();
        const onRefresh = () => void refreshActiveTemporaryHypnosis();
        window.addEventListener('focus', onRefresh);
        window.addEventListener('HYPNOOS_OPERATION_QUEUE_CHANGED', onRefresh);
        return () => {
            stopped = true;
            window.removeEventListener('focus', onRefresh);
            window.removeEventListener('HYPNOOS_OPERATION_QUEUE_CHANGED', onRefresh);
        };
    }, [userData.activeTemporaryHypnosis]);`
  );
  output = output.replace(
    "    const [quickSupplyQtyInput, setQuickSupplyQtyInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('1');",
    "    const [quickSupplyQtyInput, setQuickSupplyQtyInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(initialDraft.quickSupplyQtyInput || '1');"
  );
  output = output.replace(
    "    const [durationInput, setDurationInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('10'); // Minutes",
    "    const [durationInput, setDurationInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(initialDraft.durationInput || '10'); // Minutes"
  );
  output = output.replace(
    "        return Math.min(9999, minutes);",
    "        return minutes;"
  );
  output = output.replace(
    "    const [showLowEnergyModal, setShowLowEnergyModal] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);",
    "    const showLowEnergyModal = false;\n    const setShowLowEnergyModal = () => {};"
  );
  output = output.replace(
    `        if (!subscription)
            return '未订阅';
        if (nowVirtualMinutes === null)`,
    `        if (!subscription)
            return '未订阅';
        if (subscription.source === 'system')
            return \`VIP\${subscription.tier.slice(3)} 已订阅\`;
        if (nowVirtualMinutes === null)`
  );
  output = output.replace(
    "            setFeatures(nextFeatures);",
    `            const featureDrafts = initialDraft.features && typeof initialDraft.features === 'object' ? initialDraft.features : {};
            setFeatures(nextFeatures.map(feature => {
                const draft = featureDrafts[feature.id] || {};
                return {
                    ...feature,
                    isEnabled: Boolean(draft.isEnabled ?? feature.isEnabled ?? false),
                    userNote: String(draft.userNote ?? feature.userNote ?? ''),
                    userNumber: typeof draft.userNumber === 'undefined' ? feature.userNumber : draft.userNumber,
                    userPersonCount: typeof draft.userPersonCount === 'undefined' ? feature.userPersonCount : draft.userPersonCount,
                    userPartCount: typeof draft.userPartCount === 'undefined' ? feature.userPartCount : draft.userPartCount,
                    userDuration: typeof draft.userDuration === 'undefined' ? feature.userDuration : draft.userDuration,
                    purchaseRequired: false,
                    purchasePriceMoney: undefined,
                    isPurchased: true,
                };
            }));`
  );
  output = output
    .replace(
      "        if (currency === 'MC_POINTS')\n            return { energy: 0, points: amount };\n        return { energy: amount, points: 0 };",
      "        return { energy: amount, points: 0 };"
    )
    .replace(
      "            const currency = feature.costCurrency === 'MC_POINTS' ? 'PT' : 'MC';",
      "            const currency = 'MC能量';"
    )
    .replace(
      "    const canSubscribeTier = (tier) => _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.canSubscribeTier(tier, { debugEnabled, totalConsumedMc: userData.totalConsumedMc });",
      "    const canSubscribeTier = () => true;"
    )
    .replace(
      "        const isLocked = !debugEnabled && userData.totalConsumedMc < tierConfig.unlockThreshold;",
      "        const isLocked = !debugEnabled && tierConfig.tier !== 'TRIAL' && tierFeatures.some(feature => !hasAccessForFeature(feature));"
    )
    .replaceAll("children: userData.mcPoints", "children: \"\"")
    .replaceAll("children: \"PTS\"", "children: \"\"")
    .replaceAll("children: [Math.floor(userData.totalConsumedMc), \" / \", tierConfig.unlockThreshold, \" 已消耗\"]", "children: isLocked ? \"未买断\" : \"已买断\"")
    .replaceAll("children: [Math.floor(userData.totalConsumedMc), \" / \", tierConfig.unlockThreshold, \" \\u5DF2\\u6D88\\u8017\"]", "children: isLocked ? \"未买断\" : \"已买断\"");
  output = output.replace(
    "    }, []);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {\n        return () => {",
    `    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (!features.length)
            return;
        const featureDrafts = {};
        for (const feature of features) {
            featureDrafts[feature.id] = {
                isEnabled: Boolean(feature.isEnabled),
                userNote: feature.userNote || '',
                userNumber: feature.userNumber,
                userPersonCount: feature.userPersonCount,
                userPartCount: feature.userPartCount,
                userDuration: feature.userDuration,
            };
        }
        writeCustomHypnosisDraft({ features: featureDrafts, quickSupplyQtyInput, durationInput });
    }, [durationInput, features, quickSupplyQtyInput]);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        return () => {`
  );
  output = output.replace(
    "                const auto = await _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.maybeAutoRenewSubscription(clock.virtualMinutes);",
    "                const auto = { renewed: false };"
  );
  output = replaceBetween(
    output,
    "    const toggleAutoRenew = async () => {",
    "    const toggleFeature = (id) => {",
    `    const toggleAutoRenew = async () => {
        if (!subscription)
            return;
        recordOperationIntent({
            来源: '催眠APP',
            操作: '查看VIP买断状态',
            当前等级: subscription.tier,
            结算提示: 'VIP为买断制。',
        });
        setSubscriptionNotice('VIP为买断制');
        setTimeout(() => setSubscriptionNotice(null), 1500);
    };
    const subscribeTier = async (tier) => {
        const price = _services_dataService__WEBPACK_IMPORTED_MODULE_4__.SUBSCRIPTION_PRICES[tier] ?? 0;
        recordOperationIntent({
            来源: '催眠APP',
            操作: '购买VIP等级',
            等级: tier,
            买断价格: '¥' + price.toLocaleString(),
            当前等级: remainingSubscriptionText,
            结算提示: '余额不足则购买失败；购买成功后永久解锁对应VIP及以下指令，不自动使用任何指令。',
        });
        setSubscriptionNotice('VIP买断请求已暂存');
        setTimeout(() => setSubscriptionNotice(null), 1500);
    };
    const purchaseFeature = async (feature) => {
        setSubscriptionNotice('具体指令随VIP订阅开放，无需单独购买');
        setTimeout(() => setSubscriptionNotice(null), 1500);
    };
    const enableDebugMode = async () => {
        setDebugEnabled(true);
    };
`
  );
  output = output
    .replaceAll(
      "            void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.updateFeature(f.id, { isEnabled: false, userNote: '' });\n",
      ""
    )
    .replaceAll(
      "    void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.updateFeature(id, {\n            isEnabled: nextEnabled,\n            ...(nextNumber === null ? null : { userNumber: nextNumber }),\n        });\n",
      ""
    )
    .replaceAll(
      "        void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.updateFeature(id, { userNote: note });\n",
      ""
    )
    .replaceAll(
      "        void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.updateFeature(id, { userNumber: value === null ? undefined : value });\n",
      ""
    );
  output = output
    .replace(
      "        const persons = feature.userNumber ?? parseFirstNumber(feature.userNote) ?? 1;\n        let amount = 0;",
      "        const persons = featurePersonCount(feature);\n        const commandDuration = featureDurationMinutes(feature, duration);\n        let amount = 0;"
    )
    .replace(
      "                const heat = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 999);",
      "                const heat = feature.userNumber === '' ? 0 : clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 999);"
    )
    .replace(
      "                const minutes = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 240);",
      "                const minutes = feature.userNumber === '' ? 0 : clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 240);"
    )
    .replace(
      "                const delta = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 100);",
      "                const delta = feature.userNumber === '' ? 0 : clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 100);"
    )
    .replace(
      "                const intensity = clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 999);",
      "                const intensity = feature.userNumber === '' ? 0 : clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), 1, 1, 999);"
    )
    .replace(
      "                amount = feature.costValue * intensity * duration;",
      "                amount = feature.costValue * intensity * commandDuration;"
    )
    .replace(
      "                amount = feature.costValue * persons * duration;",
      "                amount = feature.costValue * commandDuration;"
    )
    .replace(
      "                amount = feature.costType === 'ONE_TIME' ? feature.costValue : feature.costValue * duration;",
      "                amount = feature.costType === 'ONE_TIME' ? feature.costValue : feature.costValue * commandDuration;"
    )
    .replace(
      "        if (currency === 'MC_POINTS')",
      "        if (featureUsesPersonCount(feature))\n            amount *= persons;\n        if (featureUsesPartCount(feature))\n            amount *= featurePartCount(feature);\n        if (currency === 'MC_POINTS')"
    )
    .replace(
    "    const handleStart = async () => {",
      `    const updateFeaturePersonCount = (id, value) => {
        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userPersonCount: normalizeOptionalPositiveIntInput(value) } : f)));
    };
    const updateFeaturePartCount = (id, value) => {
        const normalized = normalizeOptionalPositiveIntInput(value);
        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userPartCount: normalized ? String(Math.min(5, normalizePositiveInt(normalized, 0))) : '' } : f)));
    };
    const updateFeatureDuration = (id, value) => {
        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userDuration: normalizeOptionalPositiveIntInput(value) } : f)));
    };
    const handleStart = async () => {`
    );
  output = output.replace(
    "    const updateFeatureNumber = (id, value) => {\n        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userNumber: value === null ? undefined : value } : f)));\n    };",
    "    const updateFeatureNumber = (id, value) => {\n        setFeatures(prev => prev.map(f => (f.id === id ? { ...f, userNumber: value === null ? '' : value } : f)));\n    };"
  );
  output = output.replace(
    "    const hasSessionFeaturesEnabled = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => features.some(f => f.isEnabled && f.id !== 'vip1_stats' && canUseEnabledFeature(f)), [debugEnabled, features, nowVirtualMinutes, subscription, subscriptionActive]);",
    "    const hasSessionFeaturesEnabled = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => features.some(f => {\n        if (!f.isEnabled || f.id === 'vip1_stats' || !canUseEnabledFeature(f))\n            return false;\n        const cost = getFeatureCost(f);\n        return cost.energy > 0 || cost.points > 0;\n    }), [debugEnabled, duration, features, nowVirtualMinutes, subscription, subscriptionActive]);"
  );
  output = replaceBetween(
    output,
    "    const handleStart = async () => {",
    "    const handleStop = () => {",
    `    const handleStart = async () => {
        const enabledFeatures = features
            .filter(f => {
                if (!f.isEnabled || f.id === 'vip1_stats' || !canUseEnabledFeature(f))
                    return false;
                const cost = getFeatureCost(f);
                return cost.energy > 0 || cost.points > 0;
            })
            .map(f => f);
        if (!enabledFeatures.length)
            return;
        const featureDetails = enabledFeatures.map(feature => {
            const cost = getFeatureCost(feature);
            const commandPersons = featurePersonCount(feature);
            const commandParts = featurePartCount(feature);
            const commandDuration = featureDurationMinutes(feature, duration);
            const usesPersons = featureUsesPersonCount(feature);
            const usesParts = featureUsesPartCount(feature);
            const usesDuration = featureUsesDuration(feature);
            const numericConfig = getFeatureNumericConfig(feature);
            const commandValue = numericConfig
                ? (feature.userNumber === '' ? 0 : clampInt(feature.userNumber ?? parseFirstNumber(feature.userNote), numericConfig.min, numericConfig.min, numericConfig.max))
                : null;
            const detail = {
                功能: feature.title,
                等级: feature.tier,
                说明: feature.description,
                备注: feature.userNote || '无',
                消耗类型: '当前MC能量',
                预计消耗: String(cost.energy) + '点',
                是否受人数影响: usesPersons ? '是' : '否',
                是否受部位数量影响: usesParts ? '是' : '否',
                是否受时间影响: usesDuration ? '是' : '否',
            };
            if (usesPersons)
                detail.人数 = String(commandPersons);
            if (usesParts)
                detail.部位数量 = String(commandParts);
            if (usesDuration)
                detail.时间 = String(commandDuration) + '分钟';
            if (numericConfig)
                detail[numericConfig.label] = String(commandValue) + (numericConfig.unit || '');
            return detail;
        });
        recordOperationIntent({
            来源: '催眠APP',
            操作: isAppendingHypnosis ? '追加催眠' : '启动催眠',
            功能列表: featureDetails,
	            MC能量消耗: String(totalEnergyCost) + '点',
            结算提示: '费用已由前端计算。AI只需检查余额、权限、目标状态和风险；余额不足的功能失败，后续同批次受影响操作也失败，不能贷款或擅自兑换资金。',
        });
        setIsTransitioning(true);
        setTimeout(() => {
            setIsTransitioning(false);
        }, 3200);
    };
`
  );
  output = output.replace(
    "        void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.clearSessionEnd();\n        // Reset inputs\n        setFeatures(prev => prev.map(f => (f.id === 'vip1_stats' ? f : { ...f, isEnabled: false, userNote: '' })));\n        void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.resetFeatures();\n        setGlobalNote('');",
    `        recordOperationIntent({
            来源: '催眠APP',
            操作: '取消催眠',
            说明: '请求AI结束当前临时催眠状态；永久催眠效果不计入催眠中，也不应被取消。',
        });
        setFeatures(prev => prev.map(f => (f.id === 'vip1_stats' ? f : { ...f, isEnabled: false, userNote: '' })));
        setGlobalNote('');`
  );
  output = output.replace(
    "        return Math.min(999, parsed);",
    "        return parsed;"
  );
	  output = output.replace(
	    "    const missingPoints = Math.max(0, totalPointsCost - userData.mcPoints);",
	    "    const missingPoints = 0;\n    const isAppendingHypnosis = Boolean(timeLeft > 0 || activeTemporaryHypnosis || userData.activeTemporaryHypnosis);"
	  );
  output = output
    .replaceAll("const nextPoints = userData.mcPoints + missingPoints;", "const nextPoints = 0;")
    .replaceAll("                                                    mcPoints: nextPoints,\n", "")
    .replaceAll(", +${missingPoints} 円", "")
    .replaceAll("累计消耗超过 10 点 MC 能量。", "完成首次系统测试回馈。")
    .replaceAll("解锁 VIP 2 权限 (累计消耗 100 MC)。", "持有金钱超过 100,000 円。");
  output = replaceBetween(
    output,
    "    const purchaseEnergy = async (desiredAmount) => {",
    "    // --- Render Helpers ---",
    `    const purchaseEnergy = async (desiredAmount) => {
        const amount = Math.max(1, Math.floor(Number(desiredAmount) || 1));
        const actualAmount = amount;
        const costMoney = 100 * actualAmount;
        recordOperationIntent({
            来源: '催眠APP',
            操作: '资源兑换',
            项目: '补充MC能量',
            数量: String(actualAmount) + '点',
            兑换规则: '100円 = 1点MC能量',
            消耗资源: '资金 ¥' + costMoney.toLocaleString(),
            获得资源: 'MC能量 +' + actualAmount + '点',
            结算提示: '余额不足则兑换失败；只兑换资源，不自动使用兑换后的资源。',
        });
        setSubscriptionNotice('补充MC能量请求已暂存');
        setTimeout(() => setSubscriptionNotice(null), 1500);
    };
    const purchaseMaxEnergy = async (desiredAmount) => {
        const amount = Math.max(1, Math.floor(Number(desiredAmount) || 1));
        recordOperationIntent({
            来源: '催眠APP',
            操作: '资源兑换',
            项目: '提升MC能量上限',
            数量: String(amount) + '点',
            兑换规则: '1000円 = 1点MC能量上限',
            消耗资源: '资金 ¥' + (amount * 1000).toLocaleString(),
            获得资源: 'MC能量上限 +' + amount + '点',
            结算提示: '余额不足则兑换失败；只兑换资源，不自动使用兑换后的资源。',
        });
        setSubscriptionNotice('提升上限请求已暂存');
        setTimeout(() => setSubscriptionNotice(null), 1500);
    };
    const purchasePoints = async () => {
        recordOperationIntent({
            来源: '催眠APP',
            操作: '资源兑换',
            项目: '无',
            兑换规则: '该兑换已取消',
            结算提示: '该兑换已取消，本项无效。',
        });
        setSubscriptionNotice('该兑换已取消');
        setTimeout(() => setSubscriptionNotice(null), 1500);
    };
    // --- Render Helpers ---
`
  );
  output = output
    .replace(
      /onClick: \(\) => void purchaseEnergy\(quickSupplyQty\), disabled: [\s\S]*?, className: "flex flex-col items-start bg-blue-900\/20/,
      'onClick: () => void purchaseEnergy(quickSupplyQty), disabled: false, className: "flex flex-col items-start bg-blue-900/20'
    )
    .replace(
      /onClick: \(\) => void purchaseMaxEnergy\(quickSupplyQty\), disabled: userData\.mcPoints < quickSupplyQty, className:/,
      'onClick: () => void purchaseMaxEnergy(quickSupplyQty), disabled: false, className:'
    )
    .replace(
      /onClick: \(\) => void purchasePoints\(quickSupplyQty\), disabled: userData\.money < quickSupplyQty \* 1000, className:/,
      'onClick: () => void purchasePoints(quickSupplyQty), disabled: false, className:'
    )
    .replace(
      /children: Math\.max\(0, userData\.mcEnergyMax - Math\.floor\(userData\.mcEnergy\)\) <= 0\s*\?\s*'已满'\s*:\s*`¥\$\{\(Math\.min\(Math\.max\(0, userData\.mcEnergyMax - Math\.floor\(userData\.mcEnergy\)\), quickSupplyQty\) \* 100\)\.toLocaleString\(\)\}`/,
      'children: `¥${(quickSupplyQty * 100).toLocaleString()}`'
    )
    .replace(
      /children: Math\.max\(0, userData\.mcEnergyMax - Math\.floor\(userData\.mcEnergy\)\) <= 0\s*\?\s*'能量已满'\s*:\s*`恢复 \$\{Math\.min\(Math\.max\(0, userData\.mcEnergyMax - Math\.floor\(userData\.mcEnergy\)\), quickSupplyQty\)\} 能量`/,
      'children: `补充 ${quickSupplyQty} 能量`'
    )
    .replaceAll(
      'children: [quickSupplyQty, "円"]',
      'children: ["¥", (quickSupplyQty * 1000).toLocaleString()]'
    )
    .replaceAll(
      'onClick: () => void purchasePoints(quickSupplyQty), disabled: false, className: "w-full flex',
      'onClick: () => void purchasePoints(quickSupplyQty), disabled: true, className: "hidden w-full flex'
    )
    .replaceAll('" \\u8BA2\\u9605\\u4E2D\\u5FC3\\uFF08\\u6BCF\\u5468\\uFF09"', '" VIP买断"')
    .replaceAll('children: "\\u5F53\\u524D\\u8BA2\\u9605"', 'children: "当前买断"')
    .replaceAll(
      'children: ["\\u81EA\\u52A8\\u7EED\\u8BA2: ", subscription?.autoRenew ? \'开\' : \'关\']',
      'children: ""'
    )
    .replaceAll(
      'className: "text-[10px] px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-300 disabled:opacity-40"',
      'className: "hidden"'
    )
    .replaceAll(
      "className: missingEnergy > 0 ? 'text-red-500 font-bold' : 'text-gray-300'",
      "className: 'text-gray-300'"
    )
    .replaceAll(
      "className: missingPoints > 0 ? 'text-red-500 font-bold' : 'text-gray-300'",
      "className: 'text-gray-300'"
    )
    .replace(
	      /children: \[\(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__\.jsx\)\(lucide_react__WEBPACK_IMPORTED_MODULE_\d+__\["default"\], \{ size: 18, fill: "currentColor" \}\), missingEnergy > 0 \? '能量不足' : missingPoints > 0 \? '[^']+' : '启动催眠'\]/,
      "children: [isAppendingHypnosis ? '追加催眠' : '启动催眠']"
    )
    .replace(
	      /\(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__\.jsxs\)\("span", \{ children: \["\\u5F53\\u524D\\u53EF\\u7528: ", Math\.floor\(userData\.mcEnergy\), " MC", totalPointsCost > 0 \? `, \$\{userData\.mcPoints\} [^`]+` : ''\] \}\)/,
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: "" })'
    )
    .replace(
      /_services_dataService__WEBPACK_IMPORTED_MODULE_\d+__\.DataService\.updateResources\(\{/g,
      'recordOperationIntent({'
    );
  output = output.replace(
	    "(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_16__[\"default\"], { size: 18, fill: \"currentColor\" }), missingEnergy > 0 ? '能量不足' : missingPoints > 0 ? '资源不足' : '启动催眠'",
    "isAppendingHypnosis ? '追加催眠' : '启动催眠'"
  );
  output = output.replace(
    `                 \${hasSessionFeaturesEnabled
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-pink-500/25 active:scale-95'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`,
    `                 \${hasSessionFeaturesEnabled
                                    ? isAppendingHypnosis
                                        ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:shadow-cyan-500/25 active:scale-95'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-pink-500/25 active:scale-95'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`
  );
  output = output
    .replace(
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-xs text-gray-400 mt-0.5", children: formatFeatureCost(feature) })] })',
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-xs text-gray-400 mt-0.5", children: formatFeatureCost(feature) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "mt-1 text-[11px] leading-relaxed text-gray-500", children: feature.description })] })'
    )
    .replace(
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-xs text-gray-300 mt-2 leading-relaxed opacity-90", children: feature.description }), (() => {',
      `(featureUsesPersonCount(feature) || featureUsesPartCount(feature) || featureUsesDuration(feature)) && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [featureUsesPersonCount(feature) && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-[10px] text-gray-400 mb-1", children: "人数" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "number", inputMode: "numeric", min: 0, step: 1, value: featurePersonInput(feature), onChange: e => updateFeaturePersonCount(feature.id, e.target.value), placeholder: "0", className: "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors" })] }), featureUsesPartCount(feature) && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-[10px] text-gray-400 mb-1", children: "部位数(1-5)" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "number", inputMode: "numeric", min: 0, max: 5, step: 1, value: featurePartInput(feature), onChange: e => updateFeaturePartCount(feature.id, e.target.value), placeholder: "0", className: "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors" })] }), featureUsesDuration(feature) && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-[10px] text-gray-400 mb-1", children: "时间(分钟)" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "number", inputMode: "numeric", min: 0, step: 1, value: featureDurationInput(feature, duration), onChange: e => updateFeatureDuration(feature.id, e.target.value), placeholder: "0", className: "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors" })] })].filter(Boolean) }), (() => {`
    )
    .replace(
      /className: "mb-4", children: \(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__\.jsx\)\("input", \{ type: "text", placeholder: "\\u53EF\\u4EE5\\u8F93\\u5165\\u4F60\\u8981\\u50AC\\u7720\\u8C01, \\u600E\\u4E48\\u50AC\\u7720\\u6216\\u8005\\u5176\\u4ED6\\u5907\\u6CE8"/,
      'className: "hidden", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", placeholder: "\\u53EF\\u4EE5\\u8F93\\u5165\\u4F60\\u8981\\u50AC\\u7720\\u8C01, \\u600E\\u4E48\\u50AC\\u7720\\u6216\\u8005\\u5176\\u4ED6\\u5907\\u6CE8"'
    )
    .replace(
      'className: "flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-white/5"',
      'className: "hidden"'
    );
  output = output
    .replace(
      "    const [features, setFeatures] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);",
      `    const [features, setFeatures] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [collapsedTiers, setCollapsedTiers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Set(_types__WEBPACK_IMPORTED_MODULE_3__.VIP_LEVELS.map(t => t.tier)));
    const toggleTierCollapsed = (tier) => {
        setCollapsedTiers(prev => {
            const next = new Set(prev);
            if (next.has(tier))
                next.delete(tier);
            else
                next.add(tier);
            return next;
        });
    };`
    )
    .replace(
      `        const progressPercent = tierConfig.unlockThreshold === 0
            ? 100
            : Math.min(100, (userData.totalConsumedMc / tierConfig.unlockThreshold) * 100);`,
      `        const progressPercent = isLocked ? 0 : 100;
        const isCollapsed = collapsedTiers.has(tierConfig.tier);
        const enabledCount = tierFeatures.filter(feature => feature.isEnabled && canUseEnabledFeature(feature)).length;`
    )
    .replace(
      'className: "mb-6 relative"',
      'className: "mb-5 relative rounded-[1.75rem] border-2 border-pink-400/25 bg-gradient-to-br from-white/[0.08] via-fuchsia-950/20 to-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.38)] overflow-hidden"'
    )
    .replace(
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex justify-between items-center mb-2 px-1", children:',
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { type: "button", onClick: () => toggleTierCollapsed(tierConfig.tier), className: "w-full flex justify-between items-center gap-3 px-4 py-4 bg-white/[0.04] border-b-2 border-pink-300/15 text-left active:bg-white/[0.07]", children:'
    )
    .replace(
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "text-pink-300 font-bold text-sm tracking-wider uppercase", children: tierConfig.label })',
      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "min-w-0", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "truncate text-xl font-black tracking-wide text-white", children: tierConfig.label }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "mt-1 text-[11px] font-semibold text-pink-100/55", children: [tierFeatures.length, " 条指令 · 已启用 ", enabledCount, " 条"] })] })'
    )
    .replace(
      'isLocked && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full", children: ["需要消耗 ", tierConfig.unlockThreshold, " 点"] }))',
	      '(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "shrink-0 flex items-center gap-2", children: [isLocked && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-[11px] text-gray-300 bg-gray-800/80 px-2 py-1 rounded-full", children: ["买断 ¥", (_services_dataService__WEBPACK_IMPORTED_MODULE_4__.SUBSCRIPTION_PRICES[tierConfig.tier] ?? 0).toLocaleString()] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(isCollapsed ? lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"] : lucide_react__WEBPACK_IMPORTED_MODULE_12__["default"], { size: 22, className: "text-pink-100/70" })] })'
    )
    .replace(
      'isLocked && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute inset-0 z-10 bg-hypno-dark/60 backdrop-blur-sm rounded-xl border border-white/5 flex flex-col items-center justify-center text-center p-4"',
      'isLocked && !isCollapsed && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute inset-x-3 bottom-3 top-[76px] z-10 bg-hypno-dark/60 backdrop-blur-sm rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-4"'
    )
    .replace(
      'className: `space-y-3 ${isLocked ?',
      "className: `space-y-3 px-3 pb-3 pt-3 ${isCollapsed ? 'hidden' : ''} ${isLocked ?"
    )
    .replace(
      'bg-white/5 border rounded-xl overflow-hidden transition-all duration-300',
      'bg-black/25 border rounded-2xl overflow-hidden transition-all duration-300'
    )
    .replace(
      "? 'border-pink-500/50 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.1)]'",
      "? 'border-pink-400/60 bg-pink-500/[0.12] ring-1 ring-pink-400/20 shadow-[0_0_16px_rgba(236,72,153,0.14)]'"
    );
  return output;
}

function patchHypnosisTypesModule(code) {
  if (!code.includes("const VIP_LEVELS") || !code.includes('AppMode["HYPNOSIS"]')) return code;
  return code
    .replace("    { tier: 'VIP5', unlockThreshold: 1000, label: 'VIP 5 (永久)' },", "    { tier: 'VIP5', unlockThreshold: 1000, label: 'VIP 5' },")
    .replace(/\n    \{ tier: 'VIP6', unlockThreshold: 2500, label: 'VIP 6 \(完全控制\)' \},/g, "");
}

function patchHypnosisDataServiceModule(code) {
  if (!code.includes("getSessionEnd: async") || !code.includes("STORE_SCHEMA")) return code;
  let output = code;
  output = output.replace(/rewardMcPoints:\s*(\d+)/g, (_, value) => `rewardMoney: ${Number(value) * 1000}`);
  output = output.replaceAll("rewardMcPoints", "rewardMoney");
  output = output.replace(
    `const DEFAULT_USER_DATA = {
    mcEnergy: 25,
    mcEnergyMax: 25,
    mcPoints: 25,
    totalConsumedMc: 0,
    money: 6000,
    suspicion: 0,
};`,
    `const DEFAULT_USER_DATA = {
    mcEnergy: 25,
    mcEnergyMax: 25,
    money: 6000,
    suspicion: 0,
};`
  );
  output = output.replace(
    `    _MC能量: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.mcEnergy),
    _MC能量上限: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.mcEnergyMax),
    当前MC点: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.mcPoints),
    _累计消耗MC点: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.totalConsumedMc),
    持有零花钱: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.money),`,
    `    MC能量: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.mcEnergy),
    MC能量上限: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.mcEnergyMax),
    持有零花钱: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().default(DEFAULT_USER_DATA.money),`
  );
  output = output.replace(
    `function systemToUserResources(system) {
    return {
        mcEnergy: system._MC能量,
        mcEnergyMax: system._MC能量上限,
        mcPoints: system.当前MC点,
        totalConsumedMc: system._累计消耗MC点,
        money: system.持有零花钱,
        suspicion: system.主角可疑度,
    };
}`,
    `function systemToUserResources(system) {
    return {
        mcEnergy: system.MC能量,
        mcEnergyMax: system.MC能量上限,
        money: system.持有零花钱,
        suspicion: system.主角可疑度,
    };
}`
  );
  output = output.replace(
    /const SUBSCRIPTION_PRICES = \{[\s\S]*?\};/,
    `const SUBSCRIPTION_PRICES = {
    VIP1: 3000,
    VIP2: 30000,
    VIP3: 100000,
    VIP4: 400000,
    VIP5: 800000,
};`
  );
  output = output.replace(
    `function getSystemClockFrom(system) {
    const dateText = typeof system?.当前日期 === 'string' ? system.当前日期 : undefined;
    const timeText = typeof system?.当前时间 === 'string' ? system.当前时间 : undefined;
    return {
        dateText,
        timeText,
        virtualMinutes: parseVirtualMinutesFrom(dateText, timeText),
    };
}`,
    `function getSystemClockFrom(system) {
    const dateText = typeof system?.当前日期 === 'string' ? system.当前日期 : undefined;
    const timeText = typeof system?.当前时间 === 'string' ? system.当前时间 : undefined;
    const dateOnlyText = dateText?.replace(/\\s*(?:星期|周)[一二三四五六日天]\\s*/g, '').trim();
    const explicitWeekday = dateText?.match(/星期[一二三四五六日天]/)?.[0] ?? dateText?.match(/周[一二三四五六日天]/)?.[0]?.replace('周', '星期');
    const parsedDate = dateText?.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*日/);
    const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const monthDays = { 1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
    const monthOrder = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    const schoolDay = (month, day) => {
        let total = 0;
        for (const item of monthOrder) {
            if (item === month)
                return total + day;
            total += monthDays[item] || 30;
        }
        return day;
    };
    const weekdayText = explicitWeekday || (parsedDate
        ? weekdayNames[((3 + schoolDay(Number(parsedDate[1]), Number(parsedDate[2])) - schoolDay(4, 9)) % 7 + 7) % 7]
        : undefined);
    const minutes = (() => {
        const match = String(timeText || '').match(/(\\d{1,2})\\s*[:：]\\s*(\\d{1,2})/);
        return match ? Number(match[1]) * 60 + Number(match[2]) : 12 * 60;
    })();
    const fmt = value => String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
    const weekdayIndex = { '星期日': 0, '星期天': 0, '星期一': 1, '星期二': 2, '星期三': 3, '星期四': 4, '星期五': 5, '星期六': 6 }[weekdayText ?? ''];
    const timetable = {
        1: ['现代文', '数学', '英语', '日本史', '体育（田径）', '家庭科'],
        2: ['古典', '化学', '数学', '英语', '美术', '班会'],
        3: ['英语', '世界史', '生物', '现代文', '体育（游泳）', '信息'],
        4: ['数学', '古典', '英语', '化学', '音乐', '保健'],
        5: ['现代文', '日本史', '生物', '英语', '体育（球技）', '综合探究'],
    };
    const periods = [
        { index: 1, start: 520, end: 570, label: '1限' },
        { index: 2, start: 580, end: 630, label: '2限' },
        { index: 3, start: 640, end: 690, label: '3限' },
        { index: 4, start: 700, end: 750, label: '4限' },
        { index: 5, start: 800, end: 850, label: '5限' },
        { index: 6, start: 860, end: 910, label: '6限' },
    ];
	    const currentMonth = parsedDate ? Number(parsedDate[1]) : 4;
	    const currentDay = parsedDate ? Number(parsedDate[2]) : 9;
	    const specialDays = [
	        { m: 4, d: 1, title: '愚人节' },
	        { m: 4, d: 8, title: '入学式/始业式' },
	        { m: 4, from: 10, to: 14, title: '社团招新周' },
	        { m: 4, d: 15, title: '社团说明会' },
	        { m: 4, d: 20, title: '身体检查' },
	        { m: 4, d: 29, title: '黄金周假期' },
	        { m: 5, from: 1, to: 6, title: '黄金周假期' },
	        { m: 5, from: 20, to: 23, title: '第一学期中考' },
	        { m: 5, d: 25, title: '球技大会' },
	        { m: 6, d: 10, title: '全校体力测验' },
	        { m: 6, d: 25, title: '学生会选举' },
	        { m: 6, d: 30, title: '夜间试胆大会' },
	        { m: 7, d: 7, title: '七夕' },
	        { m: 7, from: 14, to: 17, title: '第一学期末考' },
	        { m: 7, d: 21, title: '海之日' },
	        { m: 7, d: 22, title: '第一学期结业式' },
	        { m: 7, from: 23, to: 31, title: '暑假' },
	        { m: 7, from: 25, to: 28, title: '社团夏季合宿' },
	        { m: 8, from: 1, to: 31, title: '暑假' },
	        { m: 8, d: 1, title: '全校返校日' },
	        { m: 8, d: 11, title: '山之日' },
	        { m: 8, from: 13, to: 16, title: '盂兰盆节' },
	        { m: 8, from: 16, to: 17, title: '夏Comi' },
	        { m: 8, d: 25, title: '补习/作业冲刺' },
	        { m: 9, d: 1, title: '第二学期始业式' },
	        { m: 9, d: 15, title: '敬老之日' },
	        { m: 9, d: 16, title: '校庆准备' },
	        { m: 9, d: 23, title: '秋分之日' },
	        { m: 9, d: 29, title: '体育祭' },
	        { m: 10, d: 1, title: '衣更' },
	        { m: 10, d: 13, title: '运动之日' },
	        { m: 10, from: 21, to: 24, title: '第二学期中考' },
	        { m: 10, d: 31, title: '万圣节' },
	        { m: 11, from: 1, to: 2, title: '文化祭' },
	        { m: 11, d: 3, title: '文化之日/后夜祭' },
	        { m: 11, d: 23, title: '勤劳感谢日' },
	        { m: 11, d: 24, title: '振替休日' },
	        { m: 11, from: 25, to: 28, title: '修学旅行' },
	        { m: 12, from: 9, to: 12, title: '第二学期末考' },
	        { m: 12, d: 24, title: '第二学期结业式' },
	        { m: 12, from: 25, to: 31, title: '寒假' },
	        { m: 1, from: 1, to: 6, title: '寒假' },
	        { m: 1, d: 7, title: '第三学期始业式' },
	        { m: 1, d: 13, title: '成人之日' },
	        { m: 1, from: 17, to: 18, title: '大学入学共通测试' },
	        { m: 1, d: 25, title: '马拉松大会' },
	        { m: 2, d: 3, title: '节分' },
	        { m: 2, d: 11, title: '建国纪念日' },
	        { m: 2, d: 14, title: '情人节' },
	        { m: 2, d: 23, title: '天皇诞辰' },
	        { m: 2, d: 24, title: '振替休日' },
	        { m: 2, from: 25, to: 27, title: '学年末考试' },
	        { m: 3, d: 3, title: '女儿节' },
	        { m: 3, d: 14, title: '白色情人节' },
	        { m: 3, d: 20, title: '春分之日' },
	        { m: 3, d: 24, title: '修业式' },
	        { m: 3, from: 25, to: 31, title: '春假' },
	    ];
	    const specialDateStart = item => schoolDay(item.m, item.from ?? item.d);
	    const specialDateEnd = item => schoolDay(item.m, item.to ?? item.from ?? item.d);
	    const specialDateLabel = item => {
	        const start = item.from ?? item.d;
	        const end = item.to ?? start;
	        return start === end ? item.m + '月' + start + '日' : item.m + '月' + start + '-' + end + '日';
	    };
	    const currentOrNextSpecialDate = (() => {
	        const today = schoolDay(currentMonth, currentDay);
	        const nextSpecial = specialDays
	            .map(item => ({ item, start: specialDateStart(item), end: specialDateEnd(item) }))
	            .filter(item => item.end >= today)
	            .sort((a, b) => a.start - b.start || a.end - b.end)[0];
	        return nextSpecial ? specialDateLabel(nextSpecial.item) + ' ' + nextSpecial.item.title : '无';
	    })();
	    const weekdayForDate = (month, day) => weekdayNames[((3 + schoolDay(month, day) - schoolDay(4, 9)) % 7 + 7) % 7];
    const weekdayIndexForDate = (month, day) => ({ '星期日': 0, '星期天': 0, '星期一': 1, '星期二': 2, '星期三': 3, '星期四': 4, '星期五': 5, '星期六': 6 }[weekdayForDate(month, day)] ?? 0);
    const nextDate = (month, day) => {
        const maxDay = monthDays[month] || 30;
        if (day < maxDay)
            return { month, day: day + 1 };
        const nextMonth = monthOrder[(monthOrder.indexOf(month) + 1) % monthOrder.length] || (month % 12) + 1;
        return { month: nextMonth, day: 1 };
    };
    const courseRowsForDate = (month, day) => {
        const index = weekdayIndexForDate(month, day);
        if (index === 0 || index === 6)
            return [];
        return periods.map(period => ({
            课节: period.label,
            时间: fmt(period.start) + '-' + fmt(period.end),
            科目: timetable[index]?.[period.index - 1] || '自习',
        }));
    };
    const firstClassForDate = (month, day) => {
        const index = weekdayIndexForDate(month, day);
        const weekday = weekdayForDate(month, day);
        if (index === 0 || index === 6)
            return { 日期: month + '月' + day + '日', 星期: weekday, 课节: '无', 时间: '', 科目: '无固定课程' };
        return { 日期: month + '月' + day + '日', 星期: weekday, 课节: '1限', 时间: fmt(periods[0].start) + '-' + fmt(periods[0].end), 科目: timetable[index]?.[0] || '自习' };
    };
    const course = periods.find(period => minutes >= period.start && minutes < period.end);
    const courseSlot = (() => {
        if (weekdayIndex === 0 || weekdayIndex === 6)
            return { title: '无', detail: '' };
	        if (course) {
	            const subject = timetable[weekdayIndex]?.[course.index - 1] || '自习';
	            return { title: course.label + ' ' + subject, detail: fmt(course.start) + '-' + fmt(course.end) };
	        }
	        return { title: '无', detail: '' };
	    })();
    const fallbackSlot = (() => {
        if (weekdayIndex === 0 || weekdayIndex === 6)
            return { title: '周末自由', detail: '无固定课程' };
        if (minutes >= 510 && minutes < 520)
            return { title: '朝礼', detail: '08:30-08:40' };
        if (course) {
            const subject = timetable[weekdayIndex]?.[course.index - 1] || '自习';
            return { title: course.label + ' · ' + subject, detail: fmt(course.start) + '-' + fmt(course.end) };
        }
        if (minutes >= 750 && minutes < 800)
            return { title: '午休', detail: '12:30-13:20' };
        if (minutes >= 910 && minutes < 925)
            return { title: '终礼', detail: '15:10-15:25' };
        if (minutes >= 925 && minutes < 940)
            return { title: '清扫时间', detail: '15:25-15:40' };
        if (minutes >= 945)
            return { title: '放学后', detail: '15:45-' };
        if (minutes < 510)
            return { title: '上学前', detail: '08:30前' };
        return { title: '课间', detail: '移动/准备' };
    })();
    const scheduleText = fallbackSlot.title;
    const scheduleDetailText = fallbackSlot.detail;
    const tomorrow = nextDate(currentMonth, currentDay);
    const dailySchedule = {
        日期: currentMonth + '月' + currentDay + '日',
        星期: weekdayText || weekdayForDate(currentMonth, currentDay),
        当前课段: { 名称: scheduleText, 时间: scheduleDetailText },
	        当前或待上课程: courseSlot.title,
	        当前或下个特殊日期: currentOrNextSpecialDate,
	        课表: courseRowsForDate(currentMonth, currentDay),
        次日第一节: firstClassForDate(tomorrow.month, tomorrow.day),
    };
    return {
        dateText,
        dateOnlyText,
        timeText,
        weekdayText,
        scheduleText,
        scheduleDetailText,
        courseText: courseSlot.title,
        dailySchedule,
        virtualMinutes: parseVirtualMinutesFrom(dateText, timeText),
    };
}`
  );
  output = output.replace("    VIP6: 1000,\n", "");
  output = output.replace(
    "    sessionEndAtMs: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().optional(),",
    `    sessionEndAtMs: zod__WEBPACK_IMPORTED_MODULE_0__.z.coerce.number().optional(),
    sessionSummary: zod__WEBPACK_IMPORTED_MODULE_0__.z.any().optional(),
    sessionContent: zod__WEBPACK_IMPORTED_MODULE_0__.z.any().optional(),
    activeSessionSummary: zod__WEBPACK_IMPORTED_MODULE_0__.z.any().optional(),
    activeSessionContent: zod__WEBPACK_IMPORTED_MODULE_0__.z.any().optional(),
    sessionFeatures: zod__WEBPACK_IMPORTED_MODULE_0__.z.any().optional(),
    activeSessionFeatures: zod__WEBPACK_IMPORTED_MODULE_0__.z.any().optional(),`
  );
  output = output.replace(
    "const CHAT_OPTION = { type: 'chat' };",
    `const CHAT_OPTION = { type: 'chat' };
function isPlainVariableObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isMeaningfulHypnosisEffect(value) {
    if (value === null || value === undefined || value === false)
        return false;
    if (Array.isArray(value))
        return value.some(isMeaningfulHypnosisEffect);
    if (isPlainVariableObject(value))
        return Object.keys(value).length > 0 && Object.values(value).some(isMeaningfulHypnosisEffect);
    const text = String(value).trim();
    return Boolean(text && !/^(无|暂无|none|null|undefined|\\{\\}|\\[\\])$/i.test(text));
}
function hasActiveTemporaryHypnosisEffect(roles) {
    if (!isPlainVariableObject(roles))
        return false;
    for (const role of Object.values(roles)) {
        if (!isPlainVariableObject(role))
            continue;
        if (isMeaningfulHypnosisEffect(role['临时催眠效果']))
            return true;
    }
    return false;
}
function scoreStatDataCandidate(value) {
    if (!isPlainVariableObject(value))
        return -1;
    let score = 0;
    const system = value['系统'];
    const roles = value['角色'];
    const achievements = value['成就'];
    const tasks = value['任务'];
    if (isPlainVariableObject(system)) {
        score += 20;
        if (system['当前日期'] != null)
            score += 5;
        if (system['当前时间'] != null)
            score += 5;
        if (system['当前日程'] != null)
            score += 3;
        if (system['持有零花钱'] != null)
            score += 5;
        const store = isPlainVariableObject(system['hypnoos']) ? system['hypnoos'] : system['_hypnoos'];
        if (isPlainVariableObject(store))
            score += 3 + Object.keys(store).length;
    }
    if (isPlainVariableObject(roles))
        score += 30 + Object.keys(roles).length * 5;
    if (isPlainVariableObject(achievements))
        score += 4 + Object.keys(achievements).length;
    if (isPlainVariableObject(tasks))
        score += 8 + Object.keys(tasks).length;
    return score;
}
function getFrontendVariableOptions() {
    const currentOption = getCurrentVariableOption();
    return dedupeVariableOptions([currentOption, { type: 'message', message_id: 'latest' }, CHAT_OPTION]);
}
function getFallbackVariableOptions() {
    return dedupeVariableOptions([{ type: 'message', message_id: 'latest' }, CHAT_OPTION]);
}
function getCurrentVariableOption() {
    const currentMessageId = getCurrentMessageIdSafe();
    return currentMessageId !== null && currentMessageId !== 'latest'
        ? { type: 'message', message_id: currentMessageId }
        : null;
}
function getCurrentMessageIdSafe() {
    try {
        const currentMessageId = getCurrentMessageId();
        if (currentMessageId !== undefined && currentMessageId !== null && currentMessageId !== 'latest')
            return currentMessageId;
    }
    catch {
        // ignore
    }
    return null;
}
function getLatestMessageIdSafe() {
    try {
        if (typeof getChatMessages !== 'function')
            return null;
        const messages = getChatMessages(-1);
        if (!Array.isArray(messages) || messages.length === 0)
            return null;
        const latest = messages[messages.length - 1];
        const explicitId = latest?.message_id ?? latest?.mesid ?? latest?.id;
        return explicitId ?? messages.length - 1;
    }
    catch {
        return null;
    }
}
function shouldPreferCurrentMessageSnapshot() {
    return Boolean(getCurrentVariableOption());
}
function isUsableStatDataSnapshot(value) {
    if (!isPlainVariableObject(value))
        return false;
    const system = value['系统'];
    const roles = value['角色'];
    return isPlainVariableObject(system) || (isPlainVariableObject(roles) && Object.keys(roles).length > 0);
}
function unwrapStatDataSnapshot(value) {
    if (isPlainVariableObject(value?.stat_data))
        return value.stat_data;
    return value;
}
function dedupeVariableOptions(options) {
    const seen = new Set();
    const result = [];
    for (const option of options) {
        if (!option)
            continue;
        const key = option.type + ':' + String(option.message_id ?? '');
        if (seen.has(key))
            continue;
        seen.add(key);
        result.push(option);
    }
    return result;
}
function pickBestVariableSnapshot(candidates) {
    let best = null;
    for (const candidate of candidates) {
        const score = scoreStatDataCandidate(candidate);
        if (score < 0)
            continue;
        if (!best || score > best.score)
            best = { candidate, score };
    }
    return best?.candidate ?? null;
}
function getVariableSnapshotsForOptionsSync(options, includeImplicit = false) {
    const candidates = [];
    for (const option of options) {
        try {
            const mvu = globalThis.Mvu?.getMvuData?.(option);
            const root = unwrapStatDataSnapshot(mvu);
            if (mvu && typeof mvu.then !== 'function' && isPlainVariableObject(root))
                candidates.push(root);
        }
        catch {
            // ignore unavailable option
        }
    }
    for (const option of options) {
        try {
            const vars = typeof getVariables === 'function' ? getVariables(option) : null;
            const root = unwrapStatDataSnapshot(vars);
            if (isPlainVariableObject(root))
                candidates.push(root);
        }
        catch {
            // ignore unavailable option
        }
    }
    if (includeImplicit) {
        try {
            const vars = typeof getVariables === 'function' ? getVariables() : null;
            const root = unwrapStatDataSnapshot(vars);
            if (isPlainVariableObject(root))
                candidates.push(root);
        }
        catch {
            // ignore
        }
        try {
            const mvu = globalThis.Mvu?.getMvuData?.();
            const root = unwrapStatDataSnapshot(mvu);
            if (mvu && typeof mvu.then !== 'function' && isPlainVariableObject(root))
                candidates.push(root);
        }
        catch {
            // ignore
        }
    }
    const seen = new Set();
    return candidates.filter(candidate => {
        if (!isPlainVariableObject(candidate))
            return false;
        const key = [
            candidate['系统']?.['当前日期'] ?? '',
            candidate['系统']?.['当前时间'] ?? '',
            candidate['系统']?.['MC能量'] ?? candidate['系统']?.['_MC能量'] ?? '',
            candidate['系统']?.['持有零花钱'] ?? '',
            Object.keys(candidate['角色'] ?? {}).join(','),
            Object.keys(candidate['成就'] ?? {}).join(','),
            Object.keys(candidate['任务'] ?? {}).join(','),
        ].join('\\u0001');
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function getVariableSnapshotsSync() {
    const currentOption = getCurrentVariableOption();
    if (currentOption) {
        const current = getVariableSnapshotsForOptionsSync([currentOption], false);
        if (current.some(isUsableStatDataSnapshot))
            return current;
    }
    return getVariableSnapshotsForOptionsSync(getFallbackVariableOptions(), true);
}
function getLatestVariablesSync() {
    return pickBestVariableSnapshot(getVariableSnapshotsSync()) ?? {};
}
function getLatestChatVariables() {
    return normalizeChatVariables(getLatestVariablesSync());
}
const FRONTEND_REWARD_STATE_VERSION = 3;
let frontendRewardVariableSyncSignature = '';
function frontendRewardStateScope() {
    try {
        const chatId = globalThis.SillyTavern?.getCurrentChatId?.();
        if (chatId !== undefined && chatId !== null && String(chatId).trim())
            return String(chatId).trim();
    }
    catch {
        // ignore
    }
    try {
        const context = typeof getContext === 'function' ? getContext() : null;
        const chatId = context?.chatId ?? context?.chat?.id ?? context?.characterId ?? context?.name2;
        if (chatId !== undefined && chatId !== null && String(chatId).trim())
            return String(chatId).trim();
    }
    catch {
        // ignore
    }
    return 'global';
}
function frontendRewardStateKey() {
    return 'hypnoos.frontend-rewards.v1:' + frontendRewardStateScope();
}
function normalizeFrontendRewardState(input) {
    const base = { version: FRONTEND_REWARD_STATE_VERSION, achievements: {}, achievementNames: {}, quests: {}, questNames: {}, dynamicAchievements: {}, dynamicQuests: {} };
    if (!input || typeof input !== 'object')
        return base;
    for (const key of ['achievements', 'achievementNames', 'quests', 'questNames']) {
        const source = input[key];
        if (!source || typeof source !== 'object')
            continue;
        for (const [id, value] of Object.entries(source)) {
            if (value)
                base[key][String(id)] = true;
        }
    }
    for (const [key, normalizer] of Object.entries({ dynamicAchievements: normalizeStoredAchievementRecord, dynamicQuests: normalizeStoredQuestRecord })) {
        const source = input[key];
        if (!source || typeof source !== 'object')
            continue;
        for (const [id, value] of Object.entries(source)) {
            const record = normalizer(value, id);
            const recordId = String(record.id ?? id ?? '').trim();
            if (recordId)
                base[key][recordId] = record;
        }
    }
    return base;
}
const frontendRewardMemoryState = normalizeFrontendRewardState(null);
function writeFrontendRewardState(state) {
    const normalized = normalizeFrontendRewardState(state);
    for (const key of Object.keys(frontendRewardMemoryState))
        delete frontendRewardMemoryState[key];
    Object.assign(frontendRewardMemoryState, normalized);
}
function readFrontendRewardStateRaw() {
    return normalizeFrontendRewardState(frontendRewardMemoryState);
}
function firstNonEmptyText(...values) {
    for (const value of values) {
        const text = String(value ?? '').trim();
        if (text)
            return text;
    }
    return '';
}
function toMoneyNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}
function normalizeStoredAchievementRecord(value, fallbackKey = '') {
    const raw = isPlainVariableObject(value) ? value : {};
    const title = firstNonEmptyText(raw.成就, raw.名称, raw.title, raw.name, fallbackKey);
    const id = firstNonEmptyText(raw.成就ID, raw.id, raw.ID, title, fallbackKey);
    return {
        id,
        title,
        description: firstNonEmptyText(raw.条件, raw.完成条件, raw.description, raw.desc),
        rewardMoney: toMoneyNumber(raw.奖励金钱 ?? raw.奖励零花钱 ?? raw.rewardMoney),
        isClaimed: true,
        source: 'variable',
    };
}
function normalizeStoredQuestRecord(value, fallbackKey = '') {
    const raw = isPlainVariableObject(value) ? value : {};
    const title = firstNonEmptyText(raw.任务, raw.名称, raw.title, raw.name, fallbackKey);
    const id = firstNonEmptyText(raw.任务ID, raw.id, raw.ID, title, fallbackKey);
    return {
        id,
        title,
        description: firstNonEmptyText(raw.完成条件, raw.条件, raw.description, raw.desc),
        rewardMoney: toMoneyNumber(raw.奖励金钱 ?? raw.奖励零花钱 ?? raw.rewardMoney),
        status: 'COMPLETED',
        source: 'variable',
    };
}
function coerceRewardVariableRecord(item) {
    const raw = isPlainVariableObject(item?.value) ? item.value : {};
    return { ...raw, key: item?.key };
}
function looksLikeAchievementRecord(value) {
    if (!isPlainVariableObject(value))
        return false;
    if (value.成就 != null || value.成就ID != null)
        return true;
    if (value.任务 != null || value.任务ID != null)
        return false;
    return false;
}
function looksLikeQuestRecord(value) {
    if (!isPlainVariableObject(value))
        return false;
    if (value.任务 != null || value.任务ID != null || value.完成条件 != null)
        return true;
    if (value.成就 != null || value.成就ID != null)
        return false;
    return false;
}
function markStoredAchievement(state, record) {
    const normalized = normalizeStoredAchievementRecord(record, record?.key);
    if (normalized.id)
        state.achievements[normalized.id] = true;
    if (normalized.title) {
        state.achievements[normalized.title] = true;
        state.achievementNames[normalized.title] = true;
    }
}
function markStoredQuest(state, record) {
    const normalized = normalizeStoredQuestRecord(record, record?.key);
    if (normalized.id)
        state.quests[normalized.id] = true;
    if (normalized.title) {
        state.quests[normalized.title] = true;
        state.questNames[normalized.title] = true;
    }
    if (normalized.id)
        state.dynamicQuests[normalized.id] = normalized;
}
function isFrontendAchievementClaimed(state, achievement) {
    const id = String(achievement?.id ?? '').trim();
    const title = String(achievement?.title ?? achievement?.name ?? '').trim();
    return Boolean((id && state.achievements[id]) || (title && (state.achievements[title] || state.achievementNames[title])));
}
function isFrontendQuestClaimed(state, quest) {
    const id = String(quest?.id ?? '').trim();
    const title = String(quest?.title ?? quest?.name ?? '').trim();
    return Boolean((id && state.quests[id]) || (title && (state.quests[title] || state.questNames[title])));
}
function isCompletedFrontendRewardRecord(value) {
    if (value === true)
        return true;
    if (!isPlainVariableObject(value))
        return false;
    const done = value.已完成 ?? value.completed ?? value.isCompleted ?? value.status ?? value.状态;
    if (done === true)
        return true;
    const text = String(done ?? '').trim().toUpperCase();
    return ['已完成', '完成', 'COMPLETED', 'CLAIMED', '已领取'].includes(text);
}
function collectCompletedFrontendRewardVariables(variables) {
    const achievements = [];
    const quests = [];
    const achievementVars = variables['成就'];
    if (isPlainVariableObject(achievementVars)) {
        for (const [key, value] of Object.entries(achievementVars)) {
            if (isCompletedFrontendRewardRecord(value) && looksLikeAchievementRecord(value))
                achievements.push({ key, value });
        }
    }
    const taskVars = variables['任务'];
    if (isPlainVariableObject(taskVars)) {
        for (const [key, value] of Object.entries(taskVars)) {
            if (isCompletedFrontendRewardRecord(value) && looksLikeQuestRecord(value))
                quests.push({ key, value });
        }
    }
    return { achievements, quests };
}
function frontendRewardVariableSignature(records) {
    if (records.achievements.length === 0 && records.quests.length === 0)
        return '';
    return JSON.stringify({
        achievements: records.achievements.map(item => [item.key, normalizeStoredAchievementRecord(item.value, item.key)]),
        quests: records.quests.map(item => [item.key, normalizeStoredQuestRecord(item.value, item.key)]),
    });
}
function isLatestFrontendRewardLayer() {
    const current = getCurrentMessageIdSafe();
    if (current === null)
        return true;
    const latest = getLatestMessageIdSafe();
    return latest === null || String(current) === String(latest);
}
function clearCompletedFrontendRewardVariables(records) {
    const achievementKeys = records.achievements.map(item => item.key);
    const questKeys = records.quests.map(item => item.key);
    if (achievementKeys.length === 0 && questKeys.length === 0)
        return;
    const clearWith = (option) => updateVariablesWith(vars => {
        const root = isPlainVariableObject(vars?.stat_data) ? vars.stat_data : vars;
        if (!isPlainVariableObject(root))
            return vars;
        if (isPlainVariableObject(root['成就'])) {
            for (const key of achievementKeys)
                delete root['成就'][key];
        }
        if (isPlainVariableObject(root['任务'])) {
            for (const key of questKeys)
                delete root['任务'][key];
        }
        if (isPlainVariableObject(vars?.stat_data))
            vars.stat_data = root;
        return vars;
    }, option);
    for (const option of getFrontendVariableOptions()) {
        try {
            clearWith(option);
        }
        catch (err) {
            console.warn('[HypnoOS] 清理已同步任务/成就变量失败', err);
        }
    }
    try {
        updateVariablesWith(vars => {
            const root = isPlainVariableObject(vars?.stat_data) ? vars.stat_data : vars;
            if (!isPlainVariableObject(root))
                return vars;
            if (isPlainVariableObject(root['成就'])) {
                for (const key of achievementKeys)
                    delete root['成就'][key];
            }
            if (isPlainVariableObject(root['任务'])) {
                for (const key of questKeys)
                    delete root['任务'][key];
            }
            if (isPlainVariableObject(vars?.stat_data))
                vars.stat_data = root;
            return vars;
        }, CHAT_OPTION);
    }
    catch (err) {
        console.warn('[HypnoOS] 清理已同步任务/成就变量失败', err);
    }
}
function syncFrontendRewardStateFromVariables() {
    try {
        if (!isLatestFrontendRewardLayer())
            return;
        const variables = getLatestVariablesSync();
        if (!isPlainVariableObject(variables))
            return;
        const records = collectCompletedFrontendRewardVariables(variables);
        const signature = frontendRewardVariableSignature(records);
        if (!signature)
            return;
        const alreadySyncedInMemory = signature === frontendRewardVariableSyncSignature;
        frontendRewardVariableSyncSignature = signature;
        const state = readFrontendRewardStateRaw();
        for (const item of records.achievements)
            markStoredAchievement(state, coerceRewardVariableRecord(item));
        for (const item of records.quests)
            markStoredQuest(state, coerceRewardVariableRecord(item));
        writeFrontendRewardState(state);
        if (!alreadySyncedInMemory) {
            try {
                window.dispatchEvent(new CustomEvent('HYPNOOS_REWARD_STATE_CHANGED', { detail: { signature } }));
            }
            catch {
                // ignore
            }
        }
        if (!alreadySyncedInMemory)
            clearCompletedFrontendRewardVariables(records);
    }
    catch (err) {
        console.warn('[HypnoOS] 同步任务/成就状态失败', err);
    }
}
function readFrontendRewardState() {
    syncFrontendRewardStateFromVariables();
    return readFrontendRewardStateRaw();
}`
  );
  output = output.replace(
    `function normalizeSystemAliases(systemRaw) {
    const existingEnergy = toFiniteNumber(systemRaw._MC能量);
    if (existingEnergy === null) {
        const mcEnergy = toFiniteNumber(systemRaw.MC能量);
        if (mcEnergy !== null)
            systemRaw._MC能量 = mcEnergy;
    }
    const existingEnergyMax = toFiniteNumber(systemRaw._MC能量上限);
    if (existingEnergyMax === null) {
        const mcEnergyMax = toFiniteNumber(systemRaw.MC能量上限);
        if (mcEnergyMax !== null)
            systemRaw._MC能量上限 = mcEnergyMax;
    }
    return systemRaw;
}`,
    `const USER_RESOURCE_ALIASES = {
    mcEnergy: ['MC能量', '_MC能量', '当前MC能量', 'MC能量值', '当前能量', '能量', 'mcEnergy'],
    mcEnergyMax: ['MC能量上限', '_MC能量上限', '当前MC能量上限', '最大MC能量', 'MC最大能量', '能量上限', 'mcEnergyMax'],
    money: ['持有零花钱', '零花钱', '持有金钱', '持有资金', '当前资金', '资金', '金钱', 'money'],
    suspicion: ['主角可疑度', '可疑度', '当前可疑度', '_可疑度', 'suspicion'],
};
const USER_RESOURCE_CANONICAL_KEYS = {
    mcEnergy: 'MC能量',
    mcEnergyMax: 'MC能量上限',
    money: '持有零花钱',
    suspicion: '主角可疑度',
};
function readSystemAliasNumber(systemRaw, keys) {
    if (!isPlainVariableObject(systemRaw))
        return null;
    for (const key of keys) {
        if (!Object.prototype.hasOwnProperty.call(systemRaw, key))
            continue;
        const value = toFiniteNumber(systemRaw[key]);
        if (value !== null)
            return value;
    }
    return null;
}
function readExplicitUserResourcePatch(systemRaw) {
    if (!isPlainVariableObject(systemRaw))
        return null;
    const patch = {};
    for (const [field, keys] of Object.entries(USER_RESOURCE_ALIASES)) {
        const value = readSystemAliasNumber(systemRaw, keys);
        if (value !== null)
            patch[field] = value;
    }
    return Object.keys(patch).length > 0 ? patch : null;
}
function normalizeSystemAliases(systemRaw) {
    const system = isPlainVariableObject(systemRaw) ? systemRaw : {};
    for (const [field, keys] of Object.entries(USER_RESOURCE_ALIASES)) {
        const canonicalKey = USER_RESOURCE_CANONICAL_KEYS[field];
        if (toFiniteNumber(system[canonicalKey]) !== null)
            continue;
        const value = readSystemAliasNumber(system, keys);
        if (value !== null)
            system[canonicalKey] = value;
    }
    return system;
}`
  );
  output = output.replace(
    `function systemToUserResources(system) {
    return {
        mcEnergy: system._MC能量,
        mcEnergyMax: system._MC能量上限,
        money: system.持有零花钱,
        suspicion: system.主角可疑度,
    };
}`,
    `function systemToUserResources(system) {
    return {
        mcEnergy: system.MC能量,
        mcEnergyMax: system.MC能量上限,
        money: system.持有零花钱,
        suspicion: system.主角可疑度,
    };
}
function chooseUserResourcesFromSystems(systems) {
    const user = { ...DEFAULT_USER_DATA };
    const seenFields = new Set();
    for (const systemRaw of systems) {
        const patch = readExplicitUserResourcePatch(systemRaw);
        if (!patch)
            continue;
        for (const [field, value] of Object.entries(patch)) {
            if (seenFields.has(field) && user[field] !== DEFAULT_USER_DATA[field])
                continue;
            user[field] = value;
            seenFields.add(field);
        }
    }
    if (seenFields.size > 0)
        return user;
    for (const systemRaw of systems) {
        if (!isPlainVariableObject(systemRaw))
            continue;
        return systemToUserResources(SYSTEM_SCHEMA.parse(normalizeSystemAliases({ ...systemRaw })));
    }
    return null;
}`
  );
  output = replaceBetween(
    output,
    "    getUserData: async () => {",
    "    getSessionEnd: async () => {",
    `    getUserData: async () => {
        const systems = [];
        let activeTemporaryHypnosis = false;
        let hasRoleSnapshot = false;
        try {
            const snapshots = getVariableSnapshotsSync();
            for (const snapshot of snapshots) {
                if (isPlainVariableObject(snapshot?.系统))
                    systems.push(snapshot.系统);
                if (isPlainVariableObject(snapshot?.角色)) {
                    hasRoleSnapshot = true;
                    activeTemporaryHypnosis = activeTemporaryHypnosis || hasActiveTemporaryHypnosisEffect(snapshot.角色);
                }
            }
        }
        catch (err) {
            console.warn('[HypnoOS] 收集聊天系统变量失败，使用可用资源', err);
        }
        try {
            const mvuSystem = await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getSystem();
            if (isPlainVariableObject(mvuSystem))
                systems.push(mvuSystem);
        }
        catch (err) {
            console.warn('[HypnoOS] 读取 MVU 系统变量失败，使用可用资源', err);
        }
        if (!hasRoleSnapshot) {
            try {
                activeTemporaryHypnosis = hasActiveTemporaryHypnosisEffect(await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getRoles());
            }
            catch (err) {
                console.warn('[HypnoOS] 读取 MVU 角色临时催眠效果失败，使用聊天快照', err);
            }
        }
        const user = chooseUserResourcesFromSystems(systems);
        return { ...(user ?? DEFAULT_USER_DATA), activeTemporaryHypnosis };
    },
    getSystemClock: async () => {
        const maybeSync = async (clock) => {
            try {
                if (clock.dailySchedule)
                    await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.syncDailySchedule(clock.dailySchedule);
            }
            catch (err) {
                console.warn('[HypnoOS] 同步当天课程表变量失败', err);
            }
            return clock;
        };
        const systems = [];
        try {
            for (const snapshot of getVariableSnapshotsSync()) {
                if (isPlainVariableObject(snapshot?.系统))
                    systems.push(snapshot.系统);
            }
        }
        catch (err) {
            console.warn('[HypnoOS] 收集聊天系统时间失败，使用可用时间', err);
        }
        try {
            const mvuSystem = await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getSystem();
            if (isPlainVariableObject(mvuSystem))
                systems.push(mvuSystem);
        }
        catch (err) {
            console.warn('[HypnoOS] 读取 MVU 系统时间失败，使用可用时间', err);
        }
        let fallbackClock = null;
        for (const system of systems) {
            if (!isPlainVariableObject(system))
                continue;
            if (system['当前日期'] == null && system['当前时间'] == null && system['当前日程'] == null)
                continue;
            const clock = getSystemClockFrom(system);
            fallbackClock ??= clock;
            if (clock.dateText !== '4月9日 星期三' || clock.timeText !== '12:00' || clock.scheduleText !== '4限 · 现代文')
                return await maybeSync(clock);
        }
        return await maybeSync(fallbackClock ?? getSystemClockFrom({}));
    },`
  );
  output = output.replace(
    `    updateResources: async (newData) => {
        const merged = { ...(await DataService.getUserData()), ...newData };
        updateVariablesWith(vars => {
            const { system, store } = normalizeChatVariables(vars);
            system._MC能量 = merged.mcEnergy;
            system._MC能量上限 = merged.mcEnergyMax;
            system.持有零花钱 = merged.money;
            system.主角可疑度 = merged.suspicion;
            system._hypnoos = store;
            vars.系统 = system;
            return vars;
        }, CHAT_OPTION);
        await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.syncUserResources(merged);
        return merged;
    },`,
    `    updateResources: async (newData) => {
        // The frontend may optimistically calculate a preview, but AI is the only writer of persistent variables.
        return { ...(await DataService.getUserData()), ...newData };
    },`
  );
  output = output.replace(
    `    getSessionEnd: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const endVirtualMinutes = typeof store.sessionEndVirtualMinutes === 'number' && Number.isFinite(store.sessionEndVirtualMinutes)
            ? store.sessionEndVirtualMinutes
            : null;
        const endAtMs = typeof store.sessionEndAtMs === 'number' && Number.isFinite(store.sessionEndAtMs) ? store.sessionEndAtMs : null;
        return { endVirtualMinutes, endAtMs };
    },`,
    `    getSessionEnd: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const endVirtualMinutes = typeof store.sessionEndVirtualMinutes === 'number' && Number.isFinite(store.sessionEndVirtualMinutes)
            ? store.sessionEndVirtualMinutes
            : null;
        const endAtMs = typeof store.sessionEndAtMs === 'number' && Number.isFinite(store.sessionEndAtMs) ? store.sessionEndAtMs : null;
        const isPermanentText = (value) => /永久|permanent/i.test(String(value ?? ''));
        const summarizeSessionValue = (value) => {
            if (value == null || value === '')
                return '';
            if (Array.isArray(value)) {
                return value.map(item => summarizeSessionValue(item)).filter(Boolean).join(' / ');
            }
            if (typeof value === 'object') {
                const title = value.title ?? value.name ?? value.feature ?? value.featureName ?? value['功能'] ?? value['名称'] ?? '';
                const note = value.note ?? value.userNote ?? value.summary ?? value.description ?? value['备注'] ?? value['描述'] ?? '';
                const combined = [title, note].filter(Boolean).join('：');
                return combined && !isPermanentText(combined) ? combined : '';
            }
            return String(value)
                .split(/[\\n,，;；、\\/]+/)
                .map(text => text.trim())
                .filter(text => text && !isPermanentText(text))
                .join(' / ');
        };
        const sessionSummary = [
            store.sessionSummary,
            store.sessionContent,
            store.activeSessionSummary,
            store.activeSessionContent,
            store.sessionFeatures,
            store.activeSessionFeatures,
        ].map(summarizeSessionValue).filter(Boolean)[0] ?? '';
        return { endVirtualMinutes, endAtMs, sessionSummary };
    },`
  );
  output = output.replace(
    `            purchaseRequired: isPurchaseRequired(f),
            purchasePricePoints: getPurchasePricePoints(f) ?? undefined,
            isPurchased: !isPurchaseRequired(f) || Boolean(store.purchases?.[f.id]),`,
    `            purchaseRequired: false,
            purchasePricePoints: undefined,
            isPurchased: true,`
  );
  output = output.replace(
    `    getAchievements: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const dynamic = await buildRoleBasedAchievements(store);
        const all = [...STATIC_ACHIEVEMENTS, ...dynamic];
        return all.map(a => ({ ...a, isClaimed: store.achievements[a.id] ?? false }));
    },`,
    `    getAchievements: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const frontendState = readFrontendRewardState();
        const dynamic = await buildRoleBasedAchievements(store);
        const all = [...STATIC_ACHIEVEMENTS, ...dynamic];
        const known = new Set();
        const mapped = all.map(a => {
            const id = String(a.id ?? '').trim();
            const title = String(a.title ?? a.name ?? '').trim();
            if (id)
                known.add(id);
            if (title)
                known.add(title);
            return ({
            ...a,
            isClaimed: Boolean(store.achievements[a.id] ?? false) || isFrontendAchievementClaimed(frontendState, a),
        });
        });
	        return mapped.filter(a => !a.isClaimed);
    },`
  );
  output = output.replace(
    `    getQuests: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const claimed = store.quests ?? {};
        const tasks = (await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getTasks().catch(() => null)) ?? {};
        const quests = QUEST_DATABASE.map(q => {
            const locked = claimed[q.id] === 'CLAIMED';
            if (locked) {
                return {
                    id: q.id,
                    title: q.name,
                    description: q.condition,
	                rewardMoney: q.rewardMoney,
                    status: 'CLAIMED',
                };
            }
            const taskState = tasks[q.name];
            const completed = Boolean(taskState && typeof taskState === 'object' && taskState.已完成 === true);
            const active = Boolean(taskState && typeof taskState === 'object' && typeof taskState.已完成 === 'boolean');
            return {
                id: q.id,
                title: q.name,
                description: q.condition,
	                rewardMoney: q.rewardMoney,
                status: completed
                    ? 'COMPLETED'
                    : active
                        ? 'ACTIVE'
                        : 'AVAILABLE',
            };
        });
        const order = { COMPLETED: 0, ACTIVE: 1, AVAILABLE: 2, CLAIMED: 3 };
        quests.sort((a, b) => order[a.status] - order[b.status]);
        return quests;
    },`,
    `    getQuests: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const frontendState = readFrontendRewardState();
        const claimed = store.quests ?? {};
        const tasks = (await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getTasks().catch(() => null)) ?? {};
        const seenTaskNames = new Set();
        const seenQuestKeys = new Set();
        const quests = QUEST_DATABASE.map(q => {
            seenQuestKeys.add(String(q.id ?? '').trim());
            seenQuestKeys.add(String(q.name ?? '').trim());
            const taskState = tasks[q.name];
            if (taskState && typeof taskState === 'object')
                seenTaskNames.add(q.name);
            const completed = Boolean(taskState && typeof taskState === 'object' && taskState.已完成 === true);
            const active = Boolean(taskState && typeof taskState === 'object' && typeof taskState.已完成 === 'boolean');
            const claimedDone = claimed[q.id] === 'CLAIMED' || isFrontendQuestClaimed(frontendState, q);
            return {
                id: q.id,
                title: q.name,
                description: q.condition,
	                rewardMoney: q.rewardMoney,
                status: claimedDone || completed
                    ? 'CLAIMED'
                    : active
                        ? 'ACTIVE'
                        : 'AVAILABLE',
            };
        });
        for (const [name, taskState] of Object.entries(tasks)) {
            if (seenTaskNames.has(name))
                continue;
            if (!taskState || typeof taskState !== 'object' || typeof taskState.已完成 !== 'boolean')
                continue;
            quests.push({
                id: \`dynamic:\${name}\`,
                title: name,
                description: String(taskState.完成条件 ?? ''),
	                rewardMoney: Number(taskState.奖励金钱 ?? taskState.奖励零花钱 ?? taskState.rewardMoney ?? 0) || 0,
                status: taskState.已完成 === true ? 'CLAIMED' : 'ACTIVE',
            });
            seenQuestKeys.add(\`dynamic:\${name}\`);
            seenQuestKeys.add(String(name));
        }
        const order = { ACTIVE: 0, AVAILABLE: 1, CLAIMED: 2, COMPLETED: 2 };
        quests.sort((a, b) => order[a.status] - order[b.status]);
        return quests.filter(q => q.status !== 'CLAIMED' && q.status !== 'COMPLETED');
    },`
  );
  output = output.replace(
    "const PERSISTENT_FEATURE_IDS = new Set([]);\nconst SUBSCRIPTION_TIER_TRIAL_LABEL = '试用期';",
    `const PERSISTENT_FEATURE_IDS = new Set([]);
const SUBSCRIPTION_TIER_TRIAL_LABEL = '试用期';
function normalizeSubscriptionTierValue(value) {
    const raw = String(value ?? '').trim();
    if (!raw || raw === SUBSCRIPTION_TIER_TRIAL_LABEL || /试用|未订阅|TRIAL/i.test(raw))
        return null;
    const compact = raw.toUpperCase().replace(/\\s+/g, '').replace(/[（）()]/g, '');
    const match = compact.match(/VIP([1-5])/);
    return match ? \`VIP\${match[1]}\` : null;
}
function readSystemSubscriptionTier(system) {
    if (!isPlainVariableObject(system))
        return null;
    return normalizeSubscriptionTierValue(system.催眠APP订阅等级 ?? system._催眠APP订阅等级 ?? system.VIP等级 ?? system.订阅等级);
}
function systemSubscriptionToStore(system) {
    const tier = readSystemSubscriptionTier(system);
    if (!tier)
        return null;
    return { tier, endVirtualMinutes: 999999999, autoRenew: false, source: 'system' };
}
function getEffectiveSubscription(store, system) {
    return systemSubscriptionToStore(system) ?? store?.subscription ?? null;
}`
  );
  output = output.replace(
    `        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        const debugEnabled = Boolean(store.debugEnabled);
        const nowVirtualMinutes = (await DataService.getSystemClock()).virtualMinutes;
        const subscription = store.subscription ?? null;
        const accessContext = { debugEnabled, subscription, nowVirtualMinutes };`,
    `        const { system, store } = getLatestChatVariables();
        const debugEnabled = Boolean(store.debugEnabled);
        const nowVirtualMinutes = (await DataService.getSystemClock()).virtualMinutes;
        const subscription = getEffectiveSubscription(store, system);
        const accessContext = { debugEnabled, subscription, nowVirtualMinutes };`
  );
  output = output.replace(
    `    getSubscription: async () => {
        const { store } = normalizeChatVariables(getVariables(CHAT_OPTION));
        return store.subscription ?? null;
    },`,
    `    getSubscription: async () => {
        const { system, store } = getLatestChatVariables();
        return getEffectiveSubscription(store, system);
    },`
  );
  output = output.replaceAll(
    "normalizeChatVariables(getVariables(CHAT_OPTION))",
    "getLatestChatVariables()"
  );
  output = output.replaceAll("getVariables(CHAT_OPTION)", "getLatestVariablesSync()");
  output = replaceBetween(
    output,
    "async function syncSubscriptionTierLabel",
    "const DataService = {",
    `async function syncSubscriptionTierLabel(nowVirtualMinutes) {
    // Frontend is read-only for subscription variables; AI writes VIP state.
    return;
}
`
  );
  output = replaceBetween(
    output,
    "    clearSubscription: async () => {",
    "    subscribeOrRenew: async",
    `    clearSubscription: async () => {
        // Frontend must not reset AI-authored subscription variables.
        return { ok: false, message: '订阅变更由AI根据本轮APP操作结算' };
    },
`
  );
  output = replaceBetween(
    output,
    "    subscribeOrRenew: async",
    "    maybeAutoRenewSubscription: async",
    `    subscribeOrRenew: async ({ tier }) => {
        // UI records a request; AI handles money and VIP variable updates.
        return { ok: false, message: '订阅请求已记录，等待AI结算', requestedTier: tier };
    },
`
  );
  output = replaceBetween(
    output,
    "    maybeAutoRenewSubscription: async",
    "    getFeatures: async",
    `    maybeAutoRenewSubscription: async () => {
        return { renewed: false };
    },
`
  );
  output = output.replace(
    /    canSubscribeTier: \(tier, ctx\) => [^\n]+/,
    "    canSubscribeTier: () => true,"
  );
  output = replaceBetween(
    output,
    "    getFeatures: async () => {",
    "    purchaseFeature: async",
    `    getFeatures: async () => {
        const { store } = getLatestChatVariables();
        return FEATURES.filter(f => f.id !== 'vip1_stats').map(f => ({
            ...f,
            isEnabled: store.features?.[f.id]?.isEnabled ?? f.isEnabled,
            userNote: store.features?.[f.id]?.userNote ?? f.userNote,
            userNumber: store.features?.[f.id]?.userNumber ?? f.userNumber,
            purchaseRequired: false,
            purchasePriceMoney: undefined,
            isPurchased: true,
        }));
    },
`
  );
  output = replaceBetween(
    output,
    "    purchaseFeature: async",
    "    getDebugEnabled: async",
    `    purchaseFeature: async () => {
        return { ok: false, message: '单功能购买已取消，请通过VIP买断解锁' };
    },
`
  );
  output = replaceBetween(
    output,
    "    getQuests: async () => {",
    "    claimAchievement: async",
    `    getQuests: async () => {
        const tasks = (await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getTasks().catch(() => null)) ?? {};
        const seenTaskNames = new Set();
        const quests = QUEST_DATABASE.map(q => {
            const taskState = tasks[q.name];
            if (taskState && typeof taskState === 'object')
                seenTaskNames.add(q.name);
            const completed = Boolean(taskState && typeof taskState === 'object' && taskState.已完成 === true);
            const active = Boolean(taskState && typeof taskState === 'object' && typeof taskState.已完成 === 'boolean');
            return {
                id: q.id,
                title: q.name,
                description: q.condition,
                rewardMoney: q.rewardMoney,
                status: completed
                    ? 'CLAIMED'
                    : active
                        ? 'ACTIVE'
                        : 'AVAILABLE',
            };
        });
        for (const [name, taskState] of Object.entries(tasks)) {
            if (seenTaskNames.has(name))
                continue;
            if (!taskState || typeof taskState !== 'object' || typeof taskState.已完成 !== 'boolean')
                continue;
            if (taskState.已完成 === true)
                continue;
            quests.push({
                id: \`dynamic:\${name}\`,
                title: name,
                description: String(taskState.完成条件 ?? ''),
                rewardMoney: Number(taskState.奖励金钱 ?? taskState.奖励零花钱 ?? taskState.rewardMoney ?? 0) || 0,
                status: 'ACTIVE',
            });
        }
        const order = { ACTIVE: 0, AVAILABLE: 1, CLAIMED: 2, COMPLETED: 2 };
        quests.sort((a, b) => order[a.status] - order[b.status]);
        return quests.filter(q => q.status !== 'CLAIMED' && q.status !== 'COMPLETED');
    },
`
  );
  output = replaceBetween(
    output,
    "    claimAchievement: async",
    "    acceptQuest: async",
    `    claimAchievement: async () => {
        const user = await DataService.getUserData();
        return { success: false, newMoney: user.money };
    },
`
  );
  output = output.replace(
    /    claimQuest: async \(id, currentPoints\) => \{[\s\S]*?\n    \},\n\};/,
    `    claimQuest: async () => {
        const user = await DataService.getUserData();
        return { success: false, newMoney: user.money };
    },
};`
  );
  output = output.replace(
    /function systemToUserResources\(system\) \{[\s\S]*?        suspicion: system\.主角可疑度,\n    \};\n\}/,
    `function systemToUserResources(system) {
    return {
        mcEnergy: system.MC能量,
        mcEnergyMax: system.MC能量上限,
        money: system.持有零花钱,
        suspicion: system.主角可疑度,
    };
}`
  );
  if (!output.includes("function chooseUserResourcesFromSystems(systems)")) {
    output = output.replace(
      /function systemToUserResources\(system\) \{[\s\S]*?\n\}/,
      `$&
function chooseUserResourcesFromSystems(systems) {
    const user = { ...DEFAULT_USER_DATA };
    const seenFields = new Set();
    for (const systemRaw of systems) {
        const patch = readExplicitUserResourcePatch(systemRaw);
        if (!patch)
            continue;
        for (const [field, value] of Object.entries(patch)) {
            if (seenFields.has(field) && user[field] !== DEFAULT_USER_DATA[field])
                continue;
            user[field] = value;
            seenFields.add(field);
        }
    }
    if (seenFields.size > 0)
        return user;
    for (const systemRaw of systems) {
        if (!isPlainVariableObject(systemRaw))
            continue;
        return systemToUserResources(SYSTEM_SCHEMA.parse(normalizeSystemAliases({ ...systemRaw })));
    }
    return null;
}`
    );
  }
  output = output.replace(
    /    updateResources: async \(newData\) => \{[\s\S]*?    \},\n    startSession:/,
    `    updateResources: async (newData) => {
        // The frontend may optimistically calculate a preview, but AI is the only writer of persistent variables.
        return { ...(await DataService.getUserData()), ...newData };
    },
    startSession:`
  );
  return output;
}

function extractBalancedObjectLiteral(text, marker) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return "";
  const objectStart = text.indexOf("{", markerIndex);
  if (objectStart < 0) return "";
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = objectStart; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === "\"" || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(objectStart, i + 1);
    }
  }
  return "";
}

function cleanMchanSeedText(value, fallback = "") {
  const text = String(value || "").trim();
  return (text || fallback).replaceAll("MC点", "MC能量");
}

function jsonForInlineScript(value) {
  return JSON.stringify(value)
    .replace(/<\//g, "<\\/")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function injectWorkbenchInputProbe(html) {
  if (String(html || "").includes("__ST_WORKBENCH_INPUT_PROBE__")) return html;
  const script = `<script>
(() => {
  const MARKER = "__ST_WORKBENCH_INPUT_PROBE__";
  if (window[MARKER]) return;
  window[MARKER] = true;

  const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  let isTopLevel = true;
  try {
    isTopLevel = window.self === window.top;
  } catch {
    isTopLevel = false;
  }
  if (!isLocalPreview || !isTopLevel) return;

  const mount = () => {
    if (document.getElementById("st-workbench-input-probe")) return;
    const style = document.createElement("style");
    style.textContent = \`
      body.st-workbench-probe-enabled {
        min-height: calc(100vh + 280px);
        overflow-y: auto !important;
      }
      #st-workbench-input-probe {
        box-sizing: border-box;
        width: min(820px, calc(100vw - 28px));
        margin: 18px auto 28px;
        padding: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.96));
        color: #e5e7eb;
        box-shadow: 0 16px 45px rgba(0, 0, 0, 0.34);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #st-workbench-input-probe .probe-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }
      #st-workbench-input-probe .probe-title {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0;
      }
      #st-workbench-input-probe .probe-note {
        margin-top: 3px;
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.45;
      }
      #st-workbench-input-probe .probe-actions {
        display: flex;
        gap: 8px;
        flex: 0 0 auto;
      }
      #st-workbench-input-probe button {
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 7px;
        background: rgba(30, 41, 59, 0.9);
        color: #e5e7eb;
        height: 30px;
        padding: 0 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      #st-workbench-input-probe button:hover {
        background: rgba(51, 65, 85, 0.95);
      }
      #send_textarea.st-workbench-send-textarea {
        box-sizing: border-box;
        display: block;
        width: 100%;
        min-height: 150px;
        resize: vertical;
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 8px;
        background: rgba(2, 6, 23, 0.92);
        color: #f8fafc;
        padding: 11px 12px;
        font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        outline: none;
      }
      #send_textarea.st-workbench-send-textarea:focus {
        border-color: rgba(125, 211, 252, 0.72);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16);
      }
      @media (max-width: 560px) {
        #st-workbench-input-probe {
          margin: 14px auto 22px;
          padding: 12px;
        }
        #st-workbench-input-probe .probe-head {
          align-items: flex-start;
          flex-direction: column;
        }
        #st-workbench-input-probe .probe-actions {
          width: 100%;
        }
        #st-workbench-input-probe button {
          flex: 1;
        }
      }
    \`;
    document.head.appendChild(style);
    document.body.classList.add("st-workbench-probe-enabled");

    const panel = document.createElement("section");
    panel.id = "st-workbench-input-probe";
    panel.innerHTML = \`
      <div class="probe-head">
        <div>
          <div class="probe-title">本地测试输入框</div>
          <div class="probe-note">点击领取、购买、启动催眠等操作时，会更新同一个本轮操作容器，不会自动发送。</div>
        </div>
        <div class="probe-actions">
          <button type="button" data-probe-clear>清空</button>
          <button type="button" data-probe-copy>复制</button>
        </div>
      </div>
      <textarea id="send_textarea" class="st-workbench-send-textarea" data-testid="send-textarea" spellcheck="false" placeholder="这里会收到唯一的 <本轮APP操作> 容器..."></textarea>
    \`;
    panel.querySelector("[data-probe-clear]")?.addEventListener("click", () => {
      const input = panel.querySelector("#send_textarea");
      window.__ST_CLEAR_OPERATION_INPUT_LOG__?.();
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
    panel.querySelector("[data-probe-copy]")?.addEventListener("click", async () => {
      const input = panel.querySelector("#send_textarea");
      try {
        await navigator.clipboard?.writeText(input.value || "");
      } catch {
        input.select();
        document.execCommand?.("copy");
      }
      input.focus();
    });
    document.body.appendChild(panel);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
</script>`;
  const sourceHtml = String(html || "");
  const closingBodyIndex = sourceHtml.toLowerCase().lastIndexOf("</body>");
  if (closingBodyIndex >= 0) {
    return sourceHtml.slice(0, closingBodyIndex) + script + sourceHtml.slice(closingBodyIndex);
  }
  return sourceHtml + script;
}

function normalizeMchanSeed(rawSeed) {
  if (!rawSeed || typeof rawSeed !== "object") return null;
  const boardIdByName = Object.fromEntries(MCHAN_BOARD_DEFINITIONS.map((board) => [board.name, board.id]));
  const boardOrder = Object.fromEntries(MCHAN_BOARD_DEFINITIONS.map((board, index) => [board.name, index]));
  const baseTime = Date.UTC(2026, 3, 1, 8, 0, 0);
  const threads = [];
  for (const board of MCHAN_BOARD_DEFINITIONS) {
    const posts = Array.isArray(rawSeed[board.name]) ? rawSeed[board.name] : [];
    posts.forEach((post, index) => {
      const postNo = Number(post?.postNo || index + 1);
      const combinedText = [
        post?.title,
        post?.body,
        ...(Array.isArray(post?.floors) ? post.floors : [])
      ].join("\n");
      const createdAt = baseTime + (boardOrder[board.name] || 0) * 3600000 + Math.max(0, postNo - 1) * 600000;
      let body = cleanMchanSeedText(post?.body);
      if (board.name === "公告区" && postNo === 1 && !body.includes("原作者：Ramiel")) {
        body = (body ? body + "\n\n" : "") + "原作者：Ramiel";
      }
      threads.push({
        id: "seed-" + boardIdByName[board.name] + "-" + postNo,
        boardId: boardIdByName[board.name],
        title: cleanMchanSeedText(post?.title, board.name + "帖子" + postNo),
        author: "anonymous",
        body,
        pinned: board.name === "公告区" && postNo === 1,
        postNo,
        source: "card-seed",
        createdAt,
        updatedAt: createdAt,
        replies: (Array.isArray(post?.floors) ? post.floors : []).map((floor, floorIndex) => ({
              id: "seed-" + boardIdByName[board.name] + "-" + postNo + "-floor-" + (floorIndex + 1),
              author: "anonymous",
              body: cleanMchanSeedText(floor),
              floorNo: floorIndex + 1,
              source: "card-seed",
              createdAt: createdAt + (floorIndex + 1) * 60000
            })).filter((reply) => reply.body)
      });
    });
  }
  return { boards: MCHAN_BOARD_DEFINITIONS, threads };
}

async function loadStaticMchanSeed() {
  try {
    const html = await readFile(MCHAN_STATIC_SOURCE, "utf8");
    const literal = extractBalancedObjectLiteral(html, "const E=");
    if (!literal) return null;
    const rawSeed = Function("return (" + literal + ");")();
    return normalizeMchanSeed(rawSeed);
  } catch (error) {
    console.warn(`Unable to read MChan static seed from ${MCHAN_STATIC_SOURCE}: ${error.message}`);
    return null;
  }
}

function upgradeInternalMchanApp(html) {
  let output = String(html || "");
  if (!output.includes("__ST_INTERNAL_MCHAN_APP__")) return output;
  output = output.replace(
    `  function compactText(element) {
    return String(element?.textContent || "").replace(/\\s+/g, " ").trim();
  }

  function getStatsRoles() {
    let variables = null;
    try {
      if (typeof getVariables === "function") variables = getVariables();
    } catch {}
    try {
      const mvuData = window.Mvu?.getMvuData?.();
      if (mvuData && typeof mvuData.then !== "function" && mvuData.stat_data) variables = mvuData.stat_data;
    } catch {}
    const roles = variables?.["角色"];
    return roles && typeof roles === "object" && !Array.isArray(roles) ? roles : {};
  }`,
    `  function compactText(element) {
    return String(element?.textContent || "").replace(/\\s+/g, " ").trim();
  }

  function getLatestVariableOptions() {
    const currentOption = getCurrentVariableOption();
    if (currentOption) return [currentOption];
    return dedupeVariableOptions([{ type: "message", message_id: "latest" }, { type: "chat" }]);
  }

  function getCurrentVariableOption() {
    const currentMessageId = getCurrentMessageIdSafe();
    return currentMessageId !== null && currentMessageId !== "latest"
      ? { type: "message", message_id: currentMessageId }
      : null;
  }

  function getCurrentMessageIdSafe() {
    try {
      const currentMessageId = getCurrentMessageId();
      if (currentMessageId !== undefined && currentMessageId !== null && currentMessageId !== "latest") return currentMessageId;
    } catch {}
    return null;
  }

  function getLatestMessageIdSafe() {
    try {
      if (typeof getChatMessages !== "function") return null;
      const messages = getChatMessages(-1);
      if (!Array.isArray(messages) || messages.length === 0) return null;
      const latest = messages[messages.length - 1];
      return latest?.message_id ?? latest?.mesid ?? latest?.id ?? messages.length - 1;
    } catch {
      return null;
    }
  }

  function shouldPreferCurrentMessageSnapshot() {
    return Boolean(getCurrentVariableOption());
  }

  function dedupeVariableOptions(options) {
    const seen = new Set();
    const result = [];
    for (const option of options) {
      if (!option) continue;
      const key = option.type + ":" + String(option.message_id ?? "");
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(option);
    }
    return result;
  }

  function scoreStatDataCandidate(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return -1;
    let score = 0;
    const system = value["系统"];
    const roles = value["角色"];
    const tasks = value["任务"];
    if (system && typeof system === "object" && !Array.isArray(system)) {
      score += 20;
      if (system["当前日期"] != null) score += 5;
      if (system["当前时间"] != null) score += 5;
      if (system["持有零花钱"] != null) score += 5;
      const store = system["hypnoos"] && typeof system["hypnoos"] === "object" && !Array.isArray(system["hypnoos"])
        ? system["hypnoos"]
        : system["_hypnoos"];
      if (store && typeof store === "object" && !Array.isArray(store)) {
        score += 3 + Object.keys(store).length;
      }
    }
    if (roles && typeof roles === "object" && !Array.isArray(roles)) score += 30 + Object.keys(roles).length * 5;
    if (tasks && typeof tasks === "object" && !Array.isArray(tasks)) score += 8 + Object.keys(tasks).length;
    return score;
  }

  function unwrapStatDataSnapshot(value) {
    if (value?.stat_data && typeof value.stat_data === "object" && !Array.isArray(value.stat_data)) return value.stat_data;
    return value;
  }

  function getLatestStatDataSync() {
    const candidates = [];
    const hasCurrentSnapshot = Boolean(getCurrentVariableOption());
    for (const option of getLatestVariableOptions()) {
      try {
        const mvu = window.Mvu?.getMvuData?.(option);
        const root = unwrapStatDataSnapshot(mvu);
        if (root && typeof root === "object" && !Array.isArray(root)) candidates.push(root);
      } catch {}
    }
    for (const option of getLatestVariableOptions()) {
      try {
        const vars = typeof getVariables === "function" ? getVariables(option) : null;
        const root = unwrapStatDataSnapshot(vars);
        if (root && typeof root === "object" && (root["系统"] || root["角色"] || root["任务"])) candidates.push(root);
      } catch {}
    }
    if (!hasCurrentSnapshot) {
      try {
        const vars = typeof getVariables === "function" ? getVariables() : null;
        const root = unwrapStatDataSnapshot(vars);
        if (root && typeof root === "object") candidates.push(root);
      } catch {}
      try {
        const mvu = window.Mvu?.getMvuData?.();
        const root = unwrapStatDataSnapshot(mvu);
        if (root && typeof root === "object" && !Array.isArray(root)) candidates.push(root);
      } catch {}
    }
    let best = null;
	    for (const candidate of candidates) {
	      const score = scoreStatDataCandidate(candidate);
	      if (score < 0) continue;
	      if (!best || score > best.score) best = { candidate, score };
	    }
    return best?.candidate ?? null;
  }

  function getStatsRoles() {
    const variables = getLatestStatDataSync();
    const roles = variables?.["角色"];
    return roles && typeof roles === "object" && !Array.isArray(roles) ? roles : {};
  }`
  );
  output = output.replace(
    `  function getSystemState() {
    try {
      const vars = typeof getVariables === "function" ? getVariables() : null;
      if (vars?.["系统"]) return vars["系统"];
    } catch {}
    try {
      const mvuData = window.Mvu?.getMvuData?.();
      if (mvuData && typeof mvuData.then !== "function" && mvuData.stat_data?.["系统"]) return mvuData.stat_data["系统"];
    } catch {}
    return {};
  }`,
    `  function getSystemState() {
    const variables = getLatestStatDataSync();
    const system = variables?.["系统"];
    return system && typeof system === "object" && !Array.isArray(system) ? system : {};
  }`
  );
  output = output.replace(
    `  function boot() {
    ensurePhoneDarkThemeStyle();
    patchHomeTile();
    updatePhoneDarkTheme();
    const observer = new MutationObserver(() => patchHomeTile());
    observer.observe(document.body, { childList: true, subtree: true });
    const themeObserver = new MutationObserver(() => updatePhoneDarkTheme());
    themeObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }`,
    `  function refreshPhoneVariableViews() {
    patchHomeTile();
    updatePhoneDarkTheme();
  }

  function boot() {
    ensurePhoneDarkThemeStyle();
    refreshPhoneVariableViews();
    const scheduleRefresh = () => window.requestAnimationFrame(refreshPhoneVariableViews);
    window.addEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", scheduleRefresh);
    window.addEventListener("focus", scheduleRefresh);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) scheduleRefresh();
    });
    try {
      if (typeof eventOn === "function" && window.Mvu?.events) {
        eventOn(window.Mvu.events.VARIABLE_INITIALIZED, scheduleRefresh);
        eventOn(window.Mvu.events.VARIABLE_UPDATE_ENDED, scheduleRefresh);
      }
    } catch {}
  }`
  );
  return output;
}

function injectInternalMchanApp(html, staticSeed) {
  if (html.includes("__ST_INTERNAL_MCHAN_APP__")) return upgradeInternalMchanApp(html);
  const defaultBoards = jsonForInlineScript(staticSeed?.boards?.length ? staticSeed.boards : MCHAN_BOARD_DEFINITIONS);
  const defaultRoleNames = jsonForInlineScript(Object.keys(DEFAULT_PREVIEW_ROLES));
  const defaultRoleProfiles = jsonForInlineScript(Object.fromEntries(
    Object.entries(DEFAULT_PREVIEW_ROLES).map(([name, role]) => [name, role["档案"] || {}])
  ));
  const defaultThreads = jsonForInlineScript(staticSeed?.threads?.length ? staticSeed.threads : [
    {
      id: "thread-mchan-static",
      boardId: "notice",
      title: "匿名版静态镜像",
      author: "system",
      body: "这里是手机内部的只读匿名版页面。点击帖子可查看内容，返回按钮回到匿名版首页。\\n\\n原作者：Ramiel",
      pinned: true,
      createdAt: 1813929600000,
      updatedAt: 1813929600000,
      replies: []
    }
  ]);
  const script = `<script>
(() => {
  const APP_MARKER = "__ST_INTERNAL_MCHAN_APP__";
  if (window[APP_MARKER]) return;
  window[APP_MARKER] = true;

  const DEFAULT_BOARDS = ${defaultBoards};
  const DEFAULT_THREADS = ${defaultThreads};
  const DEFAULT_ROLE_NAMES = ${defaultRoleNames};
  const DEFAULT_ROLE_PROFILES = ${defaultRoleProfiles};
  function stDefaultAssetBase() {
    try {
      const pathname = decodeURIComponent(String(window.location?.pathname || ""));
      if (pathname.includes("/public/frontends/hypnosis-app/") || pathname.includes("/dist/催眠APP前端/")) {
        return new URL("assets/", window.location.href).href;
      }
    } catch {}
    return "/public/frontends/hypnosis-app/assets/";
  }
  const ST_ASSET_BASE = window.__ST_HYPNOOS_ASSET_BASE__ || stDefaultAssetBase();
  function stAssetUrl(path) {
    const value = String(path || "");
    if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
    return ST_ASSET_BASE.replace(/\\/?$/, "/") + value.replace(/^\\/+/, "");
  }
  function stInlineAppIcon(bg, body) {
    return '<svg class="st-custom-app-icon" viewBox="0 0 72 72" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="72" height="72" rx="17" fill="' + bg + '"/>' +
      '<g fill="none" stroke="white" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">' + body + '</g>' +
    '</svg>';
  }
  const ST_APP_ICONS = {
    scanRole: stInlineAppIcon("#a855f7", '<path d="M18 23v-5h5"/><path d="M49 18h5v5"/><path d="M54 49v5h-5"/><path d="M23 54h-5v-5"/><path d="M16 36s7-11 20-11 20 11 20 11-7 11-20 11-20-11-20-11Z"/><circle cx="36" cy="36" r="6"/>'),
    profile: stInlineAppIcon("#0f766e", '<rect x="19" y="15" width="34" height="42" rx="4"/><circle cx="36" cy="29" r="6"/><path d="M25 46c3-7 19-7 22 0"/><path d="M25 53h22"/>'),
    timetable: stInlineAppIcon("#2563eb", '<rect x="17" y="18" width="38" height="38" rx="5"/><path d="M17 29h38"/><path d="M27 15v8"/><path d="M45 15v8"/><path d="M27 39h18"/><path d="M27 48h11"/>'),
    clock: stInlineAppIcon("#0ea5e9", '<circle cx="36" cy="36" r="20"/><path d="M36 24v13l9 6"/><path d="M24 18l-5-5"/><path d="M48 18l5-5"/>'),
    map: stInlineAppIcon("#10b981", '<path d="M18 51V22l13-5 13 5 10-4v29l-10 4-13-5-13 5Z"/><path d="M31 17v29"/><path d="M44 22v29"/><circle cx="36" cy="34" r="3"/>'),
    school: stInlineAppIcon("#475569", '<path d="M15 32l21-12 21 12"/><path d="M20 32v22h32V32"/><path d="M29 54V39h14v15"/><path d="M27 32h18"/><path d="M36 20v-6"/>')
  };
  const ST_DEFAULT_PROFILE_PHOTOS = {
    "西园寺爱丽莎": stAssetUrl("profiles/saionji-alisa.png"),
    "月咏深雪": stAssetUrl("profiles/tsukuyomi-miyuki.png"),
    "犬冢夏美": stAssetUrl("profiles/inuzuka-natsumi.png")
  };
  const BOARD_NAMES = DEFAULT_BOARDS.map((board) => board.name);
  const BOARD_ID_BY_NAME = Object.fromEntries(DEFAULT_BOARDS.map((board) => [board.name, board.id]));
  const BOARD_NAME_BY_ID = Object.fromEntries(DEFAULT_BOARDS.map((board) => [board.id, board.name]));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function defaultState() {
    return {
      version: 1,
      activeBoardId: "notice",
      activeThreadId: null,
      query: "",
      boards: clone(DEFAULT_BOARDS),
      threads: clone(DEFAULT_THREADS)
    };
  }

  function normalizeState(input) {
    const base = defaultState();
    const state = input && typeof input === "object" ? input : {};
    const boards = Array.isArray(state.boards) && state.boards.length ? state.boards : base.boards;
    const boardIds = new Set(boards.map((board) => String(board.id)));
    const threads = Array.isArray(state.threads) ? state.threads : base.threads;
    const normalizedThreads = threads
      .filter((thread) => thread && boardIds.has(String(thread.boardId)))
      .map((thread) => ({
        id: String(thread.id || makeId("thread")),
        boardId: String(thread.boardId),
        title: String(thread.title || "未命名主题"),
        author: String(thread.author || "anonymous"),
        body: String(thread.body || ""),
        pinned: Boolean(thread.pinned),
        postNo: Number.isFinite(Number(thread.postNo)) ? Number(thread.postNo) : undefined,
        source: String(thread.source || "local"),
        createdAt: Number(thread.createdAt || Date.now()),
        updatedAt: Number(thread.updatedAt || thread.createdAt || Date.now()),
        replies: Array.isArray(thread.replies)
          ? thread.replies.map((reply) => ({
              id: String(reply.id || makeId("reply")),
              author: String(reply.author || "anonymous"),
              body: String(reply.body || ""),
              floorNo: Number.isFinite(Number(reply.floorNo)) ? Number(reply.floorNo) : undefined,
              source: String(reply.source || "local"),
              originKey: typeof reply.originKey === "string" ? reply.originKey : undefined,
              createdAt: Number(reply.createdAt || Date.now())
            }))
          : []
      }));
    const activeBoardId = boardIds.has(String(state.activeBoardId)) ? String(state.activeBoardId) : boards[0].id;
    const activeThreadId = normalizedThreads.some((thread) => thread.id === state.activeThreadId && thread.boardId === activeBoardId)
      ? String(state.activeThreadId)
      : null;
    return {
      version: 1,
      activeBoardId,
      activeThreadId,
      query: String(state.query || ""),
      boards,
      threads: normalizedThreads,
      meta: state.meta && typeof state.meta === "object" ? { ...state.meta } : {}
    };
  }

  function parseJson(raw) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function storageScope() {
    try {
      const chatId = window?.SillyTavern?.getCurrentChatId?.();
      if (chatId !== undefined && chatId !== null && String(chatId).length > 0) return String(chatId);
    } catch {}
    return "global";
  }

  function legacyStorageKeys() {
    const scoped = "mchan.v1:" + storageScope();
    const keys = [scoped, "mchan.v1:global"];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith("mchan.v1:") && !keys.includes(key)) keys.push(key);
      }
    } catch {}
    return keys;
  }

  function legacyPostToThread(boardName, post) {
    const boardId = BOARD_ID_BY_NAME[post?.board] || BOARD_ID_BY_NAME[boardName];
    if (!boardId) return null;
    const postNo = Number(post?.postNo || 0);
    const createdAt = Number(post?.createdAtMs || Date.now());
    const updatedAt = Number(post?.updatedAtMs || createdAt);
    return {
      id: "legacy-" + boardId + "-" + (Number.isFinite(postNo) && postNo > 0 ? postNo : makeId("post")),
      boardId,
      title: String(post?.title || (BOARD_NAME_BY_ID[boardId] + "帖子" + (postNo || ""))),
      author: "anonymous",
      body: String(post?.body || ""),
      pinned: false,
      postNo: Number.isFinite(postNo) && postNo > 0 ? postNo : undefined,
      source: "legacy",
      createdAt,
      updatedAt,
      replies: Array.isArray(post?.floors) ? post.floors.map((floor) => {
        const floorNo = Number(floor?.floorNo || floor?.originFloorTagNo || 0);
        return {
          id: "legacy-" + boardId + "-" + (postNo || "x") + "-floor-" + (floorNo || makeId("floor")),
          author: floor?.source === "user" ? "you" : "anonymous",
          body: String(floor?.content || ""),
          floorNo: Number.isFinite(floorNo) && floorNo > 0 ? floorNo : undefined,
          source: String(floor?.source || "legacy"),
          originKey: typeof floor?.originKey === "string" ? floor.originKey : undefined,
          createdAt: Number(floor?.createdAtMs || updatedAt)
        };
      }).filter((reply) => reply.body.trim()) : []
    };
  }

  function legacyStateToInternal(legacy, sourceLabel) {
    if (!legacy || typeof legacy !== "object" || !legacy.boards || typeof legacy.boards !== "object") return null;
    const threads = [];
    for (const boardName of BOARD_NAMES) {
      const posts = legacy.boards?.[boardName]?.posts;
      if (!Array.isArray(posts)) continue;
      for (const post of posts) {
        const thread = legacyPostToThread(boardName, post);
        if (thread) {
          thread.source = sourceLabel || "legacy";
          threads.push(thread);
        }
      }
    }
    if (!threads.length) return null;
    threads.sort((a, b) => Number(a.boardId.localeCompare(b.boardId)) || Number(a.postNo || 0) - Number(b.postNo || 0));
    return {
      version: 1,
      activeBoardId: threads[0].boardId,
      activeThreadId: threads[0].id,
      query: "",
      boards: clone(DEFAULT_BOARDS),
      threads,
      meta: { importedFrom: sourceLabel || "legacy" }
    };
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^$()|[\\]\\\\]/g, "\\\\$&").replace(/[{}]/g, "\\\\$&");
  }

  function cleanTagText(value) {
    return String(value || "").replace(/\\r\\n/g, "\\n").trim();
  }

  function parseMchanTaggedBlocks(text) {
    const source = cleanTagText(text);
    if (!source || !source.includes("<匿名版>")) return [];
    const boardPattern = BOARD_NAMES.map(escapeRegExp).join("|");
    const blockRe = new RegExp("<(?<tag>(?:" + boardPattern + ")帖子(?<no>\\\\d+))>(?<inner>[\\\\s\\\\S]*?)<\\\\/\\\\k<tag>>", "gu");
    const floorRe = /<(?<tag>楼层(?<no>\\d+))>(?<inner>[\\s\\S]*?)<\\/\\k<tag>>/gu;
    const posts = [];
    for (const match of source.matchAll(blockRe)) {
      const tag = match.groups?.tag || "";
      const no = Number(match.groups?.no || 0);
      const boardName = BOARD_NAMES.find((name) => tag.startsWith(name));
      if (!boardName || !Number.isFinite(no) || no <= 0) continue;
      const inner = match.groups?.inner || "";
      const title = cleanTagText(inner.match(/<标题>([\\s\\S]*?)<\\/标题>/u)?.[1] || "");
      const body = cleanTagText(inner.match(/<正文>([\\s\\S]*?)<\\/正文>/u)?.[1] || "");
      const floors = [];
      for (const floor of inner.matchAll(floorRe)) {
        const floorNo = Number(floor.groups?.no || 0);
        const content = cleanTagText(floor.groups?.inner || "");
        if (content) floors.push({ floorNo, content, createdAtMs: Date.now(), source: "ai", originKey: "tag:" + boardName + ":" + no + ":" + floorNo });
      }
      posts.push({ board: boardName, postNo: no, title, body, createdAtMs: Date.now(), updatedAtMs: Date.now(), floors });
    }
    return posts;
  }

  function taggedPostsToState(posts) {
    if (!Array.isArray(posts) || !posts.length) return null;
    const legacy = { version: 1, boards: {}, meta: {} };
    for (const boardName of BOARD_NAMES) legacy.boards[boardName] = { posts: [] };
    for (const post of posts) {
      if (!legacy.boards[post.board]) continue;
      legacy.boards[post.board].posts.push(post);
    }
    return legacyStateToInternal(legacy, "chat-tags");
  }

  function loadLegacyStorageState() {
    for (const key of legacyStorageKeys()) {
      const legacy = parseJson(localStorage.getItem(key));
      const converted = legacyStateToInternal(legacy, key);
      if (converted) return converted;
    }
    return null;
  }

  function loadTaggedChatState() {
    const messages = [];
    try {
      if (typeof getCurrentMessageId === "function" && typeof getChatMessages === "function") {
        messages.push(...(getChatMessages(getCurrentMessageId()) || []));
      }
    } catch {}
    try {
      if (typeof getChatMessages === "function") messages.push(...(getChatMessages(-1) || []));
    } catch {}
    try {
      if (Array.isArray(window.__ST_MCHAN_CHAT__)) messages.push(...window.__ST_MCHAN_CHAT__);
    } catch {}
    const posts = [];
    const seenMessages = new Set();
    for (const message of messages) {
      const body = String(message?.message || "");
      const key = String(message?.message_id ?? "") + ":" + body.length;
      if (seenMessages.has(key)) continue;
      seenMessages.add(key);
      posts.push(...parseMchanTaggedBlocks(body));
    }
    return taggedPostsToState(posts);
  }

  function replyKey(reply) {
    return reply.originKey || (String(reply.floorNo || "") + "::" + String(reply.body || "").slice(0, 80));
  }

  function mergeImportedState(base, imported) {
    if (!imported?.threads?.length) return { state: base, count: 0 };
    const state = normalizeState(base);
    let count = 0;
    for (const incoming of normalizeState(imported).threads) {
      const existing = state.threads.find((thread) =>
        thread.id === incoming.id ||
        (incoming.postNo && thread.postNo === incoming.postNo && thread.boardId === incoming.boardId)
      );
      if (!existing) {
        state.threads.unshift(incoming);
        count += 1;
        continue;
      }
      if (incoming.title && (!existing.title || existing.title.startsWith("未命名"))) existing.title = incoming.title;
      if (incoming.body && !existing.body) existing.body = incoming.body;
      existing.updatedAt = Math.max(Number(existing.updatedAt || 0), Number(incoming.updatedAt || 0));
      const seen = new Set((existing.replies || []).map(replyKey));
      for (const reply of incoming.replies || []) {
        const key = replyKey(reply);
        if (!seen.has(key)) {
          existing.replies.push(reply);
          seen.add(key);
          count += 1;
        }
      }
      existing.replies.sort((a, b) => Number(a.floorNo || a.createdAt || 0) - Number(b.floorNo || b.createdAt || 0));
    }
    if (count > 0) {
      const first = imported.threads[0];
      state.activeBoardId = first.boardId || state.activeBoardId;
      state.activeThreadId = first.id || state.activeThreadId;
      state.meta = { ...(state.meta || {}), importedCount: count };
    }
    return { state: normalizeState(state), count };
  }

  function loadState() {
    return normalizeState(defaultState());
  }

  function saveState(state) {
    window.__ST_MCHAN_FORUM_STATE__ = clone(state);
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/\x60/g, "&#96;");
  }

  function formatTime(value) {
    const date = new Date(Number(value || Date.now()));
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function getBoard(state) {
    return state.boards.find((board) => board.id === state.activeBoardId) || state.boards[0];
  }

  function getBoardThreads(state) {
    return state.threads
      .filter((thread) => thread.boardId === state.activeBoardId)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.updatedAt) - Number(a.updatedAt));
  }

  function getActiveThread(state) {
    return state.threads.find((thread) => thread.id === state.activeThreadId && thread.boardId === state.activeBoardId) || null;
  }

  function threadSearchText(thread) {
    return [thread.title, thread.author, thread.body].concat((thread.replies || []).map((reply) => reply.body)).join("\\n").toLowerCase();
  }

  function recordOperation(text) {
    const operation = "[MC匿名版] " + text;
    window.__ST_MCHAN_LAST_OPERATION__ = operation;
    console.info(operation);
  }

  function operationValueToText(value) {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value)) {
      return value.map(operationValueToText).filter(Boolean).map((text) => "- " + text.replace(/\\n/g, "\\n  ")).join("\\n");
    }
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, item]) => {
          const text = operationValueToText(item);
          return text ? key + "：" + text : "";
        })
        .filter(Boolean)
        .join("\\n");
    }
    return String(value);
  }

	  function appendAppOperation(payload) {
	    const append = window.__ST_APPEND_OPERATION_TO_INPUT__;
	    if (typeof append === "function") {
	      void append(payload);
	      return true;
	    }
	    const body = typeof payload === "string" ? payload : operationValueToText(payload);
	    const buildBlock = window.__ST_BUILD_OPERATION_BLOCK_FROM_PAYLOADS__;
	    const block = typeof buildBlock === "function"
	      ? buildBlock([payload])
	      : "<本轮APP操作>\\n" + body.trim() + "\\n</本轮APP操作>";
    const docs = [];
    for (const candidate of [window.parent?.document, window.top?.document, document]) {
      try {
        if (candidate && !docs.includes(candidate)) docs.push(candidate);
      } catch {}
    }
    for (const doc of docs) {
      const input = doc.querySelector("#send_textarea, textarea#send_textarea, textarea[name='send_textarea'], textarea[data-testid='send-textarea']");
      if (!input) continue;
      const current = "value" in input ? input.value : input.textContent;
      const base = String(current || "").replace(/<本轮APP操作>[\\s\\S]*?<\\/本轮APP操作>/g, "").trim();
      const next = base ? base.replace(/\\s*$/, "") + "\\n" + block : block;
      if ("value" in input) input.value = next;
      else input.textContent = next;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus?.();
      return true;
    }
    try {
      const target = window.parent && window.parent !== window ? window.parent : window.top;
      if (target && target !== window) {
        target.postMessage({ type: "HYPNOOS_APPEND_OPERATION", payload, block }, "*");
      }
    } catch {}
    console.info("[HypnoOS] 已记录APP操作", block);
    return false;
  }

  function enableHorizontalDragScroll(scroller) {
    if (!scroller || scroller.dataset.stDragScroll === "ready") return;
    scroller.dataset.stDragScroll = "ready";
    scroller.classList.add("st-drag-scroll");
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let moved = false;
    let blockClickUntil = 0;
    const dragThreshold = 8;
    const finishDrag = (event) => {
      if (pointerId === null) return;
      const activePointerId = pointerId;
      const didMove = moved;
      pointerId = null;
      moved = false;
      try {
        if (!event?.pointerId || event.pointerId === activePointerId) scroller.releasePointerCapture?.(activePointerId);
      } catch {}
      scroller.classList.remove("is-dragging");
      if (didMove) blockClickUntil = Date.now() + 260;
    };
    scroller.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target?.closest?.("input,textarea,select,[contenteditable='true']")) return;
      if (scroller.scrollWidth <= scroller.clientWidth + 1) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = scroller.scrollLeft;
      moved = false;
    });
    scroller.addEventListener("pointermove", (event) => {
      if (pointerId === null || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (!moved) {
        if (absX < dragThreshold || absX < absY * 1.25) return;
        moved = true;
        scroller.classList.add("is-dragging");
        try {
          scroller.setPointerCapture?.(pointerId);
        } catch {}
      }
      scroller.scrollLeft = startScrollLeft - dx;
      event.preventDefault();
    });
    scroller.addEventListener("pointerup", finishDrag);
    scroller.addEventListener("pointercancel", finishDrag);
    scroller.addEventListener("lostpointercapture", finishDrag);
    scroller.addEventListener("click", (event) => {
      if (Date.now() > blockClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    }, true);
  }

  function ensureStyle() {
    if (document.getElementById("st-mchan-internal-style")) return;
    const style = document.createElement("style");
    style.id = "st-mchan-internal-style";
    style.textContent = \`
.st-mchan-internal-app{position:absolute;inset:0;z-index:80;display:flex;flex-direction:column;background:linear-gradient(180deg,#101426 0%,#080b14 54%,#05060b 100%);color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0;overflow:hidden}
.st-mchan-internal-app *{box-sizing:border-box}
.st-mchan-header{flex:0 0 auto;padding:42px 16px 14px;background:linear-gradient(180deg,rgba(22,28,52,.96),rgba(7,10,20,.86));color:white;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 12px 30px rgba(0,0,0,.24)}
.st-mchan-back{width:34px;height:34px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.07);color:white;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer}
.st-mchan-title strong{display:block;font-size:18px;line-height:1.2;letter-spacing:.02em}
.st-mchan-title span{display:block;margin-top:3px;color:rgba(226,232,240,.62);font-size:11px}
.st-mchan-boards{flex:0 0 auto;display:flex;gap:8px;padding:10px 12px;overflow-x:auto;background:rgba(3,6,14,.76);border-bottom:1px solid rgba(255,255,255,.08)}
.st-mchan-boards,.st-mchan-threads,.st-mchan-detail{scrollbar-width:none}
.st-mchan-boards::-webkit-scrollbar,.st-mchan-threads::-webkit-scrollbar,.st-mchan-detail::-webkit-scrollbar{display:none}
.st-mchan-board{border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.05);color:rgba(226,232,240,.72);white-space:nowrap;font-size:12px;font-weight:750;box-shadow:0 1px 0 rgba(255,255,255,.03) inset;cursor:pointer}
.st-mchan-board small{margin-left:4px;color:rgba(226,232,240,.42);font-weight:700}
.st-mchan-board.active{background:linear-gradient(135deg,rgba(34,211,238,.24),rgba(168,85,247,.2));border-color:rgba(125,211,252,.45);color:white}
.st-drag-scroll{cursor:grab;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scroll-behavior:auto}
.st-drag-scroll.is-dragging{cursor:grabbing;user-select:none}
.st-mchan-content{flex:1;min-height:0;background:transparent}
.st-mchan-content.is-list{display:flex;flex-direction:column}
.st-mchan-content.is-detail{display:block;overflow:auto;padding:12px}
.st-mchan-list{min-height:0;padding:11px 12px;overflow:hidden;display:flex;flex-direction:column;gap:9px}
.st-mchan-content.is-list .st-mchan-list{flex:1}
.st-mchan-board-meta{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.st-mchan-board-meta strong{font-size:15px;color:#f8fafc}
.st-mchan-board-meta small{display:block;color:rgba(203,213,225,.58);font-size:11px;line-height:1.4}
.st-mchan-search{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(255,255,255,.06);padding:9px 10px;font-size:13px;color:#f8fafc;outline:none}
.st-mchan-search::placeholder{color:rgba(203,213,225,.38)}
.st-mchan-search:focus{border-color:rgba(34,211,238,.52);box-shadow:0 0 0 3px rgba(34,211,238,.12)}
.st-mchan-threads{min-height:0;overflow:auto;display:flex;flex-direction:column;gap:7px;padding-right:2px}
.st-mchan-thread{width:100%;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.055);padding:10px;text-align:left;display:grid;gap:4px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.12)}
.st-mchan-thread.active{border-color:rgba(34,211,238,.45);background:rgba(34,211,238,.09);box-shadow:0 0 0 1px rgba(34,211,238,.12)}
.st-mchan-thread strong{font-size:13px;line-height:1.25;color:#f8fafc}
.st-mchan-thread small{font-size:11px;color:rgba(203,213,225,.56)}
.st-mchan-pin{display:inline-block;margin-right:5px;color:#67e8f9;font-weight:800}
.st-mchan-empty{margin:16px 0;color:rgba(203,213,225,.54);font-size:13px;text-align:center}
.st-mchan-thread-detail{padding:0}
.st-mchan-detail-back{margin-bottom:12px}
.st-mchan-actions{display:flex;justify-content:flex-end;gap:8px;align-items:center}
.st-mchan-button{border:1px solid rgba(255,255,255,.1);border-radius:10px;background:linear-gradient(135deg,rgba(34,211,238,.26),rgba(168,85,247,.24));color:white;padding:8px 12px;font-size:12px;font-weight:800;cursor:pointer}
.st-mchan-button.secondary{background:rgba(255,255,255,.07);color:rgba(226,232,240,.86)}
.st-mchan-button.danger{background:rgba(244,63,94,.18);border-color:rgba(244,63,94,.34);color:#fecdd3}
.st-mchan-thread-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:10px;margin-bottom:10px}
.st-mchan-thread-head h3{margin:0;color:#f8fafc;font-size:16px;line-height:1.3}
.st-mchan-thread-head small{display:block;margin-top:3px;color:rgba(203,213,225,.55);font-size:11px}
.st-mchan-thread-body{white-space:pre-wrap;color:rgba(226,232,240,.88);font-size:13px;line-height:1.6;margin:0 0 12px}
.st-mchan-replies{display:grid;gap:8px;margin:0 0 10px}
.st-mchan-reply{border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.045);padding:10px}
.st-mchan-reply header{display:flex;justify-content:space-between;gap:8px;color:rgba(203,213,225,.54);font-size:11px;margin-bottom:6px}
.st-mchan-reply p{margin:0;color:rgba(226,232,240,.86);white-space:pre-wrap;font-size:12px;line-height:1.55}
.st-add-role-app{position:absolute;inset:0;z-index:82;display:flex;flex-direction:column;background:linear-gradient(180deg,#101426 0%,#080b14 55%,#05060b 100%);color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0;overflow:hidden}
.st-add-role-app *{box-sizing:border-box}
.st-add-role-header{flex:0 0 auto;padding:42px 16px 14px;background:linear-gradient(180deg,rgba(22,28,52,.96),rgba(7,10,20,.86));display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 12px 30px rgba(0,0,0,.24)}
.st-add-role-back{width:34px;height:34px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.07);color:white;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer}
.st-add-role-title strong{display:block;font-size:18px;line-height:1.2}
.st-add-role-title span{display:block;margin-top:3px;color:rgba(226,232,240,.62);font-size:11px}
.st-add-role-body{flex:1;min-height:0;overflow:auto;padding:12px;display:grid;gap:10px;scrollbar-width:none}
.st-add-role-body::-webkit-scrollbar{display:none}
.st-add-role-card{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035));box-shadow:0 12px 26px rgba(0,0,0,.18);padding:12px}
.st-add-role-card h3{margin:0 0 7px;font-size:14px;color:#f8fafc}
.st-add-role-card p{margin:0;color:rgba(226,232,240,.68);font-size:12px;line-height:1.55}
.st-add-role-grid{display:grid;gap:9px}
.st-add-role-field{display:grid;gap:5px}
.st-add-role-field span{font-size:11px;font-weight:800;color:rgba(226,232,240,.78)}
.st-add-role-field input,.st-add-role-field textarea{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(2,6,23,.45);color:#f8fafc;outline:none;padding:9px 10px;font-size:12px;font-family:inherit;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.st-add-role-field textarea{min-height:68px;resize:vertical;line-height:1.5}
.st-add-role-field input:focus,.st-add-role-field textarea:focus{border-color:rgba(34,211,238,.55);box-shadow:0 0 0 3px rgba(34,211,238,.12)}
.st-add-role-examples{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.st-add-role-example{min-width:0;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(2,6,23,.28);padding:10px 8px;display:grid;gap:4px;text-align:center;color:#f8fafc;cursor:pointer;box-shadow:0 8px 18px rgba(0,0,0,.13)}
.st-add-role-example:not(:disabled):hover{border-color:rgba(34,211,238,.36);background:rgba(34,211,238,.1)}
.st-add-role-example.is-empty{background:rgba(255,255,255,.035);border-style:dashed;color:rgba(226,232,240,.48)}
.st-add-role-example:disabled{opacity:.5;cursor:not-allowed}
.st-add-role-example strong{display:block;font-size:12px;color:inherit;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-add-role-example small{display:block;font-size:10px;color:rgba(226,232,240,.52);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-add-role-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;align-items:center}
.st-add-role-button{border:1px solid rgba(255,255,255,.1);border-radius:12px;background:linear-gradient(135deg,rgba(34,211,238,.26),rgba(168,85,247,.24));color:white;padding:9px 12px;font-size:12px;font-weight:850;cursor:pointer}
.st-add-role-button.secondary{background:rgba(255,255,255,.07);color:rgba(226,232,240,.86)}
.st-add-role-hint{border:1px solid rgba(34,211,238,.16);border-radius:14px;background:rgba(34,211,238,.075);padding:10px;color:rgba(226,232,240,.72);font-size:11px;line-height:1.55}
.st-add-role-status{min-height:18px;color:#67e8f9;font-size:11px;line-height:1.5}
.st-lite-app{position:absolute;inset:0;z-index:82;display:flex;flex-direction:column;background:radial-gradient(circle at 25% -10%,rgba(34,211,238,.14),transparent 35%),linear-gradient(180deg,#101426 0%,#080b14 58%,#05060b 100%);color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0;overflow:hidden}
.st-profile-app{z-index:150;background:#111827}
.st-lite-app *{box-sizing:border-box}
.st-lite-header{flex:0 0 auto;padding:42px 16px 14px;background:rgba(3,6,14,.56);display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 12px 30px rgba(0,0,0,.22);backdrop-filter:blur(14px)}
.st-lite-back{width:34px;height:34px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.07);color:white;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer}
.st-lite-title strong{display:block;font-size:18px;line-height:1.2}
.st-lite-title span{display:block;margin-top:3px;color:rgba(226,232,240,.62);font-size:11px}
.st-lite-body{flex:1;min-height:0;overflow:auto;padding:12px;display:grid;align-content:start;gap:10px;scrollbar-width:none}
.st-lite-body::-webkit-scrollbar{display:none}
.st-lite-card{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.035));box-shadow:0 14px 30px rgba(0,0,0,.2);padding:12px}
.st-clock-card{display:grid;gap:14px;justify-items:center;text-align:center}
.st-clock-face{position:relative;width:min(66vw,250px);aspect-ratio:1;border-radius:50%;border:1px solid rgba(125,211,252,.28);background:radial-gradient(circle at 50% 42%,rgba(34,211,238,.16),transparent 34%),linear-gradient(145deg,rgba(15,23,42,.96),rgba(2,6,23,.94));box-shadow:inset 0 0 0 8px rgba(255,255,255,.035),0 18px 46px rgba(0,0,0,.28);user-select:none}
.st-clock-face::before{content:"";position:absolute;inset:14px;border-radius:50%;border:1px dashed rgba(226,232,240,.13)}
.st-clock-mark{position:absolute;width:2px;height:10px;border-radius:999px;background:rgba(226,232,240,.42)}
.st-clock-hand{position:absolute;left:50%;top:50%;width:4px;border-radius:999px;background:#f8fafc;transform-origin:50% 100%;box-shadow:0 0 16px rgba(103,232,249,.28)}
.st-clock-hand::after{content:"";position:absolute;left:50%;top:-12px;width:34px;height:calc(100% + 28px);transform:translateX(-50%);border-radius:999px}
.st-clock-hand.hour{height:25%;margin-left:-2px;margin-top:-25%}
.st-clock-hand.minute{height:35%;margin-left:-2px;margin-top:-35%;background:#67e8f9}
.st-clock-center{position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:999px;background:#f9a8d4;box-shadow:0 0 18px rgba(249,168,212,.48)}
.st-clock-time{font-size:34px;font-weight:900;letter-spacing:.02em;font-variant-numeric:tabular-nums;color:#f8fafc}
.st-clock-inputs{width:100%;display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:end}
.st-clock-inputs label{display:grid;gap:5px;text-align:left;color:rgba(226,232,240,.68);font-size:11px;font-weight:850}
.st-clock-inputs input{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(2,6,23,.48);color:#f8fafc;outline:none;padding:11px 12px;font-size:20px;font-weight:900;text-align:center;font-variant-numeric:tabular-nums}
.st-clock-inputs input:focus{border-color:rgba(34,211,238,.58);box-shadow:0 0 0 3px rgba(34,211,238,.13)}
.st-clock-colon{padding:0 0 10px;color:rgba(226,232,240,.72);font-size:24px;font-weight:900}
.st-clock-action{width:100%;border:1px solid rgba(34,211,238,.28);border-radius:15px;background:linear-gradient(135deg,#06b6d4,#7c3aed);color:white;font-weight:900;font-size:14px;padding:12px;box-shadow:0 14px 30px rgba(34,211,238,.18);cursor:pointer}
.st-clock-note{margin:0;color:rgba(203,213,225,.6);font-size:11px;line-height:1.55;text-align:left}
.st-todo-card{min-height:220px;display:grid;place-items:center;text-align:center}
.st-todo-card strong{font-size:34px;letter-spacing:.12em;color:#f8fafc}
.st-graph-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.st-graph-tab,.st-rule-button{border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.055);color:rgba(226,232,240,.78);font-size:12px;font-weight:850;padding:9px 10px;cursor:pointer}
.st-graph-tab.active,.st-rule-button{border-color:rgba(34,211,238,.36);background:linear-gradient(135deg,rgba(34,211,238,.18),rgba(168,85,247,.15));color:#f8fafc}
.st-graph-card{display:grid;gap:10px}
.st-graph-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.st-graph-head strong{font-size:15px;color:#fff}
.st-graph-head span{font-size:10px;color:rgba(203,213,225,.5);font-weight:800}
.st-location-current{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid rgba(34,211,238,.2);border-radius:15px;background:linear-gradient(135deg,rgba(34,211,238,.12),rgba(168,85,247,.08));padding:10px}
.st-location-current span{color:rgba(203,213,225,.58);font-size:10px;font-weight:850}
.st-location-current strong{color:#f8fafc;font-size:13px;line-height:1.35;text-align:right}
.st-location-list{display:grid;gap:8px}
.st-location-item{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;border:1px solid rgba(255,255,255,.09);border-radius:15px;background:rgba(2,6,23,.34);padding:8px}
.st-location-item.is-current{border-color:rgba(34,211,238,.45);background:linear-gradient(135deg,rgba(34,211,238,.14),rgba(168,85,247,.1))}
.st-location-main{color:inherit;text-align:left;min-width:0}
.st-location-main strong{display:flex;align-items:center;gap:6px;font-size:14px;color:#f8fafc;line-height:1.25}
.st-location-main small{font-size:9px;color:rgba(125,211,252,.72);font-weight:850;white-space:nowrap}
.st-location-main p{margin:5px 0 0;color:rgba(226,232,240,.72);font-size:12px;line-height:1.5;white-space:pre-wrap}
.st-location-suggest{align-self:center;border:1px solid rgba(34,211,238,.24);border-radius:11px;background:rgba(14,165,233,.1);color:#bae6fd;font-size:11px;font-weight:850;padding:7px 9px;cursor:pointer;white-space:nowrap}
.st-graph-info{display:grid;gap:8px;border:1px solid rgba(255,255,255,.09);border-radius:15px;background:rgba(2,6,23,.34);padding:10px}
.st-graph-info-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.st-graph-info-head strong{font-size:14px;color:#f8fafc;line-height:1.25}
.st-graph-info-head small{font-size:10px;color:rgba(125,211,252,.7);white-space:nowrap}
.st-graph-info p{margin:0;color:rgba(226,232,240,.72);font-size:12px;line-height:1.55;white-space:pre-wrap}
.st-graph-delete{justify-self:end;border:1px solid rgba(244,63,94,.28);border-radius:11px;background:rgba(244,63,94,.12);color:#fecdd3;font-size:11px;font-weight:850;padding:7px 10px;cursor:pointer}
.st-graph-add{display:grid;gap:8px}
.st-graph-add-grid{display:grid;grid-template-columns:1fr;gap:8px}
.st-graph-add input,.st-graph-add textarea{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(2,6,23,.45);color:#f8fafc;outline:none;padding:9px 10px;font-size:12px;line-height:1.45;font-family:inherit}
.st-graph-add textarea{min-height:64px;resize:vertical}
.st-graph-add input:focus,.st-graph-add textarea:focus{border-color:rgba(34,211,238,.5);box-shadow:0 0 0 3px rgba(34,211,238,.12)}
.st-graph-add button{border:1px solid rgba(34,211,238,.32);border-radius:13px;background:linear-gradient(135deg,rgba(34,211,238,.17),rgba(168,85,247,.15));color:#e0f2fe;font-size:12px;font-weight:850;padding:9px 10px;cursor:pointer}
.st-graph-add-hint{margin:0;color:rgba(203,213,225,.55);font-size:10px;line-height:1.45}
.st-rule-list{display:grid;gap:8px}
.st-rule-empty{margin:0;color:rgba(203,213,225,.52);font-size:12px;text-align:center;padding:18px 4px}
.st-rule-item{border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.05);padding:10px}
.st-rule-item strong{display:block;color:#f8fafc;font-size:13px;line-height:1.3}
.st-rule-item strong small{display:inline-block;margin-left:6px;border:1px solid rgba(125,211,252,.22);border-radius:999px;background:rgba(14,165,233,.12);color:#bae6fd;font-size:9px;font-weight:850;padding:2px 6px;vertical-align:1px}
.st-rule-item p{margin:5px 0 0;color:rgba(226,232,240,.68);font-size:12px;line-height:1.5;white-space:pre-wrap}
.st-rule-form{display:grid;gap:8px}
.st-rule-input{width:100%;min-height:74px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(2,6,23,.45);color:#f8fafc;outline:none;padding:10px;font-size:12px;line-height:1.5;resize:vertical;font-family:inherit}
.st-rule-input:focus{border-color:rgba(34,211,238,.55);box-shadow:0 0 0 3px rgba(34,211,238,.12)}
.st-rule-cost{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.st-rule-cost span{border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(2,6,23,.32);padding:7px 5px;text-align:center;color:rgba(226,232,240,.72);font-size:10px;font-weight:850}
.st-rule-cost.is-single{grid-template-columns:1fr}
.st-rule-state{margin:0;color:rgba(226,232,240,.68);font-size:11px;line-height:1.45}
.st-rule-button:disabled{opacity:.48;cursor:not-allowed;filter:saturate(.7)}
.st-rule-delete{margin-top:8px;border:1px solid rgba(244,63,94,.26);border-radius:10px;background:rgba(244,63,94,.11);color:#fecdd3;font-size:10px;font-weight:850;padding:6px 9px;cursor:pointer}
.st-rule-delete:disabled{opacity:.46;cursor:not-allowed;filter:saturate(.7)}
.st-cal-hero{display:grid;gap:8px;border-color:rgba(34,211,238,.18);background:linear-gradient(135deg,rgba(34,211,238,.14),rgba(168,85,247,.1))}
.st-cal-date{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.st-cal-date strong{font-size:24px;line-height:1;color:#fff}
.st-cal-date span{font-size:12px;color:#a5f3fc;font-weight:850}
.st-cal-now{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.st-cal-now article{min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(2,6,23,.32);padding:9px}
.st-cal-now small{display:block;color:rgba(203,213,225,.55);font-size:10px;font-weight:800}
.st-cal-now strong{display:block;margin-top:4px;color:#f8fafc;font-size:13px;line-height:1.25}
.st-cal-section-title{margin:2px 2px -2px;color:rgba(226,232,240,.9);font-size:13px;font-weight:900}
.st-cal-events{display:grid;gap:7px}
.st-cal-event{display:grid;grid-template-columns:54px 1fr;gap:9px;align-items:center;border:1px solid rgba(255,255,255,.085);border-radius:14px;background:rgba(255,255,255,.055);padding:9px}
.st-cal-event time{display:grid;place-items:center;min-height:42px;border-radius:12px;background:rgba(15,23,42,.62);color:#a5f3fc;font-size:11px;font-weight:900;text-align:center;line-height:1.2}
.st-cal-event strong{display:block;font-size:13px;color:#fff;line-height:1.25}
.st-cal-event span{display:block;margin-top:3px;color:rgba(203,213,225,.6);font-size:11px;line-height:1.35}
.st-cal-month{display:grid;gap:8px;padding:10px}
.st-cal-month-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.st-cal-month-head strong{font-size:16px;color:#fff;line-height:1.2}
.st-cal-month-head span{border:1px solid rgba(34,211,238,.22);border-radius:999px;background:rgba(34,211,238,.08);color:#a5f3fc;padding:5px 8px;font-size:10px;font-weight:900;white-space:nowrap}
.st-cal-month-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.st-cal-weekday{min-width:0;text-align:center;color:rgba(203,213,225,.52);font-size:9px;font-weight:900;padding:2px 0}
.st-cal-day{min-width:0;min-height:38px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(2,6,23,.28);padding:5px 4px;display:grid;align-content:start;gap:3px}
.st-cal-day.is-empty{visibility:hidden}
.st-cal-day.is-weekend{background:rgba(56,189,248,.055)}
.st-cal-day.is-special{border-color:rgba(244,114,182,.26);background:linear-gradient(180deg,rgba(244,114,182,.12),rgba(2,6,23,.28))}
.st-cal-day.is-today{border-color:rgba(34,211,238,.62);box-shadow:0 0 0 1px rgba(34,211,238,.2),0 8px 18px rgba(8,145,178,.16)}
.st-cal-day b{font-size:12px;line-height:1;color:#f8fafc}
.st-cal-day i{font-style:normal;color:#f9a8d4;font-size:7px;line-height:1.12;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-tt-current{display:flex;align-items:center;justify-content:space-between;gap:10px;border-color:rgba(34,211,238,.2);background:linear-gradient(135deg,rgba(34,211,238,.14),rgba(244,114,182,.1))}
.st-tt-current div{min-width:0}
.st-tt-current span{display:block;color:rgba(203,213,225,.62);font-size:11px;font-weight:800}
.st-tt-current strong{display:block;margin-top:3px;color:#fff;font-size:18px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-tt-badge{flex:0 0 auto;border:1px solid rgba(34,211,238,.24);border-radius:999px;background:rgba(34,211,238,.1);color:#a5f3fc;padding:7px 9px;font-size:11px;font-weight:900;white-space:nowrap}
.st-tt-week{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.st-tt-day{min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.045);padding:6px 5px;display:grid;gap:5px}
.st-tt-day.is-active{border-color:rgba(34,211,238,.45);background:linear-gradient(180deg,rgba(34,211,238,.12),rgba(168,85,247,.08))}
.st-tt-day h3{margin:0;text-align:center;font-size:12px;line-height:1.2;color:#f8fafc}
.st-tt-day h3 small{display:block;margin-top:2px;font-size:8px;color:rgba(203,213,225,.48);font-weight:800}
.st-tt-period{min-height:42px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(2,6,23,.34);padding:5px 4px;display:grid;align-content:center;text-align:center}
.st-tt-period.is-current{border-color:rgba(244,114,182,.62);background:linear-gradient(135deg,rgba(244,114,182,.22),rgba(168,85,247,.16));box-shadow:0 8px 18px rgba(131,24,67,.22)}
.st-tt-period small{font-size:8px;color:rgba(203,213,225,.46);line-height:1.1}
.st-tt-period strong{font-size:10px;color:#f8fafc;line-height:1.15;word-break:keep-all}
.st-tt-period em{font-style:normal;font-size:8px;color:#a5f3fc;line-height:1.1}
.st-tt-rhythm{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.st-tt-rhythm-item{min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.045);padding:7px 3px;display:grid;justify-items:center;gap:3px;text-align:center}
.st-tt-rhythm-item b,.st-tt-rhythm-item i{color:rgba(226,232,240,.78);font-size:9px;font-style:normal;font-weight:900;line-height:1}
.st-tt-rhythm-item span{position:relative;color:#a5f3fc;font-size:8px;font-weight:900;line-height:1;white-space:nowrap}
.st-tt-rhythm-item span:before,.st-tt-rhythm-item span:after{content:"";position:absolute;left:50%;width:1px;height:6px;background:rgba(34,211,238,.35)}
.st-tt-rhythm-item span:before{bottom:calc(100% + 1px)}
.st-tt-rhythm-item span:after{top:calc(100% + 1px)}
@media (max-width:420px){.st-mchan-header{padding-top:38px}.st-mchan-board{padding:7px 10px}.st-mchan-content.is-detail{padding:10px}}
\`;
    document.head.appendChild(style);
  }

  function ensurePhoneDarkThemeStyle() {
    if (document.getElementById("st-phone-dark-theme-style")) return;
    const style = document.createElement("style");
    style.id = "st-phone-dark-theme-style";
    style.textContent = \`
.st-drag-scroll{cursor:grab;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scroll-behavior:auto}
.st-drag-scroll.is-dragging{cursor:grabbing;user-select:none}
.st-help-author-card{margin:10px 12px 12px;border:1px solid rgba(34,211,238,.2);border-radius:16px;background:linear-gradient(135deg,rgba(34,211,238,.14),rgba(168,85,247,.1));box-shadow:0 12px 26px rgba(8,47,73,.18);padding:12px;color:#f8fafc}
.st-help-author-card strong{display:block;font-size:14px;line-height:1.2}
.st-help-author-card p{margin:6px 0 0;color:rgba(226,232,240,.78);font-size:12px;line-height:1.5}
.st-author-credit-line{margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,255,255,.08);color:rgba(125,211,252,.78)!important;font-size:10px!important;font-weight:800!important;line-height:1.3!important}
.st-home-author-status{display:block!important;max-width:112px!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:10px!important;font-weight:900!important;letter-spacing:0!important;white-space:nowrap!important;line-height:1.1!important}
.st-home-hypnosis-island{position:absolute!important}
.st-home-hypnosis-scroll{padding-left:34px!important}
.st-home-hypnosis-scroll>svg:first-child{position:absolute!important;left:10px!important;top:50%!important;transform:translateY(-50%)!important;z-index:2!important;pointer-events:none!important}
.st-home-hypnosis-scroll::-webkit-scrollbar{display:none}
.st-custom-icon-box{background:transparent!important;box-shadow:none!important;overflow:visible!important}
.st-custom-icon-box>svg:not(.st-custom-app-icon){display:none!important}
.st-custom-app-icon{width:100%;height:100%;display:block;border-radius:inherit;filter:drop-shadow(0 10px 18px rgba(0,0,0,.22))}
#st-operation-workspace{box-sizing:border-box;width:100%;max-width:680px;min-height:0;margin:0;display:grid;grid-template-columns:minmax(320px,420px) minmax(150px,1fr);gap:8px;align-items:start;justify-content:start;padding:4px 0 4px 4px}
#st-operation-workspace>#app{min-width:0;width:100%}
#st-operation-workspace>#app>div:first-child{justify-content:flex-start!important;align-items:flex-start!important;padding:0!important}
#st-operation-side-panel{box-sizing:border-box;min-width:0;height:var(--st-phone-panel-height,min(844px,calc(100vh - 8px)));max-height:var(--st-phone-panel-height,min(844px,calc(100vh - 8px)));border:1px solid rgba(255,255,255,.1);border-radius:18px;background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(2,6,23,.93));box-shadow:0 18px 44px rgba(0,0,0,.3);color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;display:flex;flex-direction:column;backdrop-filter:blur(16px)}
.st-operation-panel-head{flex:0 0 auto;padding:12px 11px 10px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.st-operation-panel-title{display:grid;gap:4px;min-width:0}
.st-operation-panel-title strong{font-size:13px;line-height:1.2;color:#fff}
.st-operation-panel-title span{font-size:10px;line-height:1.35;color:rgba(203,213,225,.55)}
.st-operation-count-pill{flex:0 0 auto;min-width:24px;height:22px;border-radius:999px;background:rgba(34,211,238,.14);border:1px solid rgba(34,211,238,.28);color:#a5f3fc;display:grid;place-items:center;font-size:11px;font-weight:900}
.st-operation-panel-list{flex:1 1 auto;min-height:0;overflow:auto;padding:9px;display:grid;align-content:start;gap:7px;scrollbar-width:none}
.st-operation-panel-list::-webkit-scrollbar{display:none}
.st-operation-empty{margin:0;border:1px dashed rgba(255,255,255,.12);border-radius:13px;padding:14px 10px;text-align:center;color:rgba(203,213,225,.56);font-size:11px;line-height:1.5;background:rgba(255,255,255,.035)}
.st-operation-item{min-width:0;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.055);padding:8px;box-shadow:0 8px 18px rgba(0,0,0,.13);display:grid;gap:5px}
.st-operation-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
.st-operation-item-main{min-width:0;display:grid;gap:3px}
.st-operation-item-source{display:block;max-width:100%;color:rgba(196,181,253,.78);font-size:9px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-operation-item-action{font-size:12px;font-weight:900;color:#fff;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-operation-item-summary{margin:0;color:rgba(226,232,240,.58);font-size:10px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-operation-item-remove{flex:0 0 auto;width:24px;height:24px;border:1px solid rgba(244,63,94,.28);border-radius:9px;background:rgba(244,63,94,.12);color:#fecdd3;font-size:15px;font-weight:900;line-height:1;cursor:pointer}
.st-operation-item-remove:active{transform:scale(.96)}
.st-operation-panel-preview{flex:0 0 auto;border-top:1px solid rgba(255,255,255,.08);padding:8px 9px;background:rgba(2,6,23,.36)}
.st-operation-panel-preview summary{cursor:pointer;list-style:none;color:rgba(203,213,225,.64);font-size:10px;font-weight:800}
.st-operation-panel-preview summary::-webkit-details-marker{display:none}
.st-operation-panel-preview pre{max-height:92px;overflow:auto;margin:6px 0 0;padding:7px;border-radius:10px;background:rgba(2,6,23,.6);border:1px solid rgba(255,255,255,.08);color:rgba(226,232,240,.72);font:9px/1.4 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;white-space:pre-wrap;word-break:break-word}
.st-operation-panel-actions{flex:0 0 auto;padding:9px;border-top:1px solid rgba(255,255,255,.08);display:grid;grid-template-columns:1fr;gap:7px}
.st-operation-panel-actions button{height:34px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);color:rgba(226,232,240,.88);font-size:11px;font-weight:900;cursor:pointer}
.st-operation-panel-actions button.primary{background:linear-gradient(135deg,#8b5cf6,#ec4899);border-color:rgba(255,255,255,.18);color:white;box-shadow:0 10px 22px rgba(131,24,67,.22)}
.st-operation-panel-actions button:disabled{opacity:.42;cursor:not-allowed;box-shadow:none;filter:grayscale(.35)}
.st-operation-panel-actions button:not(:disabled):active{transform:scale(.98)}
@media (max-width:500px){#st-operation-workspace{width:min(100%,430px);grid-template-columns:1fr;gap:8px;padding:6px;min-height:0}#st-operation-side-panel{height:auto!important;max-height:320px!important;border-radius:18px}.st-operation-panel-actions{grid-template-columns:1fr 1.2fr}.st-operation-panel-preview pre{max-height:82px}}
.st-operation-warning{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(2,6,23,.58);backdrop-filter:blur(8px);padding:22px}
.st-operation-warning-card{width:min(340px,calc(100vw - 44px));border:1px solid rgba(244,114,182,.35);border-radius:20px;background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.96));box-shadow:0 24px 70px rgba(0,0,0,.48);padding:16px;color:#f8fafc}
.st-operation-warning-card strong{display:block;font-size:15px;line-height:1.25}
.st-operation-warning-card p{margin:8px 0 14px;color:rgba(226,232,240,.72);font-size:12px;line-height:1.55}
.st-operation-warning-actions{display:grid;grid-template-columns:1fr;gap:8px}
.st-operation-warning-actions button{border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.06);padding:9px 10px;color:#e5e7eb;font-size:12px;font-weight:850}
.st-operation-warning-actions button[data-action="continue"]{background:linear-gradient(135deg,#a855f7,#ec4899);color:white;border-color:rgba(255,255,255,.18)}
.st-operation-warning-actions button[data-action="mute"]{color:#fde68a}
[data-st-phone-app="calendar"]>div{background:linear-gradient(180deg,#101426 0%,#080b14 55%,#05060b 100%)!important;color:#f8fafc!important}
[data-st-phone-app="calendar"]>div>div:first-child{background:rgba(3,6,14,.74)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:0 12px 30px rgba(0,0,0,.22)!important;backdrop-filter:blur(14px)}
[data-st-phone-app="calendar"] [class*="bg-white"],[data-st-phone-app="calendar"] [class*="bg-gray-"],[data-st-phone-app="calendar"] [class*="bg-slate-"]{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:0 10px 24px rgba(0,0,0,.16)!important}
[data-st-phone-app="calendar"] [class*="text-gray-8"],[data-st-phone-app="calendar"] [class*="text-gray-7"],[data-st-phone-app="calendar"] [class*="text-slate-9"],[data-st-phone-app="calendar"] [class*="text-white"]{color:#f8fafc!important}
[data-st-phone-app="calendar"] [class*="text-gray-6"],[data-st-phone-app="calendar"] [class*="text-gray-5"],[data-st-phone-app="calendar"] [class*="text-slate-5"]{color:rgba(226,232,240,.72)!important}
[data-st-phone-app="calendar"] button{border-radius:12px!important}
[data-st-phone-app="inventory"]>div,[data-st-phone-app="help"]>div{background:linear-gradient(180deg,#101426 0%,#080b14 56%,#05060b 100%)!important;color:#f8fafc!important}
[data-st-phone-app="inventory"]>div>div:first-child,[data-st-phone-app="help"]>div>div:first-child{background:rgba(3,6,14,.72)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:0 12px 30px rgba(0,0,0,.22)!important;backdrop-filter:blur(14px)}
[data-st-phone-app="inventory"] [class*="bg-white"],[data-st-phone-app="help"] [class*="bg-white"],[data-st-phone-app="inventory"] [class*="bg-gray-"],[data-st-phone-app="help"] [class*="bg-gray-"],[data-st-phone-app="help"] [class*="shadow"],[data-st-phone-app="help"] [class*="rounded"]{background:rgba(255,255,255,.055)!important;border-color:rgba(255,255,255,.08)!important;box-shadow:0 10px 24px rgba(0,0,0,.16)!important}
[data-st-phone-app="help"] article,[data-st-phone-app="help"] section,[data-st-phone-app="help"] [role="button"]{background:rgba(255,255,255,.055)!important;border-color:rgba(255,255,255,.08)!important;color:#f8fafc!important}
[data-st-phone-app="inventory"] [class*="text-gray-8"],[data-st-phone-app="help"] [class*="text-gray-8"],[data-st-phone-app="inventory"] [class*="text-gray-7"],[data-st-phone-app="help"] [class*="text-gray-7"]{color:#f8fafc!important}
[data-st-phone-app="inventory"] [class*="text-gray-6"],[data-st-phone-app="help"] [class*="text-gray-6"],[data-st-phone-app="inventory"] [class*="text-gray-5"],[data-st-phone-app="help"] [class*="text-gray-5"]{color:rgba(226,232,240,.72)!important}
[data-st-phone-app="inventory"] [class*="text-gray-4"],[data-st-phone-app="help"] [class*="text-gray-4"],[data-st-phone-app="inventory"] [class*="text-gray-3"],[data-st-phone-app="help"] [class*="text-gray-3"]{color:rgba(203,213,225,.48)!important}
[data-st-phone-app="inventory"] button,[data-st-phone-app="help"] button{border-radius:12px}
[data-st-phone-app="inventory"] button:hover,[data-st-phone-app="help"] button:hover{background:rgba(255,255,255,.08)!important}
[data-st-phone-app="inventory"] svg,[data-st-phone-app="help"] svg{color:rgba(125,211,252,.82)!important}
[data-st-phone-app="inventory"] .text-amber-700,[data-st-phone-app="help"] .text-amber-700{color:#fde68a!important}
[data-st-phone-app="inventory"] .bg-amber-50,[data-st-phone-app="help"] .bg-amber-50{background:rgba(245,158,11,.12)!important;border-color:rgba(245,158,11,.24)!important}
[data-st-phone-app="stats"]>div{background:linear-gradient(180deg,#101426 0%,#080b14 55%,#05060b 100%)!important;color:#f8fafc!important}
[data-st-phone-app="stats"]>div>div:first-child{background:rgba(3,6,14,.74)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:0 12px 30px rgba(0,0,0,.22)!important;backdrop-filter:blur(14px)}
[data-st-phone-app="stats"] [class*="bg-white"],[data-st-phone-app="stats"] [class*="bg-gray-"],[data-st-phone-app="stats"] [class*="bg-black/20"],[data-st-phone-app="stats"] [class*="bg-slate-"]{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:0 10px 24px rgba(0,0,0,.16)!important}
[data-st-phone-app="stats"] [class*="rounded-2xl"],[data-st-phone-app="stats"] [class*="rounded-xl"]{border-radius:14px!important}
[data-st-phone-app="stats"] [class*="text-gray-8"],[data-st-phone-app="stats"] [class*="text-gray-7"],[data-st-phone-app="stats"] [class*="text-slate-9"],[data-st-phone-app="stats"] [class*="text-white"]{color:#f8fafc!important}
[data-st-phone-app="stats"] [class*="text-gray-6"],[data-st-phone-app="stats"] [class*="text-gray-5"],[data-st-phone-app="stats"] [class*="text-slate-5"]{color:rgba(226,232,240,.72)!important}
[data-st-phone-app="stats"] [class*="text-gray-4"],[data-st-phone-app="stats"] [class*="text-gray-3"]{color:rgba(203,213,225,.52)!important}
[data-st-phone-app="stats"] button{border-radius:12px!important}
[data-st-phone-app="stats"] svg{color:rgba(125,211,252,.86)!important}
[data-st-phone-app="stats"] [data-st-native-role-selector="hidden"]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
[data-st-phone-app="stats"] [data-st-native-role-button="hidden"]{display:none!important}
[data-st-phone-app="stats"] .st-role-picker{flex:0 0 auto;margin:7px 10px 0;padding:8px;border-radius:15px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.035));box-shadow:0 12px 28px rgba(0,0,0,.2)}
[data-st-phone-app="stats"] .st-role-picker-row{display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-areas:"meta search" "list list";align-items:center;gap:7px;min-width:0}
[data-st-phone-app="stats"] .st-role-picker-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
[data-st-phone-app="stats"] .st-role-picker-title{font-size:11px;font-weight:850;color:rgba(248,250,252,.92);letter-spacing:0;line-height:1.15;white-space:nowrap}
[data-st-phone-app="stats"] .st-role-picker-count{font-size:9px;color:rgba(203,213,225,.48);white-space:nowrap;line-height:1.2}
[data-st-phone-app="stats"] .st-role-picker-meta{grid-area:meta;display:grid;gap:1px;min-width:0}
[data-st-phone-app="stats"] .st-role-picker-search{grid-area:search;width:100%;min-width:0;height:32px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(2,6,23,.45);color:#f8fafc;outline:none;padding:0 10px;font-size:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
[data-st-phone-app="stats"] .st-role-picker-search::placeholder{color:rgba(203,213,225,.38)}
[data-st-phone-app="stats"] .st-role-picker-search:focus{border-color:rgba(34,211,238,.55);box-shadow:0 0 0 3px rgba(34,211,238,.12)}
[data-st-phone-app="stats"] .st-role-picker-scroll{grid-area:list;display:grid;grid-template-columns:18px minmax(0,1fr) 18px;align-items:center;gap:4px;min-width:0}
[data-st-phone-app="stats"] .st-role-picker-list{display:flex;gap:7px;overflow-x:auto;padding:1px 0;scrollbar-width:none;min-width:0;width:100%;scroll-behavior:smooth}
[data-st-phone-app="stats"] .st-role-picker-list::-webkit-scrollbar{display:none}
[data-st-phone-app="stats"] .st-role-picker-arrow{width:18px;height:34px;border:1px solid rgba(125,211,252,.18)!important;border-radius:999px!important;background:rgba(15,23,42,.42)!important;color:rgba(186,230,253,.86)!important;font-size:13px;font-weight:900;display:grid;place-items:center;padding:0!important;line-height:1;box-shadow:0 8px 18px rgba(0,0,0,.14)}
[data-st-phone-app="stats"] .st-role-picker-arrow:disabled{opacity:.25}
[data-st-phone-app="stats"] .st-role-chip{flex:0 0 88px;min-width:88px;max-width:96px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.055);padding:6px 7px;color:rgba(226,232,240,.78);text-align:left;box-shadow:0 8px 18px rgba(0,0,0,.12);cursor:pointer}
[data-st-phone-app="stats"] .st-role-chip.active{border-color:rgba(34,211,238,.55);background:linear-gradient(135deg,rgba(34,211,238,.2),rgba(168,85,247,.14));color:#fff;box-shadow:0 10px 24px rgba(8,47,73,.25)}
[data-st-phone-app="stats"] .st-role-chip strong{display:block;font-size:12px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-role-chip small{display:block;margin-top:3px;font-size:10px;color:rgba(203,213,225,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-role-picker-empty{padding:7px 4px;color:rgba(203,213,225,.48);font-size:12px;white-space:nowrap}
[data-st-phone-app="stats"] [data-st-native-stats-content="hidden"]{display:none!important}
[data-st-phone-app="stats"] [data-st-native-stat-row="hidden"]{display:none!important}
[data-st-phone-app="stats"] [data-st-native-effect-row="hidden"]{display:none!important}
[data-st-phone-app="stats"] .st-stats-enhanced-content{flex:1 1 auto;min-height:0;overflow-y:auto;padding-bottom:14px;scrollbar-width:none}
[data-st-phone-app="stats"] .st-stats-enhanced-content::-webkit-scrollbar{display:none}
[data-st-phone-app="stats"] .st-stats-overview{flex:0 0 auto;margin:10px 12px 0;display:grid;gap:10px}
[data-st-phone-app="stats"] .st-target-summary{border:1px solid rgba(34,211,238,.2);border-radius:16px;background:linear-gradient(135deg,rgba(34,211,238,.16),rgba(168,85,247,.1) 58%,rgba(255,255,255,.035));box-shadow:0 12px 26px rgba(8,47,73,.18);padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
[data-st-phone-app="stats"] .st-target-summary-main{min-width:0;display:block}
[data-st-phone-app="stats"] .st-target-summary span{display:block;margin-bottom:5px;color:rgba(125,211,252,.74);font-size:10px;font-weight:850;letter-spacing:0}
[data-st-phone-app="stats"] .st-target-summary strong{display:block;color:#f8fafc;font-size:17px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-target-summary small{display:block;margin-top:5px;color:rgba(203,213,225,.58);font-size:11px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-target-delete{flex:0 0 auto;border:1px solid rgba(244,63,94,.32)!important;background:rgba(244,63,94,.13)!important;color:#fecdd3!important;height:32px;padding:0 11px;font-size:11px;font-weight:850;white-space:nowrap;box-shadow:0 8px 18px rgba(127,29,29,.18)!important}
[data-st-phone-app="stats"] .st-target-delete:active{transform:scale(.97)}
[data-st-phone-app="stats"] .st-stat-section{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.032));box-shadow:0 12px 26px rgba(0,0,0,.18);overflow:hidden}
[data-st-phone-app="stats"] .st-stat-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:rgba(2,6,23,.25);cursor:pointer;list-style:none;user-select:none}
[data-st-phone-app="stats"] .st-stat-section[open] .st-stat-section-head{border-bottom:1px solid rgba(255,255,255,.075)}
[data-st-phone-app="stats"] .st-stat-section-head::-webkit-details-marker{display:none}
[data-st-phone-app="stats"] .st-stat-section-head::after{content:"";flex:0 0 auto;width:7px;height:7px;border-right:2px solid rgba(125,211,252,.8);border-bottom:2px solid rgba(125,211,252,.8);transform:rotate(45deg);transition:transform .18s ease,margin .18s ease}
[data-st-phone-app="stats"] .st-stat-section[open] .st-stat-section-head::after{transform:rotate(225deg);margin-top:4px}
[data-st-phone-app="stats"] .st-stat-section-head strong{font-size:12px;color:#f8fafc;line-height:1.2}
[data-st-phone-app="stats"] .st-stat-section-head span{min-width:0;margin-left:auto;font-size:10px;color:rgba(203,213,225,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-profile-grid{display:grid;gap:8px;padding:10px}
[data-st-phone-app="stats"] .st-profile-item{border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(2,6,23,.28);padding:9px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
[data-st-phone-app="stats"] .st-profile-item strong{display:block;margin-bottom:5px;color:rgba(125,211,252,.82);font-size:11px;line-height:1.2}
[data-st-phone-app="stats"] .st-profile-item p{margin:0;color:rgba(226,232,240,.76);font-size:11px;line-height:1.55;white-space:pre-wrap}
[data-st-phone-app="stats"] .st-meter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px}
[data-st-phone-app="stats"] .st-meter-grid.is-core{grid-template-columns:1fr}
[data-st-phone-app="stats"] .st-meter{min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(2,6,23,.28);padding:8px 9px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
[data-st-phone-app="stats"] .st-meter.is-overflow{border-color:rgba(251,191,36,.38);background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(2,6,23,.3));box-shadow:0 0 0 1px rgba(251,191,36,.06),inset 0 1px 0 rgba(255,255,255,.05)}
[data-st-phone-app="stats"] .st-meter-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:7px}
[data-st-phone-app="stats"] .st-meter-label{min-width:0;font-size:11px;font-weight:800;color:rgba(226,232,240,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-meter-value{font-size:12px;font-weight:900;color:#f8fafc;font-variant-numeric:tabular-nums;white-space:nowrap}
[data-st-phone-app="stats"] .st-meter.is-overflow .st-meter-value{color:#fde68a;text-shadow:0 0 16px rgba(251,191,36,.32)}
[data-st-phone-app="stats"] .st-meter-track{position:relative;height:6px;border-radius:999px;background:rgba(15,23,42,.92);overflow:hidden;border:1px solid rgba(255,255,255,.06)}
[data-st-phone-app="stats"] .st-meter-fill{position:absolute;inset:0 auto 0 0;width:var(--pct,0%);border-radius:999px;background:linear-gradient(90deg,#22d3ee,#8b5cf6);box-shadow:0 0 14px rgba(34,211,238,.24)}
[data-st-phone-app="stats"] .st-meter.is-overflow .st-meter-fill{width:100%;background:linear-gradient(90deg,#f59e0b,#f43f5e,#a855f7);box-shadow:0 0 18px rgba(251,191,36,.28)}
[data-st-phone-app="stats"] .st-meter.is-overflow .st-meter-track::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(110deg,rgba(255,255,255,.38) 0 5px,transparent 5px 10px);mix-blend-mode:screen;opacity:.55}
[data-st-phone-app="stats"] .st-meter-overflow{display:inline-flex;align-items:center;margin-left:4px;border:1px solid rgba(251,191,36,.28);border-radius:999px;background:rgba(251,191,36,.14);padding:1px 5px;font-size:9px;color:#fde68a;vertical-align:1px}
[data-st-phone-app="stats"] .st-count-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:10px}
[data-st-phone-app="stats"] .st-count-chip{min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(2,6,23,.28);padding:8px 7px;text-align:center}
[data-st-phone-app="stats"] .st-count-chip strong{display:block;color:#f8fafc;font-size:15px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
[data-st-phone-app="stats"] .st-count-chip span{display:block;margin-top:5px;color:rgba(203,213,225,.58);font-size:10px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-effects-panel{flex:0 0 auto;margin:10px 12px 14px;display:grid;gap:10px}
[data-st-phone-app="stats"] .st-effect-card{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035));box-shadow:0 12px 26px rgba(0,0,0,.18);overflow:hidden}
[data-st-phone-app="stats"] .st-effect-card.is-temporary{border-color:rgba(34,211,238,.18)}
[data-st-phone-app="stats"] .st-effect-card.is-permanent{border-color:rgba(168,85,247,.2)}
[data-st-phone-app="stats"] .st-effect-card summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;background:rgba(2,6,23,.26);cursor:pointer;list-style:none;user-select:none}
[data-st-phone-app="stats"] .st-effect-card[open] summary{border-bottom:1px solid rgba(255,255,255,.08)}
[data-st-phone-app="stats"] .st-effect-card summary::-webkit-details-marker{display:none}
[data-st-phone-app="stats"] .st-effect-card summary::after{content:"";flex:0 0 auto;width:7px;height:7px;border-right:2px solid rgba(203,213,225,.7);border-bottom:2px solid rgba(203,213,225,.7);transform:rotate(45deg);transition:transform .18s ease,margin .18s ease}
[data-st-phone-app="stats"] .st-effect-card[open] summary::after{transform:rotate(225deg);margin-top:4px}
[data-st-phone-app="stats"] .st-effect-title{display:flex;align-items:center;gap:8px;min-width:0}
[data-st-phone-app="stats"] .st-effect-dot{width:7px;height:7px;border-radius:999px;background:#67e8f9;box-shadow:0 0 18px rgba(103,232,249,.55)}
[data-st-phone-app="stats"] .st-effect-card.is-permanent .st-effect-dot{background:#c084fc;box-shadow:0 0 18px rgba(192,132,252,.55)}
[data-st-phone-app="stats"] .st-effect-title strong{font-size:12px;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-effect-count{font-size:10px;color:rgba(203,213,225,.52);white-space:nowrap}
[data-st-phone-app="stats"] .st-effect-empty{padding:14px 12px;color:rgba(203,213,225,.58);font-size:12px}
[data-st-phone-app="stats"] .st-effect-list{display:grid;gap:8px;padding:10px}
[data-st-phone-app="stats"] .st-effect-item{border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(2,6,23,.28);padding:10px}
[data-st-phone-app="stats"] .st-effect-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
[data-st-phone-app="stats"] .st-effect-item strong{display:block;min-width:0;color:rgba(248,250,252,.94);font-size:12px;line-height:1.35;overflow:hidden;text-overflow:ellipsis}
[data-st-phone-app="stats"] .st-effect-delete{flex:0 0 auto;border:1px solid rgba(244,63,94,.28)!important;border-radius:999px!important;background:rgba(244,63,94,.1)!important;color:#fecdd3!important;height:24px;padding:0 8px!important;font-size:10px;font-weight:850;white-space:nowrap;box-shadow:none!important}
[data-st-phone-app="stats"] .st-effect-delete:active{transform:scale(.96)}
[data-st-phone-app="stats"] .st-effect-item p{margin:5px 0 0;color:rgba(226,232,240,.72);font-size:11px;line-height:1.5;white-space:pre-wrap}
[data-st-phone-app="stats"] .st-effect-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
[data-st-phone-app="stats"] .st-effect-meta span{border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.055);color:rgba(226,232,240,.7);padding:3px 7px;font-size:10px;line-height:1.2}
.st-profile-body{padding:8px;display:grid;place-items:center;background:radial-gradient(circle at 50% -10%,rgba(255,255,255,.16),transparent 34%),linear-gradient(180deg,#1f2937,#0f172a)}
.st-person-paper{position:relative;width:min(100%,344px);height:100%;overflow:auto;border-radius:4px;background:#f7f1e5;color:#33291f;font-family:"Songti SC","STSong","Noto Serif SC",serif;box-shadow:0 18px 45px rgba(0,0,0,.42),inset 0 0 0 2px rgba(81,64,49,.7),inset 0 0 0 8px #f7f1e5,inset 0 0 0 9px rgba(81,64,49,.5);padding:29px 27px 22px;scrollbar-width:none}
.st-person-paper::-webkit-scrollbar{display:none}
.st-person-back,.st-person-paper-nav{position:absolute;z-index:4;border:1px solid rgba(81,64,49,.5);background:rgba(247,241,229,.92);color:#44362a;display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 7px rgba(60,45,32,.18);pointer-events:auto}
.st-person-back{top:18px;left:18px;width:28px;height:28px;border-radius:999px;font-size:23px;line-height:1}
.st-person-photo-wrap{position:relative;z-index:1;width:65%;max-width:206px;margin:0 auto 11px}
.st-person-paper-nav{top:50%;width:28px;height:54px;border-radius:999px;font-size:30px;line-height:1;transform:translateY(-50%)}
.st-person-paper-nav[data-profile-action="prev"]{left:-33px}
.st-person-paper-nav[data-profile-action="next"]{right:-33px}
.st-person-back:active{transform:scale(.96)}
.st-person-paper-nav:active{transform:translateY(-50%) scale(.96)}
.st-person-paper-head{position:relative;z-index:1;text-align:center;margin:3px 0 9px}
.st-person-paper-head small{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;width:70%;margin:0 auto 4px;color:rgba(68,54,42,.56);font-size:14px;line-height:1}
.st-person-paper-head small::before,.st-person-paper-head small::after{content:"";height:1px;background:rgba(81,64,49,.42)}
.st-person-paper-head h2{margin:0;color:#403126;font-size:34px;line-height:1.05;letter-spacing:.1em;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,.65)}
.st-person-photo{width:100%;aspect-ratio:4/5;border:3px double rgba(81,64,49,.45);background:#eee8dc;overflow:hidden;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 12px rgba(80,64,48,.13)}
.st-person-photo img{width:100%;height:100%;object-fit:cover;display:block}
.st-person-photo-empty{width:100%;height:100%;display:grid;place-items:center;text-align:center;color:rgba(68,54,42,.42);font-size:12px;font-weight:900;letter-spacing:.1em;background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(220,211,195,.45))}
.st-person-lines{position:relative;z-index:1;display:grid;gap:0}
.st-person-line{display:grid;grid-template-columns:76px minmax(0,1fr);gap:8px;align-items:start;min-height:29px;border-bottom:1px dashed rgba(81,64,49,.35);padding:5px 0}
.st-person-line span{color:#33291f;font-size:15px;font-weight:900;letter-spacing:.12em;white-space:nowrap}
.st-person-line strong{min-width:0;color:#30261d;font-size:15px;font-weight:650;line-height:1.36;white-space:pre-wrap;overflow-wrap:anywhere}
.st-person-line.is-long strong{font-size:13px;line-height:1.42}
.st-person-page-count{position:relative;z-index:1;margin-top:12px;text-align:center;color:rgba(68,54,42,.48);font-size:11px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-weight:800}
.st-person-card.is-enter-left,.st-person-paper.is-enter-left{animation:stPersonEnterLeft .22s ease-out}
.st-person-card.is-enter-right,.st-person-paper.is-enter-right{animation:stPersonEnterRight .22s ease-out}
@keyframes stPersonEnterLeft{from{opacity:.55;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
@keyframes stPersonEnterRight{from{opacity:.55;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
.st-person-empty{border:1px dashed rgba(81,64,49,.38);border-radius:10px;background:rgba(247,241,229,.9);padding:22px 14px;text-align:center;color:rgba(68,54,42,.64);font-size:13px;line-height:1.55}
	\`;
    document.head.appendChild(style);
  }

  function findPhoneRoot(from) {
    return from?.closest?.(".w-full.h-full.bg-black.overflow-hidden.relative")
      || document.querySelector(".w-full.h-full.bg-black.overflow-hidden.relative")
      || document.querySelector("#root")
      || document.body;
  }

  function clearPhoneInternalOverlays(root) {
    root?.querySelectorAll?.(".st-mchan-internal-app,.st-add-role-app,.st-calendar-lite-app,.st-timetable-app,.st-clock-app,.st-profile-app,.st-map-app,.st-school-app").forEach((element) => element.remove());
  }

  function ensureActiveThread(state) {
    const threads = getBoardThreads(state);
    if (!threads.some((thread) => thread.id === state.activeThreadId)) {
      state.activeThreadId = null;
    }
  }

  function renderPage(page, state) {
    ensureActiveThread(state);
    const board = getBoard(state);
    const threads = getBoardThreads(state);
    const thread = getActiveThread(state);
    const boardsHtml = state.boards.map((item) => (
      '<button class="st-mchan-board ' + (item.id === state.activeBoardId ? "active" : "") + '" data-mchan-action="board" data-board-id="' + escapeAttr(item.id) + '">' + escapeHtml(item.name) + '<small>' + state.threads.filter((thread) => thread.boardId === item.id).length + '</small></button>'
    )).join("");
    const threadsHtml = threads.map((item) => (
      '<button class="st-mchan-thread ' + (item.id === state.activeThreadId ? "active" : "") + '" data-mchan-action="thread" data-thread-id="' + escapeAttr(item.id) + '" data-search-text="' + escapeAttr(threadSearchText(item)) + '">' +
        '<strong>' + (item.pinned ? '<span class="st-mchan-pin">置顶</span>' : '') + escapeHtml(item.title) + '</strong>' +
        '<small>' + escapeHtml(item.author) + ' · ' + escapeHtml(formatTime(item.updatedAt)) + ' · ' + item.replies.length + ' 楼</small>' +
      '</button>'
    )).join("");
    const repliesHtml = thread ? (thread.replies || []).map((reply) => (
      '<article class="st-mchan-reply" data-reply-id="' + escapeAttr(reply.id) + '">' +
        '<header><span>' + escapeHtml(reply.author) + '</span><span>' + escapeHtml(formatTime(reply.createdAt)) + '</span></header>' +
        '<p>' + escapeHtml(reply.body) + '</p>' +
      '</article>'
    )).join("") : "";
    const detailHtml = thread
      ? '<article class="st-mchan-thread-detail">' +
          '<button class="st-mchan-button secondary st-mchan-detail-back" data-mchan-action="back-list">返回匿名版首页</button>' +
          '<div class="st-mchan-thread-head">' +
            '<div><h3>' + escapeHtml(thread.title) + '</h3><small>' + escapeHtml(thread.author) + ' · ' + escapeHtml(formatTime(thread.updatedAt)) + '</small></div>' +
          '</div>' +
          '<p class="st-mchan-thread-body">' + escapeHtml(thread.body) + '</p>' +
          '<section class="st-mchan-replies">' + (repliesHtml || '<p class="st-mchan-empty">暂无回复。</p>') + '</section>' +
        '</article>'
      : "";
    const listHtml =
      '<section class="st-mchan-list">' +
        '<div class="st-mchan-board-meta"><div><strong>' + escapeHtml(board?.name || "匿名版") + '</strong><small>' + escapeHtml(board?.description || "") + '</small></div></div>' +
        '<input class="st-mchan-search" value="' + escapeAttr(state.query) + '" placeholder="搜索帖子 / 楼层" />' +
        '<div class="st-mchan-threads">' + (threadsHtml || '<p class="st-mchan-empty">这个版块还没有帖子。</p>') + '</div>' +
      '</section>';
    page.innerHTML =
      '<header class="st-mchan-header">' +
        '<button class="st-mchan-back" data-mchan-action="back" title="返回桌面">‹</button>' +
        '<div class="st-mchan-title"><strong>MC匿名版</strong><span>手机内部论坛</span></div>' +
      '</header>' +
      '<nav class="st-mchan-boards">' + boardsHtml + '</nav>' +
      '<main class="st-mchan-content ' + (thread ? "is-detail" : "is-list") + '">' + (thread ? detailHtml : listHtml) + '</main>';
    enableHorizontalDragScroll(page.querySelector(".st-mchan-boards"));
    bindPage(page, state);
    filterThreads(page, state.query);
  }

  function filterThreads(page, query) {
    const normalized = String(query || "").trim().toLowerCase();
    page.querySelectorAll(".st-mchan-thread[data-search-text]").forEach((row) => {
      row.hidden = Boolean(normalized) && !String(row.dataset.searchText || "").includes(normalized);
    });
  }

  function bindPage(page, state) {
    page.querySelector('[data-mchan-action="back"]')?.addEventListener("click", () => {
      page.remove();
      recordOperation("关闭匿名版");
    });
    page.querySelector('[data-mchan-action="back-list"]')?.addEventListener("click", () => {
      state.activeThreadId = null;
      saveState(state);
      renderPage(page, state);
    });
    page.querySelectorAll('[data-mchan-action="board"]').forEach((button) => {
      button.addEventListener("click", () => {
        state.activeBoardId = button.dataset.boardId || state.activeBoardId;
        state.activeThreadId = null;
        saveState(state);
        recordOperation("切换版块：" + (getBoard(state)?.name || state.activeBoardId));
        renderPage(page, state);
      });
    });
    page.querySelectorAll('[data-mchan-action="thread"]').forEach((button) => {
      button.addEventListener("click", () => {
        state.activeThreadId = button.dataset.threadId || state.activeThreadId;
        saveState(state);
        renderPage(page, state);
      });
    });
    page.querySelector(".st-mchan-search")?.addEventListener("input", (event) => {
      state.query = event.target.value;
      saveState(state);
      filterThreads(page, state.query);
    });
  }

  function openMchanPage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "mchan";
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-mchan-internal-app";
    page.setAttribute("aria-label", "MC匿名版");
    root.appendChild(page);
    const state = loadState();
    saveState(state);
    recordOperation("打开匿名版");
    renderPage(page, state);
  }

  function addRolePayloadFromForm(page) {
    const roleName = page.querySelector("[name='roleName']")?.value?.trim() || "";
    const aliases = page.querySelector("[name='aliases']")?.value?.trim() || "";
    const summary = page.querySelector("[name='summary']")?.value?.trim() || "";
    const relation = page.querySelector("[name='relation']")?.value?.trim() || "";
    const appearance = page.querySelector("[name='appearance']")?.value?.trim() || "";
    const personality = page.querySelector("[name='personality']")?.value?.trim() || "";
    const extra = page.querySelector("[name='extra']")?.value?.trim() || "";
    if (!summary) return { error: "请输入目标定位 / 身体描述。" };
    const keys = [roleName].concat(aliases.split(/[，,、\\s]+/).map((item) => item.trim()).filter(Boolean));
    return {
      payload: {
        来源: "扫描角色",
        操作: "请求扫描并锁定角色",
        角色名: roleName || "由AI根据扫描目标随机命名",
        命名方式: roleName ? "使用用户填写的角色名" : "AI根据{{user}}看到并锁定的目标随机取名",
        别名或关键词: keys.filter(Boolean).join("、") || "由AI根据目标特征补全",
        Slash指令: roleName ? "/add " + roleName : "/add <AI随机生成的角色名>",
        扫描前提: "{{user}}主动看到当前场景中的目标，并用手机扫描/锁定该目标；不是凭空创建场外角色。",
        人设草稿: {
          "目标定位/身体": summary,
          与主角关系: relation,
          档案外观线索: appearance,
          性格: personality,
          其他: extra,
        },
        AI执行规范: [
          "本操作表示 {{user}} 在当前剧情中主动看到目标，并用手机扫描/锁定她；AI只能基于当前场景可见信息与用户填写的目标定位/身体来建档。",
          "如果用户未填写角色名，AI先为目标随机取一个自然、可长期使用、符合场景和身体特征的姓名，避免使用“未知角色”“目标A”等占位名。",
          "取名后先使用 /add 角色名，在角色路径下新增角色，再按本规则更新 stat_data.角色 中的新角色变量。",
          "新增前先参考西园寺爱丽莎、月咏深雪、犬冢夏美的变量结构与人设粒度：档案、身份、关系、性格、警戒/抗性和此刻心理。",
          "新角色沿用西园寺爱丽莎、月咏深雪、犬冢夏美的 stat_data.角色 结构；需要包含档案对象、心理、关系/状态、次数和效果等字段，默认值可按常识处理。",
          "若目标定位/身体存在特殊体质、身份、处境或抗性，AI可据此决定少量初始值差异，并在剧情中保持合理性。",
          "不要覆盖或删除西园寺爱丽莎、月咏深雪、犬冢夏美。"
        ]
      }
    };
  }

  const SCAN_EXAMPLES_STORAGE_KEY = "st-card-workbench:scan-examples:v1";
  const SCAN_EXAMPLE_FIELDS = ["title", "note", "roleName", "aliases", "summary", "relation", "appearance", "personality", "extra"];
  const SCAN_FORM_STASH_KEY = "st-card-workbench:scan-form-stash:v1";
  const ADD_ROLE_FORM_FIELDS = ["roleName", "aliases", "summary", "relation", "appearance", "personality", "extra"];
  const STATIC_SCAN_EXAMPLE_FALLBACKS = [
    {
      title: "阴郁同学",
      note: "已填写示例",
      roleName: "白枢暗子",
      aliases: "暗子, 白枢同学, 灵异女, 体育健将",
      summary: "{{user}}在同班教室或走廊里看到并锁定的阴郁系同班女学生。她平时沉默寡言、神经兮兮，听说喜欢灵异学，对鬼怪和怪谈异常感兴趣。",
      relation: "同班同学；她平时几乎不主动社交，只会在灵异、鬼怪、都市传说等话题被触发时突然打开话匣子。",
      appearance: "日常打扮刻意朴素阴沉，刘海和宽松校服遮住大半气质，看起来瘦弱不起眼；但只要认真整理发型、妆容和衣装，会显出比爱丽莎还要精致的美人感。身体实际肌肉饱满，有四块腹肌，运动能力很强却完全不像外表。",
      personality: "阴郁、神经质、沉默寡言，对灵异学和鬼怪极端兴奋；一旦打开话匣子会变成惹人烦的话痨。体育成绩优秀，是夏美之外的第二大体育健将，但本人对体育完全不感兴趣。",
      extra: "AI建档时保留：同班同学、阴郁灵异爱好者、沉默寡言但话痨反差、打扮后精致美人、隐藏运动天赋和四块腹肌、对体育无兴趣。"
    },
    {
      title: "异世界杀手",
      note: "已填写示例",
      roleName: "千杀百花",
      aliases: "百花, 异世界杀手, 千杀, 勇者小队成员",
      summary: "{{user}}在她确认主角很弱、准备离开前扫描并锁定的异世界杀手。她来自中世纪剑与魔法异世界，身形小巧可爱，曾是拯救异世界人类的原勇者小队成员与英雄之一。",
      relation: "她误会{{user}}是把她传送来的元凶，短暂敌视和试探；确认{{user}}很弱后决定离开，在离开前被手机扫描。她曾与勇者并肩拯救异世界人类，对勇者抱有倾慕却无法理解这种情感，只会在勇者面前出现少见的羞涩和迟疑。",
      appearance: "小巧可爱的少女体型，动作轻盈隐蔽，衣装带有中世纪剑与魔法世界的皮革护具、短刃和旅行痕迹。",
      personality: "不善言辞，戒备心强，行动比语言更直接；作为杀手习惯先观察威胁，确认无害后迅速撤离。她是英雄却不擅长表达荣耀感，对勇者的倾慕会被她误认为战友信赖或战斗习惯。",
      extra: "保持异世界来客、原勇者小队成员、拯救异世界人类的英雄、杀手身份、对勇者倾慕但不理解恋爱情感、勇者面前会羞涩、误会与离开前被扫描的时间点；AI建档时可补全她的世界观常识、战斗经验和对现代环境的不适应。"
    },
    {
      title: "作弊模式",
      note: "已填写示例",
      roleName: "中村樱",
      aliases: "樱酱, 中村总裁, Nakamura Sakura",
      summary: "{{user}}看到并锁定的大公司完美女总裁。她32岁，事业、气场和资源都近乎完美，却毫无恋爱经验；看到{{user}}第一眼便认定他是最适合承接她自毁愿望的天选之人，会主动提供大额资金与资源支持。选择这个静态示例扫描她时，AI应让她立刻主动制造与{{user}}独处的机会。",
      relation: "她有一位名叫神宫寺莲的未婚夫，对方是家世、学历、品格、事业能力和外貌都无可挑剔的精英青年；两人感情很好，外界看来是理想婚约，但一直停留在柏拉图式恋爱，亲密关系干净、温柔、克制。正因现实关系太完美、太安全，她把无法说出口的自毁欲和被弄乱的渴望投向{{user}}。面对{{user}}时会刻意装可爱撒娇，自称“樱酱”，用成熟女人的资源和权力包裹出黏人、讨好、求夸奖的姿态；静态示例扫描后，她会现场迫不及待地痴笑，写下一张《人权自愿放弃协议》，自己先签好名字，再眼神发亮地递给{{user}}要求他签字。",
      appearance: "32岁但保养极好，五官精致，眼神沉静锐利，长发、香水和高级珠宝都控制得恰到好处。平时是性感沉稳的女总裁，西装裙、高跟鞋、黑色丝袜、贴身衬衫和昂贵外套让她像不可接近的成功女性；在{{user}}面前会故意放软嗓音、眨眼、歪头、拉近距离，把成熟身体和幼稚撒娇感混在一起。",
      personality: "公开场合冷静、强势、克制，判断力和执行力极强；私下隐藏的痴女属性非常夸张，会把被{{user}}注视、命令、利用都理解成特殊恩宠。她明知自己是成熟成年人和大公司掌权者，却会在{{user}}面前故意降格成黏人的“樱酱”，索要夸奖、撒娇讨好、主动献上金钱和便利，越是被{{user}}轻视或随意驱使，越觉得自己被选中。她不会被动等待剧情安排，只要意识到{{user}}在附近，就会主动创造再次见面、单独谈话、同行或接受指示的理由。",
      extra: "作为“作弊模式”示例，她可以提供远超普通学生角色的资金、渠道、场地和社会资源支持。AI建档时保留：成年人身份、完美女总裁、稳定未婚关系、未婚夫神宫寺莲是无可挑剔的精英青年、柏拉图式恋爱、隐藏且夸张的痴女属性、自毁愿望、对{{user}}装可爱撒娇、自称樱酱、持续大额资金支持、扫描后立刻制造独处、现场痴笑写《人权自愿放弃协议》、自己先签再让{{user}}签；不要把未婚夫写成感情破裂或恶劣关系，他和她感情很好，只是亲密关系长期克制。"
    }
  ];

  function normalizeStaticScanExample(example, index) {
    const fallback = STATIC_SCAN_EXAMPLE_FALLBACKS[index] || STATIC_SCAN_EXAMPLE_FALLBACKS[0] || {};
    const source = example && typeof example === "object" ? example : {};
    const next = {};
    for (const key of SCAN_EXAMPLE_FIELDS) {
      next[key] = String(source[key] ?? fallback[key] ?? "");
    }
    return next;
  }

  function shouldUseScanExampleFallback(example, index) {
    if (!example || typeof example !== "object" || Array.isArray(example)) return false;
    if (index === 0 && String(example.note || "").trim() === "临时测试示例2") return true;
    if (index === 1) {
      const text = SCAN_EXAMPLE_FIELDS.map((key) => String(example[key] || "")).join("\\n");
      return String(example.roleName || "").trim() === "千杀百花" && !text.includes("勇者") && !text.includes("英雄");
    }
    if (index !== 2) return false;
    const contentFields = ["roleName", "aliases", "summary", "relation", "appearance", "personality", "extra"];
    const isContentEmpty = contentFields.every((key) => !String(example[key] || "").trim());
    const title = String(example.title || "").trim();
    const note = String(example.note || "").trim();
    return isContentEmpty && (!title || title === "示例人物 3") && (!note || note === "预留空白");
  }

  function getStaticScanExamples() {
    let parsed = null;
    try {
      parsed = JSON.parse(localStorage.getItem(SCAN_EXAMPLES_STORAGE_KEY) || "null");
    } catch {}
    const source = Array.isArray(parsed) ? parsed : STATIC_SCAN_EXAMPLE_FALLBACKS;
    return STATIC_SCAN_EXAMPLE_FALLBACKS.map((_, index) => normalizeStaticScanExample(shouldUseScanExampleFallback(source[index], index) ? null : source[index], index));
  }

  function renderStaticScanExamples() {
    return '<div class="st-add-role-examples">' + getStaticScanExamples().map((example, index) => {
      const canApply = Boolean(example.summary);
      const title = example.title || ("示例人物 " + (index + 1));
      const note = canApply ? (example.note || "可填入") : "未填写";
      return '<button type="button" tabindex="-1" class="st-add-role-example ' + (canApply ? "" : "is-empty") + '" data-add-role-example="' + index + '"' + (canApply ? "" : " disabled") + '>' +
        '<strong>' + escapeHtml(title) + '</strong>' +
        '<small>' + escapeHtml(note) + '</small>' +
      '</button>';
    }).join("") + '</div>';
  }

  function readAddRoleForm(page) {
    const values = {};
    ADD_ROLE_FORM_FIELDS.forEach((field) => {
      values[field] = page.querySelector("[name='" + field + "']")?.value || "";
    });
    return values;
  }

  function hasAddRoleFormContent(values) {
    return Object.values(values || {}).some((value) => String(value || "").trim());
  }

  function writeAddRoleForm(page, values) {
    ADD_ROLE_FORM_FIELDS.forEach((field) => {
      const input = page.querySelector("[name='" + field + "']");
      if (input) input.value = values?.[field] || "";
    });
  }

  function saveAddRoleStash(page, values = readAddRoleForm(page)) {
    page.__stAddRoleStash = { ...values };
    try {
      localStorage.setItem(SCAN_FORM_STASH_KEY, JSON.stringify(page.__stAddRoleStash));
    } catch {}
    updateAddRoleRestoreButton(page);
  }

  function readAddRoleStash(page) {
    if (page.__stAddRoleStash) return page.__stAddRoleStash;
    try {
      const parsed = JSON.parse(localStorage.getItem(SCAN_FORM_STASH_KEY) || "null");
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
    return null;
  }

  function updateAddRoleRestoreButton(page) {
    const button = page.querySelector('[data-add-role-action="restore"]');
    if (!button) return;
    button.disabled = !hasAddRoleFormContent(readAddRoleStash(page));
  }

  function applyStaticScanExample(page, example) {
    if (!example || !example.summary) return;
    const current = readAddRoleForm(page);
    if (hasAddRoleFormContent(current)) saveAddRoleStash(page, current);
    writeAddRoleForm(page, example);
    page.querySelector(".st-add-role-status").textContent = "已填入：" + (example.title || "示例人物") + "。可点“回撤”恢复刚才内容。";
  }

  function renderAddRolePage(page) {
    page.innerHTML =
      '<header class="st-add-role-header">' +
        '<button class="st-add-role-back" data-add-role-action="back" title="返回桌面">‹</button>' +
        '<div class="st-add-role-title"><strong>扫描角色</strong><span>{{user}} 看到目标后锁定，由 AI 建档</span></div>' +
      '</header>' +
      '<main class="st-add-role-body">' +
        '<section class="st-add-role-card">' +
          '<h3>扫描目标</h3>' +
          '<div class="st-add-role-grid">' +
            '<label class="st-add-role-field"><span>角色名（可选）</span><input name="roleName" autocomplete="off" placeholder="例如：白枢暗子；留空由 AI 随机"></label>' +
            '<label class="st-add-role-field"><span>别名 / 关键词</span><input name="aliases" autocomplete="off" placeholder="用逗号分隔，可留空"></label>' +
            '<label class="st-add-role-field"><span>目标定位 / 身体（必填）</span><textarea name="summary" placeholder="{{user}}看见并锁定的目标：她的身体、姿态、服装、所在场景、显著特征"></textarea></label>' +
            '<label class="st-add-role-field"><span>与主角关系</span><textarea name="relation" placeholder="可留空，由 AI 按场景随机"></textarea></label>' +
            '<label class="st-add-role-field"><span>档案外观线索</span><textarea name="appearance" placeholder="可留空；需要保留到人物档案的外貌、衣着或身体细节"></textarea></label>' +
            '<label class="st-add-role-field"><span>性格 / 抗性</span><textarea name="personality" placeholder="可留空；警戒心、抗性或容易被影响的点"></textarea></label>' +
            '<label class="st-add-role-field"><span>补充备注</span><textarea name="extra" placeholder="需要 AI 特别保留或避免的设定"></textarea></label>' +
          '</div>' +
        '</section>' +
        '<section class="st-add-role-card">' +
          '<h3>静态示例人物</h3>' +
          renderStaticScanExamples() +
        '</section>' +
        '<section class="st-add-role-card">' +
          '<h3>AI 建档规则</h3>' +
          '<div class="st-add-role-hint">扫描角色表示 {{user}} 主动看到当前目标并锁定她。角色名可留空，由 AI 根据目标身体、场景和气质随机取名；随后使用 /add 建档，并对照西园寺爱丽莎、月咏深雪、犬冢夏美的变量结构补齐 stat_data.角色。扫描请求不会要求 AI 新增或修改世界书；如果你希望角色长期拥有独立世界书条目，请在工作台或酒馆里自行补充。</div>' +
        '</section>' +
        '<div class="st-add-role-status" aria-live="polite"></div>' +
        '<div class="st-add-role-actions">' +
          '<button type="button" class="st-add-role-button secondary" data-add-role-action="stash">暂存</button>' +
          '<button type="button" class="st-add-role-button secondary" data-add-role-action="restore" disabled>回撤</button>' +
          '<button type="button" class="st-add-role-button secondary" data-add-role-action="clear">清空</button>' +
          '<button type="button" class="st-add-role-button" data-add-role-action="submit">写入输入框</button>' +
        '</div>' +
      '</main>';
    page.querySelector('[data-add-role-action="back"]')?.addEventListener("click", () => {
      page.remove();
    });
    page.querySelector('[data-add-role-action="clear"]')?.addEventListener("click", () => {
      page.querySelectorAll("input,textarea").forEach((input) => input.value = "");
      page.querySelector(".st-add-role-status").textContent = "";
      page.querySelector("[name='summary']")?.focus();
    });
    page.querySelector('[data-add-role-action="stash"]')?.addEventListener("click", () => {
      const values = readAddRoleForm(page);
      const status = page.querySelector(".st-add-role-status");
      if (!hasAddRoleFormContent(values)) {
        status.textContent = "没有可暂存的内容。";
        page.querySelector("[name='summary']")?.focus();
        return;
      }
      saveAddRoleStash(page, values);
      status.textContent = "已暂存当前扫描草稿。";
    });
    page.querySelector('[data-add-role-action="restore"]')?.addEventListener("click", () => {
      const values = readAddRoleStash(page);
      const status = page.querySelector(".st-add-role-status");
      if (!hasAddRoleFormContent(values)) {
        status.textContent = "没有可回撤的暂存内容。";
        return;
      }
      writeAddRoleForm(page, values);
      status.textContent = "已回撤到暂存内容。";
      page.querySelector("[name='summary']")?.focus();
    });
    page.querySelector('[data-add-role-action="submit"]')?.addEventListener("click", () => {
      const result = addRolePayloadFromForm(page);
      const status = page.querySelector(".st-add-role-status");
      if (result.error) {
        status.textContent = result.error;
        page.querySelector("[name='summary']")?.focus();
        return;
      }
      appendAppOperation(result.payload);
      status.textContent = "已暂存扫描请求，等待 AI 锁定目标、命名并更新角色变量。世界书需用户自行维护。";
    });
    page.querySelectorAll("[data-add-role-example]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
      }, true);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const outerScroll = page.__stAddRoleOuterScroll || { x: window.scrollX, y: window.scrollY, body: document.scrollingElement?.scrollTop ?? 0 };
        const index = Number(button.getAttribute("data-add-role-example"));
        applyStaticScanExample(page, getStaticScanExamples()[index]);
        button.blur?.();
        requestAnimationFrame(() => {
          window.scrollTo(outerScroll.x || 0, outerScroll.y || 0);
          if (document.scrollingElement) document.scrollingElement.scrollTop = outerScroll.body || 0;
        });
      }, true);
    });
    updateAddRoleRestoreButton(page);
  }

  function openAddRolePage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "add-role";
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-add-role-app";
    page.setAttribute("aria-label", "扫描角色");
    page.__stAddRoleOuterScroll = { x: window.scrollX, y: window.scrollY, body: document.scrollingElement?.scrollTop ?? 0 };
    root.appendChild(page);
    renderAddRolePage(page);
  }

  function detectPhoneApp(root) {
    if (!root) return "";
    if (root.querySelector(".st-add-role-app")) return "add-role";
    if (root.querySelector(".st-mchan-internal-app")) return "mchan";
    if (root.querySelector(".st-calendar-lite-app")) return "calendar-lite";
    if (root.querySelector(".st-timetable-app")) return "timetable";
    if (root.querySelector(".st-clock-app")) return "clock";
    if (root.querySelector(".st-profile-app")) return "profile";
    if (root.querySelector(".st-map-app")) return "map";
    if (root.querySelector(".st-school-app")) return "school";
    const text = root.innerText || "";
    const isHome = text.includes("催眠APP") && text.includes("成就和任务") && text.includes("MC匿名版");
    if (isHome) return "";
    const compactPhoneText = text.replace(/\s+/g, " ");
    if (
      (text.includes("日历") && (text.includes("当前日期") || text.includes("当前时间") || text.includes("新增日程") || text.includes("Calendar"))) ||
      (text.includes("今日") && (text.includes("今日无记录事件") || text.includes("入学式") || text.includes("社团招新周"))) ||
      /日\s*一\s*二\s*三\s*四\s*五\s*六/.test(compactPhoneText)
    ) return "calendar";
    if (text.includes("身体检测") || text.includes("角色状态") || text.includes("目标档案")) return "stats";
    if (text.includes("成就和任务") && (text.includes("成就筛选") || text.includes("任务筛选") || text.includes("新增"))) return "achievements";
    if (
      text.includes("帮助中心") || text.includes("Internal Build") ||
	      text.includes("如何使用催眠APP") || text.includes("如何获得金钱") ||
      text.includes("服从度") || text.includes("主角可疑度") || text.includes("金钱来源")
    ) return "help";
    if (text.includes("库存") && (text.includes("暂无持有物品") || text.includes("数量:") || text.includes("描述:"))) return "inventory";
    return "";
  }

  function compactText(element) {
    return String(element?.textContent || "").replace(/\\s+/g, " ").trim();
  }

  const ST_AUTHOR_CREDIT = "原作者：Ramiel";

  function patchHelpAuthorCredit(root) {
    if (!root?.dataset || root.dataset.stPhoneApp !== "help") return;
    const app = root.firstElementChild;
    if (!app) return;
    const content = app.querySelector('[class*="overflow-y-auto"]') || app;
    let card = content.querySelector(":scope > .st-help-author-card");
    if (!card) {
      card = document.createElement("section");
      card.className = "st-help-author-card";
      const header = app.firstElementChild;
      if (header?.parentElement === content && header.nextSibling) content.insertBefore(card, header.nextSibling);
      else content.prepend(card);
    }
    card.innerHTML = '<strong>原作者</strong><p>原作者为Ramiel，我只是二改</p><div class="st-author-credit-line">原作者：Ramiel</div>';
    const blocks = Array.from(content.children).filter((element) => {
      if (element === card || element.classList?.contains("st-help-author-card")) return false;
      const text = compactText(element);
      return text.length >= 8 && !text.includes("原作者：Ramiel");
    });
    for (const block of blocks) {
      if (block.querySelector?.(":scope > .st-author-credit-line")) continue;
      const line = document.createElement("div");
      line.className = "st-author-credit-line";
      line.textContent = ST_AUTHOR_CREDIT;
      block.appendChild(line);
    }
  }

  function getLatestVariableOptions() {
    const currentOption = getCurrentVariableOption();
    if (currentOption) return [currentOption];
    return dedupeVariableOptions([{ type: "message", message_id: "latest" }, { type: "chat" }]);
  }

  function getCurrentVariableOption() {
    const currentMessageId = getCurrentMessageIdSafe();
    return currentMessageId !== null && currentMessageId !== "latest"
      ? { type: "message", message_id: currentMessageId }
      : null;
  }

  function getCurrentMessageIdSafe() {
    try {
      const currentMessageId = getCurrentMessageId();
      if (currentMessageId !== undefined && currentMessageId !== null && currentMessageId !== "latest") return currentMessageId;
    } catch {}
    return null;
  }

  function getLatestMessageIdSafe() {
    try {
      if (typeof getChatMessages !== "function") return null;
      const messages = getChatMessages(-1);
      if (!Array.isArray(messages) || messages.length === 0) return null;
      const latest = messages[messages.length - 1];
      return latest?.message_id ?? latest?.mesid ?? latest?.id ?? messages.length - 1;
    } catch {
      return null;
    }
  }

  function shouldPreferCurrentMessageSnapshot() {
    return Boolean(getCurrentVariableOption());
  }

  function dedupeVariableOptions(options) {
    const seen = new Set();
    const result = [];
    for (const option of options) {
      if (!option) continue;
      const key = option.type + ":" + String(option.message_id ?? "");
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(option);
    }
    return result;
  }

  function scoreStatDataCandidate(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return -1;
    let score = 0;
    const system = value["系统"];
    const roles = value["角色"];
    const tasks = value["任务"];
    if (system && typeof system === "object" && !Array.isArray(system)) {
      score += 20;
      if (system["当前日期"] != null) score += 5;
      if (system["当前时间"] != null) score += 5;
      if (system["持有零花钱"] != null) score += 5;
      const store = system["hypnoos"] && typeof system["hypnoos"] === "object" && !Array.isArray(system["hypnoos"])
        ? system["hypnoos"]
        : system["_hypnoos"];
      if (store && typeof store === "object" && !Array.isArray(store)) {
        score += 3 + Object.keys(store).length;
      }
    }
    if (roles && typeof roles === "object" && !Array.isArray(roles)) score += 30 + Object.keys(roles).length * 5;
    if (tasks && typeof tasks === "object" && !Array.isArray(tasks)) score += 8 + Object.keys(tasks).length;
    return score;
  }

  function unwrapStatDataSnapshot(value) {
    if (value?.stat_data && typeof value.stat_data === "object" && !Array.isArray(value.stat_data)) return value.stat_data;
    return value;
  }

  function getLatestStatDataSync() {
    const candidates = [];
    const hasCurrentSnapshot = Boolean(getCurrentVariableOption());
    for (const option of getLatestVariableOptions()) {
      try {
        const mvu = window.Mvu?.getMvuData?.(option);
        const root = unwrapStatDataSnapshot(mvu);
        if (root && typeof root === "object" && !Array.isArray(root)) candidates.push(root);
      } catch {}
    }
    for (const option of getLatestVariableOptions()) {
      try {
        const vars = typeof getVariables === "function" ? getVariables(option) : null;
        const root = unwrapStatDataSnapshot(vars);
        if (root && typeof root === "object" && (root["系统"] || root["角色"] || root["任务"])) candidates.push(root);
      } catch {}
    }
    if (!hasCurrentSnapshot) {
      try {
        const vars = typeof getVariables === "function" ? getVariables() : null;
        const root = unwrapStatDataSnapshot(vars);
        if (root && typeof root === "object") candidates.push(root);
      } catch {}
      try {
        const mvu = window.Mvu?.getMvuData?.();
        const root = unwrapStatDataSnapshot(mvu);
        if (root && typeof root === "object" && !Array.isArray(root)) candidates.push(root);
      } catch {}
    }
    let best = null;
	    for (const candidate of candidates) {
	      const score = scoreStatDataCandidate(candidate);
	      if (score < 0) continue;
	      if (!best || score > best.score) best = { candidate, score };
	    }
    return best?.candidate ?? null;
  }

  function getStatsRoles() {
    const variables = getLatestStatDataSync();
    const roles = variables?.["角色"];
    return roles && typeof roles === "object" && !Array.isArray(roles) ? roles : {};
  }

  function findNativeRoleShell(app, roleNames) {
    const buttons = Array.from(app.querySelectorAll("button"))
      .filter((button) => !button.closest(".st-role-picker"));
    for (const button of buttons) {
      const text = compactText(button);
      const matchesRole = roleNames.some((name) => text === name || text.startsWith(name) || text.includes(name));
      if (text !== "选择目标" && !matchesRole) continue;
      let node = button.parentElement;
      for (let depth = 0; node && depth < 5; depth += 1) {
        const className = typeof node.className === "string" ? node.className : "";
        if (className.includes("shrink-0") && className.includes("relative")) return node;
        node = node.parentElement;
      }
    }
    return null;
  }

  function getNativeRoleButton(shell) {
    if (!shell) return null;
    return Array.from(shell.children).find((child) => child.tagName === "BUTTON") || shell.querySelector("button");
  }

  function selectedStatsRole(app, roleNames, fallback) {
    const remembered = String(fallback || "");
    if (roleNames.includes(remembered)) return remembered;
    const shell = findNativeRoleShell(app, roleNames);
    const nativeButton = getNativeRoleButton(shell);
    const text = compactText(nativeButton);
    const fromButton = roleNames.find((name) => text === name || text.startsWith(name) || text.includes(name));
    if (fromButton) return fromButton;
    return roleNames[0] || "";
  }

  function findNativeRoleOption(shell, roleName, nativeButton) {
    if (!shell) return null;
    return Array.from(shell.querySelectorAll("button")).find((button) => {
      if (button === nativeButton) return false;
      const text = compactText(button);
      return text === roleName || text.startsWith(roleName) || text.includes(roleName);
    }) || null;
  }

  function hideNativeRoleButtons(app, roleNames) {
    Array.from(app.querySelectorAll("button"))
      .filter((button) => !button.closest(".st-role-picker"))
      .forEach((button) => {
        const text = compactText(button);
        const matchesRole = roleNames.some((name) => text === name || text.startsWith(name) || text.includes(name));
        if (matchesRole || text === "选择目标") button.dataset.stNativeRoleButton = "hidden";
      });
  }

  function selectStatsRole(app, roleName) {
    const roles = getStatsRoles();
    const roleNames = Object.keys(roles).filter(Boolean).sort((a, b) => a.localeCompare(b, "zh-CN"));
    if (!roleNames.includes(roleName)) return;
    const picker = app.querySelector(":scope > .st-role-picker");
    if (picker) {
      picker.dataset.selected = roleName;
      delete picker.dataset.signature;
    }
    const refreshEnhancedStats = () => {
      const root = findPhoneRoot(app);
      enhanceStatsRolePicker(root);
      enhanceStatsOverview(root);
      enhanceStatsEffects(root);
    };
    const shell = findNativeRoleShell(app, roleNames);
    const nativeButton = getNativeRoleButton(shell);
    const clickOption = () => {
      const option = findNativeRoleOption(shell, roleName, nativeButton);
      if (!option) return false;
      option.click();
      return true;
    };
    if (!clickOption()) {
      nativeButton?.click();
      window.setTimeout(() => {
        clickOption();
        window.setTimeout(() => {
          refreshEnhancedStats();
        }, 30);
      }, 0);
    } else {
      window.setTimeout(() => {
        refreshEnhancedStats();
      }, 30);
    }
    refreshEnhancedStats();
  }

  function requestDeleteStatsRole(roleName) {
    if (!roleName || DEFAULT_ROLE_NAMES.includes(roleName)) return;
    appendAppOperation({
      来源: "身体检测",
      操作: "请求删除角色",
      角色名: roleName,
      AI执行规范: [
        "只能删除用户后续添加的自建角色，不能删除西园寺爱丽莎、月咏深雪、犬冢夏美。",
        "AI 判断确认后，只删除 stat_data.角色." + roleName + " 中的自建角色变量。",
        "若该角色仍在剧情现场或删除会破坏连续性，AI 应在正文说明并拒绝删除或延后删除。"
      ]
    });
  }

  function enhanceStatsRolePicker(root) {
    if (!root?.dataset || root.dataset.stPhoneApp !== "stats") return;
    const app = root.firstElementChild;
    if (!app || !compactText(app).includes("身体检测")) return;
    const roles = getStatsRoles();
    const roleNames = Object.keys(roles).filter(Boolean).sort((a, b) => a.localeCompare(b, "zh-CN"));
    const existing = app.querySelector(":scope > .st-role-picker");
    if (!roleNames.length) {
      existing?.remove();
      return;
    }
    const shell = findNativeRoleShell(app, roleNames);
    if (shell) shell.dataset.stNativeRoleSelector = "hidden";
    hideNativeRoleButtons(app, roleNames);
    const header = app.firstElementChild;
    if (!header) return;
    const picker = existing || document.createElement("section");
    if (!existing) {
      picker.className = "st-role-picker";
      picker.innerHTML =
        '<div class="st-role-picker-row">' +
          '<div class="st-role-picker-meta"><div class="st-role-picker-title">选择目标</div><div class="st-role-picker-count"></div></div>' +
          '<input class="st-role-picker-search" type="search" placeholder="搜索角色" autocomplete="off">' +
          '<div class="st-role-picker-scroll">' +
            '<button type="button" class="st-role-picker-arrow" data-st-role-scroll="-1" aria-label="向左滚动角色">‹</button>' +
            '<div class="st-role-picker-list"></div>' +
            '<button type="button" class="st-role-picker-arrow" data-st-role-scroll="1" aria-label="向右滚动角色">›</button>' +
          '</div>' +
        '</div>';
      picker.querySelector(".st-role-picker-search")?.addEventListener("input", () => {
        picker.dataset.query = picker.querySelector(".st-role-picker-search")?.value || "";
        enhanceStatsRolePicker(root);
      });
      picker.querySelectorAll("[data-st-role-scroll]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const list = picker.querySelector(".st-role-picker-list");
          if (!list) return;
          const direction = Number(button.getAttribute("data-st-role-scroll")) || 1;
          list.scrollBy({ left: direction * Math.max(82, Math.floor(list.clientWidth * 0.7)), behavior: "smooth" });
        });
      });
      header.insertAdjacentElement("afterend", picker);
    }
    const input = picker.querySelector(".st-role-picker-search");
    if (input && picker.dataset.query !== undefined && input.value !== picker.dataset.query) input.value = picker.dataset.query;
    const query = String(input?.value || picker.dataset.query || "").trim().toLowerCase();
    const selected = selectedStatsRole(app, roleNames, picker.dataset.selected);
    const signature = roleNames.join("\\u0001") + "\\u0002" + selected + "\\u0002" + query;
    if (picker.dataset.signature === signature) return;
    picker.dataset.signature = signature;
    picker.dataset.selected = selected;
    const filtered = roleNames.filter((name) => !query || name.toLowerCase().includes(query));
    const list = picker.querySelector(".st-role-picker-list");
    picker.querySelector(".st-role-picker-count").textContent = roleNames.length + " 个目标";
    if (!list) return;
    list.innerHTML = filtered.length
      ? filtered.map((name) => {
          const data = roles[name] && typeof roles[name] === "object" ? roles[name] : {};
          const count = Object.keys(data).length;
          return '<button type="button" class="st-role-chip ' + (name === selected ? "active" : "") + '" data-role-name="' + escapeAttr(name) + '">' +
            '<strong>' + escapeHtml(name) + '</strong><small>' + count + ' 项数据</small></button>';
        }).join("")
      : '<div class="st-role-picker-empty">没有匹配角色</div>';
    list.querySelectorAll(".st-role-chip").forEach((button) => {
      button.addEventListener("click", () => selectStatsRole(app, button.dataset.roleName || ""));
    });
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function effectScalar(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) {
      return value.map(effectScalar).filter(Boolean).join("、");
    }
    if (isPlainObject(value)) {
      for (const key of ["描述", "description", "说明", "内容", "状态", "value", "current", "amount"]) {
        const text = effectScalar(value[key]);
        if (text) return text;
      }
      const keys = Object.keys(value).filter(Boolean);
      return keys.length ? keys.slice(0, 4).join("、") : "";
    }
    return String(value);
  }

  const ST_CORE_STATS = ["好感度", "警戒度", "服从度", "性欲", "快感值"];
  const ST_SENSITIVITY_STATS = ["阴蒂敏感度", "小穴敏感度", "菊穴敏感度", "尿道敏感度", "乳头敏感度"];
  const ST_COUNT_STATS = ["阴蒂高潮次数", "小穴高潮次数", "菊穴高潮次数", "尿道高潮次数", "乳头高潮次数"];
  const ST_MIND_FIELDS = [
    { label: "心理（此刻）", keys: ["心理", "心理状态", "当前心理", "内心", "态度"] }
  ];
  const ST_NATIVE_TEXT_LABELS = ["外观", "外貌", "外观状态", "档案", "姓名", "年龄", "社团/职业", "身高", "体重", "三围", "头发", "面部", "上衣", "下衣", "心理", "心理状态", "当前心理"];
  const ST_NATIVE_STAT_LABELS = ST_CORE_STATS.concat(ST_SENSITIVITY_STATS, ST_COUNT_STATS, ST_NATIVE_TEXT_LABELS);

  function statFallback(label) {
    return ST_SENSITIVITY_STATS.includes(label) ? 100 : 0;
  }

  function statValue(record, label) {
    if (record && Object.prototype.hasOwnProperty.call(record, label)) return record[label];
    return statFallback(label);
  }

  function statNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const text = effectScalar(value).replace(/[,，]/g, "");
    const match = text.match(/-?\\d+(?:\\.\\d+)?/);
    const parsed = match ? Number(match[0]) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatStatNumber(value) {
    const number = statNumber(value);
    if (!Number.isFinite(number)) return "0";
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 10) / 10);
  }

  function renderMeterStat(label, value) {
    const number = statNumber(value, statFallback(label));
    const maxValue = ST_SENSITIVITY_STATS.includes(label) ? 1000 : 100;
    const percent = Math.max(0, Math.min(100, (number / maxValue) * 100));
    const overflow = number > maxValue;
    const display = effectScalar(value) || String(statFallback(label));
    const overflowBadge = overflow
      ? '<span class="st-meter-overflow">+' + escapeHtml(formatStatNumber(number - maxValue)) + '</span>'
      : "";
    return '<article class="st-meter ' + (overflow ? "is-overflow" : "") + '" style="--pct:' + percent + '%">' +
      '<div class="st-meter-top"><span class="st-meter-label">' + escapeHtml(label) + '</span>' +
      '<span class="st-meter-value">' + escapeHtml(display) + overflowBadge + '</span></div>' +
      '<div class="st-meter-track"><span class="st-meter-fill"></span></div>' +
      '</article>';
  }

  function shortCountLabel(label) {
    return label.replace("高潮次数", "高潮");
  }

  function renderCountStat(label, value) {
    const display = effectScalar(value) || "0";
    return '<article class="st-count-chip"><strong>' + escapeHtml(display) + '</strong><span>' + escapeHtml(shortCountLabel(label)) + '</span></article>';
  }

  function roleProfileData(roleName, roleData) {
    const defaultProfile = isPlainObject(DEFAULT_ROLE_PROFILES[roleName]) ? DEFAULT_ROLE_PROFILES[roleName] : {};
    const profile = isPlainObject(roleData?.["档案"]) ? roleData["档案"] : {};
    return { "姓名": roleName || profile["姓名"] || defaultProfile["姓名"] || "", ...defaultProfile, ...profile };
  }

  function pickRoleMeta(roleName, roleData) {
    const profile = roleProfileData(roleName, roleData);
    const compact = [profile["社团/职业"], profile["身高"], profile["三围"]].map(effectScalar).filter(Boolean).join(" · ");
    return compact || pickFirstText(roleData, ["角色定位", "定位", "身体", "身份", "种族", "备注"]) || "角色变量已载入";
  }

  function renderCollapsibleStatsSection(title, meta, bodyHtml, open = true) {
    return '<details class="st-stat-section"' + (open ? " open" : "") + '>' +
      '<summary class="st-stat-section-head"><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(meta) + '</span></summary>' +
      bodyHtml +
      '</details>';
  }

  function renderProfileField(field, roleData) {
    const text = pickFirstText(roleData, field.keys) || "未记录";
    return '<article class="st-profile-item"><strong>' + escapeHtml(field.label) + '</strong><p>' + escapeHtml(text) + '</p></article>';
  }

  function renderMindSection(roleData) {
    const profile = ST_MIND_FIELDS.map((field) => renderProfileField(field, roleData)).join("");
    return renderCollapsibleStatsSection("心理状态", "第一视角内心", '<div class="st-profile-grid">' + profile + '</div>');
  }

  function renderStatsOverview(roleName, roleData) {
    const core = ST_CORE_STATS.map((label) => renderMeterStat(label, statValue(roleData, label))).join("");
    const sensitivity = ST_SENSITIVITY_STATS.map((label) => renderMeterStat(label, statValue(roleData, label))).join("");
    const counts = ST_COUNT_STATS.map((label) => renderCountStat(label, statValue(roleData, label))).join("");
    const canDelete = Boolean(roleName) && !DEFAULT_ROLE_NAMES.includes(roleName);
    return '<section class="st-target-summary">' +
      '<div class="st-target-summary-main"><span>目标</span><strong>' + escapeHtml(roleName) + '</strong><small>' + escapeHtml(pickRoleMeta(roleName, roleData)) + '</small></div>' +
      (canDelete ? '<button type="button" class="st-target-delete" data-delete-role="' + escapeAttr(roleName) + '">删除角色</button>' : '') +
      '</section>' +
      renderMindSection(roleData) +
      renderCollapsibleStatsSection("状态总览", roleName, '<div class="st-meter-grid is-core">' + core + '</div>', false) +
      renderCollapsibleStatsSection("身体敏感度", "1000以上高亮", '<div class="st-meter-grid">' + sensitivity + '</div>', false) +
      renderCollapsibleStatsSection("累计次数", "由 AI 更新", '<div class="st-count-grid">' + counts + '</div>', false);
  }

  function statLabelCount(text) {
    return ST_NATIVE_STAT_LABELS.reduce((count, label) => count + (text.includes(label) ? 1 : 0), 0);
  }

  function hideNativeStatsRows(app) {
    const labels = ST_NATIVE_STAT_LABELS;
    const leaves = Array.from(app.querySelectorAll("span,p,strong,em,div"))
      .filter((element) => {
        if (element.closest(".st-role-picker,.st-stats-overview,.st-effects-panel")) return false;
        const text = compactText(element);
        return text.length > 0 && text.length <= 48 && labels.some((label) => text.includes(label));
      });
    for (const leaf of leaves) {
      let target = leaf;
      let node = leaf.parentElement;
      for (let depth = 0; node && depth < 5; depth += 1) {
        if (node === app || node === app.firstElementChild || node.classList?.contains("st-role-picker")) break;
        if (node.closest(".st-role-picker,.st-stats-overview,.st-effects-panel")) break;
        const text = compactText(node);
        const hitCount = statLabelCount(text);
        if (hitCount > 1 || text.length > 260) break;
        target = node;
        node = node.parentElement;
      }
      if (target && target !== app && target !== app.firstElementChild) {
        target.dataset.stNativeStatRow = "hidden";
      }
    }
  }

  function enhanceStatsOverview(root) {
    if (!root?.dataset || root.dataset.stPhoneApp !== "stats") return;
    const app = root.firstElementChild;
    if (!app || !compactText(app).includes("身体检测")) return;
    hideNativeStatsRows(app);
    const roles = getStatsRoles();
    const roleNames = Object.keys(roles).filter(Boolean).sort((a, b) => a.localeCompare(b, "zh-CN"));
    const selected = selectedStatsRole(app, roleNames, app.querySelector(":scope > .st-role-picker")?.dataset.selected || "");
    const roleData = roles[selected] && typeof roles[selected] === "object" ? roles[selected] : {};
    const content = ensureStatsEnhancedContent(app);
    if (!content || !selected) return;
    const panel = content.querySelector(":scope > .st-stats-overview") || document.createElement("section");
    if (!panel.parentElement) {
      panel.className = "st-stats-overview";
      content.prepend(panel);
    }
    const signature = selected + "\\u0002" + safeSignature(roleData);
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature;
    panel.innerHTML = renderStatsOverview(selected, roleData);
    panel.querySelector(".st-target-delete")?.addEventListener("click", () => requestDeleteStatsRole(selected));
  }

  function pickFirstText(record, keys) {
    for (const key of keys) {
      const text = effectScalar(record?.[key]);
      if (text) return text;
    }
    return "";
  }

  function requestDeleteHypnosisEffect(roleName, effectType, effectKey, effectTitle) {
    if (!roleName || !effectType || !effectKey) return;
    appendAppOperation({
      来源: "身体检测",
      操作: "删除催眠效果",
      角色名: roleName,
      效果类型: effectType,
      效果键名: effectKey,
      效果名称: effectTitle || effectKey,
      目标变量路径: "/角色/" + roleName + "/" + effectType + "/" + effectKey,
      AI执行规范: "只在剧情与变量允许时删除这个角色指定类型下的单个效果；成功用remove删除目标路径。不要顺手改其他效果、敏感度、次数、校规或资源；失败时在正文说明原因。"
    });
  }

  function normalizeEffectEntry(name, value, index) {
    const fallbackTitle = name || "效果 " + (index + 1);
    if (!isPlainObject(value)) {
      return {
        key: name || String(index),
        title: fallbackTitle,
        description: effectScalar(value) || "已记录",
        meta: []
      };
    }
    const title = pickFirstText(value, ["名称", "name", "标题", "title", "效果名", "效果"]) || fallbackTitle;
    const description = pickFirstText(value, ["描述", "description", "说明", "内容", "详情", "状态", "效果"]) || "";
    const used = new Set(["名称", "name", "标题", "title", "效果名", "效果", "描述", "description", "说明", "内容", "详情", "状态"]);
    const preferredMeta = ["强度", "等级", "层数", "阶段", "剩余时间", "持续时间", "回合", "来源", "触发条件", "目标", "备注"];
    const meta = [];
    for (const key of preferredMeta) {
      const text = effectScalar(value[key]);
      if (text) {
        meta.push([key, text]);
        used.add(key);
      }
    }
    for (const [key, item] of Object.entries(value)) {
      if (meta.length >= 6 || used.has(key) || key.startsWith("_")) continue;
      const text = effectScalar(item);
      if (text) meta.push([key, text]);
    }
    return {
      key: name || title || String(index),
      title,
      description: description || (meta.length ? "" : "已记录"),
      meta
    };
  }

  function normalizeEffectEntries(value) {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) {
      return value
        .map((item, index) => normalizeEffectEntry("", item, index))
        .filter((item) => item.title || item.description || item.meta.length);
    }
    if (isPlainObject(value)) {
      const entries = Object.entries(value);
      if (!entries.length) return [];
      return entries.map(([name, item], index) => normalizeEffectEntry(name, item, index));
    }
    const text = effectScalar(value);
    return text ? [{ key: "效果", title: "效果", description: text, meta: [] }] : [];
  }

  function renderEffectCard(roleName, label, value, variant) {
    const entries = normalizeEffectEntries(value);
    const emptyText = label.includes("临时") ? "暂无临时效果" : "暂无永久效果";
    const body = entries.length
      ? '<div class="st-effect-list">' + entries.map((entry) => {
          const meta = entry.meta.length
            ? '<div class="st-effect-meta">' + entry.meta.map(([key, text]) => '<span>' + escapeHtml(key) + '：' + escapeHtml(text) + '</span>').join("") + '</div>'
            : "";
          return '<article class="st-effect-item"><div class="st-effect-item-head"><strong>' + escapeHtml(entry.title) + '</strong>' +
            '<button type="button" class="st-effect-delete" data-effect-delete="true" data-effect-role="' + escapeAttr(roleName) + '" data-effect-type="' + escapeAttr(label) + '" data-effect-key="' + escapeAttr(entry.key || entry.title) + '" data-effect-title="' + escapeAttr(entry.title) + '">删除</button></div>' +
            (entry.description ? '<p>' + escapeHtml(entry.description) + '</p>' : '') +
            meta + '</article>';
        }).join("") + '</div>'
      : '<div class="st-effect-empty">' + emptyText + '</div>';
    return '<details class="st-effect-card ' + variant + '">' +
      '<summary><div class="st-effect-title"><span class="st-effect-dot"></span><strong>' + escapeHtml(label) + '</strong></div>' +
      '<div class="st-effect-count">' + entries.length + ' 项</div></summary>' +
      body +
      '</details>';
  }

  function hideNativeEffectRows(app) {
    const labels = ["临时催眠效果", "永久催眠效果"];
    const nodes = Array.from(app.querySelectorAll("button,span,p,div"))
      .filter((element) => {
        if (element.closest(".st-effects-panel,.st-stats-overview")) return false;
        const text = compactText(element);
        return text.length > 0 && text.length <= 180 && labels.some((label) => text.includes(label));
      });
    for (const element of nodes) {
      let target = element;
      let node = element.parentElement;
      for (let depth = 0; node && depth < 5; depth += 1) {
        if (node === app || node === app.firstElementChild) break;
        if (node.closest(".st-effects-panel,.st-stats-overview")) break;
        const text = compactText(node);
        const hitCount = labels.reduce((count, label) => count + (text.includes(label) ? 1 : 0), 0);
        if (!hitCount || text.length > 260) break;
        target = node;
        if (hitCount >= 2) break;
        node = node.parentElement;
      }
      if (target && target !== app && target !== app.firstElementChild) {
        target.dataset.stNativeEffectRow = "hidden";
      }
    }
  }

  function findStatsContent(app) {
    return app?.querySelector?.('[class*="overflow-y-auto"][class*="space-y-4"]') || null;
  }

  function ensureStatsEnhancedContent(app) {
    if (!app) return null;
    const nativeContent = findStatsContent(app);
    const existing = app.querySelector(":scope > .st-stats-enhanced-content");
    const content = existing || document.createElement("section");
    if (!existing) {
      content.className = "st-stats-enhanced-content";
      const picker = app.querySelector(":scope > .st-role-picker");
      if (picker) picker.insertAdjacentElement("afterend", content);
      else if (nativeContent?.parentElement === app) app.insertBefore(content, nativeContent);
      else app.appendChild(content);
    }
    if (nativeContent && nativeContent !== content) nativeContent.dataset.stNativeStatsContent = "hidden";
    return content;
  }

  function findStatsTargetCard(content) {
    return Array.from(content?.children || []).find((child) => {
      if (child.classList?.contains("st-stats-overview") || child.classList?.contains("st-effects-panel")) return false;
      return compactText(child).startsWith("目标");
    }) || null;
  }

  function enhanceStatsEffects(root) {
    if (!root?.dataset || root.dataset.stPhoneApp !== "stats") return;
    const app = root.firstElementChild;
    if (!app || !compactText(app).includes("身体检测")) return;
    hideNativeEffectRows(app);
    const roles = getStatsRoles();
    const roleNames = Object.keys(roles).filter(Boolean).sort((a, b) => a.localeCompare(b, "zh-CN"));
    const selected = selectedStatsRole(app, roleNames, app.querySelector(":scope > .st-role-picker")?.dataset.selected || "");
    const roleData = roles[selected] && typeof roles[selected] === "object" ? roles[selected] : {};
    const temp = roleData["临时催眠效果"];
    const permanent = roleData["永久催眠效果"];
    const content = ensureStatsEnhancedContent(app);
    if (!content || !selected) return;
    const panel = content.querySelector(":scope > .st-effects-panel") || document.createElement("section");
    const overview = content.querySelector(":scope > .st-stats-overview");
    if (!panel.parentElement) {
      panel.className = "st-effects-panel";
      if (overview?.nextSibling) content.insertBefore(panel, overview.nextSibling);
      else if (overview) content.appendChild(panel);
      else content.prepend(panel);
    } else if (overview && panel.previousElementSibling !== overview) {
      overview.insertAdjacentElement("afterend", panel);
    }
    const signature = selected + "\\u0002" + safeSignature(temp) + "\\u0002" + safeSignature(permanent);
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature;
    panel.innerHTML = renderEffectCard(selected, "临时催眠效果", temp, "is-temporary") +
      renderEffectCard(selected, "永久催眠效果", permanent, "is-permanent");
    panel.querySelectorAll("[data-effect-delete]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        requestDeleteHypnosisEffect(
          button.getAttribute("data-effect-role") || selected,
          button.getAttribute("data-effect-type") || "",
          button.getAttribute("data-effect-key") || "",
          button.getAttribute("data-effect-title") || ""
        );
      });
    });
  }

  function safeSignature(value) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function updatePhoneDarkTheme() {
    ensurePhoneDarkThemeStyle();
    const root = document.querySelector(".w-full.h-full.bg-black.overflow-hidden.relative");
    if (!root) return;
    const app = detectPhoneApp(root);
    if (app) root.dataset.stPhoneApp = app;
    else delete root.dataset.stPhoneApp;
    if (app !== "help") {
      root.querySelectorAll(".st-help-author-card,.st-author-credit-line").forEach((element) => element.remove());
    }
    if (app === "help") {
      patchHelpAuthorCredit(root);
    }
    if (app === "stats") {
      enhanceStatsRolePicker(root);
      enhanceStatsOverview(root);
      enhanceStatsEffects(root);
    }
  }

  function findTileFromLabel(label) {
    let node = label;
    for (let depth = 0; node && depth < 7; depth += 1) {
      const className = typeof node.className === "string" ? node.className : "";
      if (node.tagName === "BUTTON" || /cursor-pointer|group/.test(className)) return node;
      node = node.parentElement;
    }
    return label.parentElement;
  }

  function findHomeTileByText(text) {
    const labels = Array.from(document.querySelectorAll("span,button,div"))
      .filter((element) => !element.closest(".st-mchan-internal-app,.st-add-role-app,.st-calendar-lite-app,.st-timetable-app,.st-clock-app,.st-profile-app,.st-map-app,.st-school-app") && element.textContent?.trim() === text);
    for (const label of labels) {
      const tile = findTileFromLabel(label);
      if (tile) return tile;
    }
    return null;
  }

  function replaceExactTextInTile(tile, from, to) {
    const elements = Array.from(tile.querySelectorAll("*"));
    for (const element of elements) {
      if (element.children.length === 0 && element.textContent?.trim() === from) {
        element.textContent = to;
        return true;
      }
    }
    return false;
  }

  function setHomeTileLabel(tile, text) {
    const labels = Array.from(tile.querySelectorAll("*"))
      .filter((element) => element.children.length === 0 && element.textContent?.trim());
    const label = labels[labels.length - 1];
    if (label) label.textContent = text;
  }

  function setHomeTileIcon(tile, src, alt) {
    if (!tile || !src) return;
    const source = String(src || "");
    const signature = String(alt || "") + ":" + source.length + ":" + source.slice(-64);
    if (tile.dataset.stCustomIcon === signature) return;
    const iconElement = tile.querySelector("svg, img");
    const iconBox = iconElement?.parentElement || tile.firstElementChild;
    if (!iconBox) return;
    iconBox.classList.add("st-custom-icon-box");
    iconBox.innerHTML = source.trim().startsWith("<svg")
      ? source
      : '<img class="st-custom-app-icon" alt="' + escapeAttr(alt || "") + '" src="' + escapeAttr(source) + '">';
    tile.dataset.stCustomIcon = signature;
  }

  const ST_WEEKDAY_NAMES = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const ST_WEEKDAY_INDEX = { "星期日": 0, "星期天": 0, "星期一": 1, "星期二": 2, "星期三": 3, "星期四": 4, "星期五": 5, "星期六": 6 };
  const ST_SCHOOL_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const ST_MONTH_DAYS = { 1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
  const ST_WEEKLY_TIMETABLE = {
    1: ["现代文", "数学", "英语", "日本史", "体育（田径）", "家庭科"],
    2: ["古典", "化学", "数学", "英语", "美术", "班会"],
    3: ["英语", "世界史", "生物", "现代文", "体育（游泳）", "信息"],
    4: ["数学", "古典", "英语", "化学", "音乐", "保健"],
    5: ["现代文", "日本史", "生物", "英语", "体育（球技）", "综合探究"]
  };
  const ST_CLASS_PERIODS = [
    { index: 1, start: 520, end: 570, label: "1限" },
    { index: 2, start: 580, end: 630, label: "2限" },
    { index: 3, start: 640, end: 690, label: "3限" },
    { index: 4, start: 700, end: 750, label: "4限" },
    { index: 5, start: 800, end: 850, label: "5限" },
    { index: 6, start: 860, end: 910, label: "6限" }
  ];
  const ST_SPECIAL_DAYS = [
    { m: 4, d: 1, title: "愚人节", detail: "普通授课 / 谣言高发" },
    { m: 4, d: 8, title: "入学式/始业式", detail: "特别日程" },
    { m: 4, from: 10, to: 14, title: "社团招新周", detail: "普通课后招新" },
    { m: 4, d: 15, title: "社团说明会", detail: "下午特别活动" },
    { m: 4, d: 20, title: "身体检查", detail: "保健特别日程" },
    { m: 4, d: 29, title: "黄金周假期", detail: "无固定课程", holiday: true },
    { m: 5, from: 1, to: 6, title: "黄金周假期", detail: "无固定课程", holiday: true },
    { m: 5, from: 20, to: 23, title: "第一学期中考", detail: "按考试安排", exam: true },
    { m: 5, d: 25, title: "球技大会", detail: "全日活动" },
    { m: 6, d: 10, title: "全校体力测验", detail: "体育测定日" },
    { m: 6, d: 25, title: "学生会选举", detail: "下午特别日程" },
    { m: 6, d: 30, title: "夜间试胆大会", detail: "夜间活动日" },
    { m: 7, d: 7, title: "七夕", detail: "普通授课 / 节日气氛" },
    { m: 7, from: 14, to: 17, title: "第一学期末考", detail: "按考试安排", exam: true },
    { m: 7, d: 21, title: "海之日", detail: "祝日", holiday: true },
    { m: 7, d: 22, title: "第一学期结业式", detail: "上午特别日程" },
    { m: 7, from: 23, to: 31, title: "暑假", detail: "自由/社团/补习", holiday: true },
    { m: 7, from: 25, to: 28, title: "社团夏季合宿", detail: "校外活动" },
    { m: 8, from: 1, to: 31, title: "暑假", detail: "自由/社团/补习", holiday: true },
    { m: 8, d: 1, title: "全校返校日", detail: "短日程" },
    { m: 8, d: 11, title: "山之日", detail: "祝日", holiday: true },
    { m: 8, from: 13, to: 16, title: "盂兰盆节", detail: "假期", holiday: true },
    { m: 8, from: 16, to: 17, title: "夏Comi", detail: "校外事件" },
    { m: 8, d: 25, title: "补习/作业冲刺", detail: "补习日" },
    { m: 9, d: 1, title: "第二学期始业式", detail: "特别日程" },
    { m: 9, d: 15, title: "敬老之日", detail: "祝日", holiday: true },
    { m: 9, d: 16, title: "校庆准备", detail: "班会/班级项目" },
    { m: 9, d: 23, title: "秋分之日", detail: "祝日", holiday: true },
    { m: 9, d: 29, title: "体育祭", detail: "全日活动" },
    { m: 10, d: 1, title: "衣更", detail: "换冬装/普通授课" },
    { m: 10, d: 13, title: "运动之日", detail: "祝日", holiday: true },
    { m: 10, from: 21, to: 24, title: "第二学期中考", detail: "按考试安排", exam: true },
    { m: 10, d: 31, title: "万圣节", detail: "放学后活动" },
    { m: 11, from: 1, to: 2, title: "文化祭", detail: "全日活动" },
    { m: 11, d: 3, title: "文化之日/后夜祭", detail: "祝日/后夜祭", holiday: true },
    { m: 11, d: 23, title: "勤劳感谢日", detail: "祝日", holiday: true },
    { m: 11, d: 24, title: "振替休日", detail: "补假", holiday: true },
    { m: 11, from: 25, to: 28, title: "修学旅行", detail: "校外特别日程" },
    { m: 12, from: 9, to: 12, title: "第二学期末考", detail: "按考试安排", exam: true },
    { m: 12, d: 24, title: "第二学期结业式", detail: "上午特别日程/平安夜" },
    { m: 12, from: 25, to: 31, title: "寒假", detail: "自由行动", holiday: true },
    { m: 1, from: 1, to: 6, title: "寒假", detail: "自由行动", holiday: true },
    { m: 1, d: 7, title: "第三学期始业式", detail: "特别日程" },
    { m: 1, d: 13, title: "成人之日", detail: "祝日", holiday: true },
    { m: 1, from: 17, to: 18, title: "大学入学共通测试", detail: "校内禁声" },
    { m: 1, d: 25, title: "马拉松大会", detail: "耐力跑" },
    { m: 2, d: 3, title: "节分", detail: "普通授课/节日气氛" },
    { m: 2, d: 11, title: "建国纪念日", detail: "祝日", holiday: true },
    { m: 2, d: 14, title: "情人节", detail: "普通授课/节日气氛" },
    { m: 2, d: 23, title: "天皇诞辰", detail: "祝日", holiday: true },
    { m: 2, d: 24, title: "振替休日", detail: "补假", holiday: true },
    { m: 2, from: 25, to: 27, title: "学年末考试", detail: "按考试安排", exam: true },
    { m: 3, d: 3, title: "女儿节", detail: "普通授课/节日气氛" },
    { m: 3, d: 14, title: "白色情人节", detail: "普通授课/节日气氛" },
    { m: 3, d: 20, title: "春分之日", detail: "祝日", holiday: true },
    { m: 3, d: 24, title: "修业式", detail: "年度结束/特别日程" },
    { m: 3, from: 25, to: 31, title: "春假", detail: "自由行动", holiday: true }
  ];

  function getSystemState() {
    const variables = getLatestStatDataSync();
    const system = variables?.["系统"];
    return system && typeof system === "object" && !Array.isArray(system) ? system : {};
  }

  function parseStoryDate(text) {
    const raw = String(text || "");
    const match = raw.match(/(\\d{1,2})\\s*月\\s*(\\d{1,2})\\s*日/);
    if (!match) return null;
    const weekdayMatch = raw.match(/星期[一二三四五六日天]/);
    return {
      month: Number(match[1]),
      day: Number(match[2]),
      explicitWeekday: weekdayMatch ? weekdayMatch[0] : ""
    };
  }

  function schoolYearDay(month, day) {
    let total = 0;
    for (const item of ST_SCHOOL_MONTH_ORDER) {
      if (item === month) return total + day;
      total += ST_MONTH_DAYS[item] || 30;
    }
    return day;
  }

  function weekdayForStoryDate(dateText) {
    const parsed = parseStoryDate(dateText);
    if (!parsed) return "";
    if (parsed.explicitWeekday) return parsed.explicitWeekday;
    const anchor = { month: 4, day: 9, weekday: 3 };
    const diff = schoolYearDay(parsed.month, parsed.day) - schoolYearDay(anchor.month, anchor.day);
    const index = ((anchor.weekday + diff) % 7 + 7) % 7;
    return ST_WEEKDAY_NAMES[index];
  }

  function minutesFromTimeText(text) {
    const match = String(text || "").match(/(\\d{1,2})\\s*[:：]\\s*(\\d{1,2})/);
    if (!match) return 8 * 60;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function specialDayForDate(parsedDate) {
    if (!parsedDate) return null;
    const matches = ST_SPECIAL_DAYS.filter((item) => {
      if (item.m !== parsedDate.month) return false;
      const from = item.from ?? item.d;
      const to = item.to ?? item.d;
      return parsedDate.day >= from && parsedDate.day <= to;
    });
    if (!matches.length) return null;
    matches.sort((a, b) => {
      const spanA = (a.to ?? a.d) - (a.from ?? a.d);
      const spanB = (b.to ?? b.d) - (b.from ?? b.d);
      return spanA - spanB;
    });
    return matches[0];
  }

  function normalSchoolSlot(minutes, weekdayText) {
    const weekdayIndex = ST_WEEKDAY_INDEX[weekdayText];
    if (weekdayIndex === 0 || weekdayIndex === 6) {
      return { title: "周末自由", detail: "无固定课程" };
    }
    if (minutes >= 450 && minutes < 500) return { title: "早训", detail: "社团自愿" };
    if (minutes >= 500 && minutes < 510) return { title: "入校", detail: "校门关闭前" };
    if (minutes >= 510 && minutes < 520) return { title: "朝礼", detail: "08:30-08:40" };
    for (const period of ST_CLASS_PERIODS) {
      if (minutes >= period.start && minutes < period.end) {
        const subject = ST_WEEKLY_TIMETABLE[weekdayIndex]?.[period.index - 1] || "自习";
        return {
          title: period.label + " · " + subject,
          detail: formatPeriodTime(period.start) + "-" + formatPeriodTime(period.end),
          period: period.label,
          subject
        };
      }
    }
    if (minutes >= 570 && minutes < 580) return { title: "课间", detail: "1限后" };
    if (minutes >= 630 && minutes < 640) return { title: "课间", detail: "2限后" };
    if (minutes >= 690 && minutes < 700) return { title: "课间", detail: "3限后" };
    if (minutes >= 750 && minutes < 800) return { title: "午休", detail: "12:30-13:20" };
    if (minutes >= 850 && minutes < 860) return { title: "课间", detail: "5限前后" };
    if (minutes >= 910 && minutes < 925) return { title: "终礼", detail: "15:10-15:25" };
    if (minutes >= 925 && minutes < 940) return { title: "清扫时间", detail: "15:25-15:40" };
    if (minutes >= 945) return { title: "放学后", detail: "社团/自由行动" };
    if (minutes < 450) return { title: "上学前", detail: "自由行动" };
    return { title: "课间", detail: "移动/准备" };
  }

  function formatPeriodTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function routineSlot(minutes, weekdayText, parsedDate) {
    const special = specialDayForDate(parsedDate);
    const normal = normalSchoolSlot(minutes, weekdayText);
    if (special?.holiday || special?.exam || (special && !/普通授课/.test(special.detail || ""))) {
      return { title: special.title, detail: special.detail || "特别日程" };
    }
    if (special && /普通授课/.test(special.detail || "")) {
      return { title: normal.title, detail: normal.detail + " / " + special.title };
    }
    return normal;
  }

  function specialDateLabel(item) {
    const from = item.from ?? item.d;
    const to = item.to ?? item.d;
    if (from !== to) return item.m + "/" + from + "-" + to;
    return item.m + "/" + from;
  }

  function upcomingSpecialDays(parsedDate, limit = 8) {
    const base = parsedDate || { month: 4, day: 9 };
    const today = schoolYearDay(base.month, base.day);
    return ST_SPECIAL_DAYS
      .map((item) => {
        const from = item.from ?? item.d;
        const to = item.to ?? item.d;
        const start = schoolYearDay(item.m, from);
        const end = schoolYearDay(item.m, to);
        const distance = today > end ? -1 : Math.max(0, start - today);
        return { ...item, distance };
      })
      .filter((item) => item.distance >= 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  function renderCalendarMonthGrid(parsedDate) {
    const month = parsedDate?.month || 4;
    const todayDay = parsedDate?.day || 9;
    const daysInMonth = ST_MONTH_DAYS[month] || 30;
    const firstWeekday = ST_WEEKDAY_INDEX[weekdayForStoryDate(month + "月1日")] ?? 1;
    const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
    const cells = weekdayLabels.map((label) => '<div class="st-cal-weekday">' + label + '</div>');
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push('<div class="st-cal-day is-empty"></div>');
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const weekdayIndex = (firstWeekday + day - 1) % 7;
      const special = specialDayForDate({ month, day });
      const className = [
        "st-cal-day",
        day === todayDay ? "is-today" : "",
        special ? "is-special" : "",
        weekdayIndex === 0 || weekdayIndex === 6 ? "is-weekend" : ""
      ].filter(Boolean).join(" ");
      cells.push(
        '<div class="' + className + '">' +
          '<b>' + day + '</b>' +
          (special ? '<i>' + escapeHtml(special.title) + '</i>' : '') +
        '</div>'
      );
    }
    return (
      '<div class="st-cal-month-head"><strong>' + month + '月</strong><span>' + escapeHtml(weekdayForStoryDate(month + "月" + todayDay + "日") || "") + '</span></div>' +
      '<div class="st-cal-month-grid">' + cells.join("") + '</div>'
    );
  }

  function renderLiteCalendarPage(page) {
    const system = getSystemState();
    const dateText = system["当前日期"] || "4月9日 星期三";
    const timeText = system["当前时间"] || "12:00";
    const parsedDate = parseStoryDate(dateText);
    const weekday = weekdayForStoryDate(dateText) || "星期三";
    const slot = routineSlot(minutesFromTimeText(timeText), weekday, parsedDate);
    const special = specialDayForDate(parsedDate);
    const events = upcomingSpecialDays(parsedDate);
    const eventsHtml = events.map((event) => (
      '<article class="st-cal-event">' +
        '<time>' + escapeHtml(specialDateLabel(event)) + '</time>' +
        '<div><strong>' + escapeHtml(event.title) + '</strong><span>' + escapeHtml(event.detail || "特别日程") + '</span></div>' +
      '</article>'
    )).join("");
    page.innerHTML =
      '<header class="st-lite-header">' +
        '<button class="st-lite-back" data-lite-action="back" title="返回桌面">‹</button>' +
        '<div class="st-lite-title"><strong>日历</strong><span>日期、日程与特殊日期</span></div>' +
      '</header>' +
      '<main class="st-lite-body">' +
        '<section class="st-lite-card st-cal-hero">' +
          '<div class="st-cal-date"><strong>' + escapeHtml(dateText) + '</strong><span>' + escapeHtml(timeText) + '</span></div>' +
          '<div class="st-cal-now">' +
            '<article><small>当前</small><strong>' + escapeHtml(slot.title) + '</strong></article>' +
            '<article><small>状态</small><strong>' + escapeHtml(special ? special.title : weekday) + '</strong></article>' +
          '</div>' +
        '</section>' +
        '<section class="st-lite-card st-cal-month">' + renderCalendarMonthGrid(parsedDate) + '</section>' +
        '<div class="st-cal-section-title">今日说明</div>' +
        '<section class="st-lite-card"><p style="margin:0;color:rgba(226,232,240,.72);font-size:12px;line-height:1.55">' + escapeHtml((special?.detail || slot.detail || "普通日程")) + '</p></section>' +
        '<div class="st-cal-section-title">近期特殊日期</div>' +
        '<section class="st-cal-events">' + (eventsHtml || '<article class="st-cal-event"><time>--</time><div><strong>暂无特殊日期</strong><span>按普通日程推进</span></div></article>') + '</section>' +
      '</main>';
    page.querySelector('[data-lite-action="back"]')?.addEventListener("click", () => page.remove());
  }

  function splitSubject(subject) {
    const match = String(subject || "").match(/^(.+?)（(.+?)）$/);
    return match ? { main: match[1], sub: match[2] } : { main: String(subject || "自习"), sub: "" };
  }

  function renderTimetablePage(page) {
    const days = [
      { index: 1, short: "周一", full: "星期一" },
      { index: 2, short: "周二", full: "星期二" },
      { index: 3, short: "周三", full: "星期三" },
      { index: 4, short: "周四", full: "星期四" },
      { index: 5, short: "周五", full: "星期五" }
    ];
    const system = getSystemState();
    const dateText = system["当前日期"] || "4月9日 星期三";
    const timeText = system["当前时间"] || "12:00";
    const parsedDate = parseStoryDate(dateText);
    const weekday = weekdayForStoryDate(dateText) || "星期三";
    const activeDay = ST_WEEKDAY_INDEX[weekday];
    const minutes = minutesFromTimeText(timeText);
    const activePeriod = ST_CLASS_PERIODS.find((period) => minutes >= period.start && minutes < period.end)?.index || 0;
    const special = specialDayForDate(parsedDate);
    const blocksClass = special && (special.holiday || special.exam || !/普通授课/.test(special.detail || ""));
    const slot = routineSlot(minutes, weekday, parsedDate);
    const weekHtml = days.map((day) => {
      const periods = ST_CLASS_PERIODS.map((period) => {
        const subject = ST_WEEKLY_TIMETABLE[day.index]?.[period.index - 1] || "自习";
        const parts = splitSubject(subject);
        const current = !blocksClass && day.index === activeDay && period.index === activePeriod;
        return '<div class="st-tt-period ' + (current ? "is-current" : "") + '">' +
          '<small>' + escapeHtml(period.label) + '</small>' +
          '<strong>' + escapeHtml(parts.main) + '</strong>' +
          (parts.sub ? '<em>' + escapeHtml(parts.sub) + '</em>' : '') +
        '</div>';
      }).join("");
      return '<section class="st-tt-day ' + (day.index === activeDay ? "is-active" : "") + '">' +
        '<h3>' + escapeHtml(day.short) + '<small>' + escapeHtml(day.full) + '</small></h3>' +
        periods +
      '</section>';
    }).join("");
    page.innerHTML =
      '<header class="st-lite-header">' +
        '<button class="st-lite-back" data-lite-action="back" title="返回桌面">‹</button>' +
        '<div class="st-lite-title"><strong>课程表</strong><span>普通授课日 · 周一到周五</span></div>' +
      '</header>' +
      '<main class="st-lite-body">' +
        '<section class="st-lite-card st-tt-current">' +
          '<div><span>' + escapeHtml(dateText + " · " + timeText) + '</span><strong>' + escapeHtml(slot.title) + '</strong></div>' +
          '<div class="st-tt-badge">' + escapeHtml(slot.detail || (special?.detail || "普通授课")) + '</div>' +
        '</section>' +
        '<section class="st-tt-week">' + weekHtml + '</section>' +
        '<section class="st-tt-rhythm">' +
          '<div class="st-tt-rhythm-item"><b>08:30</b><span>朝礼</span><i>08:40</i></div>' +
          '<div class="st-tt-rhythm-item"><b>12:30</b><span>午休</span><i>13:20</i></div>' +
          '<div class="st-tt-rhythm-item"><b>15:10</b><span>终礼</span><i>15:25</i></div>' +
          '<div class="st-tt-rhythm-item"><b>15:25</b><span>清扫</span><i>15:40</i></div>' +
          '<div class="st-tt-rhythm-item"><b>15:45</b><span>放学</span><i>16:00</i></div>' +
        '</section>' +
      '</main>';
    page.querySelector('[data-lite-action="back"]')?.addEventListener("click", () => page.remove());
  }

  const PERSON_PROFILE_FIELDS = [
    { key: "姓名", label: "姓　名" },
    { key: "年龄", label: "年　龄" },
    { key: "社团/职业", label: "社　团" },
    { key: "身高", label: "身　高" },
    { key: "体重", label: "体　重" },
    { key: "三围", label: "三　围" },
    { key: "头发", label: "头　发", long: true },
    { key: "面部", label: "面　部", long: true },
    { key: "上衣", label: "上　衣", long: true },
    { key: "下衣", label: "下　衣", long: true }
  ];
  const PROFILE_PHOTO_STORAGE_PREFIX = "hypnoos:profile-photo:v1";

  function orderedProfileRoleNames(roles) {
    const defaults = DEFAULT_ROLE_NAMES.filter((name) => Object.prototype.hasOwnProperty.call(roles, name));
    const rest = Object.keys(roles).filter((name) => name && !DEFAULT_ROLE_NAMES.includes(name)).sort((a, b) => a.localeCompare(b, "zh-CN"));
    return defaults.concat(rest);
  }

  function profileStorageScope() {
    try {
      const id = window?.SillyTavern?.getCurrentChatId?.();
      if (id !== undefined && id !== null && String(id)) return String(id);
    } catch {}
    try {
      const id = getCurrentMessageIdSafe();
      if (id !== null && id !== undefined) return "message-" + String(id);
    } catch {}
    return "global";
  }

  function profilePhotoStorageKey(roleName) {
    return PROFILE_PHOTO_STORAGE_PREFIX + ":" + profileStorageScope() + ":" + roleName;
  }

  function localProfilePhoto(roleName) {
    try {
      return localStorage.getItem(profilePhotoStorageKey(roleName)) || "";
    } catch {
      return "";
    }
  }

  function profilePhotoSource(roleName, roleData) {
    const profile = roleProfileData(roleName, roleData);
    const source = effectScalar(profile["照片"]).trim();
    if (source && !["无", "空", "未记录"].includes(source)) return source;
    return localProfilePhoto(roleName) || ST_DEFAULT_PROFILE_PHOTOS[roleName] || "";
  }

  function profileFieldText(profile, roleName, field) {
    const value = effectScalar(profile[field.key]).trim();
    if (value) return value;
    if (field.key === "姓名") return roleName || "未记录";
    return "未记录";
  }

  function normalizeProfileIndex(page, count) {
    if (!count) return 0;
    const raw = Number(page.dataset.profileIndex || 0);
    const index = Number.isFinite(raw) ? raw : 0;
    return ((Math.trunc(index) % count) + count) % count;
  }

  function closePersonProfilePage(page) {
    const root = page.parentElement;
    if (root?.dataset?.stPhoneApp === "profile") delete root.dataset.stPhoneApp;
    page.parentNode?.removeChild(page);
  }

  function turnPersonProfilePage(page, delta) {
    const current = Number(page.dataset.profileIndex || 0);
    page.dataset.profileIndex = String((Number.isFinite(current) ? current : 0) + delta);
    renderPersonProfilePage(page, delta < 0 ? -1 : 1);
  }

  function runPersonProfileAction(page, action) {
    if (action === "back") closePersonProfilePage(page);
    if (action === "prev") turnPersonProfilePage(page, -1);
    if (action === "next") turnPersonProfilePage(page, 1);
    if (action === "upload-photo") page.querySelector("[data-profile-file]")?.click();
  }

  function bindPersonProfileEvents(page) {
    if (page.dataset.profileBound === "true") return;
    page.dataset.profileBound = "true";
    page.addEventListener("click", (event) => {
      const target = event.target?.closest?.("[data-profile-action]");
      if (!target || !page.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      runPersonProfileAction(page, target.dataset.profileAction);
    });
    page.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        turnPersonProfilePage(page, -1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        turnPersonProfilePage(page, 1);
      }
      if ((event.key === "Enter" || event.key === " ") && event.target?.closest?.('[data-profile-action="upload-photo"]')) {
        event.preventDefault();
        page.querySelector("[data-profile-file]")?.click();
      }
    });
  }

  function bindPersonProfileControls(page) {
    page.dataset.profileControlsBound = "delegated";
  }

  function personProfileSignature(page) {
    const roles = getStatsRoles();
    const roleNames = orderedProfileRoleNames(roles);
    const index = normalizeProfileIndex(page, roleNames.length);
    const roleName = roleNames[index] || "";
    const roleData = isPlainObject(roles[roleName]) ? roles[roleName] : {};
    return JSON.stringify({
      index,
      names: roleNames,
      profile: roleProfileData(roleName, roleData),
      photo: profilePhotoSource(roleName, roleData)
    });
  }

  function renderPersonProfilePage(page, direction = 0) {
    bindPersonProfileEvents(page);
    const roles = getStatsRoles();
    const roleNames = orderedProfileRoleNames(roles);
    const index = normalizeProfileIndex(page, roleNames.length);
    page.dataset.profileIndex = String(index);
    if (!roleNames.length) {
      page.dataset.profileSignature = personProfileSignature(page);
      page.innerHTML =
        '<main class="st-lite-body st-profile-body">' +
          '<section class="st-person-paper">' +
            '<button class="st-person-back" type="button" data-profile-action="back" title="返回桌面">‹</button>' +
            '<div class="st-person-paper-head"><small>NO DATA</small><h2>人物档案</h2></div>' +
            '<section class="st-person-empty">没有可显示的角色档案。</section>' +
          '</section>' +
        '</main>';
      bindPersonProfileControls(page);
      return;
    }
    const roleName = roleNames[index];
    const roleData = isPlainObject(roles[roleName]) ? roles[roleName] : {};
    const profile = roleProfileData(roleName, roleData);
    const photo = profilePhotoSource(roleName, roleData);
    const animationClass = direction < 0 ? " is-enter-left" : direction > 0 ? " is-enter-right" : "";
    const fieldsHtml = PERSON_PROFILE_FIELDS.map((field) => (
      '<div class="st-person-line ' + (field.long ? "is-long" : "") + '">' +
        '<span>' + escapeHtml(field.label) + '</span>' +
        '<strong>' + escapeHtml(profileFieldText(profile, roleName, field)) + '</strong>' +
      '</div>'
    )).join("");
    page.innerHTML =
      '<main class="st-lite-body st-profile-body">' +
        '<section class="st-person-paper' + animationClass + '" aria-label="人物档案纸">' +
          '<button class="st-person-back" type="button" data-profile-action="back" title="返回桌面">‹</button>' +
          '<div class="st-person-paper-head"><small>✦</small><h2>人物档案</h2></div>' +
          '<div class="st-person-photo-wrap">' +
            '<button class="st-person-paper-nav" type="button" data-profile-action="prev" title="上一个">‹</button>' +
            '<button class="st-person-photo" type="button" data-profile-action="upload-photo" title="点击更换照片">' +
              (photo ? '<img alt="' + escapeAttr(roleName) + '" src="' + escapeAttr(photo) + '">' : '<div class="st-person-photo-empty">点击照片区域<br>更换图片</div>') +
            '</button>' +
            '<button class="st-person-paper-nav" type="button" data-profile-action="next" title="下一个">›</button>' +
          '</div>' +
          '<input type="file" accept="image/*" data-profile-file hidden>' +
          '<section class="st-person-lines">' + fieldsHtml + '</section>' +
          '<div class="st-person-page-count">' + escapeHtml(String(index + 1) + " / " + roleNames.length) + '</div>' +
        '</section>' +
      '</main>';
    page.dataset.profileSignature = personProfileSignature(page);
    bindPersonProfileControls(page);
    const fileInput = page.querySelector("[data-profile-file]");
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file || !/^image\\//i.test(file.type || "")) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          localStorage.setItem(profilePhotoStorageKey(roleName), String(reader.result || ""));
        } catch {}
        renderPersonProfilePage(page);
      };
      reader.readAsDataURL(file);
    });
  }

  function openPersonProfilePage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "profile";
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-lite-app st-profile-app";
    page.setAttribute("aria-label", "人物档案");
    root.appendChild(page);
    renderPersonProfilePage(page);
  }

  function updateOpenPersonProfilePage() {
    const page = document.querySelector(".st-profile-app");
    if (page && page.dataset.profileSignature !== personProfileSignature(page)) {
      renderPersonProfilePage(page);
    }
  }

  function openLiteCalendarPage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "calendar-lite";
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-lite-app st-calendar-lite-app";
    page.setAttribute("aria-label", "日历");
    root.appendChild(page);
    renderLiteCalendarPage(page);
  }

  function openTimetablePage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "timetable";
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-lite-app st-timetable-app";
    page.setAttribute("aria-label", "课程表");
    root.appendChild(page);
    renderTimetablePage(page);
  }

  function normalizeClockPart(value, max) {
    const parsed = Number.parseInt(String(value ?? "").replace(/\\D/g, ""), 10);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(max, parsed));
  }

  function sanitizeClockInputValue(value, max, pad = false) {
    const digits = String(value ?? "").replace(/\\D/g, "").slice(0, 2);
    if (!digits) return "";
    const safe = String(Math.max(0, Math.min(max, Number.parseInt(digits, 10) || 0)));
    return pad ? safe.padStart(2, "0") : safe;
  }

  function getClockSeed() {
    const text = getSystemState()["当前时间"] || "12:00";
    const minutes = minutesFromTimeText(text);
    const safeMinutes = Number.isFinite(minutes) ? minutes : 12 * 60;
    return { hour: Math.floor(safeMinutes / 60) % 24, minute: safeMinutes % 60 };
  }

  function formatClockInput(hour, minute) {
    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }

  function updateClockFace(page) {
    const hour = normalizeClockPart(page.querySelector("[data-clock-hour]")?.value, 23);
    const minute = normalizeClockPart(page.querySelector("[data-clock-minute]")?.value, 59);
    const hourDeg = ((hour % 12) + minute / 60) * 30;
    const minuteDeg = minute * 6;
    const hourHand = page.querySelector(".st-clock-hand.hour");
    const minuteHand = page.querySelector(".st-clock-hand.minute");
    if (hourHand) hourHand.style.transform = "rotate(" + hourDeg + "deg)";
    if (minuteHand) minuteHand.style.transform = "rotate(" + minuteDeg + "deg)";
    const label = page.querySelector(".st-clock-time");
    if (label) label.textContent = formatClockInput(hour, minute);
  }

  function setClockValue(page, hour, minute) {
    const hourInput = page.querySelector("[data-clock-hour]");
    const minuteInput = page.querySelector("[data-clock-minute]");
    if (hourInput) hourInput.value = String(normalizeClockPart(hour, 23)).padStart(2, "0");
    if (minuteInput) minuteInput.value = String(normalizeClockPart(minute, 59)).padStart(2, "0");
    updateClockFace(page);
  }

  function renderClockPage(page) {
    const seed = getClockSeed();
    const marks = Array.from({ length: 12 }, (_, index) => {
      const angle = index * 30;
      const radians = angle * Math.PI / 180;
      const x = 50 + Math.sin(radians) * 42;
      const y = 50 - Math.cos(radians) * 42;
      return '<i class="st-clock-mark" style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%;transform:translate(-50%,-50%) rotate(' + angle + 'deg)"></i>';
    }).join("");
    page.innerHTML =
      '<header class="st-lite-header">' +
        '<button class="st-lite-back" data-lite-action="back" title="返回桌面">‹</button>' +
        '<div class="st-lite-title"><strong>时钟</strong><span>建议剧情开始时间</span></div>' +
      '</header>' +
      '<main class="st-lite-body">' +
        '<section class="st-lite-card st-clock-card">' +
          '<div class="st-clock-face" aria-hidden="true">' + marks +
            '<i class="st-clock-hand hour"></i><i class="st-clock-hand minute"></i><i class="st-clock-center"></i>' +
          '</div>' +
          '<div class="st-clock-time">' + escapeHtml(formatClockInput(seed.hour, seed.minute)) + '</div>' +
          '<div class="st-clock-inputs">' +
	            '<label><span>时</span><input data-clock-hour inputmode="numeric" autocomplete="off" maxlength="2" min="0" max="23" value="' + escapeAttr(String(seed.hour).padStart(2, "0")) + '"></label>' +
	            '<b class="st-clock-colon">:</b>' +
	            '<label><span>分</span><input data-clock-minute inputmode="numeric" autocomplete="off" maxlength="2" min="0" max="59" value="' + escapeAttr(String(seed.minute).padStart(2, "0")) + '"></label>' +
          '</div>' +
          '<button type="button" class="st-clock-action" data-clock-action="suggest">建议此时间</button>' +
          '<p class="st-clock-note">这只会写入本轮操作，请 AI 按剧情连续性判断是否推进时间；前端不会直接改当前时间变量。</p>' +
        '</section>' +
      '</main>';
    page.querySelector('[data-lite-action="back"]')?.addEventListener("click", () => {
      const root = page.parentElement;
      if (root?.dataset) delete root.dataset.stPhoneApp;
      page.remove();
    });
    page.querySelectorAll("[data-clock-hour],[data-clock-minute]").forEach((input) => {
      input.addEventListener("input", () => {
        const max = input.hasAttribute("data-clock-hour") ? 23 : 59;
        input.value = sanitizeClockInputValue(input.value, max, false);
        updateClockFace(page);
      });
      input.addEventListener("blur", () => {
        const max = input.hasAttribute("data-clock-hour") ? 23 : 59;
        input.value = sanitizeClockInputValue(input.value, max, true) || "00";
        updateClockFace(page);
      });
    });
    page.querySelector('[data-clock-action="suggest"]')?.addEventListener("click", () => {
      const hour = normalizeClockPart(page.querySelector("[data-clock-hour]")?.value, 23);
      const minute = normalizeClockPart(page.querySelector("[data-clock-minute]")?.value, 59);
      const suggested = formatClockInput(hour, minute);
      appendAppOperation({
        来源: "时钟",
        操作: "建议剧情开始时间",
        当前时间: getSystemState()["当前时间"] || "未知",
        建议时间: suggested,
        AI执行规范: "这是用户建议剧情从该时间开始或推进到该时间；AI应按剧情连续性判断是否成立，成立时更新系统.当前时间并同步日程、事件、当前/待上课程与课程表相关变量。"
      });
    });
    updateClockFace(page);
  }

  function openClockPage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "clock";
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-lite-app st-clock-app";
    page.setAttribute("aria-label", "时钟");
    root.appendChild(page);
    renderClockPage(page);
  }

  const STATIC_GRAPH_DEFAULTS = {
    world: {
      title: "区域地图",
      locations: [
        { id: "school", label: "私立斋明学园", info: "东京近郊的老牌私立升学高中，前千金女校，今年正式改为男女混校。{{user}}目前主要活动的舞台。" },
        { id: "saionji-company", label: "西园寺企业", info: "西园寺财团相关企业据点，象征爱丽莎家族的财富、人脉和社会影响力。" },
        { id: "saionji-home", label: "西园寺的家", info: "西园寺爱丽莎的家。豪宅、佣人和严格家族秩序构成她日常生活的背景。" },
        { id: "miyuki-home", label: "深雪的家", info: "月咏深雪的住处。安静、整洁、书卷气重，适合处理学习、班务和私人阅读情节。" },
        { id: "natsumi-home", label: "夏美的家", info: "犬冢夏美的家。生活气息更强，和运动、饮食、训练后的休息场景容易连接。" }
      ]
    },
    school: {
      title: "学校地图",
      locations: [
        { id: "classroom", label: "教室", info: "二年级教室。日常上课、课间人际、视线交错和班级中心关系最容易发生的地点。" },
        { id: "corridor", label: "走廊", info: "连接教室、社团与各专用教室的公共空间。人来人往，适合短暂偶遇和擦肩而过。" },
        { id: "old-school-building", label: "旧校舍", info: "破败、阴暗、少有人去的旧建筑。传闻、躲藏、无人目击的偶遇和灵异气氛都容易在这里聚集。" },
        { id: "library", label: "图书馆", info: "安静的阅读与自习空间。深雪常会出现，也适合调查资料、传闻和灵异记录。" },
        { id: "principal", label: "校长室", info: "校方管理层所在地点。校规、处分、学校声望和重大事件容易在这里交汇。" },
        { id: "pool", label: "游泳池", info: "体育（水泳）相关场地。视线、换装、体能差异和季节活动很容易在这里展开。" },
        { id: "field", label: "操场", info: "田径与户外体育场地。夏美的主场，也是白枢暗子隐藏运动能力可能暴露的地方。" }
      ]
    }
  };

  function graphScopeKey() {
    try {
      const chatId = window?.SillyTavern?.getCurrentChatId?.();
      if (chatId !== undefined && chatId !== null && String(chatId).trim()) return String(chatId).trim();
    } catch {}
    return "global";
  }

  function graphStorageKey(scope) {
    return "hypnoos.static-map." + scope + ".v1:" + graphScopeKey();
  }

  function graphUpdateSeenStorageKey() {
    return "hypnoos.static-map.update-seen.v1:" + graphScopeKey();
  }

  function cloneGraph(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return { locations: [] };
    }
  }

  function normalizeGraphGraph(raw, scope) {
    const fallback = STATIC_GRAPH_DEFAULTS[scope] || STATIC_GRAPH_DEFAULTS.world;
    const fallbackLocations = fallback.locations || fallback.nodes || [];
    const fallbackById = new Map(fallbackLocations.map((location) => [String(location.id), location]));
    const source = raw && typeof raw === "object" ? raw : fallback;
    const sourceLocations = Array.isArray(source.locations)
      ? source.locations
      : Array.isArray(source.places)
        ? source.places
        : Array.isArray(source.nodes)
          ? source.nodes
          : fallbackLocations;
    const locations = sourceLocations
      .filter((location) => location && typeof location === "object" && String(location.id || location.label || location.name || location["地点"] || "").trim())
      .map((location, index) => {
        const id = String(location.id || location.key || location.label || location.name || location["地点"] || ("place-" + index));
        return {
          id,
          label: String(location.label || location.name || location["地点"] || location.title || id || ("地点" + (index + 1))),
          info: String(location.info || location.description || location.desc || location["描述"] || fallbackById.get(id)?.info || "暂无地点信息。")
        };
      });
    return {
      title: String(source.title || fallback.title || (scope === "school" ? "学校地图" : "地图")),
      locations
    };
  }

  function saveStaticGraph(scope, graph) {
    try {
      localStorage.setItem(graphStorageKey(scope), JSON.stringify(normalizeGraphGraph(graph, scope)));
    } catch {}
  }

  function mergeDefaultStaticGraphLocations(graph, scope) {
    const fallback = STATIC_GRAPH_DEFAULTS[scope] || STATIC_GRAPH_DEFAULTS.world;
    const defaults = fallback.locations || [];
    const existing = new Set((graph.locations || []).map((location) => String(location.id || location.label || "")));
    const additions = defaults.filter((location) => {
      const id = String(location.id || location.label || "");
      return id && !existing.has(id);
    });
    if (!additions.length) return graph;
    return { ...graph, locations: graph.locations.concat(additions.map((location) => ({ ...location }))) };
  }

  function defaultGraphNodeIds(scope) {
    const fallback = STATIC_GRAPH_DEFAULTS[scope] || STATIC_GRAPH_DEFAULTS.world;
    return new Set((fallback.locations || []).map((location) => String(location.id)));
  }

  function getCurrentStoryLocation() {
    const system = getSystemState();
    return String(system["当前地点"] || system["当前位置"] || "").trim();
  }

  function isGraphLocationCurrent(location, currentLocation) {
    const current = String(currentLocation || "").trim();
    if (!current || !location) return false;
    const id = String(location.id || "").trim();
    const label = String(location.label || "").trim();
    return Boolean((label && current.includes(label)) || (id && current === id));
  }

  function deleteStaticGraphNode(scope, nodeId) {
    const ids = defaultGraphNodeIds(scope);
    if (ids.has(String(nodeId))) return false;
    const graph = loadStaticGraph(scope);
    const next = {
      ...graph,
      locations: graph.locations.filter((location) => location.id !== nodeId)
    };
    saveStaticGraph(scope, next);
    return true;
  }

  function parseStaticGraphUpdateText(text) {
    const source = String(text || "");
    if (!source.includes("<地图更新>") && !source.includes("<学校地图更新>")) return 0;
    let applied = 0;
    const specs = [
      { scope: "world", re: /<地图更新>([\\s\\S]*?)<\\/地图更新>/g },
      { scope: "school", re: /<学校地图更新>([\\s\\S]*?)<\\/学校地图更新>/g }
    ];
    for (const spec of specs) {
      for (const match of source.matchAll(spec.re)) {
        try {
          saveStaticGraph(spec.scope, JSON.parse(String(match[1] || "").trim()));
          applied += 1;
        } catch {}
      }
    }
    return applied;
  }

  function readSeenGraphUpdateKeys() {
    try {
      const parsed = JSON.parse(localStorage.getItem(graphUpdateSeenStorageKey()) || "[]");
      if (Array.isArray(parsed)) return new Set(parsed.map(String));
    } catch {}
    return new Set();
  }

  function writeSeenGraphUpdateKeys(keys) {
    try {
      localStorage.setItem(graphUpdateSeenStorageKey(), JSON.stringify(Array.from(keys).slice(-120)));
    } catch {}
  }

  function graphMessageBody(message) {
    if (typeof message === "string") return message;
    if (!message || typeof message !== "object") return "";
    return String(message.message ?? message.mes ?? message.text ?? message.content ?? message.raw ?? "");
  }

  function pushGraphMessages(target, source, label) {
    if (!Array.isArray(source)) return;
    source.forEach((message, index) => {
      const body = graphMessageBody(message);
      if (!body.includes("<地图更新>") && !body.includes("<学校地图更新>")) return;
      const id = message && typeof message === "object"
        ? (message.message_id ?? message.mesid ?? message.id ?? index)
        : index;
      target.push({ key: label + ":" + String(id) + ":" + body.length, body });
    });
  }

  function syncStaticGraphUpdatesFromChat() {
    const messages = [];
    try {
      if (typeof getCurrentMessageId === "function" && typeof getChatMessages === "function") {
        const current = getChatMessages(getCurrentMessageId());
        pushGraphMessages(messages, Array.isArray(current) ? current : [current], "current");
      }
    } catch {}
    try {
      if (typeof getChatMessages === "function") pushGraphMessages(messages, getChatMessages(-1) || [], "getChatMessages");
    } catch {}
    try {
      const context = window?.SillyTavern?.getContext?.() || (typeof getContext === "function" ? getContext() : null);
      pushGraphMessages(messages, context?.chat || [], "context");
    } catch {}
    try {
      pushGraphMessages(messages, Array.isArray(window.chat) ? window.chat : [], "window.chat");
    } catch {}
    const seen = readSeenGraphUpdateKeys();
    let changed = false;
    for (const message of messages) {
      if (seen.has(message.key)) continue;
      if (parseStaticGraphUpdateText(message.body) > 0) {
        seen.add(message.key);
        changed = true;
      }
    }
    if (changed) writeSeenGraphUpdateKeys(seen);
  }

  function loadStaticGraph(scope) {
    syncStaticGraphUpdatesFromChat();
    try {
      const stored = JSON.parse(localStorage.getItem(graphStorageKey(scope)) || "null");
      if (stored) {
        const graph = normalizeGraphGraph(stored, scope);
        const merged = mergeDefaultStaticGraphLocations(graph, scope);
        if (merged.locations.length !== graph.locations.length) saveStaticGraph(scope, merged);
        return merged;
      }
    } catch {}
    const graph = normalizeGraphGraph(cloneGraph(STATIC_GRAPH_DEFAULTS[scope]), scope);
    saveStaticGraph(scope, graph);
    return graph;
  }

  function graphSuggestedNodeId(name) {
    const base = String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || "new-place";
  }

  function renderGraphAddLocationCard(scope, graph) {
    const currentLocation = getCurrentStoryLocation() || "未知";
    const title = scope === "school" ? "新增校内地点" : "新增区域地点";
    const tag = scope === "school" ? "<学校地图更新>" : "<地图更新>";
    return '<section class="st-lite-card st-graph-add" data-graph-add-scope="' + escapeAttr(scope) + '">' +
      '<div class="st-graph-head"><strong>' + title + '</strong><span>统一提示词</span></div>' +
      '<div class="st-graph-add-grid">' +
        '<input data-graph-add-name autocomplete="off" placeholder="地点名">' +
        '<textarea data-graph-add-info placeholder="地点说明、用途、相关角色或剧情倾向"></textarea>' +
      '</div>' +
      '<p class="st-graph-add-hint">提交后只会加入本轮APP操作；AI需要输出完整 ' + escapeHtml(tag) + ' 地点列表 JSON，前端再写入本地。当前地点变量：' + escapeHtml(currentLocation) + '。</p>' +
      '<button type="button" data-graph-add-submit data-graph-scope="' + escapeAttr(scope) + '">请求新增地点</button>' +
    '</section>';
  }

  function renderStaticGraphCard(scope) {
    const graph = loadStaticGraph(scope);
    const currentLocation = getCurrentStoryLocation();
    const locations = graph.locations.length
      ? graph.locations.map((location) => {
          const deletable = !defaultGraphNodeIds(scope).has(location.id);
          const isCurrent = isGraphLocationCurrent(location, currentLocation);
          return '<article class="st-location-item' + (isCurrent ? " is-current" : "") + '">' +
            '<div class="st-location-main">' +
              '<strong>' + escapeHtml(location.label) + (isCurrent ? '<small>变量当前</small>' : "") + '</strong>' +
              '<p>' + escapeHtml(location.info || "暂无地点信息。") + '</p>' +
            '</div>' +
            '<button type="button" class="st-location-suggest" data-graph-suggest-location="' + escapeAttr(location.id) + '" data-graph-scope="' + escapeAttr(scope) + '">建议设为地点</button>' +
            (deletable ? '<button class="st-graph-delete" type="button" data-graph-action="delete-node" data-graph-scope="' + escapeAttr(scope) + '" data-graph-node-id="' + escapeAttr(location.id) + '">删除</button>' : "") +
          '</article>';
        }).join("")
      : '<div class="st-graph-info"><p>暂无地点信息。</p></div>';
    return '<section class="st-lite-card st-graph-card">' +
      '<div class="st-graph-head"><strong>' + escapeHtml(graph.title) + '</strong><span>' + graph.locations.length + ' 地点</span></div>' +
      '<div class="st-location-current"><span>当前地点变量</span><strong>' + escapeHtml(currentLocation || "未记录") + '</strong></div>' +
      '<div class="st-location-list">' + locations + '</div>' +
    '</section>' +
    renderGraphAddLocationCard(scope, graph);
  }

  function getSchoolRules() {
    const variables = getLatestStatDataSync();
    const rules = variables?.["校规"] || variables?.["系统"]?.["校规"];
    return rules && typeof rules === "object" && !Array.isArray(rules) ? rules : {};
  }

  const DEFAULT_SCHOOL_RULE_NAMES = new Set(["仪容礼仪", "出勤学习", "校内安全"]);

  function isDefaultSchoolRuleName(name) {
    return DEFAULT_SCHOOL_RULE_NAMES.has(String(name || "").trim());
  }

  function schoolRuleRequirementState() {
    const system = getSystemState();
    const roles = getStatsRoles();
    const tier = String(system["催眠APP订阅等级"] || "").trim().toUpperCase();
    const alisaFavor = Number(roles?.["西园寺爱丽莎"]?.["好感度"] ?? 0);
    const currentMoney = Number(system["持有零花钱"] ?? 0);
    const rules = getSchoolRules();
    return {
      vip5: /VIP\s*5/.test(tier),
      alisaFavor: Number.isFinite(alisaFavor) ? alisaFavor : 0,
      currentMoney: Number.isFinite(currentMoney) ? currentMoney : 0,
      count: Object.keys(rules).length
    };
  }

  function paidSchoolRuleBlockedReasons(requirement, { checkCount = false } = {}) {
    const blockedReasons = [];
    if (!requirement.vip5) blockedReasons.push("需要VIP5");
    if (requirement.alisaFavor < 100) blockedReasons.push("西园寺爱丽莎好感度至少100");
    if (requirement.currentMoney < 500000000) blockedReasons.push("资金不足¥500,000,000");
    if (checkCount && requirement.count >= 3) blockedReasons.push("校规最多3条");
    return blockedReasons;
  }

  function hasPendingSchoolRuleRequest() {
    try {
      const pending = window.__ST_GET_PENDING_OPERATION_INPUT_LOG__?.() || [];
      return pending.some((entry) => {
        const payload = entry?.payload ?? entry;
        return payload && typeof payload === "object" && payload["来源"] === "学校" && payload["操作"] === "申请立校规";
      });
    } catch {
      return false;
    }
  }

  function renderSchoolRulesCard() {
    const rules = getSchoolRules();
    const entries = Object.entries(rules);
    const requirement = schoolRuleRequirementState();
    const blockedReasons = paidSchoolRuleBlockedReasons(requirement, { checkCount: true });
    const canSubmit = blockedReasons.length === 0;
    const list = entries.length
      ? entries.map(([name, value]) => {
          const isDefaultRule = isDefaultSchoolRuleName(name);
          const deleteBlockedReasons = isDefaultRule ? paidSchoolRuleBlockedReasons(requirement) : [];
          const canDelete = deleteBlockedReasons.length === 0;
          const text = typeof value === "object" && value !== null ? (value["内容"] || value["效果"] || JSON.stringify(value)) : value;
          return '<article class="st-rule-item"><strong>' + escapeHtml(name) + (isDefaultRule ? '<small>初始校规</small>' : "") + '</strong><p>' + escapeHtml(text) + '</p><button class="st-rule-delete" type="button" data-school-rule-delete="' + escapeAttr(name) + '" data-school-rule-default="' + (isDefaultRule ? "true" : "false") + '"' + (canDelete ? "" : ' disabled title="' + escapeAttr(deleteBlockedReasons.join(" / ")) + '"') + '>' + (isDefaultRule ? (canDelete ? "付费废止" : "需条件") : "删除校规") + '</button></article>';
        }).join("")
      : '<p class="st-rule-empty">暂无校规</p>';
    return '<section class="st-lite-card st-graph-card">' +
      '<div class="st-graph-head"><strong>现行校规</strong><span>' + entries.length + ' 条</span></div>' +
      '<div class="st-rule-list">' + list + '</div>' +
    '</section>' +
    '<section class="st-lite-card st-rule-form">' +
      '<textarea class="st-rule-input" data-school-rule-input placeholder="输入想制定的校规"></textarea>' +
      '<div class="st-rule-cost is-single"><span>资金 ¥500,000,000</span></div>' +
      '<p class="st-rule-state">要求：VIP5；西园寺爱丽莎好感度≥100；持有零花钱≥¥500,000,000；一次发布一条；最多3条。当前：' + escapeHtml((requirement.vip5 ? "VIP5" : "非VIP5") + " / 爱丽莎好感度 " + requirement.alisaFavor + " / 资金 ¥" + requirement.currentMoney.toLocaleString() + " / " + requirement.count + "条") + '</p>' +
      '<button class="st-rule-button" type="button" data-school-rule-submit' + (canSubmit ? "" : " disabled") + '>' + (canSubmit ? "申请立校规" : blockedReasons.join(" / ")) + '</button>' +
    '</section>';
  }

  function bindGraphPageActions(page) {
    page.querySelectorAll("[data-graph-add-submit]").forEach((button) => {
      button.addEventListener("click", () => {
        const scope = button.getAttribute("data-graph-scope") || "world";
        const card = button.closest("[data-graph-add-scope]");
        const nameInput = card?.querySelector("[data-graph-add-name]");
        const infoInput = card?.querySelector("[data-graph-add-info]");
        const name = String(nameInput?.value || "").trim();
        const infoText = String(infoInput?.value || "").trim();
        if (!name && !infoText) return;
        const graph = loadStaticGraph(scope);
        const currentLocation = getCurrentStoryLocation() || "未知";
        const tag = scope === "school" ? "学校地图更新" : "地图更新";
        appendAppOperation({
          来源: scope === "school" ? "学校地图" : "地图",
          操作: "请求新增地点",
          地图类型: graph.title + "（地点列表）",
          新增地点: {
            名称: name || "由AI按剧情命名",
            信息: infoText || "由AI按当前剧情补全",
            建议ID: graphSuggestedNodeId(name),
            当前地点变量: currentLocation
          },
          当前完整地点列表JSON: JSON.stringify({ title: graph.title, locations: graph.locations }),
          AI执行规范: "若地点成立，输出完整<" + tag + ">JSON</" + tag + ">，不是增量；只保留locations地点列表，不要输出边关系、坐标或连线。每项使用id、name、description。"
        });
        if (nameInput) nameInput.value = "";
        if (infoInput) infoInput.value = "";
      });
    });
    page.querySelectorAll("[data-graph-suggest-location]").forEach((button) => {
      button.addEventListener("click", () => {
        const scope = button.getAttribute("data-graph-scope") || "world";
        const graph = loadStaticGraph(scope);
        const id = button.getAttribute("data-graph-suggest-location") || "";
        const location = graph.locations.find((item) => item.id === id);
        if (!location) return;
        appendAppOperation({
          来源: scope === "school" ? "学校地图" : "地图",
          操作: "建议剧情地点",
          当前地点变量: getCurrentStoryLocation() || "未知",
          建议地点: {
            名称: location.label,
            描述: location.info || "暂无地点信息。",
            地图类型: graph.title
          },
          AI执行规范: "这只是用户希望剧情地点设在这里的建议；前端不能直接改当前地点。AI应按剧情、时间和移动条件判断是否成立，成立时更新/系统/当前地点，并同步当前事件、当前日程或当前/待上课程；不合理时可拒绝或延后。"
        });
      });
    });
    page.querySelectorAll("[data-graph-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const scope = button.getAttribute("data-graph-scope") || "world";
        const action = button.getAttribute("data-graph-action");
        if (action === "delete-node") {
          const nodeId = button.getAttribute("data-graph-node-id") || "";
          const graph = loadStaticGraph(scope);
          const location = graph.locations.find((item) => item.id === nodeId);
          const label = location?.label || nodeId || "这个地点";
          const ok = window.confirm("永久删除地点「" + label + "」？\\n\\n此操作不需要 AI 确认，会直接删除本浏览器里的自定义地点，删除后无法恢复。");
          if (!ok) return;
          deleteStaticGraphNode(scope, nodeId);
        }
        if (page.classList.contains("st-school-app")) renderSchoolPage(page);
        else renderMapPage(page);
      });
    });
    page.querySelector("[data-school-rule-submit]")?.addEventListener("click", () => {
      const input = page.querySelector("[data-school-rule-input]");
      const button = page.querySelector("[data-school-rule-submit]");
      const ruleText = String(input?.value || "").trim();
      if (!ruleText) return;
      if (hasPendingSchoolRuleRequest()) {
        if (button) {
          const original = button.textContent;
          button.textContent = "已有校规申请暂存";
          window.setTimeout(() => {
            button.textContent = original || "申请立校规";
          }, 1400);
        }
        return;
      }
      appendAppOperation({
        来源: "学校",
        操作: "申请立校规",
        校规内容: ruleText,
        目标范围: "未指定则学校内全体人员；也可由校规内容指定个体或群体。",
        前置条件: "VIP5；西园寺爱丽莎好感度>=100；校规少于3条；本次只发布一条；持有零花钱>=500000000。",
        固定代价: {
          持有零花钱: 500000000
        },
        AI执行规范: "成功只扣持有零花钱并写入/校规；校规不是催眠效果，禁止写入角色临时/永久催眠效果。"
      });
      input.value = "";
    });
    page.querySelectorAll("[data-school-rule-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        const ruleName = button.getAttribute("data-school-rule-delete") || "";
        const isDefaultRule = button.getAttribute("data-school-rule-default") === "true";
        appendAppOperation({
          来源: "学校",
          操作: isDefaultRule ? "废止初始校规" : "删除校规",
          校规名: ruleName,
          前置条件: isDefaultRule ? "VIP5；西园寺爱丽莎好感度>=100；持有零花钱>=500000000。" : "后续新增校规可直接删除。",
          固定代价: isDefaultRule ? { 持有零花钱: 500000000 } : { 持有零花钱: 0 },
          AI执行规范: isDefaultRule
            ? "这是废止初始默认校规；成功时扣除¥500,000,000持有零花钱并remove /校规/校规名。任一条件不足则失败，不扣费、不删除。"
            : "这是删除后续自建校规；成功时只remove /校规/校规名，不扣费、不返还金钱或其他资源。"
        });
      });
    });
  }

  function renderMapPage(page) {
    page.innerHTML =
      '<header class="st-lite-header">' +
        '<button class="st-lite-back" data-lite-action="back" title="返回桌面">‹</button>' +
        '<div class="st-lite-title"><strong>地图</strong><span>区域信息</span></div>' +
      '</header>' +
      '<main class="st-lite-body">' +
        renderStaticGraphCard("world") +
      '</main>';
    page.querySelector('[data-lite-action="back"]')?.addEventListener("click", () => {
      const root = page.parentElement;
      if (root?.dataset) delete root.dataset.stPhoneApp;
      page.remove();
    });
    bindGraphPageActions(page);
  }

  function renderSchoolPage(page) {
    const active = page.dataset.schoolTab || "map";
    page.innerHTML =
      '<header class="st-lite-header">' +
        '<button class="st-lite-back" data-lite-action="back" title="返回桌面">‹</button>' +
        '<div class="st-lite-title"><strong>学校</strong><span>学校地图与校规</span></div>' +
      '</header>' +
      '<main class="st-lite-body">' +
        '<section class="st-graph-tabs">' +
          '<button type="button" class="st-graph-tab ' + (active === "map" ? "active" : "") + '" data-school-tab="map">学校地图</button>' +
          '<button type="button" class="st-graph-tab ' + (active === "rules" ? "active" : "") + '" data-school-tab="rules">校规</button>' +
        '</section>' +
        (active === "rules" ? renderSchoolRulesCard() : renderStaticGraphCard("school")) +
      '</main>';
    page.querySelector('[data-lite-action="back"]')?.addEventListener("click", () => {
      const root = page.parentElement;
      if (root?.dataset) delete root.dataset.stPhoneApp;
      page.remove();
    });
    page.querySelectorAll("[data-school-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        page.dataset.schoolTab = button.getAttribute("data-school-tab") || "map";
        renderSchoolPage(page);
      });
    });
    bindGraphPageActions(page);
  }

  function openTodoPage(tile, appName, className, title, subtitle, schoolMode = false) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = appName;
    root.style.position = root.style.position || "relative";
    clearPhoneInternalOverlays(root);
    const page = document.createElement("section");
    page.className = "st-lite-app " + className;
    page.setAttribute("aria-label", title);
    root.appendChild(page);
    if (schoolMode) renderSchoolPage(page);
    else renderMapPage(page);
  }

  window.__ST_OPEN_MCHAN_APP__ = () => openMchanPage();
  window.__ST_OPEN_ADD_ROLE_APP__ = () => openAddRolePage();
  window.__ST_OPEN_PROFILE_APP__ = () => openPersonProfilePage();
  window.__ST_OPEN_LITE_CALENDAR_APP__ = () => openLiteCalendarPage();
  window.__ST_OPEN_TIMETABLE_APP__ = () => openTimetablePage();
  window.__ST_OPEN_CLOCK_APP__ = () => openClockPage();
  window.__ST_OPEN_MAP_APP__ = () => openTodoPage(null, "map", "st-map-app", "地图", "区域信息");
  window.__ST_OPEN_SCHOOL_APP__ = () => openTodoPage(null, "school", "st-school-app", "学校", "学校地图与校规", true);

  function looksLikePhoneHome(root) {
    const rootText = root?.innerText || "";
    return ["催眠APP", "日历", "帮助", "成就和任务", "库存", "MC匿名版"].every((label) => rootText.includes(label)) &&
      !root.querySelector(".st-mchan-internal-app, .st-add-role-app, .st-calendar-lite-app, .st-timetable-app, .st-clock-app, .st-profile-app, .st-map-app, .st-school-app");
  }

  function getHomeHeader(root) {
    return root?.querySelector?.('[class*="px-6"][class*="mb-8"]') || root?.firstElementChild?.firstElementChild || null;
  }

  const ST_HOME_AUTHOR_STATUS = "Ramiel";

  function patchHomeAuthorStatus(root) {
    if (!root || !looksLikePhoneHome(root)) return;
    const existing = root.querySelector(".st-home-author-status");
    if (existing?.textContent === ST_HOME_AUTHOR_STATUS) return;
    const rootRect = root.getBoundingClientRect();
    const candidates = Array.from(root.querySelectorAll("span,div,time")).filter((element) => {
      if (element.closest(".st-mchan-internal-app,.st-add-role-app,.st-calendar-lite-app,.st-timetable-app,.st-clock-app,.st-profile-app,.st-map-app,.st-school-app")) return false;
      const text = element.textContent?.trim() || "";
      if (!element.classList?.contains("st-home-author-status") && !/^\\d{1,2}:\\d{2}$/.test(text)) return false;
      if (element.children.length > 0) return false;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      const top = rect.top - rootRect.top;
      const left = rect.left - rootRect.left;
      const fontSize = Number.parseFloat(getComputedStyle(element).fontSize) || 0;
      return top >= 0 && top < 72 && left >= 0 && left < 130 && fontSize <= 28;
    });
    const target = candidates.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return (ar.top - br.top) || (ar.left - br.left);
    })[0];
    if (!target) return;
    target.textContent = ST_HOME_AUTHOR_STATUS;
    target.classList.add("st-home-author-status");
  }

  function pendingOperationCount() {
    try {
      const pending = window.__ST_GET_PENDING_OPERATION_INPUT_LOG__?.();
      return Array.isArray(pending) ? pending.length : 0;
    } catch {
      return 0;
    }
  }

  function removeHomeOperationConfirm(root) {
    root?.querySelectorAll?.(".st-operation-confirm").forEach((button) => button.remove());
  }

  function getPendingOperationViews() {
    try {
      const views = window.__ST_GET_PENDING_OPERATION_VIEW__?.();
      if (Array.isArray(views)) return views;
    } catch {}
    try {
      const pending = window.__ST_GET_PENDING_OPERATION_INPUT_LOG__?.();
      if (!Array.isArray(pending)) return [];
      return pending.map((entry, index) => ({
        id: String(entry?.id || entry?.key || index),
        key: String(entry?.key || entry?.id || index),
        at: Number(entry?.at || 0),
        source: "APP",
        action: "操作",
        summary: JSON.stringify(entry?.payload ?? entry),
        line: "- 操作｜内容=" + JSON.stringify(entry?.payload ?? entry)
      }));
    } catch {
      return [];
    }
  }

  function formatOperationPanelTime(value) {
    const date = new Date(Number(value || 0));
    if (Number.isNaN(date.getTime()) || Number(value || 0) <= 0) return "刚刚";
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }

  function compactOperationPanelSummary(item) {
    const text = String(item?.summary || item?.line || "");
    const readField = (key) => {
      const marker = key + "=";
      const start = text.indexOf(marker);
      if (start < 0) return "";
      return text.slice(start + marker.length).split("｜")[0].trim();
    };
    const keys = String(item?.action || "").includes("成就")
      ? ["成就", "名称", "目标", "角色"]
      : String(item?.action || "").includes("任务")
        ? ["任务", "名称", "数量", "目标", "角色"]
        : ["校规内容", "校规名", "功能", "命令", "目标", "角色", "角色名", "名称", "等级", "数量"];
    for (const key of keys) {
      const value = readField(key);
      if (value) return value.length > 18 ? value.slice(0, 18) + "..." : value;
    }
    const cleaned = text.replace(/^-\\s*/, "").trim();
    return cleaned.length <= 18 && !cleaned.includes("｜") ? cleaned : "";
  }

  function syncOperationSidePanelSize(panel) {
    const workspace = document.getElementById("st-operation-workspace");
    const phone = document.querySelector("#st-operation-workspace #app .w-full.h-full.bg-black.overflow-hidden.relative")
      || document.querySelector("#st-operation-workspace #app > div");
    const rect = phone?.getBoundingClientRect?.();
    const height = Math.round(Number(rect?.height || 0));
    if (!workspace || !panel || height < 420 || height > 1200) return;
    workspace.style.setProperty("--st-phone-panel-height", height + "px");
    panel.style.height = height + "px";
    panel.style.maxHeight = height + "px";
  }

  function updateOperationSidePanel() {
    const panel = document.getElementById("st-operation-side-panel");
    if (!panel) return;
    syncOperationSidePanelSize(panel);
    const items = getPendingOperationViews();
    const count = pendingOperationCount();
    let block = "";
    try {
      block = window.__ST_BUILD_PENDING_OPERATION_BLOCK__?.() || "";
    } catch {}
    const signature = JSON.stringify(items.map((item) => [item.id, item.key, item.source, item.action, item.summary, item.line, item.at])) + "\\n" + block;
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature;
    const listHtml = items.length
      ? items.map((item) => {
          const conciseSummary = compactOperationPanelSummary(item);
          return '<article class="st-operation-item">' +
            '<div class="st-operation-item-top">' +
              '<div class="st-operation-item-main">' +
                '<span class="st-operation-item-source">' + escapeHtml(item.source || "APP") + " · " + escapeHtml(formatOperationPanelTime(item.at)) + '</span>' +
                '<strong class="st-operation-item-action">' + escapeHtml(item.action || "操作") + '</strong>' +
              '</div>' +
              '<button class="st-operation-item-remove" type="button" title="删除这条操作" data-operation-remove="' + escapeAttr(item.id || item.key) + '">×</button>' +
            '</div>' +
            (conciseSummary ? '<p class="st-operation-item-summary">' + escapeHtml(conciseSummary) + '</p>' : "") +
          '</article>';
        }).join("")
      : '<p class="st-operation-empty">还没有本轮前端点击。点击领取、接任务、购买或启动催眠后会先暂存在这里。</p>';
    panel.innerHTML =
      '<header class="st-operation-panel-head">' +
        '<div class="st-operation-panel-title"><strong>本轮操作</strong><span>确认前只暂存，不写变量也不发送。</span></div>' +
        '<span class="st-operation-count-pill">' + String(count) + '</span>' +
      '</header>' +
      '<div class="st-operation-panel-list">' + listHtml + '</div>' +
      '<details class="st-operation-panel-preview">' +
        '<summary>将写入输入框的内容</summary>' +
        '<pre>' + escapeHtml(block || "暂无待写入内容") + '</pre>' +
      '</details>' +
      '<div class="st-operation-panel-actions">' +
        '<button type="button" data-operation-panel-action="clear" ' + (count ? "" : "disabled") + '>清空</button>' +
        '<button class="primary" type="button" data-operation-panel-action="flush" ' + (count ? "" : "disabled") + '>确认写入</button>' +
      '</div>';
  }

  function bindOperationSidePanel(panel) {
    if (!panel || panel.dataset.bound === "true") return;
    panel.dataset.bound = "true";
    panel.addEventListener("click", async (event) => {
      const target = event.target;
      const removeButton = target?.closest?.("[data-operation-remove]");
      if (removeButton) {
        event.preventDefault();
        event.stopPropagation();
        window.__ST_REMOVE_PENDING_OPERATION__?.(removeButton.dataset.operationRemove);
        updateOperationSidePanel();
        return;
      }
      const actionButton = target?.closest?.("[data-operation-panel-action]");
      if (!actionButton || actionButton.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      const action = actionButton.dataset.operationPanelAction;
      if (action === "clear") {
        window.__ST_CLEAR_OPERATION_INPUT_LOG__?.();
        updateOperationSidePanel();
        return;
      }
      if (action === "flush") {
        actionButton.disabled = true;
        try {
          await window.__ST_FLUSH_OPERATION_TO_INPUT__?.();
        } finally {
          panel.dataset.signature = "";
          updateOperationSidePanel();
        }
      }
    });
  }

  function ensureOperationSidePanel() {
    const app = document.getElementById("app");
    if (!app) return null;
    if (!app.firstElementChild) return null;
    document.body.classList.add("st-operation-side-layout");
    let workspace = document.getElementById("st-operation-workspace");
    if (!workspace) {
      workspace = document.createElement("div");
      workspace.id = "st-operation-workspace";
      app.parentNode?.insertBefore(workspace, app);
      workspace.appendChild(app);
    } else if (app.parentElement !== workspace) {
      workspace.insertBefore(app, workspace.firstChild);
    }
    let panel = document.getElementById("st-operation-side-panel");
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = "st-operation-side-panel";
      panel.setAttribute("aria-label", "本轮APP操作暂存列表");
      workspace.appendChild(panel);
    } else if (panel.parentElement !== workspace) {
      workspace.appendChild(panel);
    }
    bindOperationSidePanel(panel);
    updateOperationSidePanel();
    return panel;
  }

  function patchAddRoleTile() {
    const root = findPhoneRoot(document.body);
    if (!root || !looksLikePhoneHome(root)) return;
    const hypnosisTile = findHomeTileByText("催眠APP");
    if (!hypnosisTile) return;
    const parent = hypnosisTile.parentElement;
    if (!parent || parent.querySelector('[data-st-add-role-tile="true"]')) return;
    const tile = hypnosisTile.cloneNode(true);
    tile.dataset.stAddRoleTile = "true";
    tile.dataset.stMchanInternalPatched = "";
    tile.setAttribute("aria-label", "打开扫描角色");
    replaceExactTextInTile(tile, "催眠APP", "扫描角色");
    setHomeTileIcon(tile, ST_APP_ICONS.scanRole, "扫描角色");
    tile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    tile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openAddRolePage(tile);
    }, true);
    hypnosisTile.insertAdjacentElement("afterend", tile);
  }

  function patchPersonProfileTile() {
    const root = findPhoneRoot(document.body);
    if (!root || !looksLikePhoneHome(root)) return;
    const anchorTile = findHomeTileByText("扫描角色") || findHomeTileByText("催眠APP");
    if (!anchorTile) return;
    const parent = anchorTile.parentElement;
    if (!parent || parent.querySelector('[data-st-profile-tile="true"]')) return;
    const tile = anchorTile.cloneNode(true);
    tile.dataset.stProfileTile = "true";
    tile.removeAttribute("data-st-add-role-tile");
    tile.removeAttribute("data-st-mchan-internal-patched");
    tile.setAttribute("aria-label", "打开人物档案");
    replaceExactTextInTile(tile, "扫描角色", "人物档案");
    replaceExactTextInTile(tile, "催眠APP", "人物档案");
    setHomeTileIcon(tile, ST_APP_ICONS.profile, "人物档案");
    tile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    tile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openPersonProfilePage(tile);
    }, true);
    anchorTile.insertAdjacentElement("afterend", tile);
  }

  function patchCalendarAndTimetableTiles() {
    const root = findPhoneRoot(document.body);
    if (!root || !looksLikePhoneHome(root)) return;
    const calendarTile = findHomeTileByText("日历");
    if (!calendarTile) return;
    if (calendarTile.dataset.stLiteCalendarPatched !== "true") {
      calendarTile.dataset.stLiteCalendarPatched = "true";
      calendarTile.setAttribute("aria-label", "打开日历");
      calendarTile.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openLiteCalendarPage(calendarTile);
      }, true);
    }
    const parent = calendarTile.parentElement;
    if (!parent) return;
    let timetableTile = parent.querySelector('[data-st-timetable-tile="true"]');
    if (!timetableTile) {
      timetableTile = calendarTile.cloneNode(true);
      timetableTile.dataset.stTimetableTile = "true";
      timetableTile.dataset.stLiteCalendarPatched = "";
      timetableTile.setAttribute("aria-label", "打开课程表");
      replaceExactTextInTile(timetableTile, "日历", "课程表");
      setHomeTileIcon(timetableTile, ST_APP_ICONS.timetable, "课程表");
      timetableTile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      timetableTile.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openTimetablePage(timetableTile);
      }, true);
      calendarTile.insertAdjacentElement("afterend", timetableTile);
    }
    if (parent.querySelector('[data-st-clock-tile="true"]')) return;
    const clockTile = timetableTile.cloneNode(true);
    clockTile.dataset.stClockTile = "true";
    clockTile.removeAttribute("data-st-timetable-tile");
    clockTile.setAttribute("aria-label", "打开时钟");
    setHomeTileLabel(clockTile, "时钟");
    setHomeTileIcon(clockTile, ST_APP_ICONS.clock, "时钟");
    clockTile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clockTile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openClockPage(clockTile);
    }, true);
    timetableTile.insertAdjacentElement("afterend", clockTile);
  }

  function patchMapAndSchoolTiles() {
    const root = findPhoneRoot(document.body);
    if (!root || !looksLikePhoneHome(root)) return;
    const anchor = findHomeTileByText("MC匿名版") || findHomeTileByText("帮助");
    if (!anchor?.parentElement) return;
    const parent = anchor.parentElement;
    let mapTile = parent.querySelector('[data-st-map-tile="true"]');
    if (!mapTile) {
      mapTile = anchor.cloneNode(true);
      mapTile.dataset.stMapTile = "true";
      mapTile.removeAttribute("data-st-mchan-internal-patched");
      mapTile.setAttribute("aria-label", "打开地图");
      setHomeTileLabel(mapTile, "地图");
      setHomeTileIcon(mapTile, ST_APP_ICONS.map, "地图");
      mapTile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      mapTile.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openTodoPage(mapTile, "map", "st-map-app", "地图", "区域信息");
      }, true);
      anchor.insertAdjacentElement("afterend", mapTile);
    }
    if (parent.querySelector('[data-st-school-tile="true"]')) return;
    const schoolTile = mapTile.cloneNode(true);
    schoolTile.dataset.stSchoolTile = "true";
    schoolTile.removeAttribute("data-st-map-tile");
    schoolTile.setAttribute("aria-label", "打开学校");
    setHomeTileLabel(schoolTile, "学校");
    setHomeTileIcon(schoolTile, ST_APP_ICONS.school, "学校");
    schoolTile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    schoolTile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openTodoPage(schoolTile, "school", "st-school-app", "学校", "学校地图与校规", true);
    }, true);
    mapTile.insertAdjacentElement("afterend", schoolTile);
  }

  function patchHomeTile() {
    const root = findPhoneRoot(document.body);
    patchHomeAuthorStatus(root);
    removeHomeOperationConfirm(root);
    ensureOperationSidePanel();
    const labels = Array.from(document.querySelectorAll("span,button,div"))
      .filter((element) => !element.closest(".st-mchan-internal-app,.st-add-role-app,.st-calendar-lite-app,.st-timetable-app,.st-clock-app,.st-profile-app,.st-map-app,.st-school-app") && element.textContent?.trim() === "MC匿名版");
    for (const label of labels) {
      const tile = findTileFromLabel(label);
      if (!tile || tile.dataset.stMchanInternalPatched === "true") continue;
      tile.dataset.stMchanInternalPatched = "true";
      tile.setAttribute("aria-label", "打开MC匿名版");
      tile.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openMchanPage(tile);
      }, true);
    }
  }

  function refreshPhoneVariableViews() {
    patchHomeTile();
    updatePhoneDarkTheme();
    updateOpenPersonProfilePage();
    updateOperationSidePanel();
  }

  function hasInitialPhonePatch() {
    const phone = document.querySelector(".w-full.h-full.bg-black.overflow-hidden.relative");
    if (!phone) return false;
    if (phone.dataset?.stPhoneApp) return true;
    if (looksLikePhoneHome(phone)) return true;
    if (document.querySelector('[data-st-add-role-tile="true"], [data-st-timetable-tile="true"], [data-st-clock-tile="true"], [data-st-profile-tile="true"], [data-st-map-tile="true"], [data-st-school-tile="true"], .st-role-picker, .st-mchan-internal-app, .st-add-role-app, .st-calendar-lite-app, .st-timetable-app, .st-clock-app, .st-profile-app, .st-map-app, .st-school-app')) return true;
    return false;
  }

  function releaseBootGuard() {
    window.__ST_HYPNOOS_PATCH_READY__ = true;
    document.documentElement.classList.remove("st-hypnoos-boot-failed");
    document.documentElement.classList.remove("st-hypnoos-booting");
  }

  function refreshUntilFirstPatch(attempt = 0) {
    refreshPhoneVariableViews();
    if (hasInitialPhonePatch() || attempt >= 90) {
      window.requestAnimationFrame(releaseBootGuard);
      return;
    }
    window.requestAnimationFrame(() => refreshUntilFirstPatch(attempt + 1));
  }

  function boot() {
    ensurePhoneDarkThemeStyle();
    refreshUntilFirstPatch();
    let refreshScheduled = false;
    const schedulePhoneVariableRefresh = () => {
      if (refreshScheduled) return;
      refreshScheduled = true;
      window.requestAnimationFrame(() => {
        refreshScheduled = false;
        refreshPhoneVariableViews();
      });
    };
    try {
      const appRoot = document.getElementById("app") || document.body;
      const observer = new MutationObserver(schedulePhoneVariableRefresh);
      observer.observe(appRoot, { childList: true, subtree: true });
    } catch {}
    window.addEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", schedulePhoneVariableRefresh);
    window.addEventListener("focus", schedulePhoneVariableRefresh);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) schedulePhoneVariableRefresh();
    });
    try {
      if (typeof eventOn === "function" && window.Mvu?.events) {
        eventOn(window.Mvu.events.VARIABLE_INITIALIZED, refreshPhoneVariableViews);
        eventOn(window.Mvu.events.VARIABLE_UPDATE_ENDED, refreshPhoneVariableViews);
      }
    } catch {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
</script>`;
  const sourceHtml = String(html || "");
  const closingBodyIndex = sourceHtml.toLowerCase().lastIndexOf("</body>");
  if (closingBodyIndex >= 0) {
    return sourceHtml.slice(0, closingBodyIndex) + script + "\n" + sourceHtml.slice(closingBodyIndex);
  }
  return `${sourceHtml}\n${script}`;
}

function previewVariableRuntime() {
  const defaultRoles = jsonForInlineScript(DEFAULT_PREVIEW_ROLES);
  return `
const __stLocalPreview = Boolean(globalThis.__ST_LOCAL_PREVIEW__);
const __stClone = (value) => JSON.parse(JSON.stringify(value ?? {}));
const __stDefaultRoles = () => (${defaultRoles});
const __stDefaultVariables = () => ({
  "系统": {
    "MC能量": 25,
    "MC能量上限": 25,
    "持有零花钱": 6000,
    "主角可疑度": 0,
    "当前日期": "4月9日 星期三",
    "当前时间": "12:00",
    "当前日程": "4限 · 现代文",
	    "当前/待上课程": "4限 现代文",
	    "当天课程表": {
	      "日期": "4月9日",
	      "星期": "星期三",
	      "当前课段": { "名称": "4限 · 现代文", "时间": "11:40-12:30" },
	      "当前或待上课程": "4限 现代文",
	      "当前或下个特殊日期": "4月10-14日 社团招新周",
	      "课表": [
        { "课节": "1限", "时间": "08:40-09:30", "科目": "英语" },
        { "课节": "2限", "时间": "09:40-10:30", "科目": "世界史" },
        { "课节": "3限", "时间": "10:40-11:30", "科目": "生物" },
        { "课节": "4限", "时间": "11:40-12:30", "科目": "现代文" },
        { "课节": "5限", "时间": "13:20-14:10", "科目": "体育（游泳）" },
        { "课节": "6限", "时间": "14:20-15:10", "科目": "信息" }
      ],
      "次日第一节": { "日期": "4月10日", "星期": "星期四", "课节": "1限", "时间": "08:40-09:30", "科目": "数学" }
	    },
	    "当前事件": "4限 · 现代文",
	    "当前或下个特殊日期": "4月10-14日 社团招新周",
	    "当前地点": "私立斋明学园 / 教室",
    "hypnoos": {}
  },
  "校规": {
    "仪容礼仪": {
      "内容": "在校内应保持私立斋明学园学生应有的端正仪容、礼貌言行与公共场合分寸，不得故意破坏学校名誉。",
      "目标范围": "学校内全体人员",
      "生效范围": "学校内",
      "来源": "初始校规"
    },
    "出勤学习": {
      "内容": "学生在授课、朝礼、终礼和学校指定活动中应按时到场，未经许可不得擅自逃课、扰乱课堂或妨碍他人学习。",
      "目标范围": "学校内学生",
      "生效范围": "学校内",
      "来源": "初始校规"
    },
    "校内安全": {
      "内容": "任何人不得在校内进行暴力、胁迫、危险恶作剧或无许可进入限制区域；发现异常情况应优先保证学生安全并向教职员报告。",
      "目标范围": "学校内全体人员",
      "生效范围": "学校内",
      "来源": "初始校规"
    }
  },
  "角色": __stDefaultRoles()
});
function __stMergeDefaultVariables(value) {
  const base = __stDefaultVariables();
  const current = value && typeof value === "object" ? __stClone(value) : {};
  const system = current["系统"] && typeof current["系统"] === "object" ? current["系统"] : {};
  const roles = current["角色"] && typeof current["角色"] === "object" ? current["角色"] : {};
  const mergedRoles = { ...base["角色"] };
  for (const [name, value] of Object.entries(roles)) {
    mergedRoles[name] = value && typeof value === "object" && !Array.isArray(value) && mergedRoles[name]
      ? { ...mergedRoles[name], ...value }
      : value;
  }
  return {
    ...base,
    ...current,
    "系统": { ...base["系统"], ...system },
    "角色": mergedRoles
  };
}
if (__stLocalPreview) {
  globalThis.__ST_WORKBENCH_VARIABLES__ = __stMergeDefaultVariables(globalThis.__ST_WORKBENCH_VARIABLES__);
  globalThis.__ST_WORKBENCH_CHAT__ = globalThis.__ST_WORKBENCH_CHAT__ || [{ message_id: 0, message: "<StatusPlaceHolderImpl />" }];
}
const __stExternalGetVariables = globalThis.getVariables;
const __stExternalUpdateVariablesWith = globalThis.updateVariablesWith;
const __stExternalGetCurrentMessageId = globalThis.getCurrentMessageId;
const __stExternalGetChatMessages = globalThis.getChatMessages;
const __stExternalSetChatMessages = globalThis.setChatMessages;
var getVariables = (...args) => {
  if (!__stLocalPreview && typeof __stExternalGetVariables === "function") {
    return __stExternalGetVariables(...args);
  }
  if (!__stLocalPreview) return {};
  return __stClone(globalThis.__ST_WORKBENCH_VARIABLES__);
};
var updateVariablesWith = (updater, ...args) => {
  if (!__stLocalPreview && typeof __stExternalUpdateVariablesWith === "function") {
    return __stExternalUpdateVariablesWith(updater, ...args);
  }
  if (!__stLocalPreview) return getVariables();
  const current = getVariables();
  const next = typeof updater === "function" ? updater(current) : current;
  globalThis.__ST_WORKBENCH_VARIABLES__ = __stClone(next || current);
  return getVariables();
};
var getCurrentMessageId = () => {
  if (!__stLocalPreview && typeof __stExternalGetCurrentMessageId === "function") {
    return __stExternalGetCurrentMessageId();
  }
  return 0;
};
var getChatMessages = (messageId = -1) => {
  if (!__stLocalPreview && typeof __stExternalGetChatMessages === "function") {
    return __stExternalGetChatMessages(messageId);
  }
  if (!__stLocalPreview) return [];
  const chat = globalThis.__ST_WORKBENCH_CHAT__;
  if (messageId === -1) return chat.slice(-1);
  return chat.filter((message) => message.message_id === messageId);
};
var setChatMessages = async (messages) => {
  if (!__stLocalPreview && typeof __stExternalSetChatMessages === "function") {
    return __stExternalSetChatMessages(messages);
  }
  if (!__stLocalPreview) return false;
  const chat = globalThis.__ST_WORKBENCH_CHAT__;
  for (const next of messages || []) {
    const index = chat.findIndex((message) => message.message_id === next.message_id);
    if (index >= 0) chat[index] = { ...chat[index], ...next };
    else chat.push(next);
  }
  return true;
};
if (__stLocalPreview) {
  globalThis.getVariables = globalThis.getVariables || getVariables;
  globalThis.updateVariablesWith = globalThis.updateVariablesWith || updateVariablesWith;
  globalThis.getCurrentMessageId = globalThis.getCurrentMessageId || getCurrentMessageId;
  globalThis.getChatMessages = globalThis.getChatMessages || getChatMessages;
  globalThis.setChatMessages = globalThis.setChatMessages || setChatMessages;
}
if (__stLocalPreview) {
  globalThis.Mvu = globalThis.Mvu || {
    getMvuData: () => ({ stat_data: getVariables() }),
    setMvuVariable: (mvu, variablePath, value) => {
      const parts = String(variablePath || "").split(".");
      let node = mvu.stat_data ||= {};
      while (parts.length > 1) {
        const part = parts.shift();
        node = node[part] ||= {};
      }
      node[parts[0]] = value;
      globalThis.__ST_WORKBENCH_VARIABLES__ = __stClone(mvu.stat_data);
      return true;
    },
    replaceMvuData: (mvu) => {
      globalThis.__ST_WORKBENCH_VARIABLES__ = __stClone(mvu?.stat_data || mvu || __stDefaultVariables());
      return true;
    }
  };
  globalThis.waitGlobalInitialized = globalThis.waitGlobalInitialized || (async () => true);
}
`;
}

function prepareSillyTavernLoadHtml(html, origin = DEFAULT_ST_LOAD_ORIGIN) {
  const vendorBase = origin.replace(/\/$/, "") + "/public/vendor/";
  const assetBase = origin.replace(/\/$/, "") + "/public/frontends/hypnosis-app/assets/";
  return String(html || "")
    .replaceAll(LOCAL_VENDOR.zod, vendorBase + "zod.mjs")
    .replaceAll(LOCAL_VENDOR.lodash, vendorBase + "lodash.mjs")
    .replaceAll(LOCAL_VENDOR.jquery, vendorBase + "jquery.mjs")
    .replaceAll(LOCAL_VENDOR.scheduler, vendorBase + "scheduler.mjs")
    .replaceAll('"/public/frontends/hypnosis-app/assets/"', JSON.stringify(assetBase));
}

function splitExportBlock(source) {
  const text = String(source || "");
  const start = text.lastIndexOf("export{");
  if (start < 0) throw new Error("Unable to find vendor export block.");
  const end = text.indexOf("};", start);
  if (end < 0) throw new Error("Unable to close vendor export block.");
  return {
    body: text.slice(0, start),
    spec: text.slice(start + "export{".length, end),
    suffix: text.slice(end + 2)
  };
}

function parseExportSpec(spec) {
  return String(spec || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const alias = part.match(/^(.+?)\s+as\s+(.+)$/);
      if (alias) return { local: alias[1].trim(), exported: alias[2].trim() };
      return { local: part, exported: part };
    });
}

function namespaceVendorIife(source) {
  const { body, spec, suffix } = splitExportBlock(source);
  const exports = parseExportSpec(spec);
  const objectBody = exports
    .map(({ local, exported }) => `${JSON.stringify(exported)}:${local}`)
    .join(",");
  return `(function(){\n${body}\nreturn Object.freeze({${objectBody}});${suffix}\n})()`;
}

function defaultVendorIife(source) {
  const { body, spec, suffix } = splitExportBlock(source);
  const defaultExport = parseExportSpec(spec).find((item) => item.exported === "default");
  if (!defaultExport) throw new Error("Unable to find default vendor export.");
  return `(function(){\n${body}\nreturn ${defaultExport.local};${suffix}\n})()`;
}

async function prepareSillyTavernInlineLoadHtml(html) {
  const sourceHtml = String(html || "");
  const moduleMatch = sourceHtml.match(/<script\s+type=["']module["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!moduleMatch) throw new Error("Unable to find frontend module script.");
  const moduleSource = moduleMatch[1];
  const moduleWithoutImports = moduleSource.replace(
    /^import\s+\*\s+as\s+z\s+from\s+["'][^"']+["'];\s*\nimport\s+_\s+from\s+["'][^"']+["'];\s*\nimport\s+\$\s+from\s+["'][^"']+["'];\s*\nimport\s+\*\s+as\s+__WEBPACK_EXTERNAL_MODULE_https_testingcf_jsdelivr_net_npm_scheduler_esm_4fbff9f3__\s+from\s+["'][^"']+["'];\s*\n+/,
    ""
  );
  if (moduleWithoutImports === moduleSource) throw new Error("Unable to remove frontend module imports.");

  const vendorDir = path.resolve(path.dirname(output), "../../vendor");
  const [zodSource, lodashSource, jquerySource, schedulerSource] = await Promise.all([
    readFile(path.join(vendorDir, "zod.mjs"), "utf8"),
    readFile(path.join(vendorDir, "lodash.mjs"), "utf8"),
    readFile(path.join(vendorDir, "jquery.mjs"), "utf8"),
    readFile(path.join(vendorDir, "scheduler.mjs"), "utf8")
  ]);
  const prelude = [
    "var z = " + namespaceVendorIife(zodSource) + ";",
    "var _ = " + defaultVendorIife(lodashSource) + ";",
    "var $ = " + defaultVendorIife(jquerySource) + ";",
    "var __WEBPACK_EXTERNAL_MODULE_https_testingcf_jsdelivr_net_npm_scheduler_esm_4fbff9f3__ = " + namespaceVendorIife(schedulerSource) + ";"
  ].join("\n");

  const classicScript = `<script>\n${prelude}\n${moduleWithoutImports}\n</script>`;
  return sourceHtml.replace(moduleMatch[0], () => classicScript);
}

const rawHtml = await readSource(source);
const mchanStatic = await loadStaticMchanSeed();
const mirrored = sanitizeGeneratedFrontend(prepareFrontendHtml(rawHtml, source, { mchanStatic }));
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, mirrored);

console.log(`Mirrored frontend: ${source} -> ${output}`);
if (mchanStatic?.threads?.length) console.log(`MChan static seed: ${mchanStatic.threads.length} threads`);
console.log(`Size: ${Math.round(mirrored.length / 1024)} KB`);

if (path.basename(output) === "index.html" && path.basename(path.dirname(output)) === "hypnosis-app") {
  const stLoadOutput = path.join(path.dirname(output), "st-load.html");
  const stLoadInlineOutput = path.join(path.dirname(output), "st-load-inline.html");
  const stLoadHtml = prepareSillyTavernLoadHtml(mirrored);
  const stLoadInlineHtml = await prepareSillyTavernInlineLoadHtml(stLoadHtml);
  await writeFile(stLoadOutput, stLoadHtml);
  await writeFile(stLoadInlineOutput, stLoadInlineHtml);
  console.log(`SillyTavern load frontend: ${stLoadOutput}`);
  console.log(`SillyTavern inline load frontend: ${stLoadInlineOutput}`);
}
