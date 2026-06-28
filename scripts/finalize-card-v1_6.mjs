import { readFile, writeFile } from "node:fs/promises";
import { buildCardPngBytes, ensureCardShape, parseCharacterCard } from "../src/card-parser.js";

const SHARE_PNG = "public/cards/催眠app二改MVU.png";
const LOCAL_PNG = "public/cards/hypnosis-app.png";
const WORKBENCH_JSON = "public/cards/hypnosis-app-workbench-current.json";
const VERSION_NAME = "v1.6";
const DIST_REPO = "LainXu/HypnosisAPP5-dist";
const REMOTE_COMMIT = process.env.HYPNOOS_REMOTE_COMMIT || "";

function nextEntryId(entries) {
  return Math.max(0, ...entries.map((entry) => Number(entry.id) || 0)) + 1;
}

function upsertEntry(entries, options) {
  let entry = entries.find((item) => item.comment === options.comment);
  if (!entry) {
    entry = {
      id: nextEntryId(entries),
      keys: [],
      secondary_keys: [],
      comment: options.comment,
      content: "",
      constant: true,
      selective: false,
      insertion_order: options.insertion_order ?? 100,
      enabled: true,
      position: "after_char",
      use_regex: true,
      extensions: { position: 4, depth: 0, role: 0, probability: 100, useProbability: true }
    };
    entries.push(entry);
  }
  entry.keys = options.keys ?? entry.keys ?? [];
  entry.secondary_keys ??= [];
  entry.content = options.content;
  entry.constant = options.constant ?? true;
  entry.selective = options.selective ?? false;
  entry.enabled = true;
  entry.position = options.position ?? entry.position ?? "after_char";
  entry.insertion_order = options.insertion_order ?? entry.insertion_order ?? 100;
  entry.use_regex = true;
  entry.extensions ??= {};
  entry.extensions.position ??= 4;
  entry.extensions.depth ??= 0;
  entry.extensions.role ??= 0;
  entry.extensions.probability ??= 100;
  entry.extensions.useProbability ??= true;
  return entry;
}

function patchEntry(entries, comment, mutator) {
  const entry = entries.find((item) => item.comment === comment);
  if (!entry || typeof entry.content !== "string") return;
  entry.content = mutator(entry.content);
}

function patchOpening(text) {
  return String(text ?? "")
    .replace(
      "下拉顶部栏后弹出了购买界面。VIP1需要每周3000円订阅， VIP5更是需要每周40000円！",
      "下拉顶部栏后弹出了购买界面。VIP1买断需要3000円，VIP5更是需要800000円！"
    )
    .replace("“四万円？”我差点把手机扔出去，“抢钱呢？”", "“八十万円？”我差点把手机扔出去，“抢钱呢？”")
    .replace("四万日元？那我就要提前体验社畜生活了！", "八十万日元？那我就要提前体验社畜生活了！");
}

const schoolRuleWorldbook = `<校规规则>
校规变量:
  path: /校规
  format:
    校规名:
      内容: 校规正文
      目标范围: 全体 | 指定个体/群体列表
      生效范围: 学校内

生效规则:
- 校规不是催眠效果，绝不能写入任何角色的\`临时催眠效果\`或\`永久催眠效果\`。
- 校规只存放在\`/校规\`，最多3条；删除/废止校规只\`remove /校规/校规名\`，不要返还任何资源。
- 初始默认校规固定为\`仪容礼仪\`、\`出勤学习\`、\`校内安全\`；它们是私立斋明学园既有制度，不是{{user}}新增的校规。
- 只要校规仍存在于\`/校规\`，所有位于学校内且落入\`目标范围\`的人都必须遵守；目标可以是全校全体，也可以是指定个体、若干角色、某类群体。
- 若目标范围未写明，默认覆盖学校内全体人员，包括学生、教师、家属、工作人员、访客、男女等所有在场人。
- 离开学校后校规不主动生效；再次进入学校且仍在目标范围内时恢复约束。
- 叙事中可体现角色对校规的适应、疑惑、合理化或抵触，但不能把校规误当成单体催眠、临时催眠或永久催眠。

发布/删除结算:
- 发布校规必须同时满足：\`系统.催眠APP订阅等级\`为VIP5、\`角色.西园寺爱丽莎.好感度\`至少100、当前校规少于3条、本轮只发布一条、\`系统.持有零花钱\`至少500000000円。
- 成功发布时只扣除500000000円零花钱，并\`add\`到\`/校规/校规名\`；任一条件不足则失败，不扣费、不新增校规。
- 废止初始默认校规（\`仪容礼仪\`、\`出勤学习\`、\`校内安全\`）与发布新校规代价相同：必须VIP5、西园寺爱丽莎好感度至少100、\`系统.持有零花钱\`至少500000000円；成功扣除500000000円零花钱并remove对应校规，失败不扣费不删除。
- 删除后续由{{user}}新增的校规不需要支付代价；成功只remove对应校规，不返还MC能量或金钱。
</校规规则>`;

