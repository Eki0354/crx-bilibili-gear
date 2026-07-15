# Bilibili Gear

提升 Bilibili 日常使用体验的 Chrome 扩展。

## 功能

### 评论 IP 属地显示
在评论区每条评论旁显示发布者的 IP 属地信息，方便快速了解评论来源地域。

### 评论生成图片分享
将指定评论（及其上下文）生成分享图片，支持一键复制到剪贴板，方便分享到社交平台。

### 网页全屏快捷点赞
在全屏播放视频时，无需退出全屏即可快速点赞/取消点赞，减少操作打断。

### 自动领取大会员权益
自动检测并领取 Bilibili 大会员的每月/每日权益（如 B 币券、漫画券等），避免手动领取的遗漏。

### 屏蔽首页推荐视频卡片广告
在首页推荐流中过滤掉广告卡片、推广内容和非视频条目（如直播流），仅保留正常的视频推荐。

## 技术栈

- **框架**: [WXT](https://wxt.dev) + [Vue 3](https://vuejs.org)
- **构建**: Vite + TypeScript
- **扩展类型**: Chrome Extension Manifest V3

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发模式（支持热更新）
pnpm dev

# 构建生产版本
pnpm build

# 构建 Firefox 版本
pnpm dev:firefox
pnpm build:firefox
```
