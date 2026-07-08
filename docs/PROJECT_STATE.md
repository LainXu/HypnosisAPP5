# 催眠app二改MVU v2.5 项目状态

这份文档是新对话的交接入口。接手时先读这里；若任务需要拆分协作，再读 `docs/MULTI_AGENT_WORKFLOW.md`，按多 agent 轻量工作流只启动相关层。

## 当前真源

- 当前版本：`v2.5`
- 本地卡输出：`public/cards/催眠app二改MVU v2.5.png`（`public/cards/` 已忽略，不提交到主仓库）
- 本地前端镜像：`public/frontends/hypnosis-app/`
- 手机前端镜像：`public/frontends/hypnosis-app-phone/`
- 前端生成脚本：`scripts/mirror-frontend.mjs`
- 卡片封装脚本：`scripts/finalize-card-v1_6.mjs`
- 一键发布脚本：`scripts/publish-card.mjs`
- 共享配置：`scripts/card-config.mjs`
- 远程 dist 仓库：`LainXu/HypnosisAPP5-dist`
- 远程前端路径：`dist/webview/st-load-inline.html`

不再维护或提交这些旧目标：

- `public/cards/hypnosis-app.png`
- `public/cards/催眠app二改MVU.png`
- `public/cards/hypnosis-app-workbench-current.json`
- `public/cards/` 里的 PNG 发布产物
- 任何工作台中间产物或多版本卡库

## 一次性工作流

每个需求只走一次下面的顺序，不要做完前端又回头补变量，也不要为了确认反复抽检 PNG。

如果需求跨越变量、世界书、前端正则、酒馆助手脚本中的多个层级，优先使用 `docs/MULTI_AGENT_WORKFLOW.md`：由统筹 agent 分发最小任务合同，专门 agent 只读自己的锚点文件。

1. **判定改动层**
   - 改手机界面、按钮、暂存、渲染：改 `scripts/mirror-frontend.mjs`，不手改生成出的 HTML。
   - 改变量、世界书、正则、初始数据：改 `scripts/finalize-card-v1_6.mjs`。
   - 改成就/任务数据库：直接改 `src/reward-defaults.js` 或卡内 `data.extensions.workbench.rewardDatabase`。
   - 改独立成就任务工作台：改 `src/app.js` 和 `src/styles.css`；它不应该参与前端渲染或保存中间产物。

2. **先变量/世界书，后前端**
   - 如果一个功能需要新变量、世界书解释、AI 更新规则，先在 finalizer 里定义。
   - 前端只消费已经确定的变量名，不临时发明第二套字段。

3. **前端内部应用四件套**
   - 新增或重做手机应用时，同步处理主屏入口、`clearPhoneInternalOverlays`、`detectPhoneApp` 和首页补丁排除列表。
   - 应用页只挂在手机根容器里；动画/遮罩也只 append 到手机根容器，不要 append 到 `document.body`，否则会盖住右侧暂存区。
   - 旧 React 顶栏和新灵动岛不要共存。重做页面时优先删旧顶栏路径，再补内部页。

4. **生成本地前端一次**
   - 需要前端变化时运行 `node --check scripts/mirror-frontend.mjs`。
   - 再运行 `node scripts/mirror-frontend.mjs`。
   - 手机端由桌面端镜像派生；前端变化后运行 `node --check scripts/build-phone-frontend.mjs` 和 `node scripts/build-phone-frontend.mjs`。
   - 生成后用 `rg` 检查关键函数/类名是否进入 `public/frontends/hypnosis-app/index.html` 和 `st-load-inline.html`。

5. **封装和结构抽检**
   - 改变量、世界书、正则、默认变量或远程 commit 时，运行 `node --check scripts/finalize-card-v1_6.mjs` 和 `node scripts/finalize-card-v1_6.mjs`。
   - 发布前运行 `npm run verify:card` 做轻量 PNG/前端结构检查：确认世界书 comment 无重复、初始化变量顺序为 `系统 -> 校规 -> 成就 -> 任务 -> 角色`、默认四名初始角色存在、默认校规 5 条、旧式跨日恢复半管 MC 能量和聊天世界书自动创建入口不存在。

6. **发布只用一个命令**
   - 需要远程卡时运行 `npm run publish:card` 或 `node scripts/publish-card.mjs`。
   - 这个脚本默认发布当前已经生成好的桌面端和手机端前端；它会构建手机端、同步 dist、提交并推送远程 dist、取得 commit、用该 commit 回写唯一 PNG。
   - 脚本默认不重新运行 `scripts/mirror-frontend.mjs`，避免把未验证的前端补丁混入发布。只有确实需要发布时顺便重新生成桌面端，才使用 `HYPNOOS_RUN_MIRROR=1 node scripts/publish-card.mjs`。
   - 不手动复制第二张本地卡，不手动维护无版本 PNG。