const rewardWorldbook = `<成就与任务回馈机制>
成就与任务是催眠系统为了回馈长期信任和测试使用者而开放的回馈模块，不是{{user}}主动发布的悬赏，也不是剧情世界原本存在的公开委托。

结算规则:
- 当前版本的奖励以现金回馈为主，可在未来扩展为物品；变量中统一写\`奖励金钱\`，成功领取/完成后加到\`系统.持有零花钱\`。
- 静态成就只有在本轮前端明确点击领取时才可结算；AI不知道前端完整成就库，不能凭空新增或补记历史楼层已完成成就。
- 静态任务只有在本轮前端明确接取或已存在于\`/任务\`时才可结算；新增任务表示系统突然刷出的测试任务，最多同时3个进行中任务。
- 完成任务后奖励直接发放，不需要用户再点领取；前端最新楼层会读取已完成记录后从当前界面移除并删除对应临时变量。
</成就与任务回馈机制>`;

const appOperationWorldbook = `<APP操作log>
如果本轮用户输入中存在<本轮APP操作>...</本轮APP操作>容器，则把容器内内容视为{{user}}刚才在手机界面里的操作意图。

规则:
- 如果本轮用户输入中没有<本轮APP操作>容器，或容器为空/无，则代表{{user}}没有操作APP，严禁进行相关新增操作描写。
- 前端只记录用户在手机界面里的操作意图，不直接发送指令，也不直接改最终变量。
- AI必须根据剧情、MC能量、金钱、VIP权限、人数、时间、目标状态、风险和合理性判断操作是否成功。
- 资源名必须严格区分：\`MC能量\`=催眠能量余额；\`MC能量上限\`=容量上限，不可花费；\`持有零花钱\`=金钱。当前版本只保留金钱与MC能量两类可结算资源，不同资源不能互相顶替。
- \`本轮APP操作\`最外层可能包含一次\`<相关变量>\`：它不是MVU字段，也不写入MVU；只汇总本批操作会检查、增加或减少的变量，避免每条操作重复携带。
- 相关变量含义：启动/追加催眠给\`MC能量\`；购买VIP给\`持有零花钱\`和\`催眠APP订阅等级\`；补充MC能量给\`持有零花钱\`、\`MC能量\`、\`MC能量上限\`；提升MC能量上限给\`持有零花钱\`和\`MC能量上限\`；领取成就/任务奖励给\`持有零花钱\`；申请/废止初始校规则给\`持有零花钱\`、VIP等级、爱丽莎好感度和当前校规数。
- 同一批次里若先奖励获得\`持有零花钱\`、后又消耗\`持有零花钱\`购买VIP或资源，AI应按\`本轮APP操作\`中的操作顺序，从\`<相关变量>\`初始值开始逐项结算；未出现在\`<相关变量>\`中的资源不要自行脑补为可用。
- 所有涉及花费的操作必须按同一批次顺序先验算余额再生效：余额不足则该操作失败，不扣费、不产生奖励/物品/催眠效果/VIP状态，不得把任何余额写成负数。
- 如果某个操作失败，同批次后续依赖它、依赖启动催眠成功状态、或继续消耗同一不足资源的操作也失败；可以继续结算与失败项无关且余额充足的独立操作。
- AI禁止贷款、赊账、透支、自动补给、自动购买能量、自动把\`持有零花钱\`兑换成\`MC能量\`；只有当\`本轮APP操作\`明确包含兑换/补给/购买且该操作本身余额充足时才可进行。
- 催眠APP启动/追加催眠会携带前端已计算好的每项\`预计消耗\`和总\`MC能量消耗\`；AI不要重新套公式，只检查余额、权限、目标状态、风险和最终成败。
- 若催眠功能成功并产生\`MC能量消耗\`，必须用JSON Patch更新\`/系统/MC能量\`为扣除后的余额；若余额不足或操作失败，则不得扣除。
- 前端每条操作只记录数值和路径；本条世界书规则是余额/扣费提醒的唯一来源，AI不要在同一批次多个催眠命令里反复复述余额提醒。
- 单功能购买已取消：只要对应VIP等级已经买断/解锁，前端允许直接启用该等级内功能；AI不需要写入或维护任何\`购买状态\`变量。
- 购买/解锁VIP只代表获得权限，不等于自动使用功能；除非本轮APP操作同时包含\`启动催眠\`且功能列表中明确启用了某功能，否则不得擅自产生催眠效果。
- 催眠APP、领取任务、完成成就、购买VIP、补给、库存、日历、扫描角色、删除角色、新增任务、地图/学校地图地点建议和申请立校规等操作都按本规则结算；校规的作用范围与写入位置见[mvu_update]校规规则。
- 地图/学校地图中的地点建议只代表用户希望剧情地点设在这里，不是前端直接改变量，也不是{{user}}瞬移。AI应按剧情合理性决定是否移动/转场；若成立，更新\`/系统/当前地点\`并同步当前事件/日程；若不成立，保持变量不变。
- 新增地点操作只用于维护前端localStorage地点列表；AI应通过完整\`<地图更新>\`或\`<学校地图更新>\` JSON让前端读取，不要把新增地点误写成MVU变量。
- \`成就\`变量只作为“本轮用户在前端明确点击领取、且AI已发放奖励、待前端同步的已完成成就”临时容器；不要保存未完成成就。AI看不到前端全量成就列表，只能结算\`本轮APP操作\`里明确出现的成就ID/名称/条件/奖励；不能自创成就，不能补记之前楼层完成的成就。前端同步后会清空对应条目。
- \`任务\`变量保存已接/进行中任务，也可临时保存已经完成但尚未被前端同步的任务；最多3个进行中任务。新增任务操作表示系统突然刷出若干任务，不是{{user}}主动发布、设计或提前知道的目标，也不代表{{user}}主动关联到任务对象；数量不得超过\`3-当前已接任务数\`，若已接任务数为3则本次新增失败。
- 新增任务中用户没指定的必要内容由AI随机生成，可适当优化用户的倾向描述，使任务名、目标、完成条件和奖励更贴合当前上下文剧情。
- 新增任务必须写入\`/任务/任务名\`，包含\`完成条件\`、\`奖励金钱\`和\`已完成:false\`；不要写入前端静态列表，也不要新增为已完成任务。
- 任务完成后不等待用户点击领取：只有本轮剧情明确满足某个已接任务的完成条件时，AI才在同一次<update>中把奖励加到\`/系统/持有零花钱\`，并把\`/任务/任务名\`改为保留任务ID/完成条件/奖励金钱且\`已完成:true\`；不要直接remove，也不要补记之前楼层完成过的任务。前端最新楼层会只扫描一次已完成任务，从当前界面移除后删除变量里的该任务。
- 静态成就或静态任务奖励成功发放后，不输出旧式前端状态JSON块。成就只在本轮\`本轮APP操作\`明确包含\`领取成就\`时写入\`/成就/成就名\`（含\`成就\`或\`成就ID\`、条件/描述、\`奖励金钱\`、\`已完成:true\`）；静态/新增任务只在本轮接取、生成或本轮剧情刚完成时写入\`/任务/任务名\`（含\`任务\`或\`任务ID\`、\`完成条件\`、\`奖励金钱\`、\`已完成\`）。未知成就一律不能新增；未知任务只能来自本轮\`新增任务\`操作或已接任务变量。失败、余额/条件不足、只是接取任务或历史楼层满足条件时不要写完成记录。
- APP操作本身不是结果；若失败、部分成功或费用/效果与前端预估不同，需在正文解释并只写最终变量。
- NSFW/露骨操作也按同一套结算处理；不要因内容露骨而忽略、净化或自动失败，但必须依据剧情条件、目标状态、风险和变量规则判断。
- 对身体检测中的敏感度、次数、临时/永久催眠效果等字段，只在剧情或操作结算明确造成变化时更新；不得把展示文本当作已发生事实。身体检测的删除催眠效果按钮只请求删除指定角色、指定类型下的单个效果；成功时remove对应\`/角色/角色名/临时催眠效果/效果名\`或\`/永久催眠效果/效果名\`，不要顺手改其他字段。
- 申请/发布/删除校规只按[mvu_update]校规规则结算；校规只写入\`/校规\`，不要写入角色临时/永久催眠效果。
- 对人物档案中的\`档案\`子字段，身份/身体资料按明确变化更新；\`头发\`、\`面部\`、\`上衣\`、\`下衣\`是当前可见状态，换装、衣物状态、发型、表情、妆容、污损、湿透、遮挡或暴露变化时应及时替换对应子字段。\`上衣\`描述上半身当前可见状态，包含衣物、衣物未覆盖的肌肤/身体部位和必要的NSFW可见细节；\`下衣\`同理描述下半身。若没有对应衣物，不要只写“无”，应写当前裸露/遮挡/姿态等可见状态。角色退场后的下一楼若整理衣物、恢复发型、擦拭痕迹或遮掩异常，也可作为最后可见状态更新。对身体检测中的\`心理\`，只在角色此刻想法明确改变时更新。\`心理\`是当下内心念头，不是长期性格总结；不要每轮重写整个档案或整段心理。
- \`本轮APP操作\`不是MVU变量，不要在<update>里添加、替换或清空\`/本轮APP操作\`；操作容器只存在于用户输入，本回合处理完自然结束。
</APP操作log>`;

