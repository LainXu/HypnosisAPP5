# SillyTavern Frontend Agent Notes

> Historical note. For current work, read `docs/PROJECT_STATE.md` first and follow its single-card, one-pass workflow. This file may mention old paths kept only for background.

This note is for agents working on this repository after v1.8. It records the local packaging flow, SillyTavern integration points, MVU variable rules, and frontend pitfalls found during the HypnosisAPP card rewrite.

## Repository Shape

- `public/frontends/hypnosis-app/source.html` is the pinned upstream frontend snapshot.
- `scripts/mirror-frontend.mjs` is the real frontend patch generator. Edit this first; generated HTML is overwritten.
- `public/frontends/hypnosis-app/index.html` is the local preview frontend.
- `public/frontends/hypnosis-app/st-load.html` and `public/frontends/hypnosis-app/st-load-inline.html` are SillyTavern loaders.
- `scripts/finalize-card-v1_6.mjs` patches the single versioned PNG card metadata.
- `npm run publish:card` publishes the webview to CDN and writes the resulting commit back into the single card.

Do not use the workbench UI for final edits unless the user explicitly asks. It can rewrite card files and make versions drift.

## Normal Build Flow

Local frontend:

```bash
npm run mirror:frontend
```

Card export and remote release:

```bash
npm run publish:card
```

The card regex loads:

```html
<body>
<script>
window.__ST_HYPNOOS_ASSET_BASE__ = "https://cdn.jsdelivr.net/gh/LainXu/HypnosisAPP5-dist@<hash>/dist/webview/assets/";
$("body").load("https://cdn.jsdelivr.net/gh/LainXu/HypnosisAPP5-dist@<hash>/dist/webview/st-load-inline.html")
</script>
</body>
```

Use commit-pinned jsDelivr URLs. Do not use `main` for shared cards, or old chats may change unexpectedly.

## SillyTavern Frontend Constraints

- The frontend runs inside a SillyTavern message, not as a normal SPA route.
- It may be mounted, removed, and reprocessed when messages, variables, or swipe layers change.
- Avoid direct variable mutation from UI. UI should record user intent into the chat input; AI writes MVU variables.
- Keep per-floor reads scoped to the current message/layer whenever possible. Old message frontends should not always follow newest variables unless intentionally designed.
- Remote frontend code cannot directly update browser `localStorage` through AI. AI can only write text/variables; frontend must observe variables and then update storage itself.
- Do not rely on long polling. Prefer one refresh on mount plus event-driven refresh hooks where available.

## Internal Phone App Workflow

Most current phone pages are injected internal apps from `scripts/mirror-frontend.mjs`, not the old React route pages. When adding or rebuilding one:

- Add the home icon/action in the `visibleApps` replacement block.
- Export an opener such as `window.__ST_OPEN_HELP_APP__`.
- Add the app class to `clearPhoneInternalOverlays`, `detectPhoneApp`, `looksLikePhoneHome`, `patchHomeTile`, and `hasInitialPhonePatch` exclusion selectors.
- Reuse `renderLiteHeader` and `bindLiteHeader` unless the app intentionally has a special paper/desktop scene.
- Do not let old React top bars and the new island header coexist.
- Any temporary animation or modal that belongs to the phone must be appended inside the phone root returned by `findPhoneRoot`, never to `document.body`; otherwise it can cover the operation side panel.
- Prefer one MVU/worldbook read when entering the app. Do not reread current chat lorebook on every click unless the action explicitly needs fresh binding state.

For Tavern Helper / JS-Slash-Runner variable behavior, keep this documentation link nearby:

<https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/%E5%8A%9F%E8%83%BD%E8%AF%A6%E6%83%85/%E5%8F%98%E9%87%8F/%E5%8F%98%E9%87%8F%E7%B1%BB%E5%9E%8B.html>

## MVU Variable Model

The main card data lives under `stat_data`.

Common paths:

- `/系统/当前日期`
- `/系统/当前时间`
- `/系统/当前日程`
- `/系统/当前或下个特殊日期`
- `/系统/当前/待上课程`
- `/系统/当前事件`
- `/系统/当前地点`
- `/系统/催眠APP订阅等级`
- `/系统/MC能量`
- `/系统/MC能量上限`
- `/系统/持有零花钱`
- `/角色/<角色名>`
- `/角色/<角色名>/档案`
- `/任务`
- `/校规`

