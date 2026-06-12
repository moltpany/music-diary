# 内容审计 · per-entry 工作清单

记录每首作品的来源状态。立场：不编造，对不确定处保守措辞，每条带可引用来源。

## 来源策略

v0.2 已把来源从通用百科**升级为音乐家官方门户与专业研究机构**。仅当某作品尚无可稳定深链的官方逐曲页面时，才退而使用权威乐谱档案 **IMSLP**（仍标注为权威来源，而非编造）。升级时只取**引用来源**（标题、年份、首演、题献、URL），不整段复制门户正文（版权 + 不编造双重红线）。

v0.3 进一步：每首作品的介绍拆成 **`blurb` 提要 + `background` 创作背景 + `meaning` 作品含义** 三部分，并为每条增加 `sources` 数组——通常为「官方门户（主）+ 已核实的权威条目（辅，多为对应 Wikipedia 词条）」，详情页与来源区都会完整列出。所有背景与含义均基于下表官方/权威来源的已核实事实撰写，不编造。

## 官方门户对照

| id | 作品 | 来源机构 | 类型 |
|----|------|----------|------|
| schumann-traumerei | 梦幻曲 | **Schumann-Portal** | 官方门户 ✅ |
| debussy-clair-de-lune | 月光 | **Palazzetto Bru Zane** Mediabase | 法国浪漫音乐研究机构 ✅ |
| beethoven-fur-elise | 致爱丽丝 | **Beethoven-Haus Bonn** | 官方故居作品库 ✅ |
| schubert-standchen | 小夜曲 | **Bärenreiter**（新舒伯特全集 Urtext） | 官方出版方（版权方）✅ |
| elgar-salut-damour | 爱的礼赞 | **The Elgar Society** | 官方协会 ✅ |
| wagner-tristan-liebestod | 特里斯坦前奏曲与爱之死 | **Breitkopf & Härtel**（原始出版社） | 官方出版方 ✅ |
| liszt-liebestraum-3 | 爱之梦第三首 | **G. Henle Verlag** Urtext (HN 634) | 官方出版方 ✅ |
| tchaikovsky-romeo-juliet | 罗密欧与朱丽叶 | **Tchaikovsky Research** | 权威学术资料库 ✅ |
| rachmaninoff-piano-concerto-2 | 第二钢协第二乐章 | **G. Henle Verlag** Urtext (HN 1214) | 官方出版方 ✅ |
| bizet-carmen-habanera | 卡门·哈巴涅拉 | **Palazzetto Bru Zane** Mediabase | 法国浪漫音乐研究机构 ✅ |
| mahler-adagietto | 第五交响曲小柔板 | **Mahler Foundation** | 官方基金会 ✅ |
| brahms-intermezzo-op117-1 | 间奏曲 Op.117 No.1 | **Brahms-Portal** | 官方门户 ✅ |
| puccini-un-bel-di | 蝴蝶夫人·晴朗的一天 | **Centro Studi Giacomo Puccini** | 官方研究中心 ✅ |
| saint-saens-le-cygne | 天鹅 | **Palazzetto Bru Zane** Mediabase | 法国浪漫音乐研究机构 ✅ |
| mozart-voi-che-sapete | 费加罗·你们可知道什么是爱情 | **Stiftung Mozarteum**（柯歇尔目录） | 官方基金会 ✅ |
| verdi-libiamo | 茶花女·祝酒歌 | **Teatro La Fenice**（首演剧院） | 官方剧院剧目页 ✅ |
| puccini-e-lucevan-le-stelle | 托斯卡·星光灿烂 | **Centro Studi Giacomo Puccini** | 官方研究中心 ✅ |
| strauss-rosenkavalier | 玫瑰骑士组曲 | **Schott Music**（出版方） | 官方出版方 ✅ |
| chopin-nocturne-op9-2 | 降 E 大调夜曲 | **NIFC 肖邦国家研究所** | 官方机构 ✅ |
| chopin-etude-op10-3 | 离别曲 | **NIFC 肖邦国家研究所** | 官方机构 ✅ |
| chopin-berceuse-op57 | 摇篮曲 Op.57 | **NIFC 肖邦国家研究所** | 官方机构 ✅ |
| mozart-eine-kleine-nachtmusik-romanze | 弦乐小夜曲 K.525 第二乐章 Romanze | **Stiftung Mozarteum**（柯歇尔目录） | 官方基金会 ✅ |
| brahms-wiegenlied-op49-4 | 摇篮曲 Op.49 No.4 | **IMSLP**（5 Lieder Op.49） | 权威乐谱档案 ⚠️ 见下 |
| haydn-trumpet-concerto-finale | 小号协奏曲 Hob.VIIe:1 第三乐章 | **Wikipedia** + Henle Urtext (HN 456) | 权威条目＋官方出版方 ⚠️ 见童年注 |
| hummel-trumpet-concerto-rondo | 小号协奏曲 S.49 回旋曲 | **Wikipedia** + IMSLP（原 E 大调 S.49） | 权威条目＋权威乐谱档案 ⚠️ 见童年注 |