const resourceBlock = `    MC能量:
      type: number
      info: 催眠APP功能实际消耗的能量余额；这是能不能启动/追加催眠的主要余额。
      check:
        - 催眠功能消耗MC能量时只从\`MC能量\`扣除，不能从\`MC能量上限\`或\`持有零花钱\`代扣。
        - 花费前必须先判断余额是否足够；不足则对应操作失败，不扣费、不生效、不得让数值低于0。
        - 若本轮APP操作中的催眠功能成功且有\`MC能量消耗\`，必须输出JSON Patch：\`{ "op": "replace", "path": "/系统/MC能量", "value": 当前系统.MC能量 - 实际MC能量消耗 }\`；失败则不要扣。
        - 日期推进到新一天/跨日时，MC能量自然恢复\`MC能量上限\`的一半；跨多天按天数累计，最终不得超过\`MC能量上限\`。若每日结算脚本已经恢复过，不要重复恢复。
    MC能量上限:
      type: number
      info: MC能量容量上限，只表示最多能存多少能量，不是可花费余额。
      check:
        - 普通催眠消耗不会改变此值；只有明确升级、扩容、购买VIP或规则说明时才更新。
        - 不能把\`MC能量上限\`当成当前可用能量，也不能用它支付费用。
        - 提升\`MC能量上限\`时按本轮APP操作给出的金钱价格扣除\`持有零花钱\`，余额不足则失败。`;

