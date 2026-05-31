# 内容审计 · per-entry 工作清单

记录每条作品的来源状态与待办。立场：不编造，对不确定处保守措辞，每条带可引用来源。

## 来源策略

第一版（v0.1）的来源以**权威音乐百科条目**为起点，因为它们 URL 稳定、便于核实。Boya 的下一轮工作（`portal-source-harvester`）是把它们逐步**升级为作曲家官方门户 / 国家级研究机构**，例如：

- Chopin：Narodowy Instytut Fryderyka Chopina（en.chopin.nifc.pl，肖邦官方机构）
- Schubert：Schubert online / Wiener Schubertbund
- Liszt / Wagner：各自的官方协会与研究中心
- IMSLP：乐谱与版本信息
- 各歌剧院官方剧目页（La Scala、La Fenice、Teatro Costanzi 等）首演信息

升级时只取**引用来源**（标题、年份、史实、URL），不整段复制门户正文（版权 + 不编造双重红线）。

## 条目状态

| id | 作品 | 年份/地点核实 | 来源类型 | 待办 |
|----|------|----------|----------|------|
| schumann-traumerei | 梦幻曲 | ✅ 1838 / Leipzig | 百科 | 升级到舒曼官方门户 |
| debussy-clair-de-lune | 月光 | ✅ 1905 出版 / Paris | 百科 | 可补 IMSLP 版本信息 |
| beethoven-fur-elise | 致爱丽丝 | ✅ 1810 题记 / Vienna | 百科 | 「爱丽丝」身份保持「不明」措辞 |
| schubert-standchen | 小夜曲 | ✅ 1828 / Vienna | 百科 | 升级到 Schubert online |
| elgar-salut-damour | 爱的礼赞 | ✅ 1888 / London | 百科 | — |
| wagner-tristan-liebestod | 特里斯坦前奏曲与爱之死 | ✅ 作 1857–59 / 慕尼黑 1865 首演 | 百科 | 地点用首演地慕尼黑，注意作曲地另说 |
| liszt-liebestraum-3 | 爱之梦第三首 | ✅ 1850 出版 / Weimar | 百科 | Weimar 为李斯特当时驻地，城市级标注 |
| tchaikovsky-romeo-juliet | 罗密欧与朱丽叶幻想序曲 | ✅ 1869 / Moscow 1870 首演 | 百科 | 多次修订，年份取初作 |
| rachmaninoff-piano-concerto-2 | 第二钢协第二乐章 | ✅ 1900–01 / Moscow 首演 | 百科 | — |
| bizet-carmen-habanera | 卡门·哈巴涅拉 | ✅ 1875 / 巴黎喜歌剧院首演 | 百科 | 旋律源自 Iradier，可补注 |
| mahler-adagietto | 第五交响曲小柔板 | ✅ 1901–02 / Vienna 相识 | 百科 | 「情书」用意为后人记述，保守措辞 |
| brahms-intermezzo-op117-1 | 间奏曲 Op.117 No.1 | ✅ 1892 / Bad Ischl | 百科 | — |
| puccini-un-bel-di | 蝴蝶夫人·晴朗的一天 | ✅ 1904 / 米兰斯卡拉首演 | 百科 | — |
| saint-saens-le-cygne | 天鹅 | ✅ 1886 / 巴黎私人首演 | 百科 | 作曲地为奥地利小村，城市级用首演地巴黎 |
| mozart-voi-che-sapete | 费加罗·你们可知道什么是爱情 | ✅ 1786 / 维也纳城堡剧院首演 | 百科 | — |
| verdi-libiamo | 茶花女·祝酒歌 | ✅ 1853 / 威尼斯凤凰歌剧院首演 | 百科 | — |
| puccini-e-lucevan-le-stelle | 托斯卡·星光灿烂 | ✅ 1900 / 罗马科斯坦齐剧院首演 | 百科 | — |
| strauss-rosenkavalier | 玫瑰骑士组曲 | ✅ 1911 / 德累斯顿首演 | 百科 | 组曲常用版本 1944 Rodzinski 编订，已在 summary 注明 |

## 保守措辞约定

- 作曲地与首演地不一致时，地图点位优先用**有据可查的首演地**，并在 summary 注明。
- 「情书」「献给某人」这类含义性表述，只在有来源支持时写；否则用「通常被认为」「常被解读为」。
- 城市级标注（不落到具体厅堂），除非来源支持精确地点。