> ⚠️ **童年歌单来源标注（v0.8）**：`haydn-trumpet-concerto-finale`（海顿《小号协奏曲》Hob.VIIe:1 终乐章）与 `hummel-trumpet-concerto-rondo`（胡梅尔《小号协奏曲》S.49 回旋曲）均无 NIFC／Mozarteum 那样可稳定深链的官方逐曲门户，故以 **Wikipedia 对应词条为主来源**（已核实，非编造），并各配一条权威辅来源：海顿用 **G. Henle Verlag** Urtext 作品页（HN 456），胡梅尔用 **IMSLP**（保存原 E 大调 S.49 总谱，该曲今多奏降 E 大调）。两首已核实的共同事实：均为小号家**安东·魏丁格**的「键号」而作；海顿 1796 年作于维也纳、1800-03-28 由魏丁格在城堡剧院首演；胡梅尔 1803 年 12 月作、1804-01-01 首演并接任埃斯特哈齐宫廷乐职（海顿继任者）。胡梅尔首演确切场所略有不同说法，地图按埃斯特哈齐宫（艾森施塔特）标注并在 `place.note` 注明。立场与歌单一致：不编造日期／地点／首演背景。

> ⚠️ **IMSLP 主来源标注（睡前歌单 v0.6）**：`brahms-wiegenlied-op49-4`（勃拉姆斯《摇篮曲》）暂以 IMSLP《5 Lieder, Op. 49》页为主来源。官方 Brahms-Portal 收录此套歌曲，但其逐曲页面对自动抓取返回 403、当前无法稳定核实具体作品 ID，故按本项目策略退用 IMSLP，并以 Wikipedia 词条为辅来源核实题献与首演（贝尔塔·法贝尔；1869-12-22 维也纳，Dustmann／克拉拉·舒曼）。待 Brahms-Portal 逐曲页可稳定深链后再升级为官方主来源。另外两首睡前新曲（肖邦《摇篮曲》、莫扎特 K.525 Romanze）均已用官方门户（NIFC、Mozarteum 柯歇尔目录）作主来源。

## 音乐会曲目（concerts）的来源现状

上表覆盖的是**歌单（playlists）**里的古典正典曲目。两场**音乐会**共 28 首曲目的来源标准与歌单不同，单列于此，如实记录：

| 音乐会 | 曲目数 | 主来源现状 |
|--------|--------|-----------|
| `concert-berlin`（约翰·威廉姆斯电影之夜） | 18 | 1 首用 **John Williams 官方作品库**（johnwilliams.org），其余 17 首用 **Wikipedia** |
| `concert-vienna-2025`（小约翰·施特劳斯轻歌剧选段） | 10 | 全部用 **Wikipedia**（对应轻歌剧词条） |

说明与待办：
- **为什么不是官方门户**：电影配乐与轻歌剧选段大多没有古典正典那样可稳定深链的「官方逐曲解说页」。约翰·威廉姆斯官网（johnwilliams.org）有作品库但并非每首音乐会改编都有独立页；小约翰·施特劳斯尚无类似 NIFC／Mozarteum 的官方逐曲门户。故这两场暂以 Wikipedia 作主来源——**Wikipedia 是已核实的权威条目，不是编造**，立场与歌单一致（不编造日期/地点/首演背景）。
- **升级可行性（v0.7 已核查，结论：暂不可批量升级）**：
  - 约翰·威廉姆斯——johnwilliams.org 确有可深链的**独立曲目页**（已核实 `olympic-fanfare-and-theme`、`hymn-to-new-england`、`liberty-fanfare` 等，会被搜索索引）。但本场 18 首中：①电影单曲（帝国进行曲、海德薇主题、飞翔主题等）官网只有「影片页」、无逐曲页；②音乐会作品《大提琴挽歌》经多次定向检索仅见于作品库索引、未见独立页。官网对自动抓取返回 403，无法核实确切 URL。**唯一有官方页的 Olympic Fanfare 已迁（`jw-olympic-fanfare`）；其余不构造未核实链接。**
  - 小约翰·施特劳斯——无官方逐曲门户。维也纳官方诞辰 200 周年站 johannstrauss2025.at 只有 **2025 演出活动页**（`/event/...`），属临时性宣传页、音乐节后可能下线，作为事实来源稳定性不及 Wikipedia，故不采用。IMSLP 有逐部轻歌剧页（项目层级高于 Wikipedia），但对「选段事实」仅为平移，价值有限。
  - **结论**：保持 Wikipedia 为主来源是当前诚实的最优解。待 johnwilliams.org 逐曲页可稳定深链核实、或出现 Johann-Strauss 官方/研究机构逐曲页时，再逐条升级——不为凑「官方」而编造或改用易失效链接。
