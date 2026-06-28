import {
  buildCardPngBytes,
  cloneCard,
  downloadBlob,
  ensureCardShape,
  exportCardJson,
  exportCardPng,
  getCardData,
  parseCharacterCardFile,
  parseCharacterCardFromUrl
} from "./card-parser.js";

const SAMPLE_CARD_URL = "./public/cards/hypnosis-app.png";
const LOCAL_FRONTEND_URL = "/public/frontends/hypnosis-app/index.html";
const WORKSPACE_PNG_SAVE_URL = "/__workbench/save-card-png";
const WORKSPACE_JSON_SAVE_URL = "/__workbench/save-card-json";
const PREVIEW_VENDOR = {
  zod: "./public/vendor/zod.mjs",
  lodash: "./public/vendor/lodash.mjs",
  jquery: "./public/vendor/jquery.mjs",
  scheduler: "./public/vendor/scheduler.mjs"
};
const STORAGE_KEY = "st-card-workbench:v1";
const SCAN_EXAMPLES_STORAGE_KEY = "st-card-workbench:scan-examples:v1";
const AUTOSAVE_DELAY_MS = 450;
const SCAN_EXAMPLE_FIELDS = ["title", "note", "roleName", "aliases", "summary", "relation", "appearance", "personality", "extra"];
const WORKSPACE_FILE_SAVE_DELAY_MS = 700;
const DEFAULT_SCAN_EXAMPLES = [
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
    aliases: "百花, 异世界杀手, 千杀",
    summary: "{{user}}在她确认主角很弱、准备离开前扫描并锁定的异世界杀手。她来自中世纪剑与魔法异世界，身形小巧可爱，带着轻便暗杀装备和异界旅者的气息。",
    relation: "她误会{{user}}是把她传送来的元凶，短暂敌视和试探；确认{{user}}很弱后决定离开，在离开前被手机扫描。",
    appearance: "小巧可爱的少女体型，动作轻盈隐蔽，衣装带有中世纪剑与魔法世界的皮革护具、短刃和旅行痕迹。",
    personality: "不善言辞，戒备心强，行动比语言更直接；作为杀手习惯先观察威胁，确认无害后迅速撤离。",
    extra: "保持异世界来客、杀手身份、误会与离开前被扫描的时间点；AI建档时可补全她的世界观常识、战斗经验和对现代环境的不适应。"
  },
  {
    title: "作弊模式",
    note: "已填写示例",
    roleName: "中村樱",
    aliases: "樱酱, 中村总裁, Nakamura Sakura",
    summary: "{{user}}看到并锁定的大公司完美女总裁。她32岁，事业、气场和资源都近乎完美，却毫无恋爱经验；看到{{user}}第一眼便认定他是最适合承接她自毁愿望的天选之人，会主动提供大额资金与资源支持。",
    relation: "她有一位名叫神宫寺莲的未婚夫，对方是家世、学历、品格、事业能力和外貌都无可挑剔的精英青年；两人感情很好，外界看来是理想婚约，但一直停留在柏拉图式恋爱，亲密关系干净、温柔、克制。正因现实关系太完美、太安全，她把无法说出口的自毁欲和被弄乱的渴望投向{{user}}。面对{{user}}时会刻意装可爱撒娇，自称“樱酱”，用成熟女人的资源和权力包裹出黏人、讨好、求夸奖的姿态。",
    appearance: "32岁但保养极好，五官精致，眼神沉静锐利，长发、香水和高级珠宝都控制得恰到好处。平时是性感沉稳的女总裁，西装裙、高跟鞋、黑色丝袜、贴身衬衫和昂贵外套让她像不可接近的成功女性；在{{user}}面前会故意放软嗓音、眨眼、歪头、拉近距离，把成熟身体和幼稚撒娇感混在一起。",
    personality: "公开场合冷静、强势、克制，判断力和执行力极强；私下隐藏的痴女属性非常夸张，会把被{{user}}注视、命令、利用都理解成特殊恩宠。她明知自己是成熟成年人和大公司掌权者，却会在{{user}}面前故意降格成黏人的“樱酱”，索要夸奖、撒娇讨好、主动献上金钱和便利，越是被{{user}}轻视或随意驱使，越觉得自己被选中。",
    extra: "作为“作弊模式”示例，她可以提供远超普通学生角色的资金、渠道、场地和社会资源支持。AI建档时保留：成年人身份、完美女总裁、稳定未婚关系、未婚夫神宫寺莲是无可挑剔的精英青年、柏拉图式恋爱、隐藏且夸张的痴女属性、自毁愿望、对{{user}}装可爱撒娇、自称樱酱、持续大额资金支持；不要把未婚夫写成感情破裂或恶劣关系，他和她感情很好，只是亲密关系长期克制。"
  }
];
const DEFAULT_PREVIEW_ROLES = {
  "西园寺爱丽莎": {
    "好感度": 0,
    "警戒度": 0,
    "服从度": 0,
    "性欲": 0,
    "快感值": 0,
    "外观": "金色双马尾与宝蓝色上挑猫眼，校服被精心私改，短裙、黑色过膝袜和强烈存在感让她像班级中心的女王。",
    "心理": "正沉浸在班级中心的优越感里，几乎没把{{user}}放进视野，注意力更多在阿宅和周围女生的反应上。",
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
    "外观": "黑色长发自然垂落，制服穿得一丝不苟，黑色连裤袜与端庄站姿带出清冷、守规矩的气质。",
    "心理": "正想着把讲义和班务处理妥当，对{{user}}保持礼貌但没有私人兴趣，只想让课堂秩序继续平稳。",
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
    "外观": "小麦色肌肤、黑色短发低马尾，个子娇小但运动感强，校服常穿得松散，动作充满田径部王牌的活力。",
    "心理": "正惦记炒面面包和田径部训练，把{{user}}当成可以随手打闹的熟人，没太在意自己的距离感。",
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

let autosaveTimer = null;
let workspaceFileSaveTimer = null;
let workspaceFileSaveInFlight = null;
let workspaceFileSaveQueued = false;

const state = {
  cardState: null,
  savedCards: [],
  activeView: "overview",
  selectedBookEntry: 0,
  selectedRegex: 0,
  selectedVarGroup: "policy",
  search: "",
  frontendMode: "local",
  frontendLocalUrlDraft: LOCAL_FRONTEND_URL,
  frontendRenderNonce: 0,
  frontendRemoteStrategy: "inline",
  frontendRemote: {
    url: "",
    status: "idle",
    html: "",
    error: ""
  },
  frontendHtmlDraft: "",
  frontendUrlDraft: "",
  rawJsonDraft: "",
  phone: createDefaultPhoneState(),
  scanExamples: createDefaultScanExamples(),
  selectedScanExample: 0,
  workspaceFileStatus: "idle",
  workspaceFileError: "",
  lastSavedAt: 0,
  message: "",
  error: "",
  dirty: false
};

const views = [
  ["overview", "总览"],
  ["profile", "角色"],
  ["worldbook", "世界书"],
  ["regex", "正则"],
  ["variables", "变量"],
  ["scanExamples", "示例人物"],
  ["frontend", "前端预览"],
  ["raw", "Raw JSON"]
];

const app = document.querySelector("#app");

function setMessage(message, isError = false) {
  state.message = isError ? "" : message;
  state.error = isError ? message : "";
  render();
}

function setDirty(value = true) {
  state.dirty = value;
}

function markDirtyAndAutosave() {
  setDirty(true);
  scheduleAutosave();
}

function data() {
  if (!state.cardState) return {};
  return getCardData(state.cardState.card);
}

function regexScripts() {
  return data().extensions?.regex_scripts || [];
}

function bookEntries() {
  return data().character_book?.entries || [];
}

function updateCard(mutator) {
  if (!state.cardState) return;
  ensureCardShape(state.cardState.card);
  mutator(state.cardState.card, getCardData(state.cardState.card));
  syncLegacyTopLevel();
  syncRawJsonDraft();
  markDirtyAndAutosave();
  render();
}

function syncRawJsonDraft() {
  if (!state.cardState) return;
  state.rawJsonDraft = JSON.stringify(state.cardState.card, null, 2);
}

function syncLegacyTopLevel() {
  const card = state.cardState?.card;
  if (!card?.data) return;
  for (const key of ["name", "description", "personality", "scenario", "first_mes", "mes_example", "tags"]) {
    if (key in card.data) card[key] = cloneCard(card.data[key]);
  }
}

function workspacePayload() {
  syncPhoneToCard();
  const savedAt = Date.now();
  const payload = {
    savedAt,
    phoneState: state.phone,
    scanExamples: normalizeScanExamples(state.scanExamples),
    savedCards: state.savedCards,
    current: state.cardState
      ? {
          id: state.cardState.id,
          fileName: state.cardState.fileName,
          importedAt: state.cardState.importedAt,
          updatedAt: savedAt,
          card: state.cardState.card,
          metadata: state.cardState.metadata
        }
      : null
  };
  return payload;
}

function persistWorkspace({ markClean = false, writeFiles = true } = {}) {
  const payload = workspacePayload();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  state.lastSavedAt = payload.savedAt;
  if (markClean) setDirty(false);
  if (writeFiles) scheduleWorkspaceFileSave();
}

function scheduleAutosave() {
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => {
    try {
      persistWorkspace({ markClean: true });
    } catch (error) {
      console.warn(error);
    }
  }, AUTOSAVE_DELAY_MS);
}

function scheduleWorkspaceFileSave() {
  window.clearTimeout(workspaceFileSaveTimer);
  workspaceFileSaveTimer = window.setTimeout(() => {
    void saveWorkspaceFiles();
  }, WORKSPACE_FILE_SAVE_DELAY_MS);
}

async function writeWorkspaceFilesOnce() {
  if (!state.cardState?.card || !state.cardState?.imageBuffer) {
    return { ok: false, skipped: true, error: "当前卡没有可写回的 PNG 底图。" };
  }

  syncPhoneToCard();
  const pngBytes = buildCardPngBytes(state.cardState);
  state.workspaceFileStatus = "saving";
  state.workspaceFileError = "";

  const pngResponse = await fetch(WORKSPACE_PNG_SAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: pngBytes
  });
  if (!pngResponse.ok) {
    const text = await pngResponse.text().catch(() => "");
    throw new Error(text || `PNG 写回失败：${pngResponse.status}`);
  }

  const jsonResponse = await fetch(WORKSPACE_JSON_SAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state.cardState.card)
  });
  if (!jsonResponse.ok) {
    const text = await jsonResponse.text().catch(() => "");
    throw new Error(text || `JSON 快照写回失败：${jsonResponse.status}`);
  }

  state.cardState.imageBuffer = pngBytes.buffer.slice(pngBytes.byteOffset, pngBytes.byteOffset + pngBytes.byteLength);
  state.workspaceFileStatus = "saved";
  state.workspaceFileError = "";
  return { ok: true };
}

async function saveWorkspaceFiles({ showMessage = false } = {}) {
  workspaceFileSaveQueued = true;
  if (!workspaceFileSaveInFlight) {
    workspaceFileSaveInFlight = (async () => {
      let result = { ok: true };
      while (workspaceFileSaveQueued) {
        workspaceFileSaveQueued = false;
        try {
          result = await writeWorkspaceFilesOnce();
        } catch (error) {
          state.workspaceFileStatus = "error";
          state.workspaceFileError = error.message;
          console.warn(error);
          result = { ok: false, error: error.message };
        }
      }
      return result;
    })().finally(() => {
      workspaceFileSaveInFlight = null;
    });
  }

  const result = await workspaceFileSaveInFlight;
  if (showMessage) {
    if (result.ok) setMessage("已保存，并已写回工作区固定 PNG。");
    else setMessage(`已保存到浏览器本地，但工作区 PNG 写回失败：${result.error}`, true);
  }
  return result;
}

function saveWorkspace() {
  persistWorkspace({ markClean: true, writeFiles: false });
  setMessage("已保存到浏览器本地，正在写回工作区 PNG。");
  void saveWorkspaceFiles({ showMessage: true });
}

function loadWorkspace() {
  const text = localStorage.getItem(STORAGE_KEY);
  if (!text) return;
  try {
    const payload = JSON.parse(text);
    state.savedCards = Array.isArray(payload.savedCards) ? payload.savedCards : [];
    if (payload.current?.card) {
      state.cardState = {
        ...payload.current,
        imageBuffer: null
      };
      ensureCardShape(state.cardState.card);
      state.rawJsonDraft = JSON.stringify(state.cardState.card, null, 2);
      hydrateFrontendDraft();
    }
    state.phone = normalizePhoneState(payload.phoneState || getPhoneStateFromCard(state.cardState?.card));
    state.scanExamples = normalizeScanExamples(payload.scanExamples || getScanExamplesFromCard(state.cardState?.card) || readScanExamplesForPreview());
    persistScanExamplesForPreview();
    state.lastSavedAt = Number(payload.savedAt || payload.current?.updatedAt || 0);
  } catch (error) {
    console.warn(error);
  }
}

async function loadSampleCard() {
  try {
    const cardState = await parseCharacterCardFromUrl(SAMPLE_CARD_URL);
    setLoadedCard(cardState);
    setMessage("工作区角色卡已加载。");
  } catch (error) {
    setMessage(`工作区角色卡加载失败：${error.message}`, true);
  }
}

function setLoadedCard(cardState) {
  ensureCardShape(cardState.card);
  state.cardState = cardState;
  state.phone = normalizePhoneState(getPhoneStateFromCard(cardState.card));
  state.scanExamples = mergeScanExamples(
    getScanExamplesFromCard(cardState.card),
    readSavedScanExamples() || readScanExamplesForPreview()
  );
  persistScanExamplesForPreview();
  state.activeView = "overview";
  state.selectedScanExample = 0;
  state.selectedBookEntry = 0;
  state.selectedRegex = findFrontendRegexIndex();
  state.rawJsonDraft = JSON.stringify(cardState.card, null, 2);
  hydrateFrontendDraft();
  setDirty(false);
  persistWorkspace({ markClean: true });
  render();
}

function addCurrentToLibrary() {
  if (!state.cardState) return;
  syncPhoneToCard();
  const saved = {
    id: state.cardState.id,
    fileName: state.cardState.fileName,
    importedAt: Date.now(),
    name: data().name || state.cardState.card.name || "未命名",
    card: cloneCard(state.cardState.card),
    metadata: state.cardState.metadata
  };
  const idx = state.savedCards.findIndex((item) => item.id === saved.id);
  if (idx >= 0) state.savedCards[idx] = saved;
  else state.savedCards.unshift(saved);
  saveWorkspace();
}

function loadSavedCard(id) {
  const saved = state.savedCards.find((item) => item.id === id);
  if (!saved) return;
  setLoadedCard({
    ...saved,
    imageBuffer: null,
    card: cloneCard(saved.card)
  });
  setMessage("已从本地库加载。");
}

function deleteSavedCard(id) {
  state.savedCards = state.savedCards.filter((item) => item.id !== id);
  saveWorkspace();
}

function syncPhoneToCard() {
  if (!state.cardState?.card?.data) return;
  const d = getCardData(state.cardState.card);
  d.extensions ||= {};
  d.extensions.workbench ||= {};
  d.extensions.workbench.phoneState = cloneCard(state.phone);
  d.extensions.workbench.phoneStateUpdatedAt = new Date().toISOString();
  d.extensions.workbench.scanExamples = normalizeScanExamples(state.scanExamples);
  d.extensions.workbench.scanExamplesUpdatedAt = new Date().toISOString();
  persistScanExamplesForPreview();
}

function getPhoneStateFromCard(card) {
  return card?.data?.extensions?.workbench?.phoneState || null;
}

function getScanExamplesFromCard(card) {
  return card?.data?.extensions?.workbench?.scanExamples || null;
}

function createDefaultScanExamples() {
  return DEFAULT_SCAN_EXAMPLES.map((example) => ({ ...example }));
}

function normalizeScanExample(example, index = 0) {
  const fallback = DEFAULT_SCAN_EXAMPLES[index] || DEFAULT_SCAN_EXAMPLES[0] || {};
  const source = example && typeof example === "object" ? example : {};
  const next = {};
  for (const key of SCAN_EXAMPLE_FIELDS) {
    next[key] = String(source[key] ?? fallback[key] ?? "");
  }
  return next;
}

function normalizeScanExamples(input) {
  const source = Array.isArray(input) ? input : [];
  return DEFAULT_SCAN_EXAMPLES.map((_, index) => normalizeScanExample(source[index], index));
}