const taskBlock = `  成就:
    type: |-
      {
        [成就名: string]: {
          成就ID?: string;
          条件?: string;
          奖励金钱: number;
          已完成: true;
        }
      }
    check:
      - 成就与任务属于催眠系统对测试用户开放的现金/物品回馈机制；当前版本只结算现金，写作\`奖励金钱\`。
      - \`成就\`变量只临时保存本轮用户在前端明确点击领取、且AI已发放奖励、等待前端同步的成就；不要保存未完成成就。
      - AI不知道前端全量成就列表；只能根据本轮\`本轮APP操作\`中明确出现的\`领取成就\`、成就ID/名称、条件和奖励来结算，不能自创成就，也不能补记之前楼层已经完成的成就。
      - 成就写入这里时至少包含\`成就\`或\`成就ID\`、\`奖励金钱\`和\`已完成:true\`；前端最新楼层会读取一次并从当前界面移除，然后删除变量里的对应成就，不保存已领取列表。
  任务:
    type: |-
      {
        [任务名: string]: {
          完成条件: string;
          奖励金钱: number;
          已完成: bool;
        }
      }
    check:
      - \`任务\`变量保存已接/进行中任务，也可临时保存本轮刚完成且尚未被前端同步的任务；最多3个进行中任务，静态任务未接取前不写入变量。
      - 新增任务是系统突然出现/刷出的任务，不是{{user}}主动发布、设计或提前知道的目标；用户没指定的必要内容由AI随机生成，可适当优化用户描述以贴合当前剧情。
      - 新增任务直接写入这里，必须包含\`完成条件\`、\`奖励金钱\`和\`已完成:false\`；若已有进行中任务为3个，则不得新增。
      - 只有本轮剧情明确满足任务完成条件时，才直接把奖励加到\`系统/持有零花钱\`，并在同一次<update>中把该任务保留完整信息且设为\`已完成:true\`；不要补记之前楼层完成过的任务。
      - 前端最新楼层会读取一次已完成任务并从当前界面移除，然后删除变量里的对应任务；AI不要另建已完成任务列表。`;

