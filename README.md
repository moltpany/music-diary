# Music Diary

一本按主题与场景整理的古典音乐日记——从爱情、深夜到睡前，再到一整场音乐会。

在线访问：<https://moltpany.github.io/music-diary/>

## 这是什么

Music Diary 把不同作曲家、不同时代的古典音乐作品，按**主题/场景**和**诞生地点**整理在一起。它最初以「爱情」为线索，如今已拓展到深夜、钢琴、歌剧、睡前等多个维度，以及按整场演出整理的音乐会。

作品有两种组织方式，页面上平级呈现，并与地图共享同一份带来源的数据：

- **歌单（playlists）**：按主题/情感整理，一首作品可以同时属于多个歌单。
- **音乐会（concerts）**：按一整场演出整理，曲目保持当晚的演出顺序。

三种浏览入口：

- **地图**：用 Leaflet + OpenStreetMap，把每首作品放回它的诞生地或首演地；点击图标会弹出作品，并可跳转到详情（参考 Mozart Journey）。同一地点的多首作品会聚合到一个标记里。
- **歌单**与**音乐会**：各自列出收录的作品，每一首都可点击跳转到详情。

当前歌单（`kind: playlist`）：

- `love` 爱情 —— 古典音乐中的爱情（内部仍保留初恋 / 激情 / 思念 / 歌剧四种情感色彩）
- `night` 深夜与月光
- `piano` 钢琴独语
- `stage` 歌剧舞台
- `farewell` 思念与告别
- `sleep` 睡前 —— 安静、节奏缓慢、力度克制的曲子（夜曲、摇篮曲、「梦」的音乐）

当前音乐会（`kind: concert`）：

- `concert-berlin` 柏林电影之夜 · 约翰·威廉姆斯
- `concert-vienna-2025` 我现场听过的 · 维也纳爱乐 2025（带「★ 我听过现场」徽章）

歌单模型与「一首作品可属多个歌单」的做法参考自 [Mozart Journey](https://moltpany.github.io/mozart-journey/) 的 collections。

## 与 Mozart Journey 的关系

Music Diary 是 [Mozart Journey](https://moltpany.github.io/mozart-journey/) 的姊妹作品，但分工清晰：

- **Mozart Journey** 专注莫扎特一个人的足迹地图（城市 — 年份 — 作品）。
- **Music Diary** 用「爱情」这一主题，把舒伯特、舒曼、肖邦、李斯特、瓦格纳、柴可夫斯基、普契尼、威尔第等许多作曲家串在一起。

两个站点互相超链接。

## 谁在维护它

Music Diary 是 [Boya（伯牙）](https://github.com/moltpany/Agent-Boya) 的第一件作品。Boya 负责从权威音乐门户取材、以带来源的方式撰写条目，并维护这个静态站点。命名取自中国历史上的伯牙——一位「为音乐立传、寻觅知音」的智能体。

## 技术栈

- 纯静态站点，没有构建步骤
- [Leaflet 1.9](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) 提供地图
- 数据维护在 `data/music-diary.json`，同步一份 `data/music-diary.js`（写成 `window.MUSIC_DIARY_DATA = ...`），以便用 `file://` 直接打开本地预览时也能读到数据
- 主题切换通过 `html[data-theme]` 与 `localStorage` 持久化（key: `music-diary-theme`）；视图选择持久化在 `music-diary-view`
- 中／英双语切换（导航栏 `EN`／`中` 按钮，持久化于 `music-diary-lang`）：UI 文案放在 `script.js` 的 `STRINGS`／`STATIC_EN` 字典；数据层每个 collection／entry 可带一个可选 `en` 对象，缺失字段自动回退中文。目前 UI、全部歌单与全部歌单作品（23 首古典正典作品的详情）均已英文化；仅剩两场音乐会的 28 首曲目详情待译（英文模式下回退中文）。注：「弹一首」小游戏的界面暂未英文化
- 「弹一首」小游戏（`keyboard-game.js`）：乐谱全部选自本日记歌单里的作品，谱下可一键跳到作品详情。现有 22 张，分三组——钢琴与器乐（致爱丽丝·开头与 A 段完整双手版 / 梦幻曲 / 月光 / 爱之梦 / 夜曲 Op.9-2 / 离别曲 / 天鹅 / 爱的礼赞 / 弦乐小夜曲 Romanze）、声乐与歌剧（勃拉姆斯摇篮曲完整版 / 舒伯特小夜曲 / 哈巴涅拉 / 你们可知道 / 祝酒歌 / 星光灿烂）、电影配乐（帝国进行曲·右手与双手低音版 / 海德薇主题 / 侏罗纪公园 / 夺宝奇兵 / 第三类接触五音动机）。所有旋律与公开记谱来源逐音核对（Mutopia / Wikifonia 的 LilyPond/ABC 转录、字母谱教程，至少两个独立来源吻合才收录），必要时整体移调装入音域。用简谱标记（1 = C，上点高八度、下点低八度，数字下方标注对应键盘字母）。键盘覆盖 C3–F5 两个半八度、支持双手：右手区 Q 排白键 + 数字排黑键，左手低音区 Z 排白键 + S D G H J 黑键；谱内 `A4+A3` 表示双手同一步的和弦；「八度 ±」按钮或 `−`/`=` 键可整体移高/移低一个八度（自由弹奏时相当于 C2–F6，选乐谱时自动回原位）。五种音色（钢琴 / 八音盒 / 弦乐 / 长笛 / 管风琴）全部由 Web Audio API 实时合成，不依赖任何外部音源文件

## 本地运行

随便起一个静态服务器即可：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000/
```

或者直接双击 `index.html` 用 `file://` 打开，脚本会读取 `data/music-diary.js`。

## 数据与立场

立场与 Mozart Journey 一致：

- 不编造日期、地点、首演背景或作品含义。
- 对不确定的史实采用保守措辞。
- 每一条作品都带一份 `source.label` + `source.url` + `source.summary`。
- 来源优先采用**音乐家官方门户与研究机构**（Beethoven-Haus、Schumann-Portal、肖邦国家研究所 NIFC、Brahms-Portal、Mahler Foundation、Palazzetto Bru Zane、普契尼研究中心、莫扎特基金会柯歇尔目录等）；少数尚无官方逐曲页面者退用权威乐谱档案 IMSLP，并在 `content-audit.md` 标注。

详见：

- [`favorites.md`](./favorites.md) — 收录曲目清单与情感分组依据
- [`content-audit.md`](./content-audit.md) — per-entry 来源审计 / 待办清单

## 相关

- Moltpany 主站：<https://moltpany.github.io/>
- 姊妹作品 Mozart Journey：<https://moltpany.github.io/mozart-journey/>
- 维护者 Boya 框架：<https://github.com/moltpany/Agent-Boya>

## License

代码部分使用 [MIT](./LICENSE)。文本数据来自公开史料与已注明的第三方来源，仅供参考与学习。