function hasCustomScanExampleContent(example) {
  if (!example || typeof example !== "object") return false;
  return ["roleName", "aliases", "summary", "relation", "appearance", "personality", "extra"].some((key) => String(example[key] || "").trim());
}

function mergeScanExamples(cardExamples, savedExamples) {
  const card = normalizeScanExamples(cardExamples);
  const saved = Array.isArray(savedExamples) ? normalizeScanExamples(savedExamples) : null;
  if (!saved) return card;
  return card.map((example, index) => (hasCustomScanExampleContent(saved[index]) ? saved[index] : example));
}

function readScanExamplesForPreview() {
  try {
    const text = localStorage.getItem(SCAN_EXAMPLES_STORAGE_KEY);
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    return normalizeScanExamples(parsed);
  } catch {
    return null;
  }
}

function readSavedScanExamples() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    const payload = JSON.parse(text);
    if (!Array.isArray(payload?.scanExamples)) return null;
    return normalizeScanExamples(payload.scanExamples);
  } catch {
    return null;
  }
}

function persistScanExamplesForPreview() {
  try {
    localStorage.setItem(SCAN_EXAMPLES_STORAGE_KEY, JSON.stringify(normalizeScanExamples(state.scanExamples)));
  } catch (error) {
    console.warn(error);
  }
}

function findFrontendRegexIndex() {
  const scripts = regexScripts();
  const index = scripts.findIndex((script) => /前端|主仓库|测试用|匿名版/.test(script.scriptName || ""));
  return Math.max(0, index);
}

function hydrateFrontendDraft() {
  const script = regexScripts()[state.selectedRegex] || {};
  state.frontendHtmlDraft = stripCodeFence(script.replaceString || "");
  state.frontendUrlDraft = detectUrls(script.replaceString || "")[0] || "";
}

function stripCodeFence(text) {
  const trimmed = String(text || "").trim();
  const match = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1] : trimmed;
}