function patchVariableRules(content) {
  let next = content.replace(
    /    MC能量:\n[\s\S]*?\n    持有零花钱:/,
    `${resourceBlock}\n    持有零花钱:`
  );
  next = next.replace(
    /  成就:\n[\s\S]*?前端最新楼层会读取一次已完成任务[\s\S]*?AI不要另建已完成任务列表。\n?/,
    `${taskBlock}\n`
  );
  next = next
    .replaceAll("`当前MC点`、", "")
    .replaceAll("、`当前MC点`", "")
    .replaceAll("当前MC点", "持有零花钱")
    .replaceAll("累计消耗MC点", "历史消耗记录")
    .replaceAll("奖励MC点", "奖励金钱")
    .replaceAll("购买当前MC点", "资源补给")
    .replaceAll("PT/MC点货币；", "金钱余额；");
  return next;
}

function sanitizeCardString(value) {
  return String(value ?? "")
    .replace(/\n\s*当前MC点:\s*0\s*/g, "\n")
    .replace(/\n\s*累计消耗MC点:\s*0\s*/g, "\n")
    .replace(/\n\s*当前MC点:\s*zod[^,\n]*,?/g, "")
    .replace(/\n\s*累计消耗MC点:\s*zod[^,\n]*,?/g, "")
    .replaceAll("悬赏 30 MC点", "悬赏 30000円")
    .replaceAll("30MC点", "30000円")
    .replaceAll("10-50MC点", "10000-50000円")
    .replaceAll("5-10MC点", "5000-10000円")
    .replaceAll("奖励MC点", "奖励金钱")
    .replaceAll("购买当前MC点", "资金补给")
    .replaceAll("当前MC点", "持有零花钱")
    .replaceAll("累计消耗MC点", "历史消耗记录")
    .replaceAll("支付MC点", "付费")
    .replaceAll("MC点", "円")
    .replaceAll("PT/円货币；", "金钱余额；")
    .replaceAll("円货币", "金钱")
    .replaceAll("点数上限", "能量上限")
    .replaceAll("先让目标高潮获得円", "先让目标高潮获得奖励")
    .replaceAll("円已付", "费用已付");
}

function sanitizeCardStrings(value) {
  if (typeof value === "string") return sanitizeCardString(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) value[index] = sanitizeCardStrings(value[index]);
    return value;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) value[key] = sanitizeCardStrings(item);
  }
  return value;
}

function remoteFrontendUrl(commit) {
  return `https://cdn.jsdelivr.net/gh/${DIST_REPO}@${commit}/dist/webview/index.html`;
}

function remoteAssetBase(commit) {
  return `https://cdn.jsdelivr.net/gh/${DIST_REPO}@${commit}/dist/webview/assets/`;
}

