# 合住 · 合租生活管家

当前线上版本的完整静态源码：费用 AA 分摊、清洁值日与换班、公共物品登记和补货、室友公约确认。页面最大宽度为 430px，适配手机屏幕，桌面浏览时居中显示。

## 本地运行

在解压后的项目目录执行：

```bash
python3 -m http.server 8000
```

打开 http://localhost:8000 即可。也可以用 VS Code 的 Live Server 预览。无需安装前端依赖或配置 API 密钥。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 首页、房屋空间、功能面板与弹窗 |
| `style.css` | 手机布局、配色、卡片与表单样式 |
| `model.js` | 示例数据、费用计算、排班和状态管理 |
| `app.js` | 页面渲染、交互事件、表单与 WebMCP 工具 |
| `assets/apartment.webp` | 首页小家图片 |

## 数据保存

这是可交互的功能雏形。操作数据保存在当前浏览器的 `localStorage` 中，不会同步到其他设备或其他室友的浏览器。身份切换用于体验四位室友的协作流程；「我已支付」记录演示结清状态，不发起真实支付。提醒显示在页面动态中，不发送短信、邮件或推送。

## 放到 GitHub

将本目录中的文件推送或上传到 `Tenzyoo/Cohabit` 仓库即可保存源码。仓库内的 `index.html` 应位于根目录。文件采用相对路径，可用于 GitHub Pages 的 `/Cohabit/` 项目路径。

如需通过 GitHub Pages 托管，在仓库 Settings → Pages 中选择从分支部署，并选择 `main` 分支的根目录。此源码包没有启用或修改 GitHub Pages 设置。

## 当前版本

导出于 2026-10-01。线上页面：https://hezhu-kally-home.cherry-mesa-2673.chatgpt.site

当前网站已发布的源码版本：`cf4ea258480311ba5a49a2129ebe78c701795b4c`。导出包仅将资源地址改为相对路径，方便在其他静态托管平台使用。
