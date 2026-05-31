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
| schubert-standchen | 小夜曲 | IMSLP | 权威乐谱档案 ⚠️（暂无官方逐曲页） |
| elgar-salut-damour | 爱的礼赞 | **The Elgar Society** | 官方协会 ✅ |
| wagner-tristan-liebestod | 特里斯坦前奏曲与爱之死 | IMSLP（WWV 90） | 权威乐谱档案 ⚠️ |
| liszt-liebestraum-3 | 爱之梦第三首 | IMSLP（S. 541） | 权威乐谱档案 ⚠️ |
| tchaikovsky-romeo-juliet | 罗密欧与朱丽叶 | **Tchaikovsky Research** | 权威学术资料库 ✅ |
| rachmaninoff-piano-concerto-2 | 第二钢协第二乐章 | IMSLP（Op. 18） | 权威乐谱档案 ⚠️ |
| bizet-carmen-habanera | 卡门·哈巴涅拉 | **Palazzetto Bru Zane** Mediabase | 法国浪漫音乐研究机构 ✅ |
| mahler-adagietto | 第五交响曲小柔板 | **Mahler Foundation** | 官方基金会 ✅ |
| brahms-intermezzo-op117-1 | 间奏曲 Op.117 No.1 | **Brahms-Portal** | 官方门户 ✅ |
| puccini-un-bel-di | 蝴蝶夫人·晴朗的一天 | **Centro Studi Giacomo Puccini** | 官方研究中心 ✅ |
| saint-saens-le-cygne | 天鹅 | **Palazzetto Bru Zane** Mediabase | 法国浪漫音乐研究机构 ✅ |
| mozart-voi-che-sapete | 费加罗·你们可知道什么是爱情 | **Stiftung Mozarteum**（柯歇尔目录） | 官方基金会 ✅ |
| verdi-libiamo | 茶花女·祝酒歌 | **Teatro La Fenice**（首演剧院） | 官方剧院剧目页 ✅ |
| puccini-e-lucevan-le-stelle | 托斯卡·星光灿烂 | **Centro Studi Giacomo Puccini** | 官方研究中心 ✅ |
| strauss-rosenkavalier | 玫瑰骑士组曲 | IMSLP（Op. 59） | 权威乐谱档案 ⚠️ |
| chopin-nocturne-op9-2 | 降 E 大调夜曲 | **NIFC 肖邦国家研究所** | 官方机构 ✅ |
| chopin-etude-op10-3 | 离别曲 | **NIFC 肖邦国家研究所** | 官方机构 ✅ |

## 待办（Boya 的下一轮 portal-source-harvester）

把仍标 ⚠️ 的五项升级到官方逐曲页面：
- Schubert → Neue Schubert-Ausgabe / Wiener Schubertbund 的逐曲资源
- Wagner → Richard-Wagner-Werkverzeichnis（WWV）官方条目（如可稳定深链）
- Liszt → 新李斯特全集 / Liszt-Gesellschaft 逐曲页
- Rachmaninoff → 可信的拉赫玛尼诺夫研究机构逐曲页
- Strauss → Richard-Strauss-Institut / Richard-Strauss-Werkverzeichnis 逐曲页

## 保守措辞约定

- 作曲地与首演地不一致时，地图点位优先用**有据可查的首演地**，并在 summary 注明。
- 「情书」「献给某人」「离别曲」之类含义性表述，只在有来源支持时写；《致爱丽丝》的「爱丽丝」、《离别曲》的别名都明确标注为「身份不明 / 后人所加」。
- 城市级标注（不落到具体厅堂），除非来源支持精确地点。
