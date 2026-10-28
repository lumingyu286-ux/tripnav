# 出行导航

按分类整理的出行网址：9 个分类、30 个站点，带站内查找、本地收藏和深浅主题。无框架、无构建、无网络字体。

姊妹项目：[`lifenav`](https://github.com/lumingyu286-ux/lifenav)（生活健康）、[`zhaizai`](https://github.com/lumingyu286-ux/zhaizai)（休闲娱乐）、[`changyong`](https://github.com/lumingyu286-ux/changyong)（工作日常）、[`baike-nav`](https://github.com/lumingyu286-ux/baike-nav)（索引页）、[`nav-hub`](https://github.com/lumingyu286-ux/nav-hub)（入口页）。六个项目的视觉、模板和内容刻意互不相同，仓库与部署各自独立——其中一个被下架不会连累其余五个。

四个分类导航的分工：

| 项目 | 收的是什么 |
|---|---|
| `changyong` | 搜索、AI、办公、开发、购物——工作日常 |
| `zhaizai` | 影视、动漫、音乐、游戏、社区——休闲娱乐 |
| `lifenav` | 就医、心理、政务、维权——生活与健康 |
| 本站 | 机票、火车、住宿、签证、换汇——**出行与旅行** |

四边内容基本不重叠，不是互为镜像。

## 这一套和前五个的区别

**模板**：原生 `<details>` / `<summary>` 折叠分区，配一个居中的大搜索框当主角。展开收起、Enter / 空格、读屏器语义全由浏览器负责，不用自己造一套 ARIA 开关。查找时命中的分区自动展开、没命中的整块藏掉，清空后回到「只展开第一个」。

前五个分别是：单列索引（`baike-nav`）、单列大条（`nav-hub`）、左侧栏锚点 + 密排（`changyong`）、顶部分类条 + 卡片（`zhaizai`）、左侧竖排标签页（`lifenav`）。

**视觉**：深夜航蓝 + 电光蓝 `#6CA0FF`。`18+` 角标走描边不填色，全站只有一个实色。

**第一个分类默认展开**，也就是成人内容，打开即在最显眼的位置。

## 文件

| 文件 | 说明 |
|---|---|
| `sites.js` | **只需要改这一个文件**：站名、分类、网址 |
| `index.html` | 页面骨架 |
| `style.css` | 样式（深色为主，可切浅色，默认跟随系统） |
| `app.js` | 渲染、查找、收藏、主题、成人条目确认 |
| `404.html` | 找不到页面时的落地页，样式内联 |
| `_headers` | Cloudflare 用：让 `README.md` 不被索引 |
| `robots.txt` / `.nojekyll` / `.gitlab-ci.yml` | 收录策略与各平台配置 |

## 改 sites.js

```js
var GROUPS = [
  ['分类名', '角标', [
    ['站点名', 'https://example.com', '一句话说明'],
    ['成人站', 'https://example.com', '说明', 'adult'],   // ← 第四项
  ]],
];
```

顺序即显示顺序，第一个分类默认展开。写 `'adult'` 的条目带 `18+` 角标并在点击时弹年龄确认。域名自动显示，不用手写。

## 关于年龄确认

这个站绝大部分是 12306、Booking、移民局这类正经站点，所以**没有做进站全屏年龄门**——那等于把订票锁在 18+ 警告后面。只拦成人条目：带 `18+` 角标，点击弹确认框，确认过一次就不再问（只存在本机）。

**成人条目的 `href` 是 `#`，真实地址放在 `data-url`。** 别改回真地址：中键点击和右键「在新标签页中打开」都不触发 `click` 事件，`href` 里有真地址就能绕过确认。代价是这一条没法「复制链接地址」。

## 代码里几处别动的地方

都是前几轮代码审查实际修出来的：

- **凡是会被 JS 切 `hidden` 的元素，都要显式写 `[hidden]{display:none}`。** 作者样式里的 `display` 会压过浏览器默认值，不写的话 `el.hidden = true` 毫无视觉效果——而且 `el.hidden` 读回来仍是 `true`，测试很容易被骗过去。本项目在 `style.css` 顶部集中写了一条。
- **JS 注入的提示框用 `.notice`，不能用 `.boot`。** `.js-ok .boot { display:none }` 是给静态兜底块准备的，同名的话提示框刚创建就被藏掉。
- **`filter()` 开头要判断 `GROUPS` 是否存在。** 数据加载失败时在搜索框敲一个字符会把兜底提示一起处理掉，页面变白。
- **主题当前值记在 `themeNow` / `userPicked` 里**，`localStorage` 只当尽力而为的持久化。回头读存储的话，隐私模式下用户的手动选择会在系统主题翻转时被改回去。
- **事件绑定各自独立 `try`，且绝不走 `paintError`。** 否则一次绑定失败会把渲染好的内容抹掉，再甩出一句误导性的「检查 sites.js 格式」。
- **焦点归还的目标必须当前可见**（`offsetParent !== null`）。对隐藏元素调 `focus()` 会静默失败，焦点照样丢。
- **`@media (hover: none)` 下星标常驻显示**，触屏没有 hover。

## 部署

### Cloudflare Pages

```
npx wrangler pages deploy . --project-name=tripnav --branch main
```

新建项目时要加 `--force`，否则会被路由到 Workers 平台、拿到带账号名的长域名，而不是 `<项目名>.pages.dev`。只有创建那一次需要。

当前部署：<https://tripnav.pages.dev/>

### GitHub Pages

推到仓库，Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`。

`404.html` 里的脚本按**目录名**而非主机名判断基准路径，Cloudflare 根站、GitHub/GitLab 项目站、GitHub 用户站四种形态都指得对。**换仓库名时要同步改那里的 `DIR`。**

### GitLab Pages

`.gitlab-ci.yml` 已写好。新增文件记得同步加进 `cp` 那一行。

## 主力站还是镜像站

选一个主力，其余按镜像配，只改一处：取消 `index.html` 里 `<meta name="robots" content="noindex,follow">` 的注释。

别再加 `canonical`（会把 `noindex` 一并传给目标页），也别把 `robots.txt` 改成 `Disallow: /`（爬虫取不到 HTML 就看不到 `noindex`，该网址仍可能凭外链被只收录网址）。

## 平台条款

按我的理解（不是法律意见，以各平台当前条款为准）：Cloudflare Pages 最宽松；GitHub 和 GitLab 的条款都禁止色情内容。本站绝大部分是正经站点，成人内容只有一条且做了年龄确认，风险较低，但仍取决于平台怎么判定。

**把成人内容设为默认展开的第一个分区，会让那一条在首屏最大化曝光，这一点和上面「风险较低」的说法是有张力的。** 这是产品决策不是 bug；想降低风险，把 `sites.js` 里那一组挪到第二位即可。

`title` 和 `description` 照实写，没有堆砌露骨关键词——标题与内容不符本身就是搜索引擎的门页信号。

## 本地预览

```bash
python -m http.server 8080
```

打开 <http://127.0.0.1:8080/>。用 `file://` 直接双击时 `localStorage` 可能被限制，收藏和主题不会被记住。
