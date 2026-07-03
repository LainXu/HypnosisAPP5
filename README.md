# 催眠app二改MVU 工作区

本项目用于维护唯一一张角色卡和手机前端。当前唯一卡文件是：

```text
public/cards/催眠app二改MVU v1.9.9.png
```

根目录工作台只做“成就与任务”数据库编辑，并直接读取/写回这张 PNG 卡；不维护本地副本、多版本库或中间 JSON 工作副本。

## 运行

```bash
npm run dev
```

然后打开：

```text
http://localhost:5173
```

## 本地前端镜像

开发阶段默认预览本地镜像：

```text
public/frontends/hypnosis-app/index.html
```

重新从本地基底生成镜像：

```bash
npm run mirror:frontend
```

默认基底已经固定在工作区内：

```text
public/frontends/hypnosis-app/source.html
```

如果确实要更新远程原始前端，先刷新本地基底，再重新生成镜像：

```bash
npm run refresh:frontend-source
npm run mirror:frontend
```

也可以临时直接用远程源生成一次：

```bash
npm run mirror:frontend:remote
```

从角色卡旧匿名版正则提取 MChan 本地镜像。`mirror:frontend` 会读取这个镜像里的种子帖，注入到手机内部的静态只读匿名版页面：

```bash
npm run extract:mchan
```

## 能做什么

- 编辑成就和任务条目，支持增删查改、复制和批量合并/替换。
- 奖励使用 `星光点` 和可选物品，物品包含名称、描述和数量。
- 保存时直接写回 `public/cards/催眠app二改MVU v1.9.9.png`。
- 保留手机前端预览与输入框测试区。
- 手机前端采用“AI 是变量唯一写入源，前端只读展示和提交操作意图”的工作流。

## 唯一发布命令

发布远程前端并把 CDN commit 回写到唯一卡：

```bash
npm run publish:card
```

这个命令固定执行一次：生成本地前端镜像、同步 `LainXu/HypnosisAPP5-dist`、提交并推送 dist、用新 commit 回写 `public/cards/催眠app二改MVU v1.9.9.png`。不再手动维护第二张本地卡。

新对话接手前只需要读：

```text
docs/PROJECT_STATE.md
```
