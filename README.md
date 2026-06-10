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
- 「弹一首」小游戏（`keyboard-game.js`）：SVG 绘制五线谱，电脑键盘（A 排白键、W 排黑键）或屏幕琴键弹奏，五种音色（钢琴 / 八音盒 / 弦乐 / 长笛 / 管风琴）全部由 Web Audio API 实时合成，不依赖任何外部音源文件

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