- 完整 28 首的逐条来源见 `data/music-diary.json` 各 entry 的 `source` / `sources` 字段。

## 来源升级进度

v0.4：原先用 IMSLP 作主来源的 5 首已全部升级到**官方出版方（版权方）**的作品页——
- Schubert《小夜曲》→ Bärenreiter（新舒伯特全集 Urtext，Walther Dürr 校订）
- Wagner《特里斯坦》→ Breitkopf & Härtel（WWV 90 原始出版社）
- Liszt《爱之梦》→ G. Henle Verlag Urtext (HN 634)
- Rachmaninoff《第二钢协》→ G. Henle Verlag Urtext (HN 1214，据格林卡博物馆自笔谱)
- Strauss《玫瑰骑士》→ Schott Music

IMSLP 现已全部降为**辅来源**（乐谱档案仍有价值），不再作为任何作品的主来源。

## 待办（Boya 的下一轮）

- 若相关研究机构（Wiener Schubertbund、Richard-Strauss-Institut、Liszt-Gesellschaft 等）日后提供可稳定深链的**逐曲解说页**，可将主来源从「出版方作品页」进一步替换为「研究机构逐曲页」。
- 周期性复核所有外链有效性（出版方页面偶有改版）。

## 精确地点（place）与确定度

v0.5 为每首作品加入了 `place`（精确场所 + 地址 + 经纬度 + 确定度 + 说明 + 来源），地图标记不再停留在城市中心，而是落到具体地点。坐标均经检索核实，未核实者不编造、退回城市级并标注。

确定度分级：
- **高**：歌剧首演剧院等有明确史料的地点 —— 凡尔赛级别的确定。包括莫扎特《费加罗》(旧城堡剧院/米夏埃尔广场)、瓦格纳《特里斯坦》(慕尼黑国家剧院)、比才《卡门》(巴黎喜歌剧院)、普契尼《蝴蝶夫人》(斯卡拉)/《托斯卡》(罗马科斯坦齐)、威尔第《茶花女》(凤凰歌剧院)、施特劳斯《玫瑰骑士》(森帕歌剧院)。
- **中**：作曲家在对应城市的故居/纪念地标（舒曼故居、贝多芬 Pasqualatihaus、舒伯特辞世居所、李斯特故居、肖邦 Square d'Orléans 等）——地点真实且与作曲家强关联，但非确切创作房间，已在 `place.note` 注明。
- **低**：仅能确定城市（埃尔加之于伦敦、马勒之于维也纳、圣-桑之于巴黎），取该城一处确切地标作城市级定位，并在 note 说明。

v0.6（睡前歌单）沿用同一约定：肖邦《摇篮曲》复用其巴黎 Square d'Orléans 住所（确定度中）；莫扎特 K.525 Romanze 取维也纳 Mozarthaus、勃拉姆斯《摇篮曲》取维也纳卡尔广场勃拉姆斯纪念碑，均为城市级定位（确定度低），已在 `place.note` 注明非确切创作/完成地点。

## 保守措辞约定

- 作曲地与首演地不一致时，地图点位优先用**有据可查的首演地**，并在 summary 注明。
- 「情书」「献给某人」「离别曲」之类含义性表述，只在有来源支持时写；《致爱丽丝》的「爱丽丝」、《离别曲》的别名都明确标注为「身份不明 / 后人所加」。
- 城市级标注（不落到具体厅堂），除非来源支持精确地点。
