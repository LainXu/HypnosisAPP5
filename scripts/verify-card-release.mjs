import { readFile } from "node:fs/promises";
import { CARD_PATH, DIST_REPO } from "./card-config.mjs";
import { parseCharacterCard } from "../src/card-parser.js";

const REQUIRED_SECTIONS = ["系统", "校规", "任务", "角色"];
const DEFAULT_ROLES = ["西园寺爱丽莎", "月咏深雪", "犬冢夏美", "阿宅"];
const BANNED_INITIAL_ROLES = ["阿宅君"];
const DEFAULT_SCHOOL_RULES = ["仪容礼仪", "出勤学习", "校内安全", "校内风纪", "环境卫生"];
const BANNED_ENTRY_COMMENTS = [
  "[mvu_update]特殊地点准入证规则",
  "[mvu_update](分步更新变量的时候开)变量更新任务说明"
];
const DAILY_SETTLEMENT_SCRIPT_ID = "77618567-3f61-4303-908f-9ee59ab45cd2";
const DAILY_SETTLEMENT_SCRIPT_NAME = "数值控制脚本";
const MOBILE_MAIN_FRONTEND_TEST_GREETING = "<StatusPlaceHolderImpl/>";
const DEBUG_TEST_GREETING = "Debug测试\n<StatusPlaceHolderImpl/>";
const BANNED_TEXT_PATTERNS = [
  /MC能量.*恢复.*一半/,
  /恢复.*MC能量上限.*一半/,
  /半管/,
  /每天恢复[^。\n]*50\s*%/,
  /MC能量[^。\n]*50\s*%/,
  /regenPerDay\s*=\s*safeMax\s*\*\s*0\.5/,
  /safeMax\s*\*\s*0\.5/,
  /每天降低[^。\n]*(主角可疑度|警戒度)/,
  /每个角色每\s*5\s*点[^。\n]*警戒度[^。\n]*(主角可疑度|可疑度)/,
  /dailySuspicionIncrease/,
  /nextAlertness/,
  /registerMvuSchema/,
  /mvu_zod/,
  /变量结构\s*01\/14/,
  /Reconciling schema/i
];
const BANNED_FRONTEND_TEXT = [
  "encounterSystemWorldbookEntries",
  "encounterEnsureSystemWorldbooks",
  "邂逅系统世界书",
  "特殊地点准入证规则"
];
const BANNED_PROMPT_MACRO_PATTERNS = [
  /\{\{(?:get|format)_message_variable::stat_data\s*(?:\}\}|$)/
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function duplicateEntries(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts].filter(([, count]) => count > 1);
}