function detectUrls(text) {
  return [...String(text || "").matchAll(/https?:\/\/[^\s"'<>）)]+/g)].map((match) => match[0]);
}

function normalizeLocalFrontendUrl(value) {
  const raw = String(value || "").trim() || LOCAL_FRONTEND_URL;
  if (/^(?:https?:|data:|blob:|about:)/i.test(raw)) return raw;
  if (raw.startsWith("./public/")) return raw.replace(/^\.\//, "/");
  if (raw.startsWith("public/")) return `/${raw}`;
  return raw;
}

function isLocalhostFrontendUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    const url = new URL(raw, window.location.href);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function effectiveRemoteStrategy(url) {
  return isLocalhostFrontendUrl(url) ? "direct" : state.frontendRemoteStrategy;
}

function withPreviewReloadParam(url) {
  const normalized = normalizeLocalFrontendUrl(url);
  if (!state.frontendRenderNonce) return normalized;
  if (/^(?:data:|blob:|about:)/i.test(normalized)) return normalized;
  return `${normalized}${normalized.includes("?") ? "&" : "?"}previewReload=${state.frontendRenderNonce}`;
}

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

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultPhoneState() {
  const announcementId = makeId("thread");
  return {
    activeApp: "mchan",
    currentOperation: "无",
    inventory: {
      selectedItemId: "item-phone",
      items: [
        { id: "item-phone", name: "手机", quantity: 1, note: "统一前端载体，用于查看库存、日历和匿名版。" }
      ]
    },
    calendar: {
      date: "4月9日 星期三",
      time: "12:00",
      events: [
        { id: "event-start", title: "开学式后一天", time: "12:00", note: "初始剧情日，当前为午休。" }
      ]
    },
    mchan: {
      selectedBoardId: "announcements",
      selectedThreadId: "",
      search: "",
      boards: [
        {
          id: "announcements",
          name: "公告区",
          description: "规则、警示和系统公告",
          threads: [
            {
              id: announcementId,
              title: "置顶：匿名版使用说明",
              body: "这里是手机内置的静态匿名论坛模块。开发前端只负责只读展示，点击帖子进入详情，不提供发帖、回帖、编辑或删除。",
              author: "system",
              createdAt: Date.now(),
              updatedAt: Date.now(),
              replies: [
                { id: makeId("reply"), author: "system", body: "匿名版不再维护变量状态；需要剧情引用时由 AI 在正文中自然处理。", createdAt: Date.now() }
              ]
            }
          ]
        },
        { id: "guide", name: "新手引导区", description: "教程、问答、低风险操作", threads: [] },
        { id: "general", name: "综合讨论区", description: "传闻、闲聊、经验分享", threads: [] },
        { id: "showcase", name: "成果展示区", description: "由剧情决定是否出现内容", threads: [] },
        { id: "help", name: "求助区", description: "求助、委托、反馈", threads: [] }
      ]
    }
  };
}

function normalizePhoneState(input) {
  const fallback = createDefaultPhoneState();
  const source = input && typeof input === "object" ? input : {};
  const phone = {
    ...fallback,
    ...source,
    inventory: { ...fallback.inventory, ...(source.inventory || {}) },
    calendar: { ...fallback.calendar, ...(source.calendar || {}) },
    mchan: { ...fallback.mchan, ...(source.mchan || {}) }
  };
  phone.inventory.items = Array.isArray(phone.inventory.items) ? phone.inventory.items : fallback.inventory.items;
  phone.calendar.events = Array.isArray(phone.calendar.events) ? phone.calendar.events : fallback.calendar.events;
  phone.mchan.boards = Array.isArray(phone.mchan.boards) && phone.mchan.boards.length ? phone.mchan.boards : fallback.mchan.boards;
  for (const board of phone.mchan.boards) {
    board.id ||= makeId("board");
    board.name ||= "未命名版块";
    board.description ||= "";
    board.threads = Array.isArray(board.threads) ? board.threads : [];
    for (const thread of board.threads) {
      thread.id ||= makeId("thread");
      thread.title ||= "未命名主题";
      thread.body ||= "";
      thread.author ||= "anonymous";
      thread.createdAt ||= Date.now();
      thread.updatedAt ||= thread.createdAt;
      thread.replies = Array.isArray(thread.replies) ? thread.replies : [];
      for (const reply of thread.replies) {
        reply.id ||= makeId("reply");
        reply.author ||= "anonymous";
        reply.body ||= "";
        reply.createdAt ||= Date.now();
      }
    }
  }
  if (!phone.mchan.boards.some((board) => board.id === phone.mchan.selectedBoardId)) {
    phone.mchan.selectedBoardId = phone.mchan.boards[0]?.id || "";
  }
  const board = phone.mchan.boards.find((item) => item.id === phone.mchan.selectedBoardId);
  if (board && !board.threads.some((thread) => thread.id === phone.mchan.selectedThreadId)) {
    phone.mchan.selectedThreadId = board.threads[0]?.id || "";
  }
  if (!phone.inventory.items.some((item) => item.id === phone.inventory.selectedItemId)) {
    phone.inventory.selectedItemId = phone.inventory.items[0]?.id || "";
  }
  phone.currentOperation ||= "无";
  phone.activeApp ||= "mchan";
  phone.mchan.search ||= "";
  return phone;
}

function resetStaticMchanWorkbenchState() {
  const fallback = createDefaultPhoneState();
  state.phone = normalizePhoneState({
    ...state.phone,
    currentOperation: "无",
    mchan: fallback.mchan
  });
  syncPhoneToCard();
}

function updatePhone(mutator) {
  mutator(state.phone);
  state.phone = normalizePhoneState(state.phone);
  markDirtyAndAutosave();
  render();
}

function selectedMchanBoard() {
  return state.phone.mchan.boards.find((board) => board.id === state.phone.mchan.selectedBoardId) || state.phone.mchan.boards[0];
}

function selectedMchanThread() {
  const board = selectedMchanBoard();
  return board?.threads.find((thread) => thread.id === state.phone.mchan.selectedThreadId) || board?.threads[0] || null;
}

function selectedInventoryItem() {
  return state.phone.inventory.items.find((item) => item.id === state.phone.inventory.selectedItemId) || state.phone.inventory.items[0] || null;
}

function formatTimestamp(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function field(path, value, options = {}) {
  const textarea = options.textarea ?? String(value ?? "").length > 120;
  const label = options.label || path;
  const placeholder = options.placeholder || "";
  if (textarea) {
    return `
      <label class="field ${options.wide ? "field-wide" : ""}">
        <span>${htmlEscape(label)}</span>
        <textarea data-path="${attr(path)}" rows="${options.rows || 6}" placeholder="${attr(placeholder)}">${htmlEscape(value ?? "")}</textarea>
      </label>
    `;
  }
  return `
    <label class="field ${options.wide ? "field-wide" : ""}">
      <span>${htmlEscape(label)}</span>
      <input data-path="${attr(path)}" value="${attr(value ?? "")}" placeholder="${attr(placeholder)}" />
    </label>
  `;
}

function checkbox(path, value, label) {
  return `
    <label class="check">
      <input type="checkbox" data-path="${attr(path)}" ${value ? "checked" : ""} />
      <span>${htmlEscape(label)}</span>
    </label>
  `;
}

function selectField(path, value, label, options) {
  return `
    <label class="field">
      <span>${htmlEscape(label)}</span>
      <select data-path="${attr(path)}">
        ${options.map(([key, text]) => `<option value="${attr(key)}" ${String(value) === String(key) ? "selected" : ""}>${htmlEscape(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let node = target;
  while (parts.length > 1) {
    const part = parts.shift();
    if (node[part] == null || typeof node[part] !== "object") node[part] = {};
    node = node[part];
  }
  node[parts[0]] = value;
}

function getByPath(target, path) {
  return path.split(".").reduce((node, part) => node?.[part], target);
}

function normalizeInputValue(el) {
  if (el.type === "checkbox") return el.checked;
  if (el.dataset.type === "number") return Number(el.value || 0);
  if (el.dataset.type === "list") return el.value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
  return el.value;
}

function render() {
  app.innerHTML = `
    <main class="shell">
      ${renderSidebar()}
      <section class="workspace">
        ${renderTopbar()}
        ${renderNotice()}
        ${state.cardState ? renderActiveView() : renderEmptyState()}
      </section>
    </main>
  `;
  bindEvents();
  afterRenderEffects();
}

function renderSidebar() {
  const currentName = data().name || state.cardState?.card?.name || "未加载";
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="mark">ST</div>
        <div>
          <h1>Card Workbench</h1>
          <p>${htmlEscape(currentName)}</p>
        </div>
      </div>
      <div class="load-panel">
        <input id="file-input" type="file" accept="image/png,.json" hidden />
        <button class="primary" data-action="choose-file">加载 PNG / JSON</button>
        <button data-action="load-sample">加载工作区卡</button>
      </div>
      <nav class="nav">
        ${views.map(([key, text]) => `<button class="${state.activeView === key ? "active" : ""}" data-view="${key}">${htmlEscape(text)}</button>`).join("")}
      </nav>
      <div class="library">
        <div class="library-head">
          <strong>本地库</strong>
          <button class="icon" title="保存当前卡" data-action="save-library">+</button>
        </div>
        <div class="saved-list">
          ${
            state.savedCards.length
              ? state.savedCards.map((item) => `
                <div class="saved-item">
                  <button data-action="load-saved" data-id="${attr(item.id)}">${htmlEscape(item.name)}</button>
                  <button class="icon danger" title="删除" data-action="delete-saved" data-id="${attr(item.id)}">x</button>
                </div>
              `).join("")
              : `<p class="muted">还没有保存的卡。</p>`
          }
        </div>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const meta = state.cardState?.metadata;
  return `
    <header class="topbar">
      <div>
        <span class="eyebrow">${state.cardState ? htmlEscape(state.cardState.fileName) : "未加载"}</span>
        <h2>${htmlEscape(data().name || state.cardState?.card?.name || "角色卡可视化工作台")}</h2>
      </div>
      <div class="actions">
        ${state.lastSavedAt ? `<span class="autosaved">本地 ${htmlEscape(formatTimestamp(state.lastSavedAt))}</span>` : ""}
        ${state.dirty ? `<span class="dirty">有未导出修改</span>` : ""}
        <button data-action="save-local">保存</button>
        <button data-action="export-json">导出 JSON</button>
        <button data-action="export-png" ${state.cardState?.imageBuffer ? "" : "disabled"}>导出 PNG</button>
      </div>
      ${meta ? `<div class="meta-strip">
        <span>${meta.hasChara ? "chara" : "无 chara"}</span>
        <span>${meta.hasCcv3 ? "ccv3" : "无 ccv3"}</span>
        <span>${meta.charaEqualsCcv3 ? "两份一致" : "两份不一致"}</span>
        <span>${bookEntries().length} 世界书条目</span>
        <span>${regexScripts().length} 正则</span>
      </div>` : ""}
    </header>
  `;
}

function renderNotice() {
  if (!state.message && !state.error) return "";
  return `<div class="notice ${state.error ? "error" : ""}">${htmlEscape(state.error || state.message)}</div>`;
}

function renderEmptyState() {
  return `
    <section class="empty">
      <h2>加载一张 SillyTavern PNG 角色卡开始。</h2>
      <p>这里会解析 PNG 里的 chara / ccv3 元数据，拆出角色字段、世界书、正则脚本、变量规则和前端加载片段。所有编辑都先保存在浏览器本地，确认后再导出 JSON 或 PNG。</p>
      <div class="empty-actions">
        <button class="primary" data-action="choose-file">加载文件</button>
        <button data-action="load-sample">打开示例</button>
      </div>
    </section>
  `;
}

function renderActiveView() {
  switch (state.activeView) {
    case "profile":
      return renderProfile();
    case "worldbook":
      return renderWorldbook();
    case "regex":
      return renderRegex();
    case "variables":
      return renderVariables();
    case "scanExamples":
      return renderScanExamples();
    case "phone":
      return renderPhone();
    case "frontend":
      return renderFrontend();
    case "raw":
      return renderRaw();
    default:
      return renderOverview();
  }
}

function renderOverview() {
  const d = data();
  const scripts = regexScripts();
  const entries = bookEntries();
  const enabledEntries = entries.filter((entry) => entry.enabled !== false).length;
  const enabledRegex = scripts.filter((script) => !script.disabled).length;
  return `
    <section class="dashboard">
      <div class="stat-grid">
        <div class="stat"><span>世界书</span><strong>${entries.length}</strong><small>${enabledEntries} enabled</small></div>
        <div class="stat"><span>正则脚本</span><strong>${scripts.length}</strong><small>${enabledRegex} enabled</small></div>
        <div class="stat"><span>规格</span><strong>${htmlEscape(state.cardState.card.spec || "unknown")}</strong><small>${htmlEscape(state.cardState.card.spec_version || "")}</small></div>
        <div class="stat"><span>变量策略</span><strong>AI</strong><small>front-end read-only</small></div>
      </div>
      <div class="two-col">
        <section class="panel">
          <h3>角色信息</h3>
          <div class="read-list">
            <div><span>名称</span><strong>${htmlEscape(d.name || "")}</strong></div>
            <div><span>创建者</span><strong>${htmlEscape(d.creator || "未填写")}</strong></div>
            <div><span>版本</span><strong>${htmlEscape(d.character_version || "未填写")}</strong></div>
            <div><span>标签</span><strong>${htmlEscape((d.tags || []).join(", ") || "无")}</strong></div>
          </div>
        </section>
        <section class="panel">
          <h3>前端入口</h3>
          ${renderDetectedFrontendLinks()}
        </section>
      </div>
      <section class="panel">
        <h3>AI 变量接管建议</h3>
        <p class="body-copy">当前工作台把变量视为模型输出的状态层：前端负责展示和提交用户意图，不直接改最终变量。你可以在“变量”页编辑策略文本，并在“世界书”或“正则”里把前端写变量的说明改成只读展示。</p>
      </section>
    </section>
  `;
}

function renderDetectedFrontendLinks() {
  const links = regexScripts().flatMap((script) =>
    detectUrls(script.replaceString).map((url) => ({ url, name: script.scriptName || "未命名" }))
  );
  if (!links.length) return `<p class="muted">没有检测到远程 URL。</p>`;
  return `<div class="link-list">${links.map((link) => `
    <button data-action="preview-url" data-url="${attr(link.url)}">
      <span>${htmlEscape(link.name)}</span>
      <small>${htmlEscape(link.url)}</small>
    </button>
  `).join("")}</div>`;
}

function renderProfile() {
  const d = data();
  return `
    <section class="panel form-panel">
      <h3>角色字段</h3>
      <div class="form-grid">
        ${field("data.name", d.name, { label: "名称" })}
        ${field("data.creator", d.creator, { label: "作者" })}
        ${field("data.character_version", d.character_version, { label: "版本" })}
        ${field("data.tags", (d.tags || []).join(", "), { label: "标签", placeholder: "逗号分隔" })}
        ${field("data.description", d.description, { label: "描述", textarea: true, rows: 8, wide: true })}
        ${field("data.personality", d.personality, { label: "性格", textarea: true, rows: 5, wide: true })}
        ${field("data.scenario", d.scenario, { label: "场景", textarea: true, rows: 5, wide: true })}
        ${field("data.first_mes", d.first_mes, { label: "开场白", textarea: true, rows: 8, wide: true })}
        ${field("data.creator_notes", d.creator_notes, { label: "作者注释", textarea: true, rows: 6, wide: true })}
        ${field("data.system_prompt", d.system_prompt, { label: "系统提示", textarea: true, rows: 6, wide: true })}
        ${field("data.post_history_instructions", d.post_history_instructions, { label: "历史后提示", textarea: true, rows: 6, wide: true })}
      </div>
    </section>
  `;
}

function filteredEntries() {
  const query = state.search.trim().toLowerCase();
  return bookEntries().map((entry, index) => ({ entry, index })).filter(({ entry }) => {
    if (!query) return true;
    return [entry.comment, entry.content, ...(entry.keys || [])].join("\n").toLowerCase().includes(query);
  });
}

function renderWorldbook() {
  const d = data();
  const entries = bookEntries();
  const filtered = entries.map((entry, index) => ({ entry, index }));
  const selected = entries[state.selectedBookEntry] || entries[0];
  return `
    <section class="split-view">
      <aside class="list-pane">
        <div class="pane-head">
          <h3>${htmlEscape(d.character_book?.name || "世界书")}</h3>
          <button data-action="add-book-entry">新增</button>
        </div>
        <input class="search" data-action="search" value="${attr(state.search)}" placeholder="搜索 key / 注释 / 内容" />
        <div class="entry-list">
          ${filtered.map(({ entry, index }) => `
            <button class="entry-row ${state.selectedBookEntry === index ? "active" : ""}" data-action="select-book-entry" data-index="${index}" data-search-text="${attr([entry.comment, entry.content, ...(entry.keys || [])].join("\n").toLowerCase())}">
              <span>${htmlEscape(entry.comment || `Entry ${index + 1}`)}</span>
              <small>${htmlEscape((entry.keys || []).slice(0, 4).join(", ") || "constant")}</small>
            </button>
          `).join("") || `<p class="muted">没有匹配条目。</p>`}
        </div>
      </aside>
      <section class="detail-pane">
        ${selected ? renderBookEntryEditor(selected, state.selectedBookEntry) : `<div class="empty-inline">世界书为空。</div>`}
      </section>
    </section>
  `;
}

function renderBookEntryEditor(entry, index) {
  const ext = entry.extensions || {};
  return `
    <div class="detail-head">
      <div>
        <span class="eyebrow">Entry ${index + 1}</span>
        <h3>${htmlEscape(entry.comment || "未命名条目")}</h3>
      </div>
      <div class="actions">
        <button data-action="duplicate-book-entry" data-index="${index}">复制</button>
        <button class="danger" data-action="delete-book-entry" data-index="${index}">删除</button>
      </div>
    </div>
    <div class="form-grid">
      ${field(`book.${index}.comment`, entry.comment, { label: "注释" })}
      ${field(`book.${index}.insertion_order`, entry.insertion_order, { label: "插入顺序" })}
      ${selectField(`book.${index}.position`, entry.position, "位置", [["before_char", "before_char"], ["after_char", "after_char"], ["at_depth", "at_depth"]])}
      ${field(`book.${index}.extensions.depth`, ext.depth ?? 0, { label: "深度" })}
      ${checkbox(`book.${index}.enabled`, entry.enabled !== false, "启用")}
      ${checkbox(`book.${index}.constant`, Boolean(entry.constant), "常驻")}
      ${checkbox(`book.${index}.selective`, Boolean(entry.selective), "选择性触发")}
      ${checkbox(`book.${index}.use_regex`, Boolean(entry.use_regex), "Key 使用正则")}
      ${field(`book.${index}.keys`, (entry.keys || []).join("\\n"), { label: "主 Key", textarea: true, rows: 4, wide: true })}
      ${field(`book.${index}.secondary_keys`, (entry.secondary_keys || []).join("\\n"), { label: "副 Key", textarea: true, rows: 3, wide: true })}
      ${field(`book.${index}.content`, entry.content, { label: "内容", textarea: true, rows: 15, wide: true })}
    </div>
  `;
}

function renderRegex() {
  const scripts = regexScripts();
  const script = scripts[state.selectedRegex] || scripts[0];
  return `
    <section class="split-view">
      <aside class="list-pane">
        <div class="pane-head">
          <h3>正则脚本</h3>
          <button data-action="add-regex">新增</button>
        </div>
        <div class="entry-list">
          ${scripts.map((item, index) => `
            <button class="entry-row ${state.selectedRegex === index ? "active" : ""}" data-action="select-regex" data-index="${index}">
              <span>${htmlEscape(item.scriptName || `Regex ${index + 1}`)}</span>
              <small>${item.disabled ? "disabled" : "enabled"} · ${(item.placement || []).join(",") || "placement ?"}</small>
            </button>
          `).join("") || `<p class="muted">没有正则脚本。</p>`}
        </div>
      </aside>
      <section class="detail-pane">
        ${script ? renderRegexEditor(script, state.selectedRegex) : `<div class="empty-inline">还没有正则。</div>`}
      </section>
    </section>
  `;
}

function renderRegexEditor(script, index) {
  const urls = detectUrls(script.replaceString || "");
  return `
    <div class="detail-head">
      <div>
        <span class="eyebrow">Regex ${index + 1}</span>
        <h3>${htmlEscape(script.scriptName || "未命名正则")}</h3>
      </div>
      <div class="actions">
        <button data-action="duplicate-regex" data-index="${index}">复制</button>
        <button class="danger" data-action="delete-regex" data-index="${index}">删除</button>
      </div>
    </div>
    <div class="form-grid">
      ${field(`regex.${index}.scriptName`, script.scriptName, { label: "名称" })}
      ${field(`regex.${index}.placement`, (script.placement || []).join(","), { label: "Placement" })}
      ${checkbox(`regex.${index}.disabled`, Boolean(script.disabled), "禁用")}
      ${checkbox(`regex.${index}.markdownOnly`, Boolean(script.markdownOnly), "仅 Markdown")}
      ${checkbox(`regex.${index}.promptOnly`, Boolean(script.promptOnly), "仅 Prompt")}
      ${checkbox(`regex.${index}.runOnEdit`, Boolean(script.runOnEdit), "编辑时运行")}
      ${field(`regex.${index}.findRegex`, script.findRegex, { label: "匹配正则", textarea: true, rows: 4, wide: true })}
      ${field(`regex.${index}.replaceString`, script.replaceString, { label: "替换内容", textarea: true, rows: 12, wide: true })}
    </div>
    <section class="subpanel">
      <h4>检测到的远程入口</h4>
      ${urls.length ? urls.map((url) => `<button data-action="preview-url" data-url="${attr(url)}">${htmlEscape(url)}</button>`).join("") : `<p class="muted">没有 URL。</p>`}
    </section>
    <section class="subpanel regex-test">
      <h4>测试替换</h4>
      <textarea id="regex-test-input" rows="4" placeholder="输入待匹配文本"></textarea>
      <button data-action="run-regex-test" data-index="${index}">运行</button>
      <pre id="regex-test-output"></pre>
    </section>
  `;
}

function renderScanExamples() {
  const examples = normalizeScanExamples(state.scanExamples);
  state.selectedScanExample = Math.max(0, Math.min(state.selectedScanExample, examples.length - 1));
  const selected = examples[state.selectedScanExample] || examples[0];
  return `
    <section class="split-view scan-examples-view">
      <aside class="list-pane">
        <div class="pane-head">
          <h3>静态示例人物</h3>
          <button data-action="reset-scan-examples">重置全部</button>
        </div>
        <p class="muted">这些内容会写入“扫描角色”APP里的静态示例卡片。</p>
        <div class="entry-list">
          ${examples.map((example, index) => `
            <button class="entry-row ${state.selectedScanExample === index ? "active" : ""}" data-action="select-scan-example" data-index="${index}">
              <span>${htmlEscape(example.title || `示例人物 ${index + 1}`)}</span>
              <small>${htmlEscape(example.roleName || example.note || "留空")}</small>
            </button>
          `).join("")}
        </div>
      </aside>
      <section class="detail-pane">
        <div class="detail-head">
          <div>
            <span class="eyebrow">Scan Example ${state.selectedScanExample + 1}</span>
            <h3>${htmlEscape(selected.title || `示例人物 ${state.selectedScanExample + 1}`)}</h3>
          </div>
          <div class="actions">
            <button data-action="save-scan-examples">保存示例</button>
            <button data-action="reset-scan-example" data-index="${state.selectedScanExample}">重置此项</button>
            <button class="primary" data-action="preview-scan-examples">打开前端预览</button>
          </div>
        </div>
        <div class="scan-example-hint">
          修改后会自动保存到角色卡 <code>extensions.workbench.scanExamples</code>，并同步给本地前端预览。预览页刷新后生效。
        </div>
        <div class="form-grid">
          ${scanExampleField(state.selectedScanExample, "title", selected.title, "卡片标题", { placeholder: "例如：教师身份" })}
          ${scanExampleField(state.selectedScanExample, "note", selected.note, "副标题", { placeholder: "例如：已填写示例 / 预留空白" })}
          ${scanExampleField(state.selectedScanExample, "roleName", selected.roleName, "角色名", { placeholder: "例如：白枢暗子" })}
          ${scanExampleField(state.selectedScanExample, "aliases", selected.aliases, "关键词 / 别名", { placeholder: "暗子, 白枢同学" })}
          ${scanExampleField(state.selectedScanExample, "summary", selected.summary, "目标定位 / 身体", { textarea: true, rows: 5, wide: true, placeholder: "{{user}}看到并锁定的目标：她的身体、姿态、服装、所在场景、显著特征" })}
          ${scanExampleField(state.selectedScanExample, "relation", selected.relation, "与主角关系", { textarea: true, rows: 4, wide: true })}
          ${scanExampleField(state.selectedScanExample, "appearance", selected.appearance, "外貌", { textarea: true, rows: 4, wide: true })}
          ${scanExampleField(state.selectedScanExample, "personality", selected.personality, "性格 / 抗性", { textarea: true, rows: 4, wide: true })}
          ${scanExampleField(state.selectedScanExample, "extra", selected.extra, "补充备注", { textarea: true, rows: 4, wide: true })}
        </div>
      </section>
    </section>
  `;
}

function scanExampleField(index, key, value, label, options = {}) {
  const common = `data-scan-example-field="${attr(key)}" data-index="${index}" placeholder="${attr(options.placeholder || "")}"`;
  if (options.textarea) {
    return `
      <label class="field ${options.wide ? "field-wide" : ""}">
        <span>${htmlEscape(label)}</span>
        <textarea ${common} rows="${options.rows || 4}">${htmlEscape(value ?? "")}</textarea>
      </label>
    `;
  }
  return `
    <label class="field ${options.wide ? "field-wide" : ""}">
      <span>${htmlEscape(label)}</span>
      <input ${common} value="${attr(value ?? "")}" />
    </label>
  `;
}

function renderVariables() {
  const groups = extractVariableGroups();
  const group = groups.find((item) => item.id === state.selectedVarGroup) || groups[0];
  return `
    <section class="split-view">
      <aside class="list-pane">
        <div class="pane-head">
          <h3>变量层</h3>
        </div>
        <div class="entry-list">
          ${groups.map((item) => `
            <button class="entry-row ${state.selectedVarGroup === item.id ? "active" : ""}" data-action="select-var-group" data-id="${attr(item.id)}">
              <span>${htmlEscape(item.title)}</span>
              <small>${htmlEscape(item.subtitle)}</small>
            </button>
          `).join("")}
        </div>
      </aside>
      <section class="detail-pane">
        <div class="detail-head">
          <div>
            <span class="eyebrow">AI owns state</span>
            <h3>${htmlEscape(group.title)}</h3>
          </div>
        </div>
        ${renderVariablePolicy()}
        ${group.entry ? renderLinkedBookEntry(group.entry, group.index) : renderVariableInventory(groups)}
      </section>
    </section>
  `;
}

function renderPhone() {
  const apps = [
    ["mchan", "匿名版"],
    ["inventory", "库存"],
    ["calendar", "日历"],
    ["operation", "操作"]
  ];
  return `
    <section class="phone-workbench">
      <aside class="phone-device">
        <div class="phone-shell">
          <div class="phone-status">
            <span>${htmlEscape(state.phone.calendar.time || "08:00")}</span>
            <span>APP</span>
          </div>
          <div class="phone-tabs">
            ${apps.map(([id, label]) => `
              <button class="${state.phone.activeApp === id ? "active" : ""}" data-action="phone-app" data-app="${id}">${htmlEscape(label)}</button>
            `).join("")}
          </div>
          <div class="phone-screen">
            ${state.phone.activeApp === "inventory" ? renderPhoneInventory() : ""}
            ${state.phone.activeApp === "calendar" ? renderPhoneCalendar() : ""}
            ${state.phone.activeApp === "operation" ? renderPhoneOperation() : ""}
            ${state.phone.activeApp === "mchan" ? renderPhoneMchan() : ""}
          </div>
        </div>
      </aside>
      <section class="panel phone-rules">
        <div class="detail-head">
          <div>
            <span class="eyebrow">phone module</span>
            <h3>手机内部模块规则</h3>
          </div>
          <button class="primary" data-action="apply-phone-forum-policy">写入轻量规则</button>
        </div>
        <p class="body-copy">匿名版现在按库存、日历同级的手机内部模块处理，但它是静态只读页面：只展示旧角色卡种子帖，不发帖、不回帖、不写变量。AI 不需要维护匿名版列表状态。</p>
        <pre class="content-preview">${htmlEscape(phoneUpdateExample())}</pre>
      </section>
    </section>
  `;
}

function renderPhoneMchan() {
  const board = selectedMchanBoard();
  const thread = selectedMchanThread();
  const query = state.phone.mchan.search.trim().toLowerCase();
  const threads = (board?.threads || []).filter((item) => {
    if (!query) return true;
    return [item.title, item.body, ...(item.replies || []).map((reply) => reply.body)].join("\n").toLowerCase().includes(query);
  });
  return `
    <section class="mchan-app">
      <header class="phone-app-head">
        <div>
          <span class="eyebrow">MChan</span>
          <h3>匿名版</h3>
        </div>
        <span class="status-pill">静态只读</span>
      </header>
      <div class="mchan-layout">
        <aside class="mchan-boards">
          ${state.phone.mchan.boards.map((item) => `
            <button class="${item.id === board?.id ? "active" : ""}" data-action="mchan-board" data-board-id="${attr(item.id)}">
              <span>${htmlEscape(item.name)}</span>
              <small>${item.threads.length}</small>
            </button>
          `).join("")}
        </aside>
        <section class="mchan-list">
          <div class="mchan-board-title">
            <strong>${htmlEscape(board?.name || "匿名版")}</strong>
            <small>${htmlEscape(board?.description || "")}</small>
          </div>
          <input id="mchan-search" class="search" value="${attr(state.phone.mchan.search)}" placeholder="搜索帖子 / 楼层" />
          <div class="mchan-thread-list">
            ${threads.map((item) => `
              <button class="mchan-thread ${thread?.id === item.id ? "active" : ""}" data-action="mchan-select-thread" data-thread-id="${attr(item.id)}" data-search-text="${attr([item.title, item.body, ...(item.replies || []).map((reply) => reply.body)].join("\n").toLowerCase())}">
                <span>${htmlEscape(item.title)}</span>
                <small>${formatTimestamp(item.updatedAt)} · ${item.replies.length} 楼</small>
              </button>
            `).join("") || `<p class="muted">这个版块还没有帖子。</p>`}
          </div>
        </section>
        <section class="mchan-detail">
          ${thread ? renderMchanThreadDetail(thread) : `<div class="empty-inline">选择一个帖子查看内容。</div>`}
        </section>
      </div>
    </section>
  `;
}

function renderMchanThreadDetail(thread) {
  return `
    <div class="detail-head compact">
      <div>
        <span class="eyebrow">thread</span>
        <h3>${htmlEscape(thread.title || "未命名主题")}</h3>
      </div>
      <button data-action="mchan-back-home">返回首页</button>
    </div>
    <article class="mchan-readonly-post">
      <p>${htmlEscape(thread.body || "暂无正文。")}</p>
    </article>
    <div class="mchan-replies">
      ${(thread.replies || []).map((reply) => `
        <article class="mchan-reply">
          <header>
            <span>${htmlEscape(reply.author || "anonymous")}</span>
            <small>${formatTimestamp(reply.createdAt)}</small>
          </header>
          <p>${htmlEscape(reply.body)}</p>
        </article>
      `).join("") || `<p class="muted">暂无回复。</p>`}
    </div>
  `;
}

function renderPhoneInventory() {
  const item = selectedInventoryItem();
  return `
    <section class="inventory-app">
      <header class="phone-app-head">
        <div>
          <span class="eyebrow">inventory</span>
          <h3>库存</h3>
        </div>
        <button data-action="inventory-add-item">新增物品</button>
      </header>
      <div class="inventory-layout">
        <div class="inventory-list">
          ${state.phone.inventory.items.map((entry) => `
            <button class="${entry.id === item?.id ? "active" : ""}" data-action="inventory-select-item" data-item-id="${attr(entry.id)}">
              <span>${htmlEscape(entry.name)}</span>
              <small>x${htmlEscape(entry.quantity ?? 1)}</small>
            </button>
          `).join("")}
        </div>
        <div class="inventory-detail">
          ${item ? `
            <label class="field"><span>名称</span><input data-phone-field="inventory.item.name" value="${attr(item.name)}" /></label>
            <label class="field"><span>数量</span><input data-phone-field="inventory.item.quantity" data-type="number" value="${attr(item.quantity ?? 1)}" /></label>
            <label class="field field-wide"><span>备注</span><textarea data-phone-field="inventory.item.note" rows="5">${htmlEscape(item.note || "")}</textarea></label>
            <button class="danger" data-action="inventory-delete-item">删除物品</button>
          ` : `<p class="muted">库存为空。</p>`}
        </div>
      </div>
    </section>
  `;
}

function renderPhoneCourseTimetable() {
  const days = [
    ["周一", "现代文", "数学", "英语", "日本史", "体育（田径）", "家庭科"],
    ["周二", "古典", "化学", "数学", "英语", "美术", "班会"],
    ["周三", "英语", "世界史", "生物", "现代文", "体育（游泳）", "信息"],
    ["周四", "数学", "古典", "英语", "化学", "音乐", "保健"],
    ["周五", "现代文", "日本史", "生物", "英语", "体育（球技）", "综合探究"]
  ];
  const periods = [
    ["1限", "08:40-09:30"],
    ["2限", "09:40-10:30"],
    ["3限", "10:40-11:30"],
    ["4限", "11:40-12:30"],
    ["5限", "13:20-14:10"],
    ["6限", "14:20-15:10"]
  ];
  return `
    <section class="course-timetable">
      <div class="course-timetable-head">
        <div>
          <span class="eyebrow">weekly timetable</span>
          <h4>周课表</h4>
        </div>
        <span>普通授课日</span>
      </div>
      <div class="course-grid-scroll">
        <div class="course-grid">
          <div class="course-cell time"><strong>时间</strong><small>课节</small></div>
          ${days.map((day) => `<div class="course-cell day"><strong>${htmlEscape(day[0])}</strong><small>weekday</small></div>`).join("")}
          ${periods.map((period, index) => `
            <div class="course-cell time"><strong>${htmlEscape(period[1])}</strong><small>${htmlEscape(period[0])}</small></div>
            ${days.map((day) => `<div class="course-cell"><strong>${htmlEscape(day[index + 1])}</strong><small>${htmlEscape(period[0])}</small></div>`).join("")}
          `).join("")}
        </div>
      </div>
      <div class="course-rhythm" aria-label="日程节点">
        ${[
          ["朝礼", "08:30", "08:40"],
          ["午休", "12:30", "13:20"],
          ["终礼", "15:10", "15:25"],
          ["清扫", "15:25", "15:40"],
          ["放学", "15:45", "16:00"]
        ].map(([label, start, end]) => `
          <div class="course-rhythm-item">
            <b>${start}</b>
            <span>${label}</span>
            <i>${end}</i>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPhoneCalendar() {
  return `
    <section class="calendar-app">
      <header class="phone-app-head">
        <div>
          <span class="eyebrow">calendar</span>
          <h3>日历</h3>
        </div>
        <button data-action="calendar-add-event">新增日程</button>
      </header>
      <div class="calendar-fields">
        <label class="field"><span>当前日期</span><input data-phone-field="calendar.date" value="${attr(state.phone.calendar.date)}" /></label>
        <label class="field"><span>当前时间</span><input data-phone-field="calendar.time" value="${attr(state.phone.calendar.time)}" /></label>
      </div>
      ${renderPhoneCourseTimetable()}
      <div class="calendar-events">
        ${state.phone.calendar.events.map((event) => `
          <article class="calendar-event">
            <button class="icon danger" data-action="calendar-delete-event" data-event-id="${attr(event.id)}">x</button>
            <label class="field"><span>时间</span><input data-phone-field="calendar.event.time" data-event-id="${attr(event.id)}" value="${attr(event.time)}" /></label>
            <label class="field"><span>标题</span><input data-phone-field="calendar.event.title" data-event-id="${attr(event.id)}" value="${attr(event.title)}" /></label>
            <label class="field field-wide"><span>备注</span><textarea data-phone-field="calendar.event.note" data-event-id="${attr(event.id)}" rows="3">${htmlEscape(event.note || "")}</textarea></label>
          </article>
        `).join("") || `<p class="muted">还没有日程。</p>`}
      </div>
    </section>
  `;
}

function renderPhoneOperation() {
  return `
    <section class="operation-app">
      <header class="phone-app-head">
        <div>
          <span class="eyebrow">operation log</span>
          <h3>本轮 APP 操作</h3>
        </div>
      </header>
      <label class="field field-wide">
        <span>操作意图</span>
        <textarea data-phone-field="operation.current" rows="8">${htmlEscape(state.phone.currentOperation || "无")}</textarea>
      </label>
      <p class="body-copy">这里记录的是用户刚刚在手机界面里的操作意图，会作为输入框中的 &lt;本轮APP操作&gt; 容器发送，不再写入变量。</p>
    </section>
  `;
}

function phoneUpdateExample() {
  return [
    "<update>",
    "系统.当前时间 = 08:10",
    "本轮APP操作 = 输入容器，不进变量",
    "</update>"
  ].join("\n");
}

function extractVariableGroups() {
  const entries = bookEntries()
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => /mvu_update|变量|update/i.test(entry.comment || "") || /stat_data|<update|变量/.test(entry.content || ""));
  return [
    { id: "policy", title: "变量写入策略", subtitle: "前端只读，AI 输出更新" },
    ...entries.map(({ entry, index }) => ({
      id: `entry-${index}`,
      title: entry.comment || `Entry ${index + 1}`,
      subtitle: `${entry.enabled === false ? "disabled" : "enabled"} · ${entry.position || "unknown"}`,
      entry,
      index
    }))
  ];
}

function renderVariablePolicy() {
  return `
    <section class="subpanel">
      <div class="linked-head">
        <h4>推荐策略</h4>
        <div class="actions">
          <button data-action="apply-merged-light-policy">合并匿名版 + 轻量规则</button>
          <button class="primary" data-action="apply-ai-variable-policy">应用 AI 变量接管</button>
        </div>
      </div>
      <div class="policy-grid">
        <label class="check locked"><input type="checkbox" checked disabled /><span>AI 是变量唯一写入源</span></label>
        <label class="check locked"><input type="checkbox" checked disabled /><span>前端只提交用户意图和操作日志</span></label>
        <label class="check locked"><input type="checkbox" checked disabled /><span>变量更新通过 &lt;update&gt; 块解析</span></label>
      </div>
      <p class="body-copy">这会把“前端修改变量”的职责改成“前端展示状态、记录操作、把动作发给模型”。最终变量由 AI 根据世界书规则统一更新，避免前端状态和剧情状态分叉。</p>
    </section>
  `;
}

function renderLinkedBookEntry(entry, index) {
  return `
    <section class="subpanel">
      <div class="linked-head">
        <h4>关联世界书条目</h4>
        <button data-action="jump-book-entry" data-index="${index}">打开编辑</button>
      </div>
      <pre class="content-preview">${htmlEscape(entry.content || "")}</pre>
    </section>
  `;
}

function renderVariableInventory(groups) {
  return `
    <section class="subpanel">
      <h4>检测到的变量条目</h4>
      <div class="table">
        ${groups.filter((item) => item.entry).map((item) => `
          <button data-action="select-var-group" data-id="${attr(item.id)}">
            <span>${htmlEscape(item.title)}</span>
            <span>${htmlEscape((item.entry.keys || []).join(", ") || "constant")}</span>
            <span>${item.entry.enabled === false ? "disabled" : "enabled"}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFrontend() {
  const scripts = regexScripts();
  const current = scripts[state.selectedRegex] || {};
  const urls = detectUrls(current.replaceString || "");
  const localUrl = normalizeLocalFrontendUrl(state.frontendLocalUrlDraft || LOCAL_FRONTEND_URL);
  const localFrameUrl = withPreviewReloadParam(localUrl);
  const remoteUrl = state.frontendUrlDraft || urls[0] || "";
  const remoteStrategy = effectiveRemoteStrategy(remoteUrl);
  const remoteReady = state.frontendRemote.status === "ready" && state.frontendRemote.url === remoteUrl;
  const remoteLoading = state.frontendRemote.status === "loading" && state.frontendRemote.url === remoteUrl;
  const remoteError = state.frontendRemote.status === "error" && state.frontendRemote.url === remoteUrl;
  const remoteHtml = remoteReady ? state.frontendRemote.html : renderPreviewPlaceholder(remoteLoading, remoteError, state.frontendRemote.error);
  return `
    <section class="frontend-view">
      <div class="frontend-controls">
        <div class="segmented">
          <button class="${state.frontendMode === "local" ? "active" : ""}" data-action="frontend-mode" data-mode="local">本地</button>
          <button class="${state.frontendMode === "remote" ? "active" : ""}" data-action="frontend-mode" data-mode="remote">远程</button>
          <button class="${state.frontendMode === "srcdoc" ? "active" : ""}" data-action="frontend-mode" data-mode="srcdoc">HTML</button>
        </div>
        <select data-action="frontend-regex-select">
          ${scripts.map((script, index) => `<option value="${index}" ${index === state.selectedRegex ? "selected" : ""}>${htmlEscape(script.scriptName || `Regex ${index + 1}`)}</option>`).join("")}
        </select>
        <button data-action="sync-frontend-from-regex">从正则同步</button>
        <button data-action="apply-frontend-to-regex">写回正则</button>
      </div>
      <div class="frontend-grid">
        <section class="panel editor-panel">
          ${
            state.frontendMode === "local"
              ? `
                <label class="field field-wide">
                  <span>本地前端</span>
                  <input id="frontend-local-url" value="${attr(localUrl)}" placeholder="./public/frontends/hypnosis-app/index.html" />
                </label>
                <p class="muted">开发阶段默认读取本地镜像。更新镜像后刷新页面或点重新渲染即可；发布时切到远程模式再写回正则。</p>
                <div class="inline-status ok">本地镜像路径：${htmlEscape(localUrl)}</div>
              `
              : state.frontendMode === "remote"
              ? `
                <label class="field field-wide">
                  <span>远程 URL</span>
                  <input id="frontend-url" value="${attr(remoteUrl)}" placeholder="https://..." />
                </label>
                <label class="field field-wide">
                  <span>渲染方式</span>
                  <select id="frontend-remote-strategy">
                    <option value="inline" ${remoteStrategy === "inline" ? "selected" : ""}>拉取 HTML 后渲染</option>
                    <option value="direct" ${remoteStrategy === "direct" ? "selected" : ""}>直接 iframe</option>
                  </select>
                </label>
                <p class="muted">${isLocalhostFrontendUrl(remoteUrl) ? "检测到本机开发地址，已自动使用直接 iframe，避免大 HTML srcdoc 空白。" : "jsDelivr 上的角色卡前端常以 text/plain 返回，需要拉取后按 HTML 渲染。本地 localhost 开发服务器可切到直接 iframe。"}</p>
                ${renderRemoteStatus(remoteUrl)}
              `
              : `
                <label class="field field-wide">
                  <span>HTML / 片段</span>
                  <textarea id="frontend-html" rows="24">${htmlEscape(state.frontendHtmlDraft)}</textarea>
                </label>
              `
          }
          <button class="primary" data-action="render-frontend">重新渲染</button>
        </section>
        <section class="preview-panel">
          ${state.frontendMode === "local"
            ? `<div class="preview-frame-status" id="frontend-frame-status">正在加载本地镜像...</div><iframe id="frontend-frame" sandbox="allow-scripts allow-forms allow-popups allow-same-origin" src="${attr(localFrameUrl)}"></iframe>`
            : state.frontendMode === "remote" && remoteUrl && remoteStrategy === "direct"
            ? `<div class="preview-frame-status" id="frontend-frame-status">正在加载远程页面...</div><iframe id="frontend-frame" sandbox="allow-scripts allow-forms allow-popups allow-same-origin" src="${attr(remoteUrl)}"></iframe>`
            : state.frontendMode === "remote" && remoteUrl
              ? `<div class="preview-frame-status" id="frontend-frame-status">正在渲染 HTML...</div><iframe id="frontend-frame" sandbox="allow-scripts allow-forms allow-popups allow-same-origin" srcdoc="${attr(remoteHtml)}"></iframe>`
            : `<div class="preview-frame-status" id="frontend-frame-status">正在渲染 HTML...</div><iframe id="frontend-frame" sandbox="allow-scripts allow-forms allow-popups" srcdoc="${attr(state.frontendHtmlDraft || "<p>在左侧输入 HTML 后渲染。</p>")}"></iframe>`}
        </section>
      </div>
    </section>
  `;
}

function renderRemoteStatus(previewUrl) {
  if (!previewUrl) return "";
  if (effectiveRemoteStrategy(previewUrl) === "direct") {
    return `<div class="inline-status ok">本机地址已用直接 iframe 渲染。</div>`;
  }
  if (state.frontendRemote.status === "loading" && state.frontendRemote.url === previewUrl) {
    return `<div class="inline-status">正在拉取远程 HTML...</div>`;
  }
  if (state.frontendRemote.status === "ready" && state.frontendRemote.url === previewUrl) {
    return `<div class="inline-status ok">已按 HTML 渲染，大小 ${Math.round(state.frontendRemote.html.length / 1024)} KB。</div>`;
  }
  if (state.frontendRemote.status === "error" && state.frontendRemote.url === previewUrl) {
    return `<div class="inline-status bad">拉取失败：${htmlEscape(state.frontendRemote.error)}</div>`;
  }
  return `<div class="inline-status">准备拉取远程 HTML。</div>`;
}

function renderPreviewPlaceholder(loading, error, message) {
  const title = loading ? "正在加载远程前端..." : error ? "远程前端加载失败" : "准备渲染远程前端";
  const detail = error ? message : "如果远程站点以 text/plain 返回，工作台会自动改用 HTML srcdoc 渲染。";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f8fafc;color:#334155;font-family:system-ui,sans-serif}
    main{max-width:520px;padding:28px;text-align:center}
    h1{font-size:20px;margin:0 0 10px}
    p{line-height:1.65;color:#64748b}
  </style></head><body><main><h1>${htmlEscape(title)}</h1><p>${htmlEscape(detail || "")}</p></main></body></html>`;
}

function renderRaw() {
  return `
    <section class="panel raw-panel">
      <div class="detail-head">
        <div>
          <span class="eyebrow">JSON</span>
          <h3>完整角色卡</h3>
        </div>
        <div class="actions">
          <button data-action="format-raw">格式化</button>
          <button class="primary" data-action="apply-raw">应用 JSON</button>
        </div>
      </div>
      <textarea id="raw-json" rows="30">${htmlEscape(state.rawJsonDraft || JSON.stringify(state.cardState?.card || {}, null, 2))}</textarea>
    </section>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      flushScanExampleEditor();
      state.activeView = button.dataset.view;
      render();
    });
  });

  app.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", handleAction);
    if (el.dataset.action === "search") {
      el.addEventListener("input", (event) => {
        state.search = event.target.value;
        filterWorldbookListDom();
      });
    }
  });

  app.querySelectorAll("[data-path]").forEach((el) => {
    el.addEventListener("change", handleFieldInput);
  });

  const fileInput = app.querySelector("#file-input");
  if (fileInput) fileInput.addEventListener("change", handleFileInput);

  const frontendUrl = app.querySelector("#frontend-url");
  if (frontendUrl) frontendUrl.addEventListener("input", (event) => (state.frontendUrlDraft = event.target.value));
  const frontendLocalUrl = app.querySelector("#frontend-local-url");
  if (frontendLocalUrl) frontendLocalUrl.addEventListener("input", (event) => (state.frontendLocalUrlDraft = event.target.value));
  const frontendStrategy = app.querySelector("#frontend-remote-strategy");
  if (frontendStrategy) frontendStrategy.addEventListener("change", (event) => {
    state.frontendRemoteStrategy = event.target.value;
    render();
  });
  const frontendHtml = app.querySelector("#frontend-html");
  if (frontendHtml) frontendHtml.addEventListener("input", (event) => (state.frontendHtmlDraft = event.target.value));
  const rawJson = app.querySelector("#raw-json");
  if (rawJson) rawJson.addEventListener("input", (event) => (state.rawJsonDraft = event.target.value));
  app.querySelectorAll("[data-phone-field]").forEach((el) => {
    el.addEventListener("input", handlePhoneFieldDraftInput);
    el.addEventListener("change", handlePhoneFieldInput);
  });
  app.querySelectorAll("[data-scan-example-field]").forEach((el) => {
    el.addEventListener("input", handleScanExampleInput);
    el.addEventListener("change", handleScanExampleInput);
    el.addEventListener("keyup", handleScanExampleInput);
    el.addEventListener("blur", handleScanExampleInput);
  });
  const mchanSearch = app.querySelector("#mchan-search");
  if (mchanSearch) {
    mchanSearch.addEventListener("input", (event) => {
      state.phone.mchan.search = event.target.value;
      filterMchanThreadsDom();
      scheduleAutosave();
    });
  }
  const frontendSelect = app.querySelector('[data-action="frontend-regex-select"]');
  if (frontendSelect) frontendSelect.addEventListener("change", (event) => {
    state.selectedRegex = Number(event.target.value);
    hydrateFrontendDraft();
    render();
  });
}

async function handleAction(event) {
  flushScanExampleEditor();
  const action = event.currentTarget.dataset.action;
  const target = event.currentTarget;
  try {
    if (action === "choose-file") app.querySelector("#file-input")?.click();
    if (action === "load-sample") await loadSampleCard();
    if (action === "save-local") saveWorkspace();
    if (action === "save-library") addCurrentToLibrary();
    if (action === "load-saved") loadSavedCard(target.dataset.id);
    if (action === "delete-saved") deleteSavedCard(target.dataset.id);
    if (action === "export-json" && state.cardState) {
      syncPhoneToCard();
      exportCardJson(state.cardState.card);
    }
    if (action === "export-png" && state.cardState) {
      syncPhoneToCard();
      exportCardPng(state.cardState);
    }
    if (action === "preview-url") {
      state.activeView = "frontend";
      state.frontendMode = "remote";
      state.frontendUrlDraft = target.dataset.url;
      render();
    }
    if (action === "select-book-entry") {
      state.selectedBookEntry = Number(target.dataset.index);
      render();
    }
    if (action === "add-book-entry") addBookEntry();
    if (action === "duplicate-book-entry") duplicateBookEntry(Number(target.dataset.index));
    if (action === "delete-book-entry") deleteBookEntry(Number(target.dataset.index));
    if (action === "select-regex") {
      state.selectedRegex = Number(target.dataset.index);
      hydrateFrontendDraft();
      render();
    }
    if (action === "add-regex") addRegex();
    if (action === "duplicate-regex") duplicateRegex(Number(target.dataset.index));
    if (action === "delete-regex") deleteRegex(Number(target.dataset.index));
    if (action === "run-regex-test") runRegexTest(Number(target.dataset.index));
    if (action === "select-var-group") {
      state.selectedVarGroup = target.dataset.id;
      render();
    }
    if (action === "select-scan-example") {
      state.selectedScanExample = Number(target.dataset.index);
      render();
    }
    if (action === "reset-scan-example") resetScanExample(Number(target.dataset.index));
    if (action === "reset-scan-examples") resetScanExamples();
    if (action === "save-scan-examples") {
      flushScanExampleEditor();
      setMessage("静态示例人物已保存，并已同步给本地前端预览。");
    }
    if (action === "preview-scan-examples") {
      persistScanExamplesForPreview();
      syncPhoneToCard();
      state.activeView = "frontend";
      state.frontendMode = "local";
      state.frontendRenderNonce = Date.now();
      render();
    }
    if (action === "apply-ai-variable-policy") applyAiVariablePolicy();
    if (action === "apply-merged-light-policy") applyMergedLightPolicy();
    if (action === "apply-phone-forum-policy") applyPhoneForumPolicy();
    if (action === "jump-book-entry") {
      state.selectedBookEntry = Number(target.dataset.index);
      state.activeView = "worldbook";
      render();
    }
    if (action === "phone-app") {
      state.phone.activeApp = target.dataset.app;
      scheduleAutosave();
      render();
    }
    if (action === "mchan-board") selectMchanBoard(target.dataset.boardId);
    if (action === "mchan-select-thread") {
      state.phone.mchan.selectedThreadId = target.dataset.threadId;
      scheduleAutosave();
      render();
    }
    if (action === "mchan-back-home") {
      state.phone.mchan.selectedThreadId = "";
      scheduleAutosave();
      render();
    }
    if (action === "inventory-select-item") {
      state.phone.inventory.selectedItemId = target.dataset.itemId;
      scheduleAutosave();
      render();
    }
    if (action === "inventory-add-item") addInventoryItem();
    if (action === "inventory-delete-item") deleteInventoryItem();
    if (action === "calendar-add-event") addCalendarEvent();
    if (action === "calendar-delete-event") deleteCalendarEvent(target.dataset.eventId);
    if (action === "frontend-mode") {
      state.frontendMode = target.dataset.mode;
      render();
    }
    if (action === "sync-frontend-from-regex") {
      hydrateFrontendDraft();
      render();
    }
    if (action === "apply-frontend-to-regex") applyFrontendToRegex();
    if (action === "render-frontend") {
      const localUrl = app.querySelector("#frontend-local-url");
      const url = app.querySelector("#frontend-url");
      const html = app.querySelector("#frontend-html");
      if (localUrl) state.frontendLocalUrlDraft = normalizeLocalFrontendUrl(localUrl.value);
      if (url) state.frontendUrlDraft = url.value;
      if (html) state.frontendHtmlDraft = html.value;
      state.frontendRenderNonce = Date.now();
      if (state.frontendMode === "remote" && effectiveRemoteStrategy(state.frontendUrlDraft) === "inline") {
        state.frontendRemote = { url: "", status: "idle", html: "", error: "" };
      }
      render();
    }
    if (action === "format-raw") {
      state.rawJsonDraft = JSON.stringify(JSON.parse(state.rawJsonDraft), null, 2);
      render();
    }
    if (action === "apply-raw") applyRawJson();
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function handleFileInput(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.name.toLowerCase().endsWith(".json")) {
      const card = JSON.parse(await file.text());
      setLoadedCard({
        id: crypto.randomUUID(),
        fileName: file.name,
        importedAt: Date.now(),
        imageBuffer: null,
        card,
        metadata: { hasChara: false, hasCcv3: false, charaEqualsCcv3: false, textChunks: [] }
      });
    } else {
      setLoadedCard(await parseCharacterCardFile(file));
    }
    setMessage("文件已加载。");
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    event.target.value = "";
  }
}

function handleFieldInput(event) {
  const path = event.currentTarget.dataset.path;
  const value = normalizeInputValue(event.currentTarget);
  updateCard((card) => {
    if (path === "data.tags") {
      card.data.tags = String(value).split(",").map((item) => item.trim()).filter(Boolean);
      return;
    }
    if (path.startsWith("book.")) {
      const [, idx, ...rest] = path.split(".");
      const entry = card.data.character_book.entries[Number(idx)];
      if (!entry) return;
      if (rest.join(".") === "keys" || rest.join(".") === "secondary_keys") {
        entry[rest.join(".")] = String(value).split(/\n|,/).map((item) => item.trim()).filter(Boolean);
      } else {
        setByPath(entry, rest.join("."), coerceBookValue(rest.join("."), value));
      }
      return;
    }
    if (path.startsWith("regex.")) {
      const [, idx, key] = path.split(".");
      const script = card.data.extensions.regex_scripts[Number(idx)];
      if (!script) return;
      if (key === "placement") script.placement = String(value).split(",").map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item));
      else script[key] = value;
      return;
    }
    setByPath(card, path, value);
  });
}

function mutatePhoneField(el) {
  const fieldName = el.dataset.phoneField;
  const value = normalizeInputValue(el);
  const eventId = el.dataset.eventId;
  return (phone) => {
    const item = selectedInventoryItem();
    if (fieldName === "inventory.item.name" && item) item.name = value;
    if (fieldName === "inventory.item.quantity" && item) item.quantity = Number(value || 0);
    if (fieldName === "inventory.item.note" && item) item.note = value;
    if (fieldName?.startsWith("inventory.item") && item) {
      phone.currentOperation = `调整库存：${item.name || "未命名物品"}`;
      return;
    }
    if (fieldName === "calendar.date") {
      phone.calendar.date = value;
      phone.currentOperation = `查看日历日期：${value || "未填写"}`;
      return;
    }
    if (fieldName === "calendar.time") {
      phone.calendar.time = value;
      phone.currentOperation = `查看日历时间：${value || "未填写"}`;
      return;
    }
    if (fieldName?.startsWith("calendar.event")) {
      const itemEvent = phone.calendar.events.find((entry) => entry.id === eventId);
      if (!itemEvent) return;
      if (fieldName === "calendar.event.time") itemEvent.time = value;
      if (fieldName === "calendar.event.title") itemEvent.title = value;
      if (fieldName === "calendar.event.note") itemEvent.note = value;
      phone.currentOperation = `调整日程：${itemEvent.title || "未命名日程"}`;
      return;
    }
    if (fieldName === "operation.current") {
      phone.currentOperation = value || "无";
    }
  };
}

function handlePhoneFieldDraftInput(event) {
  mutatePhoneField(event.currentTarget)(state.phone);
  state.phone = normalizePhoneState(state.phone);
  markDirtyAndAutosave();
}

function handlePhoneFieldInput(event) {
  updatePhone(mutatePhoneField(event.currentTarget));
}

function handleScanExampleInput(event) {
  const index = Number(event.currentTarget.dataset.index);
  const fieldName = event.currentTarget.dataset.scanExampleField;
  if (!SCAN_EXAMPLE_FIELDS.includes(fieldName)) return;
  const examples = normalizeScanExamples(state.scanExamples);
  if (!examples[index]) return;
  examples[index][fieldName] = event.currentTarget.value;
  state.scanExamples = examples;
  syncPhoneToCard();
  markDirtyAndAutosave();
}

function flushScanExampleEditor() {
  const fields = Array.from(app.querySelectorAll("[data-scan-example-field]"));
  if (!fields.length) return false;
  const examples = normalizeScanExamples(state.scanExamples);
  let changed = false;
  for (const field of fields) {
    const index = Number(field.dataset.index);
    const fieldName = field.dataset.scanExampleField;
    if (!SCAN_EXAMPLE_FIELDS.includes(fieldName) || !examples[index]) continue;
    const value = field.value || "";
    if (examples[index][fieldName] !== value) {
      examples[index][fieldName] = value;
      changed = true;
    }
  }
  if (!changed) return false;
  state.scanExamples = examples;
  syncPhoneToCard();
  markDirtyAndAutosave();
  return true;
}

function resetScanExample(index) {
  const examples = normalizeScanExamples(state.scanExamples);
  if (!examples[index]) return;
  examples[index] = normalizeScanExample(DEFAULT_SCAN_EXAMPLES[index], index);
  state.scanExamples = examples;
  syncPhoneToCard();
  markDirtyAndAutosave();
  render();
}

function resetScanExamples() {
  state.scanExamples = createDefaultScanExamples();
  state.selectedScanExample = 0;
  syncPhoneToCard();
  markDirtyAndAutosave();
  render();
}

function filterMchanThreadsDom() {
  const query = state.phone.mchan.search.trim().toLowerCase();
  const rows = app.querySelectorAll(".mchan-thread[data-search-text]");
  let visible = 0;
  rows.forEach((row) => {
    const matched = !query || row.dataset.searchText.includes(query);
    row.classList.toggle("is-filtered", !matched);
    if (matched) visible += 1;
  });
  const list = app.querySelector(".mchan-thread-list");
  app.querySelector(".mchan-list-empty")?.remove();
  if (list && rows.length && visible === 0) {
    const message = document.createElement("p");
    message.className = "muted mchan-list-empty";
    message.textContent = "没有匹配帖子。";
    list.appendChild(message);
  }
}

function selectMchanBoard(boardId) {
  updatePhone((phone) => {
    phone.mchan.selectedBoardId = boardId;
    const board = phone.mchan.boards.find((item) => item.id === boardId);
    phone.mchan.selectedThreadId = "";
    phone.currentOperation = `浏览匿名版版块：${board?.name || "未知版块"}`;
  });
}

function addInventoryItem() {
  updatePhone((phone) => {
    const item = { id: makeId("item"), name: "新物品", quantity: 1, note: "" };
    phone.inventory.items.unshift(item);
    phone.inventory.selectedItemId = item.id;
    phone.currentOperation = "新增库存物品";
  });
}

function deleteInventoryItem() {
  updatePhone((phone) => {
    const item = selectedInventoryItem();
    if (!item) return;
    phone.inventory.items = phone.inventory.items.filter((entry) => entry.id !== item.id);
    phone.inventory.selectedItemId = phone.inventory.items[0]?.id || "";
    phone.currentOperation = `删除库存物品：${item.name || "未命名物品"}`;
  });
}

function addCalendarEvent() {
  updatePhone((phone) => {
    const event = { id: makeId("event"), title: "新日程", time: phone.calendar.time || "08:00", note: "" };
    phone.calendar.events.push(event);
    phone.currentOperation = "新增日历日程";
  });
}

function deleteCalendarEvent(eventId) {
  updatePhone((phone) => {
    const itemEvent = phone.calendar.events.find((entry) => entry.id === eventId);
    phone.calendar.events = phone.calendar.events.filter((entry) => entry.id !== eventId);
    phone.currentOperation = `删除日程：${itemEvent?.title || "未命名日程"}`;
  });
}

function filterWorldbookListDom() {
  const query = state.search.trim().toLowerCase();
  const rows = app.querySelectorAll(".entry-row[data-search-text]");
  let visible = 0;
  rows.forEach((row) => {
    const matched = !query || row.dataset.searchText.includes(query);
    row.classList.toggle("is-filtered", !matched);
    if (matched) visible += 1;
  });
  const empty = app.querySelector(".entry-list-empty");
  if (empty) empty.remove();
  const list = app.querySelector(".entry-list");
  if (list && rows.length && visible === 0) {
    const message = document.createElement("p");
    message.className = "muted entry-list-empty";
    message.textContent = "没有匹配条目。";
    list.appendChild(message);
  }
}

function coerceBookValue(path, value) {
  if (["insertion_order", "extensions.depth"].includes(path)) return Number(value || 0);
  return value;
}

function addBookEntry() {
  updateCard((card) => {
    const entries = card.data.character_book.entries;
    entries.push({
      id: nextEntryId(entries),
      keys: [],
      secondary_keys: [],
      comment: "新世界书条目",
      content: "",
      constant: false,
      selective: true,
      insertion_order: 100,
      enabled: true,
      position: "after_char",
      use_regex: false,
      extensions: { position: 4, depth: 0, role: 0, probability: 100, useProbability: true }
    });
    state.selectedBookEntry = entries.length - 1;
  });
}

function nextEntryId(entries) {
  return Math.max(-1, ...entries.map((entry) => Number(entry.id ?? -1)).filter((id) => !Number.isNaN(id))) + 1;
}

function duplicateBookEntry(index) {
  updateCard((card) => {
    const entries = card.data.character_book.entries;
    const copy = cloneCard(entries[index]);
    copy.id = nextEntryId(entries);
    copy.comment = `${copy.comment || "Entry"} Copy`;
    entries.splice(index + 1, 0, copy);
    state.selectedBookEntry = index + 1;
  });
}

function deleteBookEntry(index) {
  updateCard((card) => {
    card.data.character_book.entries.splice(index, 1);
    state.selectedBookEntry = Math.max(0, Math.min(state.selectedBookEntry, card.data.character_book.entries.length - 1));
  });
}

function addRegex() {
  updateCard((card) => {
    const scripts = card.data.extensions.regex_scripts;
    scripts.push({
      id: crypto.randomUUID(),
      scriptName: "新正则",
      findRegex: "",
      replaceString: "",
      trimStrings: [],
      placement: [2],
      disabled: false,
      markdownOnly: true,
      promptOnly: false,
      runOnEdit: true,
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null
    });
    state.selectedRegex = scripts.length - 1;
  });
}

function duplicateRegex(index) {
  updateCard((card) => {
    const scripts = card.data.extensions.regex_scripts;
    const copy = cloneCard(scripts[index]);
    copy.id = crypto.randomUUID();
    copy.scriptName = `${copy.scriptName || "Regex"} Copy`;
    scripts.splice(index + 1, 0, copy);
    state.selectedRegex = index + 1;
  });
}

function deleteRegex(index) {
  updateCard((card) => {
    card.data.extensions.regex_scripts.splice(index, 1);
    state.selectedRegex = Math.max(0, Math.min(state.selectedRegex, card.data.extensions.regex_scripts.length - 1));
  });
}

function runRegexTest(index) {
  const script = regexScripts()[index];
  const input = app.querySelector("#regex-test-input")?.value || "";
  const out = app.querySelector("#regex-test-output");
  if (!script || !out) return;
  try {
    const regex = regexFromSillyTavern(script.findRegex);
    out.textContent = input.replace(regex, script.replaceString || "");
  } catch (error) {
    out.textContent = error.message;
  }
}

function regexFromSillyTavern(source) {
  const text = String(source || "");
  const slash = text.match(/^\/([\s\S]*)\/([a-z]*)$/i);
  if (slash) return new RegExp(slash[1], slash[2]);
  return new RegExp(text, "g");
}

function applyFrontendToRegex() {
  if (state.frontendMode === "local") {
    setMessage("本地模式用于开发预览，不写回角色卡正则。切到远程模式后再写回发布地址。");
    return;
  }
  updateCard((card) => {
    const script = card.data.extensions.regex_scripts[state.selectedRegex];
    if (!script) return;
    if (state.frontendMode === "remote") {
      const url = app.querySelector("#frontend-url")?.value || state.frontendUrlDraft;
      state.frontendUrlDraft = url;
      script.replaceString = "```\\n<body>\\n<script>\\n$('body').load('" + url + "')\\n</script>\\n</body>\\n```";
    } else {
      const html = app.querySelector("#frontend-html")?.value || state.frontendHtmlDraft;
      state.frontendHtmlDraft = html;
      script.replaceString = "```\\n" + html + "\\n```";
    }
  });
}

function applyRawJson() {
  const text = app.querySelector("#raw-json")?.value || state.rawJsonDraft;
  const card = JSON.parse(text);
  ensureCardShape(card);
  state.cardState.card = card;
  state.rawJsonDraft = JSON.stringify(card, null, 2);
  hydrateFrontendDraft();
  markDirtyAndAutosave();
  render();
}

function bindFrontendFrameStatus() {
  const frame = app.querySelector("#frontend-frame");
  const status = app.querySelector("#frontend-frame-status");
  if (!frame || !status) return;
  let loaded = false;
  const showStatus = (message, kind = "") => {
    status.textContent = message;
    status.className = `preview-frame-status ${kind}`.trim();
  };
  const hideStatus = () => {
    status.classList.add("is-hidden");
  };
  const markLoaded = () => {
    loaded = true;
    let empty = false;
    try {
      const doc = frame.contentDocument;
      if (doc && doc.readyState === "loading") {
        loaded = false;
        return;
      }
      const bodyText = doc?.body?.innerText?.trim() || "";
      const htmlLength = doc?.documentElement?.outerHTML?.length || 0;
      empty = Boolean(doc) && !bodyText && htmlLength < 260;
    } catch {
      empty = false;
    }
    if (empty) {
      showStatus(`页面已加载，但内容为空：${frame.getAttribute("src") || "HTML 片段"}`, "bad");
      return;
    }
    hideStatus();
  };
  frame.addEventListener("load", markLoaded, { once: true });
  frame.addEventListener("error", () => {
    loaded = true;
    showStatus(`加载失败：${frame.getAttribute("src") || "HTML 片段"}`, "bad");
  }, { once: true });
  window.setTimeout(() => {
    if (!loaded) showStatus(`仍在加载：${frame.getAttribute("src") || "HTML 片段"}`);
  }, 1200);
  window.setTimeout(markLoaded, 180);
}

function afterRenderEffects() {
  if (state.activeView === "worldbook") {
    filterWorldbookListDom();
    return;
  }
  if (state.activeView === "phone" && state.phone.activeApp === "mchan") {
    filterMchanThreadsDom();
    return;
  }
  if (state.activeView !== "frontend") return;
  bindFrontendFrameStatus();
  if (state.frontendMode !== "remote") return;
  const url = state.frontendUrlDraft || detectUrls(regexScripts()[state.selectedRegex]?.replaceString || "")[0] || "";
  if (!url) return;
  if (effectiveRemoteStrategy(url) !== "inline") return;
  if (state.frontendRemote.url === url && ["loading", "ready"].includes(state.frontendRemote.status)) return;
  loadRemoteFrontendPreview(url);
}

async function loadRemoteFrontendPreview(url) {
  state.frontendRemote = { url, status: "loading", html: "", error: "" };
  render();
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    state.frontendRemote = {
      url,
      status: "ready",
      html: prepareRemoteHtml(html, url),
      error: ""
    };
  } catch (error) {
    state.frontendRemote = { url, status: "error", html: "", error: error.message };
  }
  render();
}

