# SillyTavern Card Workbench

本项目是一个零依赖的本地角色卡可视化工作台，用来读取 SillyTavern PNG 角色卡里的 `chara` / `ccv3` 元数据，并编辑角色信息、世界书、正则脚本、变量规则和前端加载片段。

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

也可以传入本地 HTML 或远程 URL：

```bash
node scripts/mirror-frontend.mjs /tmp/index.html public/frontends/hypnosis-app/index.html
node scripts/mirror-frontend.mjs https://example.com/index.html public/frontends/hypnosis-app/index.html
```

## 能做什么

- 直接加载 PNG 角色卡或 JSON。
- 可视化编辑角色字段、世界书条目和正则脚本。
- 前端预览默认使用本地镜像，也支持远程 URL 和粘贴 HTML 后重新渲染。
- 变量页默认采用“AI 是变量唯一写入源，前端只读展示和提交操作意图”的工作流。
- 变量页提供「合并匿名版 + 轻量规则」迁移按钮：把 MC匿名版改为手机内部静态只读页面，并追加更轻的 `<update>` 规则；旧世界书和正则正文保留不改写。
- 身体检测/角色状态默认作为基础手机模块开放，不再作为 VIP1 功能。
- 可以保存到浏览器本地库，导出 JSON；如果当前卡来自 PNG，也可以把修改后的 `chara` 和 `ccv3` 重新写回 PNG。