function normalizedContent(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function scriptText(script) {
  return [
    script?.scriptName,
    script?.name,
    script?.info,
    script?.content,
    script?.replaceString
  ].map((value) => String(value || "")).join("\n");
}

function assertNoBannedText(label, text) {
  for (const pattern of BANNED_TEXT_PATTERNS) {
    assert(!pattern.test(text), `banned legacy text matched in ${label}: ${pattern}`);
  }
}

async function readText(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

const parsed = parseCharacterCard(await readFile(CARD_PATH));
const data = parsed.card.data || parsed.card;
const entries = data.character_book?.entries || [];
const comments = entries.map((entry) => String(entry.comment || ""));
const identityBootstrapEntries = data.extensions?.workbench?.identityBootstrapEntries || [];
const init = entries.find((entry) => String(entry.comment || "") === "[initvar]变量初始化不需要开");
const initContent = String(init?.content || "");

assert(init, "missing [initvar]变量初始化不需要开");
assert(Array.isArray(data.alternate_greetings), "alternate greetings must be an array");
assert(
  data.alternate_greetings.length === 2
  && String(data.alternate_greetings[0] || "").trim() === MOBILE_MAIN_FRONTEND_TEST_GREETING
  && String(data.alternate_greetings[1] || "").trim() === DEBUG_TEST_GREETING,
  `alternate greetings must contain mobile frontend placeholder and Debug测试 placeholder, found ${JSON.stringify(data.alternate_greetings)}`
);

const positions = Object.fromEntries(
  REQUIRED_SECTIONS.map((name) => [name, initContent.search(new RegExp("^" + name + ":", "m"))])
);
for (const name of REQUIRED_SECTIONS) assert(positions[name] >= 0, `missing init section: ${name}`);
for (let index = 1; index < REQUIRED_SECTIONS.length; index += 1) {
  const prev = REQUIRED_SECTIONS[index - 1];
  const current = REQUIRED_SECTIONS[index];
  assert(positions[prev] < positions[current], `bad init section order: ${prev} before ${current}`);
}

const systemBlock = initContent.slice(positions["系统"], positions["校规"]);
for (const [name, pattern] of Object.entries({
  "_社畜值": /^\s{2}_社畜值:\s*0\s*$/m,
  "_buff": /^\s{2}_buff:\s*""\s*$/m,
  "_buff结束时间": /^\s{2}_buff结束时间:\s*""\s*$/m,
  "_课程表": /^\s{2}_课程表:\s*$/m
})) {
  assert(pattern.test(systemBlock), `missing readonly init variable: ${name}`);
}
assert(
  !/^\s{2}(社畜值|buff|buff结束时间|课程表):\s*/m.test(systemBlock),
  "legacy writable work/schedule variable leaked into system init block"
);

const schoolBlock = initContent.slice(positions["校规"], positions["任务"]);
const missingSchoolRules = DEFAULT_SCHOOL_RULES.filter((name) => !schoolBlock.includes(name));
assert(!missingSchoolRules.length, `missing default school rules: ${missingSchoolRules.join(", ")}`);

const roleSection = initContent.slice(positions["角色"]);
const initialRoles = [...roleSection.matchAll(/^  ([^\s\n][^:\n]*):\s*$/gm)].map((match) => match[1]);
function initialRoleBlock(roleName) {
  const escaped = roleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const header = new RegExp("^  " + escaped + ":\\s*$", "m");
  const match = roleSection.match(header);
  if (!match) return "";
  const start = match.index;
  const afterHeader = start + match[0].length;
  const rest = roleSection.slice(afterHeader);
  const nextRole = rest.search(/\n  [^\s\n][^:\n]*:\s*$/m);
  const end = nextRole >= 0 ? afterHeader + nextRole : roleSection.length;
  return roleSection.slice(start, end);
}
assert(
  DEFAULT_ROLES.every((name, index) => initialRoles[index] === name),
  `bad default role order: ${initialRoles.slice(0, DEFAULT_ROLES.length).join(", ")}`
);
const missingInitialRoles = DEFAULT_ROLES.filter((name) => !initialRoles.includes(name));
assert(!missingInitialRoles.length, `missing initial role variables: ${missingInitialRoles.join(", ")}`);
const bannedInitialRoles = BANNED_INITIAL_ROLES.filter((name) => initialRoles.includes(name));
assert(!bannedInitialRoles.length, `legacy roles leaked into init variables: ${bannedInitialRoles.join(", ")}`);
for (const roleName of DEFAULT_ROLES) {
  const block = initialRoleBlock(roleName);
  assert(block, `missing initial role block: ${roleName}`);
  assert(block.includes('心理: "未记录"'), `initial role psychology must be unrecorded: ${roleName}`);
  assert(block.includes('事件记录: "00000"'), `initial role missing event record: ${roleName}`);
  assert(block.includes('至关重要记忆: ""'), `initial role missing important memory: ${roleName}`);
}
for (const comment of [
  "[mvu_update]西园寺爱丽莎变量",
  "[mvu_update]月咏深雪变量",
  "[mvu_update]犬冢夏美变量",
  "[mvu_update]阿宅变量",
  "[mvu_plot]西园寺爱丽莎人设",
  "[mvu_plot]月咏深雪人设",
  "[mvu_plot]犬冢夏美人设",
  "[mvu_plot]阿宅人设",
  "[mvu_plot]阿宅女性化人设"
]) {
  assert(comments.includes(comment), `missing main-card identity entry: ${comment}`);
}
assert(!identityBootstrapEntries.length, "identity entries must not be stored for chat-worldbook bootstrap");

const duplicateComments = duplicateEntries(comments.filter(Boolean));
assert(!duplicateComments.length, `duplicate worldbook comments: ${duplicateComments.map(([name]) => name).join(", ")}`);

const contentPrefixes = entries
  .map((entry) => normalizedContent(entry.content).slice(0, 600))
  .filter(Boolean);
const duplicateContent = duplicateEntries(contentPrefixes);
assert(!duplicateContent.length, `duplicate worldbook content prefixes: ${duplicateContent.length}`);

for (const comment of BANNED_ENTRY_COMMENTS) {
  assert(!comments.includes(comment), `banned worldbook entry still exists: ${comment}`);
}

const allWorldbookText = entries.map((entry) => String(entry.content || "")).join("\n");
assertNoBannedText("worldbook", allWorldbookText);
for (const pattern of BANNED_PROMPT_MACRO_PATTERNS) {
  assert(!pattern.test(allWorldbookText), `banned variable macro exposes private/full root data: ${pattern}`);
}
assert(
  allWorldbookText.includes("<新增地点补充>")
  && allWorldbookText.includes("前端尚未")
  && allWorldbookText.includes("前端收到后才保存"),
  "worldbook must require AI to emit <新增地点补充> before frontend stores custom locations"
);
for (const needle of ["/系统/_社畜值", "/系统/_buff", "/系统/_buff结束时间", "/系统/_课程表"]) {
  assert(allWorldbookText.includes(needle), `worldbook missing readonly path: ${needle}`);
}

const finalizerText = await readText("scripts/finalize-card-v1_6.mjs");
assert(
  finalizerText.includes("dynamicRecordSchema")
  && ["校规", "任务", "临时催眠效果", "永久催眠效果"].every((key) => finalizerText.includes(`"${key}"`)),
  "finalizer must keep dynamic MVU dictionary schema repair for school rules, tasks and hypnosis effects"
);

const regexText = JSON.stringify(data.extensions?.regex_scripts || []);
assert(regexText.includes(`cdn.jsdelivr.net/gh/${DIST_REPO}@`), "card regex does not use commit-pinned CDN");
assert(!regexText.includes(`cdn.jsdelivr.net/gh/${DIST_REPO}@main`), "card regex points at mutable main branch");
assertNoBannedText("regex_scripts", regexText);
const identityRegex = (data.extensions?.regex_scripts || []).find((script) =>
  String(script?.scriptName || script?.name || "") === "首楼身份选择前端"
);
assert(identityRegex, "missing identity frontend regex");
assert(
  String(identityRegex.replaceString || "").includes('$("body").load(url)'),
  "identity frontend must keep the body-load fallback"
);
assert(
  String(identityRegex.replaceString || "").includes("st-hypnoos-identity-inline-frame"),
  "identity frontend must embed inside the chat message"
);
assert(
  !String(identityRegex.replaceString || "").includes('document.querySelector("#identityRoot")) return'),
  "identity frontend must not skip body load when an old embedded identity root exists"
);
assert(
  !String(identityRegex.replaceString || "").includes("__ST_HYPNOOS_IDENTITY_BOOTSTRAP_ENTRIES__"),
  "identity frontend must not carry chat worldbook bootstrap entries"
);

const tavernHelperScripts = data.extensions?.tavern_helper?.scripts || [];
const dailySettlementScripts = tavernHelperScripts.filter((script) =>
  String(script?.id || "") === DAILY_SETTLEMENT_SCRIPT_ID || String(script?.name || "") === DAILY_SETTLEMENT_SCRIPT_NAME
);
assert(dailySettlementScripts.length === 0, `daily settlement helper script must not be bundled, found ${dailySettlementScripts.length}`);
for (const script of tavernHelperScripts) {
  const id = String(script?.id || "");
  const name = String(script?.name || "");
  const text = scriptText(script);
  assertNoBannedText(`tavern_helper script ${name || id || "unknown"}`, text);
}

const frontendTexts = [
  await readText("public/frontends/hypnosis-app/st-load-inline.html"),
  await readText("public/frontends/hypnosis-app-phone/st-load-inline.html"),
  await readText("public/frontends/hypnosis-app/identity.html"),
  await readText("scripts/mirror-frontend.mjs")
].join("\n");
for (const needle of BANNED_FRONTEND_TEXT) {
  assert(!frontendTexts.includes(needle), `banned frontend text still exists: ${needle}`);
}
for (const needle of ['system["_buff结束时间"]', 'setCurrentLayerSystemField("_buff结束时间"', "/系统/_buff结束时间"]) {
  assert(frontendTexts.includes(needle), `frontend missing work buff end write path: ${needle}`);
}
for (const needle of ["repairCurrentMvuDynamicSchema", "repairDynamicMvuSchemaTree", "recursiveExtensible", "删除/废止校规若标明前端处理"]) {
  assert(frontendTexts.includes(needle), `frontend missing dynamic schema/school-rule safety text: ${needle}`);
}
assert(frontendTexts.includes("st-hypnoos-identity-port"), "identity frontend missing phone-style port wrapper");
assert(!frontendTexts.includes("st-hypnoos-identity-portal-frame"), "identity frontend must not create a top-level portal frame");
assert(!frontendTexts.includes("insertBootstrapEntries"), "identity frontend must not write chat worldbooks");
assert(!frontendTexts.includes("聊天世界书已创建/绑定"), "identity frontend still announces chat worldbook creation");

console.log(
  JSON.stringify(
    {
      ok: true,
      card: CARD_PATH,
      entries: entries.length,
      defaultRoles: initialRoles.slice(0, DEFAULT_ROLES.length),
      defaultSchoolRules: DEFAULT_SCHOOL_RULES
    },
    null,
    2
  )
);