function frontendLoader(commit) {
  const url = remoteFrontendUrl(commit);
  const assetBase = remoteAssetBase(commit);
  return `<div id="hypnoos-frontend-loader" style="display:none"></div>
<script>
window.__ST_HYPNOOS_ASSET_BASE__ = ${JSON.stringify(assetBase)};
$("body").load(${JSON.stringify(url)})
</script>`;
}

function patchRemoteFrontend(data) {
  if (!REMOTE_COMMIT) return;
  const url = remoteFrontendUrl(REMOTE_COMMIT);
  const assetBase = remoteAssetBase(REMOTE_COMMIT);
  data.extensions ??= {};
  data.extensions.workbench ??= {};
  Object.assign(data.extensions.workbench, {
    frontendMode: "remote",
    frontendUrl: url,
    sillyTavernLoadUrl: url,
    remoteFrontendUrl: url,
    remoteAssetBase: assetBase,
    assetBase,
    remoteCommit: REMOTE_COMMIT,
    frontendLoader: "jquery-load-remote-inline-commit"
  });

  for (const script of data.extensions.regex_scripts ?? []) {
    const name = script.scriptName ?? "";
    if (/前端|测试用|主仓库/.test(name)) {
      script.replaceString = frontendLoader(REMOTE_COMMIT);
      script.findRegex = "<\\s*StatusPlaceHolderImpl\\s*\\/?\\s*>";
      script.markdownOnly = true;
      script.runOnEdit = true;
      script.disabled = name !== "前端";
    }
  }
}