function prepareRemoteHtml(html, url) {
  const shim = `<script>
    window.__ST_WORKBENCH_PREVIEW__ = true;
    window.SillyTavern = window.SillyTavern || {
      getCurrentChatId: () => "workbench-preview",
      getContext: () => ({ chat: [], characterId: "workbench-preview", name1: "User", name2: "Character" })
    };
  </script>`;
  const base = `<base href="${attr(url)}">`;
  let output = String(html || "");
  if (/<head[^>]*>/i.test(output)) {
    output = output.replace(/<head([^>]*)>/i, `<head$1>${base}${shim}`);
  } else {
    output = `${base}${shim}${output}`;
  }
  output = patchKnownExternalGlobals(output);
  return output;
}

function patchKnownExternalGlobals(html) {
  let output = html;
  const imports = [];
  if (output.includes("module.exports = z;") && !output.includes("npm/zod/+esm") && !output.includes(PREVIEW_VENDOR.zod)) {
    imports.push(`import * as z from "${PREVIEW_VENDOR.zod}";`);
  }
  if (output.includes("module.exports = _;") && !output.includes("npm/lodash/+esm") && !output.includes(PREVIEW_VENDOR.lodash)) {
    imports.push(`import _ from "${PREVIEW_VENDOR.lodash}";`);
  }
  if (/\$(?:\s*\(|\.)/.test(output) && !output.includes("npm/jquery/+esm") && !output.includes(PREVIEW_VENDOR.jquery)) {
    imports.push(`import $ from "${PREVIEW_VENDOR.jquery}";`);
  }
  if (imports.length) {
    output = output.replace(
      /<script(\s+type=["']module["'][^>]*)>/i,
      `<script$1>${imports.join("\n")}\n`
    );
  }
  if (/\b(getVariables|updateVariablesWith|getCurrentMessageId|getChatMessages|setChatMessages)\b/.test(output) && !output.includes("__ST_WORKBENCH_VARIABLES__")) {
    output = output.replace(
      /\nvar __webpack_modules__ = \{/,
      `\n${previewVariableRuntime()}\nvar __webpack_modules__ = {`
    );
  }
  return output
    .replaceAll("https://testingcf.jsdelivr.net/npm/zod/+esm", PREVIEW_VENDOR.zod)
    .replaceAll("https://cdn.jsdelivr.net/npm/zod/+esm", PREVIEW_VENDOR.zod)
    .replaceAll("https://testingcf.jsdelivr.net/npm/lodash/+esm", PREVIEW_VENDOR.lodash)
    .replaceAll("https://cdn.jsdelivr.net/npm/lodash/+esm", PREVIEW_VENDOR.lodash)
    .replaceAll("https://testingcf.jsdelivr.net/npm/jquery/+esm", PREVIEW_VENDOR.jquery)
    .replaceAll("https://cdn.jsdelivr.net/npm/jquery/+esm", PREVIEW_VENDOR.jquery)
    .replaceAll("https://testingcf.jsdelivr.net/npm/scheduler/+esm", PREVIEW_VENDOR.scheduler)
    .replaceAll("https://cdn.jsdelivr.net/npm/scheduler/+esm", PREVIEW_VENDOR.scheduler);
}

function previewVariableRuntime() {
  const defaultRoles = JSON.stringify(DEFAULT_PREVIEW_ROLES);
  return `
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
    "当前/待上课程": "无",
    "当天课程表": {
      "日期": "4月9日",
      "星期": "星期三",
      "当前课段": { "名称": "午休", "时间": "12:30-13:20" },
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
    "当前事件": "午休",
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
globalThis.__ST_WORKBENCH_VARIABLES__ = __stMergeDefaultVariables(globalThis.__ST_WORKBENCH_VARIABLES__);
globalThis.__ST_WORKBENCH_CHAT__ = globalThis.__ST_WORKBENCH_CHAT__ || [{ message_id: 0, message: "<StatusPlaceHolderImpl />" }];
function getVariables() {
  return __stClone(globalThis.__ST_WORKBENCH_VARIABLES__);
}
function updateVariablesWith(updater) {
  const current = getVariables();
  const next = typeof updater === "function" ? updater(current) : current;
  globalThis.__ST_WORKBENCH_VARIABLES__ = __stClone(next || current);
  return getVariables();
}
function getCurrentMessageId() {
  return 0;
}
function getChatMessages(messageId = -1) {
  const chat = globalThis.__ST_WORKBENCH_CHAT__;
  if (messageId === -1) return chat.slice(-1);
  return chat.filter((message) => message.message_id === messageId);
}
async function setChatMessages(messages) {
  const chat = globalThis.__ST_WORKBENCH_CHAT__;
  for (const next of messages || []) {
    const index = chat.findIndex((message) => message.message_id === next.message_id);
    if (index >= 0) chat[index] = { ...chat[index], ...next };
    else chat.push(next);
  }
  return true;
}
globalThis.Mvu = globalThis.Mvu || {
  getMvuData: () => ({ stat_data: getVariables() }),
  setMvuVariable: (mvu, path, value) => {
    const parts = String(path || "").split(".");
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
`;
}

function applyAiVariablePolicy() {
  updateCard((card) => {
    card.data.extensions.workbench ||= {};
    card.data.extensions.workbench.variableAuthority = "ai";
    card.data.extensions.workbench.frontendMutation = "read-only";
    card.data.extensions.workbench.updatedAt = new Date().toISOString();
    patchOriginalWorldbookForMergedPolicy(card.data.character_book.entries);
  });
  setMessage("已把 AI 变量接管规则合并进原世界书。");
}

function applyMergedLightPolicy() {
  resetStaticMchanWorkbenchState();
  updateCard((card) => {
    const d = getCardData(card);
    d.extensions ||= {};
    d.extensions.workbench ||= {};
    d.extensions.workbench.frontendArchitecture = "phone-internal-modules";
    d.extensions.workbench.modules = ["hypnosis-app", "body-stats", "add-role", "inventory", "calendar", "mchan-static"];
    d.extensions.workbench.mchanMode = "static-readonly";
    d.extensions.workbench.variableAuthority = "ai";
    d.extensions.workbench.frontendMutation = "read-only";
    d.extensions.workbench.legacyWorldbookAndRegexPreserved = true;
    d.extensions.workbench.updatedAt = new Date().toISOString();

    const entries = d.character_book?.entries || [];
    patchOriginalWorldbookForMergedPolicy(entries);
  });
  setMessage("已应用：匿名版改为手机内部静态只读页；原世界书内的前端扣费/变量写入/身体检测限制已合并修正。");
}

function applyPhoneForumPolicy() {
  applyMergedLightPolicy();
}

function migrateUnprefixedSystemVariableNames(text) {
  return String(text || "")
    .replaceAll("_催眠APP订阅等级", "催眠APP订阅等级")
    .replaceAll("_MC能量上限", "MC能量上限")
    .replaceAll("_MC能量", "MC能量")
    .replaceAll("_累计消耗MC点", "累计消耗MC点")
    .replaceAll("_hypnoos", "hypnoos")
    .replaceAll(
      "don't update field names starts with `_` as they are readonly, such as `_变量`",
      "only update fields that clearly changed; app variables are no longer frontend-only readonly fields"
    );
}

function migrateEntriesToUnprefixedSystemVariables(entries) {
  for (const entry of entries || []) {
    if (entry && typeof entry.content === "string") {
      entry.content = migrateUnprefixedSystemVariableNames(entry.content);
    }
  }
}

function patchOriginalWorldbookForMergedPolicy(entries) {
  migrateEntriesToUnprefixedSystemVariables(entries);

  [
    "[workbench]身体检测默认开放",
    "[workbench]AI变量接管策略",
    "[workbench]前端合并策略",
    "[workbench]内容保真与NSFW兼容",
    "[mvu_update]轻量变量原则",
    "[mvu_update]轻量更新格式",
    "[mvu_update]APP操作结算工作量",
    "[mvu_update]匿名版/MChan轻量状态",
    "[mvu_update]扫描角色增删规范"
  ].forEach((comment) => removeBookEntry(entries, comment));

  const schoolRuleWorldbook = [
    "<校规规则>",
    "校规变量:",
    "  path: /校规",
    "  format:",
    "    校规名:",
    "      内容: 校规正文",
    "      目标范围: 全体 | 指定个体/群体列表",
    "      生效范围: 学校内",
    "",
    "生效规则:",
    "- 校规不是催眠效果，绝不能写入任何角色的`临时催眠效果`或`永久催眠效果`。",
    "- 校规只存放在`/校规`，最多3条；删除校规只`remove /校规/校规名`，不返还任何资源。",
    "- 只要校规仍存在于`/校规`，所有位于学校内且落入`目标范围`的人都必须遵守；目标可以是全校全体，也可以是指定个体、若干角色、某类群体。",
    "- 若目标范围未写明，默认覆盖学校内全体人员，包括学生、教师、家属、工作人员、访客、男女等所有在场人。",
    "- 离开学校后校规不主动生效；再次进入学校且仍在目标范围内时恢复约束。",
    "- 叙事中可体现角色对校规的适应、疑惑、合理化或抵触，但不能把校规误当成单体催眠、临时催眠或永久催眠。",
    "",
    "发布/删除结算:",
    "- 发布校规必须同时满足：`系统.催眠APP订阅等级`为VIP5、`角色.西园寺爱丽莎.好感度`至少100、当前校规少于3条、本轮只发布一条、`系统.当前MC点`至少500000。",
    "- 成功发布时只扣除500000当前MC点，并`add`到`/校规/校规名`；任一条件不足则失败，不扣费、不新增校规。",
    "- 删除校规不需要退款，也不得补偿MC点、MC能量或金钱。",
    "</校规规则>"
  ].join("\n");
  upsertBookEntry(entries, {
    comment: "[mvu_update]校规规则",
    keys: ["校规", "立校规", "申请立校规", "删除校规", "学校规则"],
    content: schoolRuleWorldbook,
    constant: true,
    selective: false,
    insertion_order: 12
  });

  patchEntryContent(entries, "[mvu_plot]强调要求", (content) => {
    let next = content
      .replace(
        "- **只**在本轮用户发送<催眠发送>标签时才输出启动催眠的场景.",
        "- **只**在本轮用户输入<催眠发送>标签，或`本轮APP操作`明确包含启动/追加催眠且AI已判定成功时，才输出启动催眠的场景。"
      )
      .replace(
        "- 在本轮用户没有输入<催眠发送>标签包裹的内容或`本轮APP操作`没有内容时, 在正文提及催眠APP的操作, 包括使用和修改, 输入角色使用催眠APP的描写.",
        "- 在本轮用户没有输入<催眠发送>标签，且`本轮APP操作`为空/无/未结算成功时，严禁在正文提及催眠APP的新增操作、使用、修改或角色主动使用催眠APP。"
      )
      .replace(
        "- 控制除了'当前MC'点外, 其他催眠APP的数值(带'_'的变量)和订阅和会员等级, 这部分由额外的前端完成.",
        "- 催眠APP的数值、订阅/会员等级和消耗必须由AI根据剧情与`本轮APP操作`结算后在<update>中维护；前端只记录操作意图，不直接改最终变量。"
      );
    const oldBodyStatsLine = "- 身体检测/角色状态是手机基础界面，默认可以读取`stat_data.角色`展示；它不再作为VIP1订阅限制内容，若角色状态变化由AI在变量更新中处理。";
    const bodyStatsLine = "- 身体检测/角色状态是手机基础界面，默认可以读取`stat_data.角色`展示，包括外观、心理、状态数值、敏感度、次数和临时/永久催眠效果；其中`心理`指角色此刻正在想什么/当下内心念头，不是长期性格总结；它不再作为VIP1订阅限制内容，若角色状态变化由AI在变量更新中处理。";
    if (next.includes(oldBodyStatsLine) && !next.includes(bodyStatsLine)) {
      next = next.replace(oldBodyStatsLine, bodyStatsLine);
    }
    const previousBodyStatsLine = "- 身体检测/角色状态是手机基础界面，默认可以读取`stat_data.角色`展示，包括外观、心理、状态数值、敏感度、次数和临时/永久催眠效果；它不再作为VIP1订阅限制内容，若角色状态变化由AI在变量更新中处理。";
    if (next.includes(previousBodyStatsLine) && !next.includes(bodyStatsLine)) {
      next = next.replace(previousBodyStatsLine, bodyStatsLine);
    }
    if (!next.includes(bodyStatsLine)) {
      next = next.replace(
        "- 当前持有金钱为：{{format_message_variable::stat_data.系统.持有零花钱}}，这个值优先于其他叙述",
        `${bodyStatsLine}\n- 当前持有金钱为：{{format_message_variable::stat_data.系统.持有零花钱}}，这个值优先于其他叙述`
      );
    }
    const resourceGlossaryLine = "- 资源名必须严格区分：`系统.MC能量`是催眠功能实际消耗的能量余额；`系统.MC能量上限`只是能量容量上限，不是可花费余额；`系统.当前MC点`是PT/MC点货币，不等于MC能量，不能替代能量支付。";
    if (!next.includes(resourceGlossaryLine)) {
      next = next.replace(
        "- 当前持有金钱为：{{format_message_variable::stat_data.系统.持有零花钱}}，这个值优先于其他叙述",
        `- 当前持有金钱为：{{format_message_variable::stat_data.系统.持有零花钱}}，这个值优先于其他叙述\n${resourceGlossaryLine}`
      );
    }
    const nsfwLine = "- 保留并理解角色卡既有成人/NSFW/露骨设定；不得因为内容露骨而删除、留空、净化或改写旧世界书、正则、匿名版种子帖和静态前端文本。";
    if (!next.includes(nsfwLine)) {
      next = next.replace(bodyStatsLine, `${bodyStatsLine}\n${nsfwLine}`);
    }
    return next;
  });

  patchEntryContent(entries, "[mvu_plot]催眠指导", (content) =>
    ensureLinesBeforeEndTag(
      content
      .replace(
        "任务: 根据你读到的<催眠发送>内的内容, 结合上文的剧情和备注(如有), 自然地描写{{user}}催眠角色的过程. ",
        "任务: 根据你读到的<催眠发送>或`本轮APP操作`中的催眠请求，结合上文剧情、备注、人数、时间和目标状态，自然描写{{user}}催眠角色的过程。"
      )
      .replace(
        "- 如果存在<催眠发送>就表示已经扣除了MC能量费用，不需要考虑费用消耗",
        "- 旧流程中的<催眠发送>可视为已进入催眠流程；新前端写入的`本轮APP操作`不代表已扣费或成功，AI必须先判断权限、费用、目标条件和风险，再写最终变量。"
      ),
      [
        "- 新前端会在启动催眠和每条催眠功能里用中文字段写明`预计消耗`、`MC能量消耗`、`当前MC点消耗`、`是否受人数影响`、`是否受时间影响`、`人数`和`时间`；AI应优先按这些字段结算。群体类命令本身不因人数额外加价，永久/一次性命令不因时间额外加价。",
        "- 所有涉及花费的催眠APP功能在生效前必须逐项检查余额：`系统.MC能量`支付能量费用，`系统.当前MC点`支付PT/MC点费用，`系统.持有零花钱`支付金钱费用；余额不足则该功能失败，不产生催眠效果，也不得扣成负数。",
        "- 同一批次内后续依赖失败功能、启动催眠成功状态或同一资源余额的操作，若受余额不足影响也必须失败；AI不能贷款、透支、自动补给、自动把MC点/金钱兑换成MC能量，除非`本轮APP操作`明确包含对应兑换/补给且该兑换本身费用充足。",
        "- 前端价格只是预估；若剧情条件、风险、抵抗、失败或部分成功导致费用/效果不同，AI应在正文解释并只写最终变量。",
        "- 临时/持续中的催眠若成功生效，AI应写入 `系统.hypnoos.sessionEndVirtualMinutes` 或 `系统.hypnoos.sessionEndAtMs`，并可写入 `系统.hypnoos.sessionSummary` 或 `系统.hypnoos.sessionFeatures` 作为前端顶部状态条摘要。",
        "- 永久催眠效果只能写入永久效果/角色状态相关变量，不要写入 `sessionSummary`、`sessionFeatures` 或任何正在倒计时的会话字段；永久效果不算作“催眠中”。",
        "- 临时催眠结束、被解除、失败或剧情判定不再持续时，AI应清空 `sessionEndVirtualMinutes`、`sessionEndAtMs`、`sessionSummary`、`sessionFeatures` 等会话字段。"
      ]
    )
  );

  patchEntryContent(entries, "[mvu_plot]日历和日程表*EJS制作中", (content) => {
    const scheduleBlock = [
      "初始剧情日期: 4月9日 星期三，为4月8日入学式/始业式的次日。",
      "",
      "如果本日不是节日/考试/特别活动:",
      "[Routine: Normal_School_Day]",
      "07:30-08:20: 早训(社团自愿)",
      "08:25: 校门关闭/迟到线",
      "08:30-08:40: 朝礼/晨间HR",
      "08:40-09:30: 1限",
      "09:40-10:30: 2限",
      "10:40-11:30: 3限",
      "11:40-12:30: 4限",
      "12:30-13:20: 午休",
      "13:20-14:10: 5限",
      "14:20-15:10: 6限",
      "15:10-15:25: 终礼/班会",
      "15:25-15:40: 清扫时间",
      "15:45-16:00: 放学",
      "",
      "[Weekly Timetable]",
      "星期一: 1限现代文 / 2限数学 / 3限英语 / 4限日本史 / 5限体育（田径） / 6限家庭科",
      "星期二: 1限古典 / 2限化学 / 3限数学 / 4限英语 / 5限美术 / 6限班会",
      "星期三: 1限英语 / 2限世界史 / 3限生物 / 4限现代文 / 5限体育（游泳） / 6限信息",
      "星期四: 1限数学 / 2限古典 / 3限英语 / 4限化学 / 5限音乐 / 6限保健",
      "星期五: 1限现代文 / 2限日本史 / 3限生物 / 4限英语 / 5限体育（球技） / 6限综合探究",
      "星期六/星期日: 周末自由；无固定课程，除非节日、社团、补习、合宿或特殊剧情另行指定。",
      "",
      "[Special Day Priority]",
      "节假日/寒暑春假/黄金周: 无固定课程；不要按普通课表上课。",
      "入学式/始业式/结业式/修业式/返校日: 特别短日程，以仪式、HR和通知为主。",
      "中考/期末/学年末/共通测试: 按考试安排，不使用普通课表。",
      "体育祭/球技大会/体力测验/马拉松大会/文化祭/修学旅行/合宿: 按全日或校外特别日程处理。",
      "社团招新周/社团说明会/学生会选举/校庆准备/万圣节等: 普通授课可继续，但放学后或指定时段优先发生特殊活动。",
      "",
      "前端主屏课程显示:",
      "  - 手机主界面会根据`系统.当前日期`、`系统.当前时间`和`系统.当前日程`静态显示星期与当前课段。",
      "  - 初始日期是4月9日 星期三，4月8日为入学式/始业式；若后续日期文本没有写星期，前端按这个学年日历锚点推算星期。",
      "  - 普通授课日会按上面的周课表显示具体科目；周六周日显示周末自由。",
      "  - 若日期命中特殊日，前端和AI都优先使用特殊日程；只有写明普通授课的特殊日才继续显示课程，并把活动作为备注。",
      "  - 前端会把计算出的`当天课程表`写入MVU变量，内容包含当天完整课表、当前课段和第二天第一节课；AI不要手动维护这个字段。",
      "  - AI叙事和变量更新应维护`当前日期`、`当前时间`、`当前日程`、`当前/待上课程`和`当前事件`，并检查当前场景是否符合课程/周末/假期。",
      "  - `当前/待上课程`只写当前正在上的课程或最近一节待上课程；没有课程、周末、假期、考试或活动日写`无`。",
      "  - `当前事件`写更泛的当前场景/事件，可包含午休、考试、节日、社团招新、体育祭或放学后安排。"
    ].join("\n");
    return content.replace(/<日程表>[\s\S]*?<\/日程表>/, `<日程表>\n${scheduleBlock}\n</日程表>`);
  });

  patchEntryContent(entries, "[mvu_update]变量说明和更新规则🈯", (content) => {
    const resourceRuleBlock = [
      "    MC能量:",
      "      type: number",
      "      info: 催眠APP功能实际消耗的能量余额；这是能不能启动/追加催眠的主要余额。",
      "      check:",
      "        - 催眠功能消耗MC能量时只从`MC能量`扣除，不能从`当前MC点`、`MC能量上限`或`持有零花钱`代扣。",
      "        - 花费前必须先判断余额是否足够；不足则对应操作失败，不扣费、不生效、不得让数值低于0。",
      "        - 若本轮APP操作中的催眠功能成功且有`MC能量消耗`，必须输出JSON Patch：`{ \"op\": \"replace\", \"path\": \"/系统/MC能量\", \"value\": 当前系统.MC能量 - 实际MC能量消耗 }`；失败则不要扣。",
      "    MC能量上限:",
      "      type: number",
      "      info: MC能量容量上限，只表示最多能存多少能量，不是可花费余额。",
      "      check:",
      "        - 普通催眠消耗不会改变此值；只有明确升级、扩容、订阅或规则说明时才更新。",
      "        - 不能把`MC能量上限`当成当前可用能量，也不能用它支付费用。",
      "    当前MC点:",
      "      type: number",
      "      info: PT/MC点货币，用于订阅、补给、领取奖励或匿名版相关收支；与`MC能量`完全分离。",
      "      check:",
      "        - 被催眠角色每个部位每高潮一次获得5点",
      "        - 快感值大于200的高潮获得10点, 大于300获得20, 大于400获得40点, 大于500获得80点",
      "        - 任务完成时根据任务说明或`奖励MC点`直接获得，并在同一次<update>中把该任务标记为`已完成:true`等待前端同步",
      "        - 订阅、补给、领取等需要支付MC点时必须先检查余额；不足则失败，不得负数、贷款或自动兑换。",
      "        - 重要：**只有**在上述情况下当前MC点才会更新，如果没有完成任务或任务高潮**永远不要**更新"
    ].join("\n");
	    const profileRuleBlock = [
	      "    外观:",
	      "      type: string",
      "      info: 身体检测展示用的外观/衣着/身体状态摘要。",
      "      check:",
      "        - 只有当当前剧情明确改变衣着、外貌、伤痕、可见身体状态或伪装时更新；不要每轮重写。",
      "    心理:",
      "      type: string",
      "      info: 角色此刻正在想什么/当下内心念头，不是长期性格、总体态度或人设总结。",
      "      check:",
      "        - 只有当本轮剧情明确展示或改变角色当下想法时更新；内容应贴合当前场景、目标和短期注意力。",
	      "        - 若只是长期关系、性格或常态印象变化，应优先写入人设/剧情，不要把`心理`改成固定标签。"
	    ].join("\n");
	    const taskRuleBlock = [
	      "  成就:",
	      "    type: |-",
	      "      {",
	      "        [成就名: string]: {",
	      "          成就ID?: string;",
	      "          条件?: string;",
	      "          奖励MC点: number;",
	      "          已完成: true;",
	      "        }",
	      "      }",
	      "    check:",
	      "      - `成就`变量只临时保存本轮用户在前端明确点击领取、且AI已发放奖励、等待前端同步的成就；不要保存未完成成就。",
	      "      - AI不知道前端全量成就列表；只能根据本轮`本轮APP操作`中明确出现的`领取成就`、成就ID/名称、条件和奖励来结算，不能自创成就，也不能补记之前楼层已经完成的成就。",
	      "      - 成就写入这里时至少包含`成就`或`成就ID`、`奖励MC点`和`已完成:true`；前端最新楼层会读取一次并写入浏览器本地状态，然后删除变量里的对应成就。",
	      "  任务:",
	      "    type: |-",
	      "      {",
	      "        [任务名: string]: {",
	      "          完成条件: string;",
	      "          奖励MC点: number;",
	      "          已完成: bool;",
	      "        }",
	      "      }",
	      "    check:",
	      "      - `任务`变量保存已接/进行中任务，也可临时保存本轮刚完成且尚未被前端同步的任务；最多3个进行中任务，静态任务未接取前不写入变量。",
	      "      - 新增任务是系统突然出现/刷出的任务，不是{{user}}主动发布、设计或提前知道的目标；用户没指定的必要内容由AI随机生成，可适当优化用户描述以贴合当前剧情。",
	      "      - 新增任务直接写入这里，必须包含`完成条件`、`奖励MC点`和`已完成:false`；若已有进行中任务为3个，则不得新增。",
	      "      - 只有本轮剧情明确满足任务完成条件时，才直接把奖励加到`系统/当前MC点`，并在同一次<update>中把该任务保留完整信息且设为`已完成:true`；不要补记之前楼层完成过的任务。",
	      "      - 前端最新楼层会读取一次已完成任务并写入浏览器本地状态，然后删除变量里的对应任务；AI不要另建已完成任务列表。"
	    ].join("\n");
    let next = content
      .replace(
        "        - 参考日程表变更为上学 -> 上课 -> 午休 -> 放学 或 校庆, 盂兰盆节等\n        - 参考日历的特殊日期或节日",
        "        - 参考日程表、周课表和本月日历变更为早训、朝礼、具体科目、午休、终礼、清扫、放学后、节日/考试/特别活动等\n        - 特殊日期优先于普通课表；周末和假期通常没有固定课程，除非剧情或日历明确安排社团、补习、合宿、考试或活动"
      );
    const scheduleVariableBlock = [
      "    当前/待上课程:",
      "      check:",
      "        - 当前处于普通授课的某一节课时写具体科目；课前/课间写最近一节待上课程；无课程、周末、假期、考试或特别活动时写`无`。",
      "    当天课程表:",
      "      type: object",
      "      check:",
      "        - 由前端根据`当前日期`、`当前时间`和内置周课表自动维护，包含当天完整课表、当前课段和第二天第一节课；AI不要手动维护。",
      "    当前事件:",
      "      check:",
      "        - 写当前最具体的事件/场景，可包含课程、午休、考试、节日、社团招新、体育祭、放学后安排或剧情事件；用于AI理解当前舞台。"
    ].join("\n");
    if (!next.includes("    当前/待上课程:")) {
      next = next.replace("    当前或下个事件:", `${scheduleVariableBlock}\n    当前或下个事件:`);
    }
    next = next.replace(
      /    当前MC点:\n      type: number\n      check:\n        - 被催眠角色每个部位每高潮一次获得5点\n        - 快感值大于200的高潮获得10点, 大于300获得20, 大于400获得40点, 大于500获得80点\n        - 完成任务根据任务说明获得\n        - 重要：\*\*只有\*\*在上述情况下当前MC点才会更新，如果没有完成任务或任务高潮\*\*永远不要\*\*更新/,
      resourceRuleBlock
    );
    if (!next.includes("    MC能量:\n      type: number")) {
      next = next.replace("    持有零花钱:", `${resourceRuleBlock}\n    持有零花钱:`);
    }
    const mcEnergyPatchLine = "        - 若本轮APP操作中的催眠功能成功且有`MC能量消耗`，必须输出JSON Patch：`{ \"op\": \"replace\", \"path\": \"/系统/MC能量\", \"value\": 当前系统.MC能量 - 实际MC能量消耗 }`；失败则不要扣。";
    if (!next.includes(mcEnergyPatchLine)) {
      next = next.replace(
        "        - 花费前必须先判断余额是否足够；不足则对应操作失败，不扣费、不生效、不得让数值低于0。",
        `        - 花费前必须先判断余额是否足够；不足则对应操作失败，不扣费、不生效、不得让数值低于0。\n${mcEnergyPatchLine}`
      );
    }
	    if (!next.includes("    心理:\n      type: string\n      info: 角色此刻正在想什么/当下内心念头")) {
	      next = next.replace("    ${部位}敏感度:", `${profileRuleBlock}\n    \${部位}敏感度:`);
	    }
	    next = next.replace(/  任务:\s*\n    type: \|-[\s\S]*?禁止添加新任务\./, taskRuleBlock);
	    return next;
	  });

  patchEntryContent(entries, "[mvu_update]本轮APP操作", (content) => {
    const next = [
      "<APP操作log>",
      "如果本轮用户输入中存在<本轮APP操作>...</本轮APP操作>容器，则把容器内内容视为{{user}}刚才在手机界面里的操作意图。",
      "",
      "规则:",
      "- 如果本轮用户输入中没有<本轮APP操作>容器，或容器为空/无，则代表{{user}}没有操作APP，严禁进行相关新增操作描写。",
      "- 前端只记录用户在手机界面里的操作意图，不直接发送指令，也不直接改最终变量。",
      "- AI必须根据剧情、资源/金钱/MC点、订阅权限、人数、时间、目标状态、风险和合理性判断操作是否成功。",
      "- 资源名必须严格区分：`MC能量`=催眠能量余额；`MC能量上限`=容量上限，不可花费；`当前MC点`=PT/MC点货币；`持有零花钱`=金钱。不同资源不能互相顶替。",
      "- 订阅、资源兑换、启动/追加催眠、申请校规等消费操作会在`本轮APP操作`里携带`当前变量余额`；这是前端读取到的MVU余额快照，AI结算时必须用它对照当前变量检查是否足够。",
      "- 所有涉及花费的操作必须按同一批次顺序先验算余额再生效：余额不足则该操作失败，不扣费、不产生奖励/物品/催眠效果/订阅状态，不得把任何余额写成负数。",
      "- 如果某个操作失败，同批次后续依赖它、依赖启动催眠成功状态、或继续消耗同一不足资源的操作也失败；可以继续结算与失败项无关且余额充足的独立操作。",
      "- AI禁止贷款、赊账、透支、自动补给、自动购买能量、自动把`当前MC点`或`持有零花钱`兑换成`MC能量`；只有当`本轮APP操作`明确包含兑换/补给/购买且该操作本身余额充足时才可进行。",
      "- 催眠APP启动/追加催眠会携带总`预计消耗`、`MC能量消耗`、`当前MC点消耗`，并在每项功能里携带`是否受人数影响`与`是否受时间影响`；AI结算时优先按这些中文字段处理。标记为不受人数影响的群体类命令不按人数乘算，标记为不受时间影响的永久/一次性命令不按持续时间乘算。",
      "- 若催眠功能成功并产生`MC能量消耗`，必须用JSON Patch更新`/系统/MC能量`为扣除后的余额；若余额不足或操作失败，则不得扣除。",
      "- 前端每条操作只记录数值和路径；本条世界书规则是余额/扣费提醒的唯一来源，AI不要在同一批次多个催眠命令里反复复述余额提醒。",
      "- 单功能购买已取消：只要对应VIP等级已经订阅/解锁，前端允许直接启用该等级内功能；AI不需要写入或维护任何`购买状态`变量。",
      "- 订阅/解锁VIP只代表获得权限，不等于自动使用功能；除非本轮APP操作同时包含`启动催眠`且功能列表中明确启用了某功能，否则不得擅自产生催眠效果。",
      "- 催眠APP、领取任务、完成成就、订阅、补给、库存、日历、扫描角色、删除角色、新增任务和申请立校规等操作都按本规则结算；校规的作用范围与写入位置见[mvu_update]校规规则。",
      "- `成就`变量只作为“本轮用户在前端明确点击领取、且AI已发放奖励、待前端同步的已完成成就”临时容器；不要保存未完成成就。AI看不到前端全量成就列表，只能结算`本轮APP操作`里明确出现的成就ID/名称/条件/奖励；不能自创成就，不能补记之前楼层完成的成就。前端同步后会清空对应条目。",
      "- `任务`变量保存已接/进行中任务，也可临时保存已经完成但尚未被前端同步的任务；最多3个进行中任务。新增任务操作表示系统突然刷出若干任务，不是{{user}}主动发布、设计或提前知道的目标，也不代表{{user}}主动关联到任务对象；数量不得超过`3-当前已接任务数`，若已接任务数为3则本次新增失败。",
      "- 新增任务中用户没指定的必要内容由AI随机生成，可适当优化用户的倾向描述，使任务名、目标、完成条件和奖励更贴合当前上下文剧情。",
      "- 新增任务必须写入`/任务/任务名`，包含`完成条件`、`奖励MC点`和`已完成:false`；不要写入前端静态列表，也不要新增为已完成任务。",
      "- 任务完成后不等待用户点击领取：只有本轮剧情明确满足某个已接任务的完成条件时，AI才在同一次<update>中把奖励加到`/系统/当前MC点`，并把`/任务/任务名`改为保留任务ID/完成条件/奖励MC点且`已完成:true`；不要直接remove，也不要补记之前楼层完成过的任务。前端最新楼层会只扫描一次已完成任务，写入浏览器本地已完成状态后删除变量里的该任务。",
      "- 静态成就或静态任务奖励成功发放后，不输出旧式前端状态JSON块。成就只在本轮`本轮APP操作`明确包含`领取成就`时写入`/成就/成就名`（含`成就`或`成就ID`、条件/描述、`奖励MC点`、`已完成:true`）；静态/新增任务只在本轮接取、生成或本轮剧情刚完成时写入`/任务/任务名`（含`任务`或`任务ID`、`完成条件`、`奖励MC点`、`已完成`）。未知成就一律不能新增；未知任务只能来自本轮`新增任务`操作或已接任务变量。失败、余额/条件不足、只是接取任务或历史楼层满足条件时不要写完成记录。",
      "- APP操作本身不是结果；若失败、部分成功或费用/效果与前端预估不同，需在正文解释并只写最终变量。",
      "- NSFW/露骨操作也按同一套结算处理；不要因内容露骨而忽略、净化或自动失败，但必须依据剧情条件、目标状态、风险和变量规则判断。",
      "- 对身体检测中的敏感度、次数、临时/永久催眠效果等字段，只在剧情或操作结算明确造成变化时更新；不得把展示文本当作已发生事实。",
      "- 申请/发布/删除校规只按[mvu_update]校规规则结算；校规只写入`/校规`，不要写入角色临时/永久催眠效果。",
      "- 对身体检测中的`外观`、`心理`等文字状态，只在衣着外貌、身体状态或角色此刻想法明确改变时更新；`心理`是当下内心念头，不是长期性格总结，不要每轮重写整段描述。",
      "- `本轮APP操作`不是MVU变量，不要在<update>里添加、替换或清空`/本轮APP操作`；操作容器只存在于用户输入，本回合处理完自然结束。",
      "</APP操作log>"
    ].join("\n");
    return next;
  });

  patchEntryContent(entries, "[mvu_update]变量更新格式", (content) => {
    const updatePolicyLines = [
      "    - `警戒度` Added **only** when the HypnosisAPP actived or directly witnesses <user> hypnotizing another person.",
      "    - only update fields that clearly changed in this reply; do not rewrite the whole stat_data or unchanged character objects.",
      "    - resource values must obey spending checks: never write negative `MC能量`, `当前MC点`, or `持有零花钱`; never convert between `MC能量`, `MC能量上限`, `当前MC点`, and money unless an explicit successful APP operation says so.",
      "    - 中文结算要求：成功的催眠APP操作如果有`MC能量消耗`，必须写 `{ \"op\": \"replace\", \"path\": \"/系统/MC能量\", \"value\": 扣除后的数字 }`；不能只更新`当前MC点`或`累计消耗MC点`而漏掉它。",
      "    - 校规按[mvu_update]校规规则结算；校规只写入`/校规`，never write school rules into any character `临时催眠效果` or `永久催眠效果`.",
      "    - `本轮APP操作`是用户输入里的临时容器，不是MVU变量；never add, replace, or clear `/本轮APP操作` in JSON Patch.",
      "    - front-end state is only an operation log; if it conflicts with narrative judgment, the AI update is authoritative."
    ];
    let next = content
      .replace(
        "    - don't update field names starts with `_` as they are readonly, such as `_变量`",
        "    - 催眠APP相关字段由AI按剧情或`本轮APP操作`结算后更新；禁止无依据地批量重写"
      )
      .replace(
        "    - `_`开头的催眠APP相关字段不再由前端独占；AI可在剧情或`本轮APP操作`明确结算后更新，但禁止无依据地批量重写",
        "    - 催眠APP相关字段由AI按剧情或`本轮APP操作`结算后更新；禁止无依据地批量重写"
      )
      .replace(
        "    - if `本轮APP操作` has been handled, add a JSON Patch command: `{ \"op\": \"replace\", \"path\": \"/本轮APP操作\", \"value\": \"无\" }`.",
        "    - `本轮APP操作`是用户输入里的临时容器，不是MVU变量；never add, replace, or clear `/本轮APP操作` in JSON Patch."
      );
    if (!next.includes(updatePolicyLines[1])) {
      next = next.replace(updatePolicyLines[0], updatePolicyLines.join("\n"));
    }
    for (const line of updatePolicyLines) {
      if (next.includes(line)) continue;
      next = next.replace("  format: |-", `${line}\n  format: |-`);
    }
    const profileUpdateLine = "    - `外观` and `心理` are compact text state fields shown in 身体检测; `心理` means what the character is thinking at that moment, not a long-term personality summary. Only replace `/角色/角色名/外观` or `/角色/角色名/心理` when visible appearance, clothing/body state, or the current inner thought clearly changed in this reply.";
    const oldProfileUpdateLine = "    - `外观` and `心理` are compact text state fields shown in 身体检测; only replace `/角色/角色名/外观` or `/角色/角色名/心理` when visible appearance, clothing/body state, attitude, mental state, or relationship cognition clearly changed in this reply.";
    next = next.replace(oldProfileUpdateLine, profileUpdateLine);
    if (!next.includes("`外观` and `心理`")) {
      next = next.replace(
        "    - `本轮APP操作`是用户输入里的临时容器，不是MVU变量；never add, replace, or clear `/本轮APP操作` in JSON Patch.",
        `${profileUpdateLine}\n    - \`本轮APP操作\`是用户输入里的临时容器，不是MVU变量；never add, replace, or clear \`/本轮APP操作\` in JSON Patch.`
      );
    }
    return dedupeExactLines(next, updatePolicyLines.concat(profileUpdateLine));
  });

  patchEntryContent(entries, "[mvu_update]匿名版介绍", (content) => {
    const staticBlock = [
      "当前前端实现:",
      "  - 匿名版/MChan 是手机内部静态只读页面，与库存、日历同级；不再作为独立前端正则渲染。",
      "  - 前端只读展示旧角色卡种子帖；用户只能浏览版块、搜索帖子、点击帖子看详情并返回匿名版首页，没有发帖、回帖、编辑、删除。",
      "  - 浏览匿名版不写入 `系统.手机.MChan.*`、`系统.hypnoos.mchan` 或任何论坛状态字段，也不要求AI每轮刷新帖子列表。",
      "  - 匿名版内容只是论坛文本、传闻、提示或误导素材，不能自动证明线下事实；是否为事实由剧情判断。",
      "  - 若正文剧情明确让{{user}}接取悬赏或发布内容，再按任务/MC点规则结算；不能因为静态展示或浏览动作自动添加任务、收益或变量。"
    ].join("\n");
    if (content.includes("当前前端实现:")) return content;
    return content.replace("各个板块介绍:", `${staticBlock}\n各个板块介绍:`);
  });

  patchEntryContent(entries, "[mvu_plot]人物列表", (content) => {
    const scanBlock = [
      "动态/扫描角色:",
      "  - 手机主界面的“扫描角色”APP只记录{{user}}主动看到目标并用手机扫描/锁定该目标的意图；前端不会直接改变量，也不会直接发送`/add`。",
      "  - AI处理扫描角色时，必须以当前剧情中{{user}}已经看见并能锁定的目标为对象；不要凭空创建场外角色。",
      "  - 若用户未填写角色名，AI先根据目标身体、当前场景、气质和可见特征随机取一个自然、可长期使用的姓名，禁止使用“未知角色”“目标A”等占位名。",
      "  - 命名后使用`/add 角色名`在角色路径下新增角色，再按西园寺爱丽莎、月咏深雪、犬冢夏美的变量结构与人设粒度更新`stat_data.角色`；变量结构需包含`外观`、`心理`(此刻想法)、核心数值、敏感度、次数、临时/永久催眠效果。",
      "  - 扫描角色的目标定位/身体描述可以保留用户填写的成人/NSFW细节；AI建档时不要净化，但只把当前可见和剧情允许的信息写入人设/变量。",
      "  - 身体检测中的“删除角色”只允许删除后续自建角色；西园寺爱丽莎、月咏深雪、犬冢夏美永远不能删除。",
      "  - 删除自建角色时，AI只删除`stat_data.角色.角色名`；若该角色仍在剧情现场或删除会破坏连续性，应在正文说明并拒绝或延后删除。"
    ].join("\n");
    if (content.includes("动态/扫描角色:")) {
      return content.replace(/动态\/扫描角色:[\s\S]*?(?=\n<\/人物列表>)/, scanBlock);
    }
    return content.replace("</人物列表>", `${scanBlock}\n</人物列表>`);
  });

  migrateEntriesToUnprefixedSystemVariables(entries);
}

function ensureLinesBeforeEndTag(content, lines) {
  let next = content;
  for (const line of lines) {
    if (next.includes(line)) continue;
    const endMatch = next.match(/\n<\/[^>]+>\s*$/);
    if (endMatch) next = next.replace(endMatch[0], `\n${line}${endMatch[0]}`);
    else next = `${next.trimEnd()}\n${line}`;
  }
  return next;
}

function dedupeExactLines(content, lines) {
  const targets = new Set(lines);
  const seen = new Set();
  return String(content || "")
    .split("\n")
    .filter((line) => {
      if (!targets.has(line)) return true;
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .join("\n");
}

function patchEntryContent(entries, comment, mutator) {
  const entry = entries.find((item) => item.comment === comment);
  if (!entry || typeof entry.content !== "string") return;
  entry.content = mutator(entry.content);
}

function removeBookEntry(entries, comment) {
  const index = entries.findIndex((item) => item.comment === comment);
  if (index >= 0) entries.splice(index, 1);
}

function upsertBookEntry(entries, options) {
  let entry = entries.find((item) => item.comment === options.comment);
  if (!entry) {
    entry = {
      id: nextEntryId(entries),
      keys: options.keys || [],
      secondary_keys: [],
      comment: options.comment,
      content: "",
      constant: options.constant ?? true,
      selective: true,
      insertion_order: options.insertion_order ?? 100,
      enabled: true,
      position: options.position || "after_char",
      use_regex: true,
      extensions: { position: 4, depth: options.depth ?? 0, role: options.role ?? 0, probability: 100, useProbability: true }
    };
    entries.push(entry);
  }
  entry.content = options.content;
  entry.enabled = true;
  entry.position = options.position || entry.position || "after_char";
  entry.insertion_order = options.insertion_order ?? entry.insertion_order ?? 100;
  entry.constant = options.constant ?? entry.constant ?? true;
  entry.selective = options.selective ?? entry.selective ?? true;
  entry.use_regex = true;
  entry.keys = options.keys || entry.keys || [];
  entry.secondary_keys ||= [];
  entry.extensions ||= {};
  entry.extensions.position ??= 4;
  entry.extensions.depth = options.depth ?? entry.extensions.depth ?? 0;
  entry.extensions.role = options.role ?? entry.extensions.role ?? 0;
  entry.extensions.probability ??= 100;
  entry.extensions.useProbability ??= true;
  return entry;
}

render();
void loadSampleCard();
