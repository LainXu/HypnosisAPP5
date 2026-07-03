# 前端工作区

这是一个用于维护交互式前端界面和配套静态资源的工作区。仓库保留源码、生成脚本、预览入口和发布所需资源，便于在本地迭代后同步到远端。

## 运行

```bash
npm run dev
```

开发服务器启动后，按终端提示打开本地预览地址。

## 常用脚本

生成本地预览文件：

```bash
npm run mirror:frontend
```

刷新远程基底后重新生成：

```bash
npm run refresh:frontend-source
npm run mirror:frontend
```

临时直接从远程源生成：

```bash
npm run mirror:frontend:remote
```

## 目录概览

- `src/`：工作台源码。
- `scripts/`：镜像生成、资源整理与发布辅助脚本。
- `public/frontends/`：前端预览文件与运行资源。
- `docs/`：开发记录和接手说明。

## 维护约定

- 前端生成文件由脚本统一产出，避免手工改动多份副本。
- 大体积临时文件和素材源文件不纳入版本库。
- 提交前优先确认暂存区，只提交与前端项目直接相关的变更。
