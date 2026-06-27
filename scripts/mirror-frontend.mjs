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
	    "外观": "金色双马尾打理得蓬松耀眼，宝蓝色上挑猫眼带着习惯性的俯视感；私改校服衬出夸张的胸部曲线，短裙、黑色过膝袜和昂贵香水让她一进教室就像把班级中心占住。",
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
	    "外观": "黑色长发像瀑布一样垂在肩背，制服扣到最上方、领结端正，及膝裙与黑色连裤袜把身形包得保守却难掩端庄曲线；怀里常抱着讲义，站姿笔直，带着淡淡墨香。",
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
	    "外观": "小麦色肌肤晒得健康，黑色短发随意扎成低马尾，个子娇小却有田径部王牌的紧实腿线；校服常松松垮垮，领口和袖口透着运动后的热气，动作轻快得停不下来。",
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
html.st-hypnoos-booting #app{opacity:0!important}
</style><script>
document.documentElement.classList.add("st-hypnoos-booting");
window.__ST_HYPNOOS_PATCH_READY__ = false;
window.setTimeout(() => {
  if (!window.__ST_HYPNOOS_PATCH_READY__) document.documentElement.classList.remove("st-hypnoos-booting");
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
      const key = operationRecordKey(payload);
      return {
        id: "op-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
        at: Date.now(),
        key,
        payload
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
    const buildOperationBlock = () => {
      const groups = new Map();
      for (const entry of window.__ST_OPERATION_INPUT_LOG__) {
        const record = normalizeOperationPayload(operationEntryPayload(entry));
        const source = record.source || "APP";
        if (!groups.has(source)) groups.set(source, []);
        groups.get(source).push(record);
      }
      const lines = ["<本轮APP操作>"];
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
    window.__ST_GET_PENDING_OPERATION_INPUT_LOG__ = () => window.__ST_OPERATION_INPUT_LOG__.slice();
    window.__ST_GET_PENDING_OPERATION_VIEW__ = () => window.__ST_OPERATION_INPUT_LOG__.map(describeOperationEntry);
    window.__ST_BUILD_PENDING_OPERATION_BLOCK__ = () => window.__ST_OPERATION_INPUT_LOG__.length ? buildOperationBlock() : "";
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
  outputHtml = patchEvalModuleSources(outputHtml, (code) => patchAppEntryModule(patchAppRootModule(patchMvuBridgeModule(patchHypnosisDataServiceModule(patchHypnosisAppModule(patchHypnosisSendModule(patchAchievementAppModule(code))))))));
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
  output = replaceBetween(
    output,
    "    // --- Handlers ---",
    "    // Helper: Sort Achievements",
    `    // --- Handlers ---
    const fallbackAppendOperationIntent = (payload) => {
        const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
        const block = '<本轮APP操作>\\n' + text.trim() + '\\n</本轮APP操作>';
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
            input.focus?.();
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
            成就: ach.title,
            条件: ach.description,
            奖励: \`当前MC点 +\${ach.rewardMcPoints}点\`,
        });
        setNotice(\`已记录领取成就：\${ach.title}\`);
        setTimeout(() => setNotice(null), 2000);
    };
    const handleAcceptQuest = async (quest) => {
        recordOperationIntent({
            来源: '成就和任务',
            操作: '接取任务',
            任务: quest.title,
            条件: quest.description,
            奖励: \`当前MC点 +\${quest.rewardMcPoints}点\`,
        });
        setNotice(\`已记录接取任务：\${quest.title}\`);
        setTimeout(() => setNotice(null), 2000);
    };
    const handleCancelQuest = async (quest) => {
        recordOperationIntent({
            来源: '成就和任务',
            操作: '取消任务',
            任务: quest.title,
            条件: quest.description,
        });
        setNotice(\`已记录取消任务：\${quest.title}\`);
        setTimeout(() => setNotice(null), 1800);
    };
	    const handleClaimQuest = async (quest) => {
	        setNotice('任务完成后由AI自动结算奖励，无需手动提交');
	        setTimeout(() => setNotice(null), 2200);
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
	            setNotice('已接任务已满：最多同时进行3个任务');
	            setTimeout(() => setNotice(null), 2200);
	            return;
	        }
	        const bias = String(newQuestBias || '').trim();
	        recordOperationIntent({
	            来源: '成就和任务',
	            操作: '新增任务',
	            数量: \`\${count}个\`,
	            当前已接任务数: \`\${activeQuestCount}个\`,
	            剩余可新增数量: \`\${Math.max(0, 3 - activeQuestCount)}个\`,
	            倾向: bias || '由AI根据当前上下文剧情决定',
	            初始状态: '直接写入任务变量，作为已接/进行中的任务',
	            生成规则: '根据当前上下文剧情新增若干进行中任务；写入/任务，包含完成条件、奖励MC点和已完成=false；不要写入前端静态列表，也不要标记为已完成。',
	        });
        setNotice(\`已请求新增 \${count} 个任务\`);
        setTimeout(() => setNotice(null), 2200);
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
        const selfPattern = /自己|主角|用户|玩家|{{user}}|<user>|MC|PT|能量|点数|订阅|VIP|可疑度|零花钱|资金|持有|累计消耗/;
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
        if (achievementFilter === 'UNCLAIMED')
            return unlocked && !achievement.isClaimed;
        if (achievementFilter === 'CLAIMED')
            return achievement.isClaimed;
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
	            return q.status === 'ACTIVE' || q.status === 'COMPLETED';
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
    `!loading && notice && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/80", children: notice })), !loading && activeTab === 'ACHIEVEMENTS' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "成就筛选" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", { value: achievementFilter, onChange: e => setAchievementFilter(e.target.value), className: "bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "ALL", children: "全部" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "SELF", children: "自己" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "ROLE", children: "其他角色" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "UNCLAIMED", children: "可领取" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "CLAIMED", children: "已领取" })] })] })), !loading && activeTab === 'NEW_QUEST' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3 animate-fade-in", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 space-y-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "text-sm font-bold text-white", children: "新增任务" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "mt-1 text-xs text-white/55 leading-relaxed", children: "根据当前上下文剧情，让 AI 新增若干未完成任务。前端只记录意图，不直接改变量。" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "数量" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "number", inputMode: "numeric", min: 1, max: 10, step: 1, value: newQuestCountInput, onChange: e => setNewQuestCountInput(e.target.value), onBlur: () => setNewQuestCountInput(String(normalizeNewQuestCount(newQuestCountInput))), className: "mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "block", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "倾向" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("textarea", { value: newQuestBias, onChange: e => setNewQuestBias(e.target.value), placeholder: "例如：围绕当前场景、某个角色、赚取MC点、降低可疑度...", className: "mt-1 h-24 w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-white placeholder-white/30 outline-none focus:border-cyan-300/60" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleRequestNewQuests, className: "w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-black text-white shadow-lg active:scale-[0.98]", children: "写入新增任务请求" })] })] })), !loading && activeTab === 'ACHIEVEMENTS' &&`
  );
  output = output.replace("sortedAchievements.map(ach =>", "visibleAchievements.map(ach =>");
  output = output.replace(
    `!loading && activeTab === 'QUESTS' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3 animate-fade-in", children: [`,
    `!loading && activeTab === 'QUESTS' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3 animate-fade-in", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-[11px] text-white/60", children: "任务筛选" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", { value: questFilter, onChange: e => setQuestFilter(e.target.value), className: "bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "UNFINISHED", children: "未完成" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "ACTIVE", children: "已接任务" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "DONE", children: "已完成任务" })] })] }),`
  );
  output = output.replace(
    `(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "DONE", children: "已完成任务" })`,
    ``
  );
  output = output.replace(
    `children: "根据当前上下文剧情，让 AI 新增若干未完成任务。前端只记录意图，不直接改变量。"`,
    `children: "根据当前上下文剧情，让 AI 直接生成并接取进行中任务；最多同时3个，满了会禁用。"`
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
        const timer = window.setInterval(() => void refreshUserData(), 1500);
        return () => window.clearInterval(timer);
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

function patchAppRootModule(code) {
  if (!code.includes("const App =") || !code.includes("DataService.getUserData")) return code;
  let output = code;
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
        const timer = window.setInterval(() => void refreshUserData(), 1500);
        return () => window.clearInterval(timer);
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
    .replaceAll("系统._累计消耗MC点", "系统.累计消耗MC点")
    .replaceAll("系统._hypnoos", "系统.hypnoos");
  return output;
}

function rebuildHypnosisAppModule(code) {
  const start = code.indexOf("// --- Active Session View (Countdown) ---");
  const end = code.indexOf("\n//# sourceURL=", start);
  if (start < 0 || end <= start) return code;
  const replacement = `// --- Custom Hypnosis App (rebuilt local page) ---
const CUSTOM_HYPNOSIS_DRAFT_KEY = 'hypnoos.hypnosis-app.rebuild.v1';
const TIER_ORDER = { TRIAL: 0, VIP1: 1, VIP2: 2, VIP3: 3, VIP4: 4, VIP5: 5, VIP6: 6 };
const PEOPLELESS_FEATURE_IDS = new Set(['vip4_closed_space_common_sense', 'vip5_open_space_common_sense']);
const TIMELESS_FEATURE_IDS = new Set(['vip1_temp_sensitivity', 'vip1_estrus', 'vip1_memory_erase']);
const SPECIAL_VALUE_FEATURES = {
    vip1_temp_sensitivity: { label: '敏感度增幅', unit: '点', defaultValue: 10 },
    vip1_estrus: { label: '性欲增幅', unit: '点', defaultValue: 10 },
    vip1_memory_erase: { label: '记忆时长', unit: '分钟', defaultValue: 5 },
    vip2_pleasure: { label: '快感强度', unit: '级', defaultValue: 1 },
};
const jsx = react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx;
const jsxs = react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs;
const formatClockSeconds = (seconds) => {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(value / 60);
    const s = value % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
};
const parsePositiveNumber = (value, fallback = 1) => {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0)
        return fallback;
    return next;
};
const parsePositiveInt = (value, fallback = 1) => Math.max(1, Math.floor(parsePositiveNumber(value, fallback)));
const formatMoney = (value) => '¥' + Math.max(0, Number(value) || 0).toLocaleString();
const normalizeTierValue = (value) => {
    const text = String(value || '').toUpperCase().replace(/\\s+/g, '');
    if (text.includes('VIP6'))
        return 'VIP6';
    if (text.includes('VIP5'))
        return 'VIP5';
    if (text.includes('VIP4'))
        return 'VIP4';
    if (text.includes('VIP3'))
        return 'VIP3';
    if (text.includes('VIP2'))
        return 'VIP2';
    if (text.includes('VIP1'))
        return 'VIP1';
    return 'TRIAL';
};
const getTierRank = (tier) => TIER_ORDER[normalizeTierValue(tier)] ?? 0;
const getTierLabel = (tier) => {
    const normalized = normalizeTierValue(tier);
    const config = _types__WEBPACK_IMPORTED_MODULE_3__.VIP_LEVELS.find(item => item.tier === normalized);
    return config?.label || normalized;
};
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
const featureUsesPeople = (feature) => !PEOPLELESS_FEATURE_IDS.has(feature.id);
const featureUsesTime = (feature) => feature.costType !== 'ONE_TIME' && !TIMELESS_FEATURE_IDS.has(feature.id);
const getFeatureExtraValue = (feature) => parsePositiveNumber(feature.userExtraValue ?? SPECIAL_VALUE_FEATURES[feature.id]?.defaultValue ?? 1, SPECIAL_VALUE_FEATURES[feature.id]?.defaultValue ?? 1);
const calculateFeatureCost = (feature) => {
    const people = parsePositiveInt(feature.userNumber ?? 1, 1);
    const minutes = parsePositiveInt(feature.userMinutes ?? 10, 10);
    const usesPeople = featureUsesPeople(feature);
    const usesTime = featureUsesTime(feature);
    const extra = getFeatureExtraValue(feature);
    const base = Math.max(0, Number(feature.costValue) || 0);
    let amount = base;
    if (feature.id === 'vip1_temp_sensitivity')
        amount = 2 * extra;
    else if (feature.id === 'vip1_estrus')
        amount = base * extra;
    else if (feature.id === 'vip1_memory_erase')
        amount = base * extra;
    else if (feature.id === 'vip2_pleasure')
        amount = base * extra * minutes;
    else if (feature.costType !== 'ONE_TIME')
        amount = base * minutes;
    if (usesPeople)
        amount *= people;
    const currency = feature.costCurrency === 'MC_POINTS' ? 'MC_POINTS' : 'MC_ENERGY';
    return {
        amount: Math.max(0, Math.ceil(amount)),
        currency,
        currencyLabel: currency === 'MC_POINTS' ? '当前MC点' : 'MC能量',
        people,
        minutes,
        usesPeople,
        usesTime,
        extra,
    };
};
const summarizeCosts = (features) => features.reduce((sum, feature) => {
    const cost = calculateFeatureCost(feature);
    if (cost.currency === 'MC_POINTS')
        sum.points += cost.amount;
    else
        sum.energy += cost.amount;
    return sum;
}, { energy: 0, points: 0 });
const operationAppendFallback = async (payload) => {
    const selectors = ['#send_textarea', 'textarea#send_textarea', 'textarea[name="send_textarea"]', 'textarea[data-testid="send-textarea"]'];
    const text = '<本轮APP操作>\\n<催眠APP>\\n- 启动催眠｜内容=' + JSON.stringify(payload) + '\\n</催眠APP>\\n</本轮APP操作>';
    const docs = [document, window.parent?.document].filter(Boolean);
    for (const doc of docs) {
        for (const selector of selectors) {
            const input = doc.querySelector(selector);
            if (!input)
                continue;
            const current = 'value' in input ? input.value : input.textContent;
            const next = String(current || '').replace(/\\s*$/, '') + (current ? '\\n' : '') + text;
            if ('value' in input)
                input.value = next;
            else
                input.textContent = next;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    return false;
};
const recordOperationIntent = (payload) => {
    const append = globalThis.__ST_APPEND_OPERATION_TO_INPUT__;
    if (typeof append === 'function') {
        void append(payload);
        return;
    }
    void operationAppendFallback(payload);
};
const ActiveSessionView = ({ timeLeft, sessionEndVirtualMinutes, sessionEndAtMs, sessionSummary, onStop }) => {
    const [remaining, setRemaining] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(timeLeft);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        let stopped = false;
        const tick = async () => {
            if (stopped)
                return;
            if (sessionEndVirtualMinutes !== null) {
                const clock = await _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getSystemClock().catch(() => null);
                if (stopped)
                    return;
                if (clock?.virtualMinutes !== null && clock?.virtualMinutes !== undefined) {
                    setRemaining(Math.max(0, Math.ceil((sessionEndVirtualMinutes - clock.virtualMinutes) * 60)));
                    return;
                }
            }
            if (sessionEndAtMs !== null) {
                setRemaining(Math.max(0, Math.ceil((sessionEndAtMs - Date.now()) / 1000)));
                return;
            }
            setRemaining(value => Math.max(0, value - 1));
        };
        void tick();
        const timer = setInterval(() => void tick(), 1000);
        return () => {
            stopped = true;
            clearInterval(timer);
        };
    }, [sessionEndAtMs, sessionEndVirtualMinutes, timeLeft]);
    if (remaining <= 0)
        return null;
    const content = typeof sessionSummary === 'string'
        ? sessionSummary
        : Array.isArray(sessionSummary)
            ? sessionSummary.join('、')
            : sessionSummary && typeof sessionSummary === 'object'
                ? Object.values(sessionSummary).filter(Boolean).slice(0, 3).join('、')
                : '催眠进行中';
    return jsxs('div', { className: 'relative z-10 mx-4 mt-3 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-950/30 px-4 py-3 text-white shadow-lg', children: [
            jsxs('div', { className: 'flex items-center justify-between gap-3', children: [
                    jsxs('div', { className: 'min-w-0', children: [
                            jsx('div', { className: 'text-xs font-bold uppercase tracking-widest text-fuchsia-200', children: '催眠中' }),
                            jsx('div', { className: 'truncate text-sm text-white/80', children: content || '催眠进行中' }),
                        ] }),
                    jsxs('div', { className: 'flex shrink-0 items-center gap-2', children: [
                            jsx('span', { className: 'rounded-full bg-black/30 px-3 py-1 text-sm font-black text-fuchsia-100', children: formatClockSeconds(remaining) }),
                            jsx('button', { type: 'button', onClick: onStop, className: 'rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/70', children: '取消' }),
                        ] }),
                ] }),
        ] });
};
const HypnosisApp = ({ userData, onUpdateUser, onExit }) => {
    const initialDraft = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => readCustomHypnosisDraft(), []);
    const [features, setFeatures] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [subscription, setSubscription] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [collapsedTiers, setCollapsedTiers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(initialDraft.collapsedTiers || { VIP2: true, VIP3: true, VIP4: true, VIP5: true, VIP6: true });
    const [globalNote, setGlobalNote] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(String(initialDraft.globalNote || ''));
    const [notice, setNotice] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const [isFlashing, setIsFlashing] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [timeLeft, setTimeLeft] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
    const [sessionEndVirtualMinutes, setSessionEndVirtualMinutes] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [sessionEndAtMs, setSessionEndAtMs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [sessionSummary, setSessionSummary] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const subscriptionTier = normalizeTierValue(subscription?.tier || subscription?.label || userData?.subscriptionTier || 'TRIAL');
    const subscriptionRank = getTierRank(subscriptionTier);
    const refreshSession = async () => {
        const [sessionEnd, store] = await Promise.all([
            _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getSessionEnd().catch(() => ({ endVirtualMinutes: null, endAtMs: null })),
            (_services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getStore ? _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getStore() : Promise.resolve(null)).catch(() => null),
        ]);
        setSessionEndVirtualMinutes(sessionEnd.endVirtualMinutes ?? null);
        setSessionEndAtMs(sessionEnd.endAtMs ?? null);
        setSessionSummary(store?.sessionSummary ?? store?.activeSessionSummary ?? store?.sessionContent ?? null);
        if (sessionEnd.endAtMs)
            setTimeLeft(Math.max(0, Math.ceil((sessionEnd.endAtMs - Date.now()) / 1000)));
        else if (!sessionEnd.endVirtualMinutes)
            setTimeLeft(0);
    };
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        let stopped = false;
        const load = async () => {
            const [nextFeatures, nextSubscription] = await Promise.all([
                _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getFeatures(),
                _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getSubscription().catch(() => null),
            ]);
            if (stopped)
                return;
            const featureDrafts = initialDraft.features && typeof initialDraft.features === 'object' ? initialDraft.features : {};
            setFeatures(nextFeatures
                .filter(feature => feature.id !== 'vip1_stats')
                .map(feature => {
                const draft = featureDrafts[feature.id] || {};
                return {
                    ...feature,
                    isEnabled: Boolean(draft.isEnabled ?? feature.isEnabled ?? false),
                    userNote: String(draft.userNote ?? feature.userNote ?? ''),
                    userNumber: String(draft.userNumber ?? feature.userNumber ?? 1),
                    userMinutes: String(draft.userMinutes ?? feature.userMinutes ?? 10),
                    userExtraValue: String(draft.userExtraValue ?? SPECIAL_VALUE_FEATURES[feature.id]?.defaultValue ?? 1),
                    isPurchased: true,
                    purchaseRequired: false,
                };
            }));
            setSubscription(nextSubscription);
            void refreshSession();
        };
        void load();
        return () => {
            stopped = true;
        };
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const timer = setInterval(() => {
            void _services_dataService__WEBPACK_IMPORTED_MODULE_4__.DataService.getSubscription().then(setSubscription).catch(() => undefined);
            void refreshSession();
        }, 2500);
        return () => clearInterval(timer);
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (!features.length)
            return;
        const featureDrafts = {};
        for (const feature of features) {
            featureDrafts[feature.id] = {
                isEnabled: Boolean(feature.isEnabled),
                userNote: feature.userNote || '',
                userNumber: feature.userNumber || '1',
                userMinutes: feature.userMinutes || '10',
                userExtraValue: feature.userExtraValue || '',
            };
        }
        writeCustomHypnosisDraft({ features: featureDrafts, globalNote, collapsedTiers });
    }, [collapsedTiers, features, globalNote]);
    const updateFeature = (id, patch) => {
        setFeatures(current => current.map(feature => feature.id === id ? { ...feature, ...patch } : feature));
    };
    const isTierAvailable = (tier) => {
        const normalized = normalizeTierValue(tier);
        if (normalized === 'TRIAL')
            return true;
        const config = _types__WEBPACK_IMPORTED_MODULE_3__.VIP_LEVELS.find(item => item.tier === normalized);
        const threshold = Number(config?.unlockThreshold ?? Infinity);
        return subscriptionRank >= getTierRank(normalized) || Number(userData?.totalConsumedMc || 0) >= threshold;
    };
    const selectedFeatures = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => features.filter(feature => feature.isEnabled && isTierAvailable(feature.tier)), [features, subscriptionRank, userData?.totalConsumedMc]);
    const selectedCost = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => summarizeCosts(selectedFeatures), [selectedFeatures]);
    const resourceWarning = selectedCost.energy > Number(userData?.mcEnergy || 0) || selectedCost.points > Number(userData?.mcPoints || 0);
    const requestTierUnlock = (tierConfig) => {
        recordOperationIntent({
            来源: '催眠APP',
            操作: '解锁VIP等级',
            等级: tierConfig.label,
            当前累计消耗MC点: String(userData?.totalConsumedMc ?? 0) + '点',
            解锁阈值: String(tierConfig.unlockThreshold ?? 0) + '点',
            说明: '只请求解锁或订阅该等级；解锁后对应VIP功能可直接启用，本次不会自动使用任何具体催眠指令。',
        });
        setNotice('已暂存' + tierConfig.label + '解锁请求');
    };
    const startHypnosis = () => {
        if (!selectedFeatures.length) {
            setNotice('请先启用至少一条催眠指令');
            return;
        }
        const featureDetails = selectedFeatures.map(feature => {
            const cost = calculateFeatureCost(feature);
            const extraConfig = SPECIAL_VALUE_FEATURES[feature.id];
            const details = {
                功能: feature.title,
                等级: getTierLabel(feature.tier),
                说明: feature.description,
                备注: feature.userNote || '无',
                是否受人数影响: cost.usesPeople ? '是' : '否',
                是否受时间影响: cost.usesTime ? '是' : '否',
                人数: cost.usesPeople ? String(cost.people) + '人' : '不按人数计算',
                时间: cost.usesTime ? String(cost.minutes) + '分钟' : '不按时间计算',
                消耗类型: cost.currencyLabel,
                预计消耗: String(cost.amount) + '点',
            };
            if (extraConfig)
                details[extraConfig.label] = String(cost.extra) + extraConfig.unit;
            return details;
        });
        recordOperationIntent({
            来源: '催眠APP',
            操作: timeLeft > 0 ? '追加催眠' : '启动催眠',
            全局备注: globalNote || '无',
            功能列表: featureDetails,
            MC能量消耗: String(selectedCost.energy) + '点',
            当前MC点消耗: String(selectedCost.points) + '点',
            预计消耗: 'MC能量' + selectedCost.energy + '点，当前MC点' + selectedCost.points + '点',
            当前可用: { MC能量: String(userData?.mcEnergy ?? 0) + '点', 当前MC点: String(userData?.mcPoints ?? 0) + '点' },
            结算提示: '涉及花费的功能必须先检查余额；余额不足的功能失败，后续同批次受影响操作也失败，不能贷款或擅自兑换资金。',
        });
        setIsFlashing(true);
        setNotice('启动催眠请求已暂存到右侧列表');
        window.setTimeout(() => setIsFlashing(false), 800);
    };
    const stopSession = () => {
        recordOperationIntent({
            来源: '催眠APP',
            操作: '取消催眠',
            说明: '请求AI结束当前临时催眠状态；永久催眠效果不计入催眠中，也不应被取消。',
        });
        setNotice('取消催眠请求已暂存');
    };
    const renderNumberInput = (label, value, onChange, suffix, disabled = false) => jsxs('label', { className: 'min-w-0 rounded-2xl border border-white/10 bg-black/30 px-3 py-2', children: [
            jsx('span', { className: 'block text-xs font-bold text-white/50', children: label }),
            jsxs('div', { className: 'mt-1 flex items-center gap-2', children: [
                    jsx('input', { type: 'number', min: '1', value, disabled, onChange: event => onChange(event.target.value), className: 'w-full bg-transparent text-lg font-black text-white outline-none disabled:text-white/40' }),
                    jsx('span', { className: 'shrink-0 text-sm font-bold text-white/45', children: suffix }),
                ] }),
        ] });
    const renderFeatureCard = (feature) => {
        const available = isTierAvailable(feature.tier);
        const cost = calculateFeatureCost(feature);
        const extraConfig = SPECIAL_VALUE_FEATURES[feature.id];
        const enabled = Boolean(feature.isEnabled) && available;
        const toggle = () => {
            if (!available) {
                setNotice(getTierLabel(feature.tier) + '需要先解锁');
                return;
            }
            updateFeature(feature.id, { isEnabled: !feature.isEnabled });
        };
        return jsxs('article', { className: 'rounded-3xl border p-4 transition ' + (enabled ? 'border-fuchsia-400/70 bg-fuchsia-950/20 shadow-[0_0_24px_rgba(236,72,153,0.18)]' : 'border-white/10 bg-black/25'), children: [
                jsxs('div', { className: 'flex items-start justify-between gap-3', children: [
                        jsxs('div', { className: 'min-w-0', children: [
                                jsx('h3', { className: 'text-xl font-black leading-tight text-white', children: feature.title }),
                                jsx('p', { className: 'mt-1 text-sm font-bold text-white/50', children: cost.currencyLabel + ': ' + String(cost.amount) + '点' }),
                            ] }),
                        jsx('button', { type: 'button', onClick: toggle, className: 'relative h-10 w-20 shrink-0 rounded-full p-1 transition ' + (enabled ? 'bg-fuchsia-500' : available ? 'bg-slate-700' : 'bg-slate-800 opacity-70'), title: available ? '切换启用' : '等级未解锁', children: jsx('span', { className: 'block h-8 w-8 rounded-full bg-white transition ' + (enabled ? 'translate-x-10' : '') }) }),
                    ] }),
                jsx('p', { className: 'mt-4 border-t border-white/10 pt-4 text-sm font-semibold leading-relaxed text-white/72', children: feature.description }),
                jsx('textarea', { value: feature.userNote || '', onChange: event => updateFeature(feature.id, { userNote: event.target.value }), placeholder: '补充这条指令的目标、方式或限制...', className: 'mt-4 h-20 w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/70' }),
                jsxs('div', { className: 'mt-3 grid grid-cols-2 gap-2', children: [
                        cost.usesPeople ? renderNumberInput('人数', feature.userNumber || '1', value => updateFeature(feature.id, { userNumber: value }), '人') : jsx('div', { className: 'rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-white/45', children: '不按人数计费' }),
                        cost.usesTime ? renderNumberInput('时间', feature.userMinutes || '10', value => updateFeature(feature.id, { userMinutes: value }), '分钟') : jsx('div', { className: 'rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-white/45', children: '不按时间计费' }),
                        extraConfig ? renderNumberInput(extraConfig.label, feature.userExtraValue || String(extraConfig.defaultValue), value => updateFeature(feature.id, { userExtraValue: value }), extraConfig.unit) : null,
                    ] }),
                jsxs('div', { className: 'mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2', children: [
                        jsx('span', { className: 'text-xs font-bold text-white/45', children: '计费' }),
                        jsx('span', { className: 'text-sm font-black text-yellow-300', children: cost.currencyLabel + ' ' + String(cost.amount) + '点' }),
                    ] }),
            ] }, feature.id);
    };
    const renderTierSection = (tierConfig) => {
        const tierFeatures = features.filter(feature => normalizeTierValue(feature.tier) === tierConfig.tier);
        if (!tierFeatures.length)
            return null;
        const available = isTierAvailable(tierConfig.tier);
        const collapsed = Boolean(collapsedTiers[tierConfig.tier]);
        const enabledCount = tierFeatures.filter(feature => feature.isEnabled && available).length;
        return jsxs('section', { className: 'overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]', children: [
                jsxs('button', { type: 'button', onClick: () => setCollapsedTiers(current => ({ ...current, [tierConfig.tier]: !collapsed })), className: 'flex w-full items-center justify-between gap-3 px-4 py-4 text-left', children: [
                        jsxs('div', { className: 'min-w-0', children: [
                                jsx('div', { className: 'text-lg font-black text-white', children: tierConfig.label }),
                                jsx('div', { className: 'mt-1 text-xs font-bold text-white/45', children: (available ? '可用' : '需要解锁') + ' · ' + String(enabledCount) + '/' + String(tierFeatures.length) + ' 已启用' }),
                            ] }),
                        jsxs('div', { className: 'flex shrink-0 items-center gap-2', children: [
                                !available && jsx('span', { className: 'rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-white/55', children: '未解锁' }),
                                jsx('span', { className: 'text-xl font-black text-white/55', children: collapsed ? '⌄' : '⌃' }),
                            ] }),
                    ] }),
                !available && !collapsed ? jsx('div', { className: 'px-4 pb-4', children: jsx('button', { type: 'button', onClick: event => { event.stopPropagation(); requestTierUnlock(tierConfig); }, className: 'w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-black text-white', children: '请求解锁 ' + tierConfig.label }) }) : null,
                !collapsed ? jsx('div', { className: 'space-y-3 border-t border-white/10 p-4', children: tierFeatures.map(renderFeatureCard) }) : null,
            ] }, tierConfig.tier);
    };
    return jsxs('div', { className: 'relative flex h-full w-full flex-col overflow-hidden bg-black text-white', children: [
            jsx(VortexBackground, { speed: isFlashing ? 'animate-spin' : 'spin-slow' }),
            jsxs('header', { className: 'relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur', children: [
                    jsxs('div', { className: 'flex items-center gap-3', children: [
                            jsx('button', { type: 'button', onClick: onExit, className: 'flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl text-white/80', children: '‹' }),
                            jsxs('div', { children: [
                                    jsxs('div', { className: 'flex items-center gap-2 text-xl font-black', children: [
                                            jsx(HypnoLogoSVG, { size: 28, className: 'text-fuchsia-300' }),
                                            jsx('span', { children: '催眠APP' }),
                                        ] }),
                                    jsx('div', { className: 'mt-1 text-xs font-bold text-white/45', children: '指令只暂存，变量由AI结算' }),
                                ] }),
                        ] }),
                    jsxs('div', { className: 'text-right', children: [
                            jsx('div', { className: 'text-xl font-black text-white', children: String(userData?.mcPoints ?? 0) }),
                            jsx('div', { className: 'text-xs font-bold text-white/45', children: '当前MC点' }),
                        ] }),
                ] }),
            jsx(ActiveSessionView, { timeLeft, sessionEndVirtualMinutes, sessionEndAtMs, sessionSummary, onStop: stopSession }),
            jsxs('main', { className: 'relative z-10 flex-1 overflow-y-auto p-4 pb-28 no-scrollbar', children: [
                    jsxs('section', { className: 'rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-lg', children: [
                            jsxs('div', { className: 'flex items-center justify-between gap-4', children: [
                                    jsxs('div', { className: 'min-w-0 flex-1', children: [
                                            jsx('div', { className: 'text-xs font-black uppercase tracking-widest text-pink-300', children: 'MC ENERGY' }),
                                            jsxs('div', { className: 'mt-1 flex items-center gap-2', children: [
                                                    jsx('div', { className: 'h-2 flex-1 overflow-hidden rounded-full bg-white/10', children: jsx('div', { className: 'h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500', style: { width: Math.max(0, Math.min(100, Number(userData?.mcEnergy || 0) / Math.max(1, Number(userData?.mcEnergyMax || 1)) * 100)) + '%' } }) }),
                                                    jsx('span', { className: 'shrink-0 text-sm font-bold text-white/60', children: String(userData?.mcEnergy ?? 0) + ' / ' + String(userData?.mcEnergyMax ?? 0) }),
                                                ] }),
                                            jsx('div', { className: 'mt-2 text-xs font-bold text-white/40', children: '等级：' + getTierLabel(subscriptionTier) }),
                                        ] }),
                                    jsxs('div', { className: 'rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right', children: [
                                            jsx('div', { className: 'text-xs font-bold text-white/45', children: '资金' }),
                                            jsx('div', { className: 'text-lg font-black text-yellow-300', children: formatMoney(userData?.money ?? 0) }),
                                        ] }),
                                ] }),
                            jsxs('div', { className: 'mt-4 grid grid-cols-3 gap-2 text-center', children: [
                                    jsxs('div', { className: 'rounded-2xl bg-black/25 p-3', children: [jsx('div', { className: 'text-xs font-bold text-white/45', children: '累计消耗' }), jsx('div', { className: 'mt-1 text-lg font-black text-white', children: String(userData?.totalConsumedMc ?? 0) })] }),
                                    jsxs('div', { className: 'rounded-2xl bg-black/25 p-3', children: [jsx('div', { className: 'text-xs font-bold text-white/45', children: '可疑度' }), jsx('div', { className: 'mt-1 text-lg font-black text-emerald-300', children: String(userData?.suspicion ?? 0) + '%' })] }),
                                    jsxs('div', { className: 'rounded-2xl bg-black/25 p-3', children: [jsx('div', { className: 'text-xs font-bold text-white/45', children: '本次预计' }), jsx('div', { className: 'mt-1 text-sm font-black ' + (resourceWarning ? 'text-rose-300' : 'text-fuchsia-200'), children: '能量' + selectedCost.energy + ' / 点' + selectedCost.points })] }),
                                ] }),
                        ] }),
                    jsx('textarea', { value: globalNote, onChange: event => setGlobalNote(event.target.value), placeholder: '全局备注：目标、场景、限制或本次催眠方向...', className: 'mt-4 h-20 w-full resize-none rounded-3xl border border-white/10 bg-black/35 p-4 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/70' }),
                    jsx('div', { className: 'mt-4 space-y-4', children: _types__WEBPACK_IMPORTED_MODULE_3__.VIP_LEVELS.map(renderTierSection) }),
                ] }),
            jsxs('footer', { className: 'relative z-20 shrink-0 border-t border-white/10 bg-slate-950/95 p-4 pb-7 shadow-[0_-12px_32px_rgba(0,0,0,0.45)]', children: [
                    jsxs('div', { className: 'mb-3 flex items-center justify-between gap-3 text-sm font-bold', children: [
                            jsx('span', { className: resourceWarning ? 'text-rose-300' : 'text-white/55', children: resourceWarning ? '预计余额不足，AI结算时失败' : '预计消耗已按启用指令计算' }),
                            jsx('span', { className: 'text-white/80', children: 'MC能量 ' + selectedCost.energy + '点 / 当前MC点 ' + selectedCost.points + '点' }),
                        ] }),
                    jsx('button', { type: 'button', onClick: startHypnosis, disabled: !selectedFeatures.length, className: 'mx-auto flex h-14 w-[78%] max-w-sm items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-lg font-black text-white shadow-lg disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-white/40', children: '⚡ 启动催眠' }),
                    notice ? jsx('div', { className: 'mt-3 text-center text-xs font-bold text-fuchsia-100/75', children: notice }) : null,
                ] }),
        ] });
};
`;
  const suffix = code.slice(end).replace(/\n\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,[^\n]*/g, "");
  return code.slice(0, start) + replacement + suffix;
}

function patchHypnosisAppModule(code) {
  if (!code.includes("const HypnosisApp") || !code.includes("buildHypnosisSendMessage")) return code;
  return rebuildHypnosisAppModule(code);
}

function patchHypnosisDataServiceModule(code) {
  if (!code.includes("getSessionEnd: async") || !code.includes("STORE_SCHEMA")) return code;
  let output = code;
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
function scoreStatDataCandidate(value) {
    if (!isPlainVariableObject(value))
        return -1;
    let score = 0;
    const system = value['系统'];
    const roles = value['角色'];
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
    if (isPlainVariableObject(tasks))
        score += 8 + Object.keys(tasks).length;
    if (value['本轮APP操作'] != null)
        score += 2;
    return score;
}
function getFrontendVariableOptions() {
    const currentOption = getCurrentVariableOption();
    if (currentOption)
        return [currentOption];
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
        if (shouldPreferCurrentMessageSnapshot())
            return candidate;
        if (!best || score > best.score)
            best = { candidate, score };
    }
    return best?.candidate ?? null;
}
function getVariableSnapshotsSync() {
    const candidates = [];
    const hasCurrentSnapshot = Boolean(getCurrentVariableOption());
    for (const option of getFrontendVariableOptions()) {
        try {
            const mvu = globalThis.Mvu?.getMvuData?.(option);
            if (mvu && typeof mvu.then !== 'function' && isPlainVariableObject(mvu.stat_data))
                candidates.push(mvu.stat_data);
        }
        catch {
            // ignore unavailable option
        }
    }
    for (const option of getFrontendVariableOptions()) {
        try {
            const vars = typeof getVariables === 'function' ? getVariables(option) : null;
            if (isPlainVariableObject(vars))
                candidates.push(vars);
        }
        catch {
            // ignore unavailable option
        }
    }
    if (!hasCurrentSnapshot) {
        try {
            const vars = typeof getVariables === 'function' ? getVariables() : null;
            if (isPlainVariableObject(vars))
                candidates.push(vars);
        }
        catch {
            // ignore
        }
        try {
            const mvu = globalThis.Mvu?.getMvuData?.();
            if (mvu && typeof mvu.then !== 'function' && isPlainVariableObject(mvu.stat_data))
                candidates.push(mvu.stat_data);
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
            candidate['系统']?.['当前MC点'] ?? candidate['系统']?.['MC点'] ?? '',
            Object.keys(candidate['角色'] ?? {}).join(','),
            Object.keys(candidate['任务'] ?? {}).join(','),
        ].join('\\u0001');
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function getLatestVariablesSync() {
    return pickBestVariableSnapshot(getVariableSnapshotsSync()) ?? {};
}
function getLatestChatVariables() {
    return normalizeChatVariables(getLatestVariablesSync());
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
    mcPoints: ['当前MC点', 'MC点', 'MC点数', '_MC点', '_MC点数', '当前PT', 'PT', 'PT点数', '点数', 'mcPoints'],
    totalConsumedMc: ['累计消耗MC点', '_累计消耗MC点', '累计消耗MC', '总消耗MC点', '消耗MC点', 'totalConsumedMc'],
    money: ['持有零花钱', '零花钱', '持有金钱', '持有资金', '当前资金', '资金', '金钱', 'money'],
    suspicion: ['主角可疑度', '可疑度', '当前可疑度', '_可疑度', 'suspicion'],
};
const USER_RESOURCE_CANONICAL_KEYS = {
    mcEnergy: 'MC能量',
    mcEnergyMax: 'MC能量上限',
    mcPoints: '当前MC点',
    totalConsumedMc: '累计消耗MC点',
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
        mcPoints: system.当前MC点,
        totalConsumedMc: system.累计消耗MC点,
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
  output = output.replace(
    `    getUserData: async () => {
        let user;
        try {
            const mvuSystem = await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getSystem();
            if (mvuSystem) {
                user = systemToUserResources(SYSTEM_SCHEMA.parse(normalizeSystemAliases(mvuSystem)));
            }
        }
        catch (err) {
            console.warn('[HypnoOS] 读取 MVU 系统变量失败，回退到聊天变量', err);
        }
        updateVariablesWith(vars => {
            const { system } = normalizeChatVariables(vars);
            user ??= systemToUserResources(system);
            return vars;
        }, CHAT_OPTION);
        if (user) {
            updateVariablesWith(vars => {
                const { system, store } = normalizeChatVariables(vars);
                system._MC能量 = user.mcEnergy;
                system._MC能量上限 = user.mcEnergyMax;
                system.当前MC点 = user.mcPoints;
                system._累计消耗MC点 = user.totalConsumedMc;
                system.持有零花钱 = user.money;
                system.主角可疑度 = user.suspicion;
                system._hypnoos = store;
                vars.系统 = system;
                return vars;
            }, CHAT_OPTION);
        }
        return user ?? DEFAULT_USER_DATA;
    },
    getSystemClock: async () => {
        const maybeSync = async (clock) => {
            try {
                await syncSubscriptionTierLabel(clock.virtualMinutes);
            }
            catch (err) {
                console.warn('[HypnoOS] 同步订阅等级变量失败', err);
            }
            return clock;
        };
        try {
            const mvuSystem = await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getSystem();
            if (mvuSystem)
                return await maybeSync(getSystemClockFrom(mvuSystem));
        }
        catch (err) {
            console.warn('[HypnoOS] 读取 MVU 系统时间失败，回退到聊天变量', err);
        }
        const { system } = normalizeChatVariables(getVariables(CHAT_OPTION));
        return await maybeSync(getSystemClockFrom(system));
    },`,
    `    getUserData: async () => {
        const systems = [];
        try {
            for (const snapshot of getVariableSnapshotsSync()) {
                if (isPlainVariableObject(snapshot?.系统))
                    systems.push(snapshot.系统);
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
        const user = chooseUserResourcesFromSystems(systems);
        return user ?? DEFAULT_USER_DATA;
    },
    getSystemClock: async () => {
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
            if (clock.dateText !== '4月9日 星期三' || clock.timeText !== '12:00' || clock.scheduleText !== '午休')
                return clock;
        }
        return fallbackClock ?? getSystemClockFrom({});
    },`
  );
  output = output.replace(
    `    updateResources: async (newData) => {
        const merged = { ...(await DataService.getUserData()), ...newData };
        updateVariablesWith(vars => {
            const { system, store } = normalizeChatVariables(vars);
            system._MC能量 = merged.mcEnergy;
            system._MC能量上限 = merged.mcEnergyMax;
            system.当前MC点 = merged.mcPoints;
            system._累计消耗MC点 = merged.totalConsumedMc;
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
                    rewardMcPoints: q.rewardMcPoints,
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
                rewardMcPoints: q.rewardMcPoints,
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
        const claimed = store.quests ?? {};
        const tasks = (await _mvuBridge__WEBPACK_IMPORTED_MODULE_3__.MvuBridge.getTasks().catch(() => null)) ?? {};
        const seenTaskNames = new Set();
        const quests = QUEST_DATABASE.flatMap(q => {
            if (claimed[q.id] === 'CLAIMED')
                return [];
            const taskState = tasks[q.name];
            if (taskState && typeof taskState === 'object')
                seenTaskNames.add(q.name);
            const completed = Boolean(taskState && typeof taskState === 'object' && taskState.已完成 === true);
            const active = Boolean(taskState && typeof taskState === 'object' && typeof taskState.已完成 === 'boolean');
            return [{
                id: q.id,
                title: q.name,
                description: q.condition,
                rewardMcPoints: q.rewardMcPoints,
                status: completed
                    ? 'COMPLETED'
                    : active
                        ? 'ACTIVE'
                        : 'AVAILABLE',
            }];
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
                rewardMcPoints: Number(taskState.奖励MC点 ?? taskState.奖励 ?? taskState.rewardMcPoints ?? 0) || 0,
                status: taskState.已完成 === true ? 'COMPLETED' : 'ACTIVE',
            });
        }
        const order = { COMPLETED: 0, ACTIVE: 1, AVAILABLE: 2, CLAIMED: 3 };
        quests.sort((a, b) => order[a.status] - order[b.status]);
        return quests;
    },`
  );
  output = output.replaceAll(
    "normalizeChatVariables(getVariables(CHAT_OPTION))",
    "getLatestChatVariables()"
  );
  output = output.replaceAll("getVariables(CHAT_OPTION)", "getLatestVariablesSync()");
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
  return text || fallback;
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
    if (value["本轮APP操作"] != null) score += 2;
    return score;
  }

  function getLatestStatDataSync() {
    const candidates = [];
    const hasCurrentSnapshot = Boolean(getCurrentVariableOption());
    for (const option of getLatestVariableOptions()) {
      try {
        const mvu = window.Mvu?.getMvuData?.(option);
        if (mvu?.stat_data && typeof mvu.stat_data === "object") candidates.push(mvu.stat_data);
      } catch {}
    }
    for (const option of getLatestVariableOptions()) {
      try {
        const vars = typeof getVariables === "function" ? getVariables(option) : null;
        if (vars && typeof vars === "object" && (vars["系统"] || vars["角色"] || vars["任务"])) candidates.push(vars);
      } catch {}
    }
    if (!hasCurrentSnapshot) {
      try {
        const vars = typeof getVariables === "function" ? getVariables() : null;
        if (vars && typeof vars === "object") candidates.push(vars);
      } catch {}
      try {
        const mvu = window.Mvu?.getMvuData?.();
        if (mvu?.stat_data && typeof mvu.stat_data === "object") candidates.push(mvu.stat_data);
      } catch {}
    }
    let best = null;
    for (const candidate of candidates) {
      const score = scoreStatDataCandidate(candidate);
      if (score < 0) continue;
      if (shouldPreferCurrentMessageSnapshot()) return candidate;
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
    window.setInterval(refreshPhoneVariableViews, 1500);
    window.addEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", refreshPhoneVariableViews);
    try {
      if (typeof eventOn === "function" && window.Mvu?.events) {
        eventOn(window.Mvu.events.VARIABLE_INITIALIZED, refreshPhoneVariableViews);
        eventOn(window.Mvu.events.VARIABLE_UPDATE_ENDED, refreshPhoneVariableViews);
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
    const block = "<本轮APP操作>\\n" + body.trim() + "\\n</本轮APP操作>";
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
.st-home-course-strip{margin-top:8px;display:inline-flex;max-width:100%;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(2,6,23,.34);backdrop-filter:blur(12px);box-shadow:0 10px 22px rgba(0,0,0,.16);padding:5px 9px;color:rgba(241,245,249,.9);font-size:11px;line-height:1.2}
.st-home-course-strip strong{font-size:12px;color:#fff;white-space:nowrap}
.st-home-course-strip span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgba(203,213,225,.82)}
.st-home-course-dot{width:6px;height:6px;border-radius:999px;background:#67e8f9;box-shadow:0 0 12px rgba(103,232,249,.8);flex:0 0 auto}
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
.st-calendar-timetable{margin:10px 12px 8px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.035));box-shadow:0 14px 30px rgba(0,0,0,.22);overflow:hidden}
.st-calendar-timetable-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:12px 12px 9px;border-bottom:1px solid rgba(255,255,255,.08)}
.st-calendar-timetable-head strong{display:block;font-size:15px;color:#f8fafc;line-height:1.2}
.st-calendar-timetable-head span{display:block;margin-top:3px;font-size:11px;color:rgba(203,213,225,.56);line-height:1.35}
.st-calendar-status{flex:0 1 auto;max-width:170px;border:1px solid rgba(34,211,238,.2);border-radius:999px;background:rgba(34,211,238,.09);color:#a5f3fc;padding:5px 8px;font-size:10px;font-weight:800;white-space:normal;line-height:1.2;text-align:right}
.st-calendar-grid-scroll{overflow:visible;padding:10px 8px 9px}
.st-calendar-grid{display:grid;grid-template-columns:minmax(38px,.52fr) repeat(5,minmax(0,1fr));gap:5px;width:100%}
.st-calendar-cell{min-height:40px;min-width:0;border:1px solid rgba(255,255,255,.075);border-radius:11px;background:rgba(2,6,23,.28);padding:6px 5px;display:grid;align-content:center;gap:2px;color:rgba(226,232,240,.76)}
.st-calendar-cell strong{font-size:10px;color:#f8fafc;line-height:1.16;white-space:normal;overflow:visible;text-overflow:clip;word-break:keep-all}
.st-calendar-cell span{font-size:8px;color:rgba(203,213,225,.48);line-height:1.15;white-space:normal}
.st-calendar-cell.is-time{background:rgba(15,23,42,.5);border-color:rgba(125,211,252,.12)}
.st-calendar-cell.is-time strong{font-size:10px;color:#a5f3fc;white-space:nowrap}
.st-calendar-cell.is-day{min-height:32px;text-align:center;background:rgba(255,255,255,.055)}
.st-calendar-cell.is-day strong{font-size:12px;white-space:nowrap}
.st-calendar-cell.is-active-day{border-color:rgba(34,211,238,.42);background:linear-gradient(135deg,rgba(34,211,238,.16),rgba(168,85,247,.12))}
.st-calendar-cell.is-current{border-color:rgba(244,114,182,.68);background:linear-gradient(135deg,rgba(244,114,182,.24),rgba(168,85,247,.18));box-shadow:0 0 0 1px rgba(244,114,182,.12),0 10px 22px rgba(131,24,67,.22)}
.st-calendar-rhythm{display:flex;gap:6px;flex-wrap:wrap;padding:0 10px 11px}
.st-calendar-rhythm span{flex:0 0 auto;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.045);padding:5px 8px;color:rgba(226,232,240,.68);font-size:10px;font-weight:750;white-space:nowrap}
[data-st-phone-app="inventory"]>div,[data-st-phone-app="help"]>div{background:linear-gradient(180deg,#101426 0%,#080b14 56%,#05060b 100%)!important;color:#f8fafc!important}
[data-st-phone-app="inventory"]>div>div:first-child,[data-st-phone-app="help"]>div>div:first-child{background:rgba(3,6,14,.72)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:0 12px 30px rgba(0,0,0,.22)!important;backdrop-filter:blur(14px)}
[data-st-phone-app="inventory"] [class*="bg-white"],[data-st-phone-app="help"] [class*="bg-white"],[data-st-phone-app="inventory"] [class*="bg-gray-"],[data-st-phone-app="help"] [class*="bg-gray-"]{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:0 10px 24px rgba(0,0,0,.16)!important}
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
[data-st-phone-app="stats"] .st-role-picker-list{grid-area:list;display:flex;gap:7px;overflow-x:auto;padding:1px 0;scrollbar-width:none;min-width:0;width:100%}
[data-st-phone-app="stats"] .st-role-picker-list::-webkit-scrollbar{display:none}
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
[data-st-phone-app="stats"] .st-effect-item strong{display:block;color:rgba(248,250,252,.94);font-size:12px;line-height:1.35}
[data-st-phone-app="stats"] .st-effect-item p{margin:5px 0 0;color:rgba(226,232,240,.72);font-size:11px;line-height:1.5;white-space:pre-wrap}
[data-st-phone-app="stats"] .st-effect-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
[data-st-phone-app="stats"] .st-effect-meta span{border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.055);color:rgba(226,232,240,.7);padding:3px 7px;font-size:10px;line-height:1.2}
\`;
    document.head.appendChild(style);
  }

  function findPhoneRoot(from) {
    return from?.closest?.(".w-full.h-full.bg-black.overflow-hidden.relative")
      || document.querySelector(".w-full.h-full.bg-black.overflow-hidden.relative")
      || document.querySelector("#root")
      || document.body;
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
    root.querySelector(".st-mchan-internal-app")?.remove();
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
          外貌: appearance,
          性格: personality,
          其他: extra,
        },
        AI执行规范: [
          "本操作表示 {{user}} 在当前剧情中主动看到目标，并用手机扫描/锁定她；AI只能基于当前场景可见信息与用户填写的目标定位/身体来建档。",
          "如果用户未填写角色名，AI先为目标随机取一个自然、可长期使用、符合场景和身体特征的姓名，避免使用“未知角色”“目标A”等占位名。",
          "取名后先使用 /add 角色名，在角色路径下新增角色，再按本规则更新 stat_data.角色 中的新角色变量。",
          "新增前先参考西园寺爱丽莎、月咏深雪、犬冢夏美的变量结构与人设粒度：身份、关系、外貌、性格、警戒/抗性和此刻心理。",
          "新角色沿用西园寺爱丽莎、月咏深雪、犬冢夏美的 stat_data.角色 结构；关系、状态、次数、效果等初始值按默认处理，不需要在本提示里逐项展开。",
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
      title: "教师身份",
      note: "已填写示例",
      roleName: "白鸟凛",
      aliases: "白鸟老师, 凛老师",
      summary: "{{user}}在教学楼办公室门口看到并锁定的年轻女教师。她身形高挑，穿深色修身西装外套与白衬衫，手里抱着教案和点名册。",
      relation: "学校教师；与{{user}}存在课堂/校园管理关系，初始保持师生距离。",
      appearance: "黑色长发低束，细框眼镜，妆容干净，步态克制，身上有淡淡墨水和香水味。",
      personality: "理性、负责、观察力强，面对异常会先保持礼貌警惕；对规则、秩序和职业身份很敏感。",
      extra: "保持教师身份、校园场景和谨慎态度；不要直接跳过扫描/锁定与AI建档判断。"
    },
    {
      title: "异世界杀手",
      note: "已填写示例",
      roleName: "千杀百花",
      aliases: "百花, 异世界杀手, 原勇者小队成员, 异世界英雄",
      summary: "{{user}}在她确认主角很弱、准备离开前扫描并锁定的异世界杀手。她来自中世纪剑与魔法异世界，曾是拯救异世界人类的勇者小队成员与英雄，身形小巧可爱，却带着真正经历过战争与魔物讨伐的气息。",
      relation: "她误会{{user}}是把她传送来的元凶，短暂敌视和试探；确认{{user}}很弱后决定离开，在离开前被手机扫描。她对勇者抱有深切倾慕，却无法理解这种情感，只会在勇者面前露出不自觉的羞涩反应。",
      appearance: "小巧可爱的少女体型，动作轻盈隐蔽，衣装带有中世纪剑与魔法世界的皮革护具、短刃和旅行痕迹；身上能看出长期冒险留下的细小伤痕与战斗磨损。",
      personality: "不善言辞，戒备心强，行动比语言更直接；作为原勇者小队成员，她责任感强、战斗经验丰富，对人类存续和同伴有英雄式执念。她无法准确命名自己对勇者的倾慕，只会在勇者面前短暂慌乱、移开视线或变得笨拙。",
      extra: "保持异世界来客、原勇者小队成员、拯救异世界人类的英雄、杀手身份、误会与离开前被扫描的时间点；AI建档时可补全她的世界观常识、战斗经验、对现代环境的不适应，以及她对勇者倾慕却无法理解感情的矛盾。"
    },
    {
      title: "作弊模式",
      note: "已填写示例",
      roleName: "中村樱",
      aliases: "樱酱, 中村总裁, Nakamura Sakura",
      summary: "{{user}}看到并锁定的大公司完美女总裁。她32岁，事业、气场和资源都近乎完美，却毫无恋爱经验；看到{{user}}第一眼便认定他是最适合承接她自毁愿望的天选之人。",
      relation: "她主动接近{{user}}并提供大额资金支持，明确表示会持续支持{{user}}；外界视角是强势资助者/商业女王，私下则把{{user}}视为能让她失控和坠落的对象。",
      appearance: "成熟性感的32岁女性，剪裁昂贵的职业套装、冷色高跟鞋和精致妆容让她显得沉稳冷静；身材曲线被高级面料包裹得克制却醒目，举止有总裁式压迫感。",
      personality: "性感、沉稳、冷静，习惯掌控谈判和资源；私下是隐藏痴女，恋爱经验为零，在{{user}}面前会故意装可爱，自称樱酱，并把羞耻和失控当成隐秘愿望。",
      extra: "作为“作弊模式”示例，她可以提供远超普通学生角色的资金与资源支持；AI建档时保持她的成年人身份、总裁身份、资金支持、隐藏痴女、自毁愿望和在{{user}}面前装可爱的反差。"
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
      return '<button type="button" class="st-add-role-example ' + (canApply ? "" : "is-empty") + '" data-add-role-example="' + index + '"' + (canApply ? "" : " disabled") + '>' +
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
    page.querySelector("[name='summary']")?.focus();
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
            '<label class="st-add-role-field"><span>角色名（可选）</span><input name="roleName" autocomplete="off" placeholder="例如：白鸟凛；留空由 AI 随机"></label>' +
            '<label class="st-add-role-field"><span>别名 / 关键词</span><input name="aliases" autocomplete="off" placeholder="用逗号分隔，可留空"></label>' +
            '<label class="st-add-role-field"><span>目标定位 / 身体（必填）</span><textarea name="summary" placeholder="{{user}}看见并锁定的目标：她的身体、姿态、服装、所在场景、显著特征"></textarea></label>' +
            '<label class="st-add-role-field"><span>与主角关系</span><textarea name="relation" placeholder="可留空，由 AI 按场景随机"></textarea></label>' +
            '<label class="st-add-role-field"><span>外貌</span><textarea name="appearance" placeholder="可留空；需要保留的外貌细节写在这里"></textarea></label>' +
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
      button.addEventListener("click", () => {
        const index = Number(button.getAttribute("data-add-role-example"));
        applyStaticScanExample(page, getStaticScanExamples()[index]);
      });
    });
    updateAddRoleRestoreButton(page);
  }

  function openAddRolePage(tile) {
    ensureStyle();
    ensurePhoneDarkThemeStyle();
    const root = findPhoneRoot(tile);
    root.dataset.stPhoneApp = "add-role";
    root.style.position = root.style.position || "relative";
    root.querySelector(".st-add-role-app")?.remove();
    root.querySelector(".st-mchan-internal-app")?.remove();
    const page = document.createElement("section");
    page.className = "st-add-role-app";
    page.setAttribute("aria-label", "扫描角色");
    root.appendChild(page);
    renderAddRolePage(page);
  }

  function detectPhoneApp(root) {
    if (!root) return "";
    if (root.querySelector(".st-add-role-app")) return "add-role";
    if (root.querySelector(".st-mchan-internal-app")) return "mchan";
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
    if (text.includes("帮助中心") || text.includes("MC 能量") || text.includes("Internal Build")) return "help";
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
    if (value["本轮APP操作"] != null) score += 2;
    return score;
  }

  function getLatestStatDataSync() {
    const candidates = [];
    const hasCurrentSnapshot = Boolean(getCurrentVariableOption());
    for (const option of getLatestVariableOptions()) {
      try {
        const mvu = window.Mvu?.getMvuData?.(option);
        if (mvu?.stat_data && typeof mvu.stat_data === "object") candidates.push(mvu.stat_data);
      } catch {}
    }
    for (const option of getLatestVariableOptions()) {
      try {
        const vars = typeof getVariables === "function" ? getVariables(option) : null;
        if (vars && typeof vars === "object" && (vars["系统"] || vars["角色"] || vars["任务"])) candidates.push(vars);
      } catch {}
    }
    if (!hasCurrentSnapshot) {
      try {
        const vars = typeof getVariables === "function" ? getVariables() : null;
        if (vars && typeof vars === "object") candidates.push(vars);
      } catch {}
      try {
        const mvu = window.Mvu?.getMvuData?.();
        if (mvu?.stat_data && typeof mvu.stat_data === "object") candidates.push(mvu.stat_data);
      } catch {}
    }
    let best = null;
    for (const candidate of candidates) {
      const score = scoreStatDataCandidate(candidate);
      if (score < 0) continue;
      if (shouldPreferCurrentMessageSnapshot()) return candidate;
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
        "若该角色仍在剧情现场或删除会破坏连续性，AI 应在正文说明并拒绝删除或延后删除。",
        "删除后需要在 <update> 中清空本轮APP操作。"
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
          '<div class="st-role-picker-list"></div>' +
        '</div>';
      picker.querySelector(".st-role-picker-search")?.addEventListener("input", () => {
        picker.dataset.query = picker.querySelector(".st-role-picker-search")?.value || "";
        enhanceStatsRolePicker(root);
      });
      header.insertAdjacentElement("afterend", picker);
    }
    const input = picker.querySelector(".st-role-picker-search");
    if (input && picker.dataset.query !== undefined && input.value !== picker.dataset.query) input.value = picker.dataset.query;
    const query = String(input?.value || picker.dataset.query || "").trim().toLowerCase();
    const selected = selectedStatsRole(app, roleNames, picker.dataset.selected);
    const signature = roleNames.join("\\u0001") + "\\u0002" + selected + "\\u0002" + query;
    enableHorizontalDragScroll(picker.querySelector(".st-role-picker-list"));
    if (picker.dataset.signature === signature) return;
    picker.dataset.signature = signature;
    picker.dataset.selected = selected;
    const filtered = roleNames.filter((name) => !query || name.toLowerCase().includes(query));
    const list = picker.querySelector(".st-role-picker-list");
    picker.querySelector(".st-role-picker-count").textContent = roleNames.length + " 个目标";
    if (!list) return;
    enableHorizontalDragScroll(list);
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
  const ST_PROFILE_FIELDS = [
    { label: "外观", keys: ["外观", "外貌", "外观状态", "身体", "身体特征"] },
    { label: "心理（此刻）", keys: ["心理", "心理状态", "当前心理", "内心", "态度"] }
  ];
  const ST_NATIVE_STAT_LABELS = ST_CORE_STATS.concat(ST_SENSITIVITY_STATS, ST_COUNT_STATS);

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

  function pickRoleMeta(roleData) {
    return pickFirstText(roleData, ["角色定位", "定位", "身体", "身份", "种族", "备注"]) || "角色变量已载入";
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

  function renderProfileSection(roleData) {
    const profile = ST_PROFILE_FIELDS.map((field) => renderProfileField(field, roleData)).join("");
    return renderCollapsibleStatsSection("外观与心理", "心理=第一视角内心", '<div class="st-profile-grid">' + profile + '</div>');
  }

  function renderStatsOverview(roleName, roleData) {
    const core = ST_CORE_STATS.map((label) => renderMeterStat(label, statValue(roleData, label))).join("");
    const sensitivity = ST_SENSITIVITY_STATS.map((label) => renderMeterStat(label, statValue(roleData, label))).join("");
    const counts = ST_COUNT_STATS.map((label) => renderCountStat(label, statValue(roleData, label))).join("");
    const canDelete = Boolean(roleName) && !DEFAULT_ROLE_NAMES.includes(roleName);
    return '<section class="st-target-summary">' +
      '<div class="st-target-summary-main"><span>目标</span><strong>' + escapeHtml(roleName) + '</strong><small>' + escapeHtml(pickRoleMeta(roleData)) + '</small></div>' +
      (canDelete ? '<button type="button" class="st-target-delete" data-delete-role="' + escapeAttr(roleName) + '">删除角色</button>' : '') +
      '</section>' +
      renderProfileSection(roleData) +
      renderCollapsibleStatsSection("状态总览", roleName, '<div class="st-meter-grid is-core">' + core + '</div>') +
      renderCollapsibleStatsSection("身体敏感度", "1000以上高亮", '<div class="st-meter-grid">' + sensitivity + '</div>') +
      renderCollapsibleStatsSection("累计次数", "由 AI 更新", '<div class="st-count-grid">' + counts + '</div>');
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

  function normalizeEffectEntry(name, value, index) {
    const fallbackTitle = name || "效果 " + (index + 1);
    if (!isPlainObject(value)) {
      return {
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
    return text ? [{ title: "效果", description: text, meta: [] }] : [];
  }

  function renderEffectCard(label, value, variant) {
    const entries = normalizeEffectEntries(value);
    const emptyText = label.includes("临时") ? "暂无临时效果" : "暂无永久效果";
    const body = entries.length
      ? '<div class="st-effect-list">' + entries.map((entry) => {
          const meta = entry.meta.length
            ? '<div class="st-effect-meta">' + entry.meta.map(([key, text]) => '<span>' + escapeHtml(key) + '：' + escapeHtml(text) + '</span>').join("") + '</div>'
            : "";
          return '<article class="st-effect-item"><strong>' + escapeHtml(entry.title) + '</strong>' +
            (entry.description ? '<p>' + escapeHtml(entry.description) + '</p>' : '') +
            meta + '</article>';
        }).join("") + '</div>'
      : '<div class="st-effect-empty">' + emptyText + '</div>';
    return '<details class="st-effect-card ' + variant + '" open>' +
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
    panel.innerHTML = renderEffectCard("临时催眠效果", temp, "is-temporary") +
      renderEffectCard("永久催眠效果", permanent, "is-permanent");
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
    if (app === "help") {
      patchHelpAuthorCredit(root);
    }
    if (app === "stats") {
      enhanceStatsRolePicker(root);
      enhanceStatsOverview(root);
      enhanceStatsEffects(root);
    }
    if (app === "calendar") {
      enhanceCalendarTimetable(root);
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
      .filter((element) => !element.closest(".st-mchan-internal-app") && !element.closest(".st-add-role-app") && element.textContent?.trim() === text);
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

  function manualScheduleSlot(manual, slot) {
    const text = String(manual || "").trim();
    if (!text || text === "无" || text === "{}") return null;
    if (text === slot.title || text === slot.subject || text === slot.period || text === slot.title.replace(/^\\d限 · /, "")) {
      return { title: slot.title, detail: slot.detail };
    }
    return { title: text, detail: "当前日程" };
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

  function routineSlot(minutes, weekdayText, currentSchedule, parsedDate) {
    const special = specialDayForDate(parsedDate);
    const normal = normalSchoolSlot(minutes, weekdayText);
    if (special?.holiday || special?.exam || (special && !/普通授课/.test(special.detail || ""))) {
      return { title: special.title, detail: special.detail || "特别日程" };
    }
    const manual = manualScheduleSlot(currentSchedule, normal);
    if (manual) return manual;
    if (special && /普通授课/.test(special.detail || "")) {
      return { title: normal.title, detail: normal.detail + " / " + special.title };
    }
    return normal;
  }

  function renderCalendarTimetable() {
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
    const specialBlocksClass = special && (special.holiday || special.exam || !/普通授课/.test(special.detail || ""));
    const status = special
      ? special.title + " · " + (special.detail || "特别日程")
      : weekday + " · 普通授课";
    const header = '<div class="st-calendar-cell is-time"><strong>课节</strong><span>时间</span></div>' +
      days.map((day) => '<div class="st-calendar-cell is-day ' + (day.index === activeDay ? "is-active-day" : "") + '"><strong>' + day.short + '</strong><span>' + day.full.replace("星期", "") + '</span></div>').join("");
    const rows = ST_CLASS_PERIODS.map((period) => {
      const time = formatPeriodTime(period.start) + "-" + formatPeriodTime(period.end);
      const timeCell = '<div class="st-calendar-cell is-time" title="' + escapeAttr(time) + '"><strong>' + period.label + '</strong><span>' + formatPeriodTime(period.start) + '</span></div>';
      const cells = days.map((day) => {
        const subject = ST_WEEKLY_TIMETABLE[day.index]?.[period.index - 1] || "自习";
        const classes = [
          "st-calendar-cell",
          day.index === activeDay ? "is-active-day" : "",
          !specialBlocksClass && day.index === activeDay && period.index === activePeriod ? "is-current" : ""
        ].filter(Boolean).join(" ");
        return '<div class="' + classes + '"><strong>' + escapeHtml(subject) + '</strong><span>' + period.label + '</span></div>';
      }).join("");
      return timeCell + cells;
    }).join("");
    return '<div class="st-calendar-timetable-head">' +
        '<div><strong>周课表</strong><span>普通授课日 · 周一到周五</span></div>' +
        '<div class="st-calendar-status" title="' + escapeAttr(status) + '">' + escapeHtml(status) + '</div>' +
      '</div>' +
      '<div class="st-calendar-grid-scroll"><div class="st-calendar-grid">' + header + rows + '</div></div>' +
      '<div class="st-calendar-rhythm">' +
        '<span>08:30 朝礼</span><span>12:30 午休</span><span>15:10 终礼</span><span>15:25 清扫</span><span>15:45 放学</span>' +
      '</div>';
  }

  function enhanceCalendarTimetable(root) {
    if (!root?.dataset || root.dataset.stPhoneApp !== "calendar") return;
    const app = root.firstElementChild;
    const text = compactText(app);
    if (!app || !(text.includes("日历") || text.includes("今日") || text.includes("社团招新周") || text.includes("入学式"))) return;
    const section = app.querySelector(":scope > .st-calendar-timetable") || document.createElement("section");
    if (!section.parentElement) {
      section.className = "st-calendar-timetable";
      const header = app.firstElementChild;
      if (header?.nextSibling) app.insertBefore(section, header.nextSibling);
      else app.prepend(section);
    }
    const system = getSystemState();
    const signature = [system["当前日期"], system["当前时间"], system["当前日程"]].join("\\u0002");
    if (section.dataset.signature !== signature) {
      section.dataset.signature = signature;
      section.innerHTML = renderCalendarTimetable();
    }
    enableHorizontalDragScroll(section.querySelector(".st-calendar-grid-scroll"));
    enableHorizontalDragScroll(section.querySelector(".st-calendar-rhythm"));
  }

  function currentHomeScheduleInfo() {
    const system = getSystemState();
    const dateText = system["当前日期"] || "4月9日 星期三";
    const timeText = system["当前时间"] || "12:00";
    const parsedDate = parseStoryDate(dateText);
    const weekday = weekdayForStoryDate(dateText) || "星期三";
    const slot = routineSlot(minutesFromTimeText(timeText), weekday, system["当前日程"], parsedDate);
    return { weekday, title: slot.title, detail: slot.detail };
  }

  function looksLikePhoneHome(root) {
    const rootText = root?.innerText || "";
    return ["催眠APP", "日历", "帮助", "成就和任务", "库存", "MC匿名版"].every((label) => rootText.includes(label)) &&
      !root.querySelector(".st-mchan-internal-app, .st-add-role-app");
  }

  function getHomeHeader(root) {
    return root?.querySelector?.('[class*="px-6"][class*="mb-8"]') || root?.firstElementChild?.firstElementChild || null;
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
        : ["功能", "命令", "目标", "角色", "角色名", "名称", "等级", "数量"];
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

  function patchHomeCourseStatus(root) {
    if (!root) return;
    if (!looksLikePhoneHome(root)) return;
    const header = getHomeHeader(root);
    if (!header) return;
    const info = currentHomeScheduleInfo();
    const signature = info.weekday + "|" + info.title + "|" + info.detail;
    let strip = header.querySelector(":scope > .st-home-course-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.className = "st-home-course-strip";
      header.appendChild(strip);
    }
    if (strip.dataset.signature === signature) return;
    strip.dataset.signature = signature;
    strip.innerHTML = '<i class="st-home-course-dot"></i><strong>' + escapeHtml(info.weekday) + '</strong><span>' + escapeHtml(info.title + (info.detail ? " · " + info.detail : "")) + '</span>';
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
    tile.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    tile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openAddRolePage(tile);
    }, true);
    hypnosisTile.insertAdjacentElement("afterend", tile);
  }

  function patchHomeTile() {
    const root = findPhoneRoot(document.body);
    patchHomeCourseStatus(root);
    removeHomeOperationConfirm(root);
    ensureOperationSidePanel();
    patchAddRoleTile();
    const labels = Array.from(document.querySelectorAll("span,button,div"))
      .filter((element) => !element.closest(".st-mchan-internal-app") && !element.closest(".st-add-role-app") && element.textContent?.trim() === "MC匿名版");
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
    updateOperationSidePanel();
  }

  function hasInitialPhonePatch() {
    const phone = document.querySelector(".w-full.h-full.bg-black.overflow-hidden.relative");
    if (!phone) return false;
    if (phone.dataset?.stPhoneApp) return true;
    if (document.querySelector('[data-st-add-role-tile="true"], .st-role-picker, .st-mchan-internal-app, .st-add-role-app')) return true;
    return false;
  }

  function releaseBootGuard() {
    window.__ST_HYPNOOS_PATCH_READY__ = true;
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
    window.setInterval(refreshPhoneVariableViews, 1500);
    window.addEventListener("HYPNOOS_OPERATION_QUEUE_CHANGED", refreshPhoneVariableViews);
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
    "当前MC点": 25,
    "累计消耗MC点": 0,
    "持有零花钱": 6000,
    "主角可疑度": 0,
    "当前日期": "4月9日 星期三",
    "当前时间": "12:00",
    "当前日程": "午休",
    "hypnoos": {}
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
  return String(html || "")
    .replaceAll(LOCAL_VENDOR.zod, vendorBase + "zod.mjs")
    .replaceAll(LOCAL_VENDOR.lodash, vendorBase + "lodash.mjs")
    .replaceAll(LOCAL_VENDOR.jquery, vendorBase + "jquery.mjs")
    .replaceAll(LOCAL_VENDOR.scheduler, vendorBase + "scheduler.mjs");
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
const mirrored = prepareFrontendHtml(rawHtml, source, { mchanStatic });
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