Currency/resource naming rules:

- `MC能量` is the spendable hypnosis energy.
- `MC能量上限` is capacity and is not spendable.
- `持有零花钱` is money.
- Old `MC点`/PTS/credits were removed. Do not reintroduce them.

The UI can display `localStorage` state for convenience, but the authoritative plot state should be MVU unless the feature is explicitly local-only.

## Operation Queue

Frontend operations are queued, then written into the user's input once confirmed. The outer container is:

```xml
<本轮APP操作>
  <相关变量>...</相关变量>
  <催眠APP>...</催眠APP>
  <成就和任务>...</成就和任务>
</本轮APP操作>
```

Rules:

- Do not append multiple top-level `<本轮APP操作>` containers for one turn.
- Deduplicate repeated clicks in the queue.
- Time and location suggestions should stay at the top of the queue.
- `<相关变量>` is a readout for the AI, not a variable path to write back.
- Include only variables relevant to this batch's increases/decreases or required checks.

## AI Authority Pattern

The user wants AI to be the variable writer. Frontend operations should:

- Calculate costs and collect target/time/person counts.
- Send compact operation payloads to the input.
- Avoid directly changing MVU for resources, VIP, role stats, achievements, or quests.
- Let AI apply JSON Patch to MVU after judging success/failure.

Exceptions are local UI-only state:

- Home icon order.
- Uploaded profile photos.
- Map/school local custom location descriptions, if they are explicitly local storage content.
- Frontend reward counters used only to decide whether the first achievement/task explanation should be included.

Do not persist the currently open phone app. Native React pages should use normal component state, and injected internal pages may set only the current DOM root's `data-st-phone-app` for styling.

## Home Icons

Home icon order is stored in `hypnoos:home-app-order:v1`.

Drag behavior should swap two icons, not insert and shift a row. Inserting caused jumpy order changes and made touch/mouse behavior confusing.

For click reliability:

- The element with `data-home-app-id` is the only interactive target.
- Child SVG/image/text layers should use `pointer-events:none`.
- Do not apply transforms to the outer hit target during drag; use background, shadow, or filter for feedback.
- Commit reorder only on pointer up.

## Hypnosis Command Cost Rules

Cost must be calculated by the frontend and sent to AI as final numbers.

General formula:

```text
cost = baseCost * numericValue * personCount * partCount * durationMinutes
```

Factor defaults:

- If a command does not use a factor, that factor is `1`.
- If an enabled command's required numeric input is empty, the factor is `0`; the command should not be included in start/append.
- `vip1_temp_sensitivity` uses `baseCost = 2`, `numericValue = 敏感度增加`, and `partCount = 1..5`.
- Most commands use `personCount`; group/open-space commands that are inherently area-based should opt out.
- Permanent or one-time commands do not use duration unless their specific design says otherwise.

Do not ask AI to recalculate formulas. AI checks balance, target status, permission, and risks, then applies or rejects the already-costed operation.

## Variable Refresh Pitfalls

- The first/initial message sometimes needs SillyTavern "reprocess initial variables" if the worldbook entry is not parsed.
- Avoid frontend code that writes default VIP/resource values back to MVU. It can fight the AI and reset variables.
- If an achievement/quest completion is meant to persist in frontend storage, the latest frontend layer should scan MVU once, update local state, then clear the transient completion variable.
- Do not poll constantly. Repeated MVU reads can make SillyTavern sluggish.

## Debug Checklist

After edits:

```bash
npm run mirror:frontend
node -e "new Function(require('fs').readFileSync('scripts/mirror-frontend.mjs','utf8')); console.log('syntax ok')"
rg -o "需要消耗|按MC点|区域未解锁|lockedByUnlock" public/frontends/hypnosis-app/index.html public/frontends/hypnosis-app/st-load-inline.html
```

For generated cost function checks:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('public/frontends/hypnosis-app/index.html','utf8'); const i=s.indexOf('const getFeatureCost'); console.log(s.slice(i,i+2500).replace(/\\\\n/g,'\n'))"
```

For browser checks:

- Home icons should click with one click.
- Dragging one icon over another should swap only those two icons.
- Refreshing or sending a message should not restore the last opened app from localStorage.
- Achievements/tasks page should not blank the frontend.
- Hypnosis command costs should change when person count, part count, numeric value, or duration changes.
