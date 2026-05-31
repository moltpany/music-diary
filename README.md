# Music Diary

一本以「爱情」为线索的古典音乐日记。

在线访问：<https://moltpany.github.io/music-diary/>

## 这是什么

Music Diary 把不同作曲家、不同时代的古典音乐作品，按**情感维度**和**诞生地点**整理在一起。古典音乐里的「爱情」很少是直白的甜言蜜语，更多是克制的悸动、炽热的渴望、忧伤的思念，乃至近乎宗教般的狂喜。

这本日记提供两种浏览方式，共享同一份带来源的数据：

- **地图视图**：用 Leaflet + OpenStreetMap，把每首作品放回它的诞生地或首演地。
- **主题视图**：不依赖地图，按四个情感维度分组浏览——
  - 初恋的悸动与朦胧
  - 炽热的渴望与激情
  - 忧伤的离别与思念
  - 歌剧舞台上的爱情宣言

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

详见：

- [`favorites.md`](./favorites.md) — 收录曲目清单与情感分组依据
- [`content-audit.md`](./content-audit.md) — per-entry 来源审计 / 待办清单

## 相关

- Moltpany 主站：<https://moltpany.github.io/>
- 姊妹作品 Mozart Journey：<https://moltpany.github.io/mozart-journey/>
- 维护者 Boya 框架：<https://github.com/moltpany/Agent-Boya>

## License

代码部分使用 [MIT](./LICENSE)。文本数据来自公开史料与已注明的第三方来源，仅供参考与学习。