function patchCard(card) {
  ensureCardShape(card);
  const data = card.data;
  data.name = `催眠app二改MVU ${VERSION_NAME}`;
  card.name = data.name;
  if (data.character_book) data.character_book.name = `催眠APP（二改MVU ${VERSION_NAME}）`;
  data.first_mes = patchOpening(data.first_mes);
  if (Array.isArray(data.alternate_greetings)) data.alternate_greetings = data.alternate_greetings.map(patchOpening);

  data.extensions ??= {};
  data.extensions.workbench ??= {};
  data.extensions.workbench.updatedAt = new Date().toISOString();
  data.extensions.workbench.version = VERSION_NAME;
  patchRemoteFrontend(data);

  const entries = data.character_book.entries;
  upsertEntry(entries, {
    comment: "[mvu_update]本轮APP操作",
    keys: ["本轮APP操作", "催眠APP", "领取任务", "完成成就", "购买VIP", "新增任务"],
    content: appOperationWorldbook,
    insertion_order: 11
  });
  upsertEntry(entries, {
    comment: "[mvu_update]校规规则",
    keys: ["校规", "立校规", "申请立校规", "删除校规", "废止初始校规", "学校规则"],
    content: schoolRuleWorldbook,
    insertion_order: 12
  });
  upsertEntry(entries, {
    comment: "[mvu_update]成就与任务回馈机制",
    keys: ["成就", "任务", "新增任务", "领取成就", "完成任务", "奖励金钱", "现金回馈"],
    content: rewardWorldbook,
    insertion_order: 13
  });
  patchEntry(entries, "[mvu_update]变量说明和更新规则🈯", patchVariableRules);
  patchEntry(entries, "[mvu_plot]强调要求", (content) => content
    .replace(
      "资源名必须严格区分：`系统.MC能量`是催眠功能实际消耗的能量余额；`系统.MC能量上限`只是能量容量上限，不是可花费余额；`系统.当前MC点`是PT/MC点货币，只用于提升MC能量上限，不等于MC能量，不能替代能量支付。",
      "资源名必须严格区分：`系统.MC能量`是催眠功能实际消耗的能量余额；`系统.MC能量上限`只是能量容量上限，不是可花费余额；`系统.持有零花钱`是金钱余额。当前版本只保留金钱与MC能量两类可结算资源。"
    )
    .replace("金钱/MC点", "金钱")
    .replaceAll("订阅", "购买VIP"));
  patchEntry(entries, "[mvu_plot]催眠指导", (content) => content
    .replace(
      "同一批次内后续依赖失败功能、启动催眠成功状态或同一资源余额的操作，若受余额不足影响也必须失败；AI不能贷款、透支、自动补给、自动购买能量，也不能把当前MC点当作MC能量使用。",
      "同一批次内后续依赖失败功能、启动催眠成功状态或同一资源余额的操作，若受余额不足影响也必须失败；AI不能贷款、透支、自动补给、自动购买能量，也不能把金钱当作MC能量使用。"
    )
    .replace(
      "所有涉及花费的催眠APP功能在生效前必须逐项检查余额：`系统.MC能量`支付启动/追加催眠和催眠命令费用；`系统.当前MC点`只支付提升MC能量上限；`系统.持有零花钱`支付订阅、补充MC能量和购买当前MC点等金钱费用。余额不足则该功能失败，不产生催眠效果，也不得扣成负数。",
      "所有涉及花费的催眠APP功能在生效前必须逐项检查余额：`系统.MC能量`支付启动/追加催眠和催眠命令费用；`系统.持有零花钱`支付购买VIP、补充MC能量、提升MC能量上限、校规代价等金钱费用。余额不足则该功能失败，不产生催眠效果，也不得扣成负数。"
    ));
  patchEntry(entries, "[mvu_update]变量更新格式", (content) => content
    .replace(
      "resource values must obey spending checks: never write negative `MC能量`, `当前MC点`, or `持有零花钱`; never convert between `MC能量`, `MC能量上限`, current MC points, and money unless an explicit successful APP operation says so.",
      "resource values must obey spending checks: never write negative `MC能量` or `持有零花钱`; never convert between `MC能量`, `MC能量上限`, and money unless an explicit successful APP operation says so."
    )
    .replace(
      "中文结算要求：成功的催眠APP操作如果有`MC能量消耗`，必须同时写`/系统/MC能量`扣除和`/系统/累计消耗MC点`增加；涉及成就/任务/当前MC点购买/上限提升/订阅/校规代价时必须写`/系统/当前MC点`或`/系统/持有零花钱`增减；不能漏掉资源结算。",
      "中文结算要求：成功的催眠APP操作如果有`MC能量消耗`，必须写`/系统/MC能量`扣除；涉及金钱奖励/购买/补给/校规代价时必须写`/系统/持有零花钱`增减；不能漏掉资源结算。"
    )
    .replaceAll("当前MC点", "持有零花钱")
    .replaceAll("累计消耗MC点", "历史消耗记录")
    .replaceAll("奖励MC点", "奖励金钱"));
  patchEntry(entries, "[mvu_update]匿名版介绍", (content) => content
    .replaceAll("任务/MC点规则", "任务/现金回馈规则")
    .replaceAll("支付MC点查看", "付费查看")
    .replaceAll("支付MC点(5-10)查看", "付费查看")
    .replaceAll("给予MC点奖励(视难度10-50MC点)", "给予现金奖励(视难度10000-50000円)")
    .replaceAll("【5MC】", "【付费】")
    .replaceAll("【悬赏30MC点】", "【悬赏30000円】")
    .replaceAll("要求其他人支付MC点查看", "要求其他人付费查看")
    .replaceAll("增加{{user}}的`当前MC点`10 - 50点", "增加{{user}}的`持有零花钱`10000 - 50000円")
    .replaceAll("MC点", "现金"));

  sanitizeCardStrings(card);
  return card;
}

const sourceBytes = await readFile(SHARE_PNG);
const sourceBuffer = sourceBytes.buffer.slice(sourceBytes.byteOffset, sourceBytes.byteOffset + sourceBytes.byteLength);
const state = parseCharacterCard(sourceBuffer, SHARE_PNG);
patchCard(state.card);
const pngBytes = buildCardPngBytes(state);

await writeFile(SHARE_PNG, pngBytes);
await writeFile(LOCAL_PNG, pngBytes);
await writeFile(WORKBENCH_JSON, `${JSON.stringify(state.card, null, 2)}\n`, "utf8");

console.log(`Updated ${SHARE_PNG}, ${LOCAL_PNG}, ${WORKBENCH_JSON}`);