## 酒馆 / 酒馆助手接口

- 酒馆助手变量类型文档：<https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/%E5%8A%9F%E8%83%BD%E8%AF%A6%E6%83%85/%E5%8F%98%E9%87%8F/%E5%8F%98%E9%87%8F%E7%B1%BB%E5%9E%8B.html>
- 前端直读/直改 MVU 必须做能力检测，优先复用项目现有封装，不要在新功能里写第二套接口探测。
- 项目里的变量路径以 MVU 根为准，例如 `/系统/当前时间`、`/角色/犬冢夏美/好感度`；给 AI 或项目封装的 JSON Patch path 不额外加 `stat_data`。
- `stat_data` 是角色卡内部总数据根，只在解释内部结构或兼容底层接口时提；日常世界书和前端操作提示使用 `/系统/...`、`/角色/...`。
- 避免频繁读角色卡世界书或 MVU。能在进入应用时读一次，就不要每次点击页内按钮都读。

## 变量与货币现状

- `MC能量`：催眠实际消耗。
- `MC能量上限`：能量容量上限。
- `持有零花钱`：金钱余额。
- `星光点`：APP内部货币，只能由成就、任务、派遣、兑换券等系统来源获得，角色不能提供。
- `持有物品`：物品奖励，条目包含名字、描述和数量。
- `buff`：主角最多一个抽象机制状态，不是催眠效果。
- 成就/任务奖励不再使用 MC点、PTS、积分等旧货币名。

## 手机前端现状

- 主界面已有应用：催眠APP、人物档案、日历、课程表、时钟、成就和任务、库存、MC匿名版、地图、学校、监控、打工、邂逅、帮助、设置。
- `催眠APP`：选择白名单催眠命令、补给、VIP买断；启动/追加会暂存，并播放只覆盖手机界面的催眠动画。
- `人物档案`：查看角色衣着、信息、状态、敏感度、效果；桌面档案和详情页都由变量驱动。
- `成就和任务`：前端判断静态成就和领取状态；AI生成每日任务内容并只标记完成，奖励由前端手动领取发放。
- `库存`：展示持有物品和数量，点击物品查看描述。
- `地图/学校/特殊地点`：地图显示当前地点变量，不要求地点存在于前端列表；地点列表只有明确更新时才变。
- `监控`：学校男厕门位与派遣操作。
- `打工`：普通招工/零工软件，不属于催眠APP。
- `邂逅`：浏览角色包/单独角色资料；随机桃花运仍由前端扣星光点、创建初始角色变量，并把变量/人设/可选好感链条目写入角色卡世界书对应位置。
- `帮助`：手机内简要说明其他应用。
- `设置`：导出/导入指定前端存储用于旧版聊天记录迁移，并检查当前MVU变量常用字段是否缺失或多出。

## 暂存区规则

- 前端通常提交操作意图到暂存区；补给、VIP、奖励领取、准入证购买、打工结算、角色事件等明确标注为前端处理的操作会由前端直接写变量并锁定本轮事实。
- `<相关变量>` 是给 AI 的一次性余额/状态快照，不是 MVU 路径。
- 锁定操作不能从暂存区删除，例如随机桃花运、邂逅商店购买、进行中的打工/派遣。
- “确认写入后不清空暂存”由暂存区复选框控制。

## 发布脚本行为

`npm run publish:card` 固定做这些事：

1. 默认跳过桌面端 mirror，发布当前 `public/frontends/hypnosis-app/`；若设置 `HYPNOOS_RUN_MIRROR=1` 才先运行 `scripts/mirror-frontend.mjs`。
2. 运行 `scripts/build-phone-frontend.mjs` 生成手机端。
3. 准备 `/tmp/hypnosisapp5-dist`，没有就 clone，有就 fast-forward 到 `origin/main`。
4. 用当前 `public/frontends/hypnosis-app/` 覆盖 dist 仓库 `dist/webview/`，排除 `source.html`。
5. 用当前 `public/frontends/hypnosis-app-phone/` 覆盖 dist 仓库 `dist/phone/`。
6. 若 dist 有变化，则提交并推送。
7. 读取 dist 的 HEAD commit。
8. 用 `HYPNOOS_REMOTE_COMMIT=<commit>` 运行 `scripts/finalize-card-v1_6.mjs`。
9. 只回写本地卡输出文件；`public/cards/` 是 ignored 发布产物目录，不提交到主仓库。
10. 发布后运行 `npm run verify:card`，确认本地卡已经写入 commit-pinned CDN URL。

## 新对话建议开场

可以直接这样说：

```text
读取 docs/PROJECT_STATE.md 和 docs/MULTI_AGENT_WORKFLOW.md。按多 agent 轻量工作流继续，只启动相关 agent。当前版本是 v2.5。
```
