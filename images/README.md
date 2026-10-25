# 画像の置き場所

```
images/
├── weapons/      ← 武器画像
├── artifacts/    ← 聖遺物セット画像
├── characters/   ← キャラ画像 (ファイル名は キャラID.webp)
├── others/       ← その他の画像(元素・ステータスのアイコン)
└── manifest.json ← ID と日本語名の対応表
```

## 武器のファイル名の決め方
武器の英語の正式名を、**小文字にして、アポストロフィ(')を除き、記号とスペースを `_` に変えたもの**です。
例: `Kagura's Verity` → `kaguras_verity` / `Wolf-Fang` → `wolf_fang` / `Hunter's Path` → `hunters_path` / `A Thousand Floating Dreams` → `a_thousand_floating_dreams`

## 聖遺物セットのファイル名の決め方
武器と同じ規則で、**英語の正式名**を小文字にして、アポストロフィを除き、記号とスペースを `_` に変えたものです。
例: `Wanderer's Troupe` → `wanderers_troupe` / `Disenchantment in Deep Shadow` → `disenchantment_in_deep_shadow` / `Heart of the Furnace` → `heart_of_the_furnace`
2種類のセットを組み合わせた構成(`em_2_2` `atk_2_2` `hp_2_2`)だけは、専用の名前です。

## ルール
- 形式は **WebP**、拡張子は小文字の `.webp`
- ファイル名は下の表のとおり(**半角英小文字とアンダースコア**。日本語名や大文字は使わない)
- サイズは正方形で **128×128px 程度** にそろえると見た目と読み込みが安定します
- 画像が無い項目は、表示されません(無くても動きます)
- 画像は、使用が認められているものを自分で用意してください

## 武器 (`images/weapons/`)
| ファイル名 | 名前 | 使うキャラ |
|---|---|---|
| `weapons/a_thousand_floating_dreams.webp` | 千夜に浮かぶ夢 | ナヒーダ/八重神子 |
| `weapons/kaguras_verity.webp` | 神楽の真意 | ナヒーダ/八重神子 |
| `weapons/the_widsith.webp` | 流浪楽章 | ナヒーダ/八重神子 |
| `weapons/sacrificial_fragments.webp` | 祭礼の断片 | ナヒーダ |
| `weapons/lost_prayer_to_the_sacred_winds.webp` | 四風原典 | ナヒーダ/八重神子 |
| `weapons/light_of_foliar_incision.webp` | 萃光の裁葉 | アルハイゼン |
| `weapons/primordial_jade_cutter.webp` | 磐岩結緑 | アルハイゼン |
| `weapons/iron_sting.webp` | 鉄蜂の刺し | アルハイゼン |
| `weapons/harbinger_of_dawn.webp` | 黎明の神剣 | アルハイゼン |
| `weapons/hunters_path.webp` | 狩人の道 | ティナリ |
| `weapons/aqua_simulacra.webp` | 若水 | ティナリ |
| `weapons/slingshot.webp` | 弾弓 | ティナリ |
| `weapons/jade_vista.webp` | 千鈞懸黎 | ティナリ |
| `weapons/echoes_of_the_heart.webp` | 胸中の谺 | 八重神子 |
| `weapons/skyward_atlas.webp` | 天空の巻 | 八重神子 |
| `weapons/sacrificial_sword.webp` | 祭礼の剣 | 行秋 |
| `weapons/moonweavers_dawn.webp` | 月紡ぎの曙光 | 行秋 |
| `weapons/mistsplitter_reforged.webp` | 霧切の廻光 | 行秋 |
| `weapons/wolf_fang.webp` | 狼牙 | 行秋 |
| `weapons/athame_artis.webp` | 黒蝕 | 行秋 |
| `weapons/favonius_warbow.webp` | 西風猟弓 | 夜蘭 |
| `weapons/fading_twilight.webp` | 落霞 | 夜蘭 |
| `weapons/recurve_bow.webp` | リカーブボウ | 夜蘭 |
| `weapons/the_stringless.webp` | 絶弦 | 夜蘭 |

## 聖遺物セット (`images/artifacts/`)
| ファイル名 | 名前 | 使うキャラ |
|---|---|---|
| `artifacts/deepwood_memories.webp` | 深林の記憶 | ナヒーダ |
| `artifacts/golden_troupe.webp` | 黄金の劇団 | ナヒーダ/八重神子 |
| `artifacts/gilded_dreams.webp` | 金メッキの夢 | ナヒーダ/アルハイゼン/ティナリ/八重神子 |
| `artifacts/marechaussee_hunter.webp` | ファントムハンター | アルハイゼン |
| `artifacts/wanderers_troupe.webp` | 大地を流浪する楽団 | ティナリ |
| `artifacts/disenchantment_in_deep_shadow.webp` | 影に沈む幻 | 八重神子 |
| `artifacts/heart_of_the_furnace.webp` | 炉炎溶錬の心 | 八重神子 |
| `artifacts/em_2_2.webp` | 熟知80 + 熟知80 (2セット組) | ナヒーダ/アルハイゼン/ティナリ/八重神子 |
| `artifacts/atk_2_2.webp` | 攻撃18% + 攻撃18% (2セット組) | 八重神子 / 行秋 |

`em_2_2` と `atk_2_2` は、2種類のセットを組み合わせた構成です。代表の聖遺物の画像や、簡単なアイコンを使ってください。
| `artifacts/emblem_of_severed_fate.webp` | 絶縁の旗印 | 行秋 |
| `artifacts/noblesse_oblige.webp` | 旧貴族のしつけ | 行秋 |
| `artifacts/nymphs_dream.webp` | 水仙の夢 | 行秋 |
| `artifacts/hp_2_2.webp` | HP20% + HP20% (2種の組み合わせ) | 夜蘭 |

## キャラ (`images/characters/`)
ファイル名は、キャラのID(`characters/○○.js` の `id`)に `.webp` を付けます。

| ファイル名 | キャラ |
|---|---|
| `characters/nahida.webp` | ナヒーダ |
| `characters/alhaitham.webp` | アルハイゼン |
| `characters/tighnari.webp` | ティナリ |
| `characters/yaemiko.webp` | 八重神子 |
| `characters/xingqiu.webp` | 行秋 |
| `characters/yelan.webp` | 夜蘭 |

## その他 (`images/others/`)
属性・武器種・ステータスのアイコンです。属性と武器種は絞り込みボタンとキャラのカードに、ステータスは表の「参照」列に表示します (ステータスの画像が無い間は、略称の文字が出ます)。
ファイル名は、すべて小文字で、下の表のとおりにしてください(大文字小文字も一致が必要です)。

| ファイル名 | 内容 |
|---|---|
| `others/pyro.webp` | 炎元素 |
| `others/hydro.webp` | 水元素 |
| `others/electro.webp` | 雷元素 |
| `others/dendro.webp` | 草元素 |
| `others/anemo.webp` | 風元素 |
| `others/geo.webp` | 岩元素 |
| `others/cryo.webp` | 氷元素 |
| `others/sword_one_hand.webp` | 片手剣 |
| `others/claymore.webp` | 両手剣 |
| `others/lance.webp` | 長柄武器 |
| `others/bow.webp` | 弓 |
| `others/catalyst.webp` | 法器 |
| `others/stat_atk.webp` | 攻撃力のアイコン (表の「参照」列) |
| `others/stat_hp.webp` | 最大HPのアイコン (表の「参照」列) |
| `others/stat_em.webp` | 元素熟知のアイコン (表の「参照」列) |
| `others/stat_def.webp` | 防御力のアイコン (表の「参照」列) |
| `others/stat_er.webp` | 元素チャージ効率のアイコン (表の「参照」列) |
| `others/stat_cr.webp` | 会心率のアイコン |
| `others/stat_cd.webp` | 会心ダメージのアイコン |
| `others/stat_physical.webp` | 物理ダメージバフのアイコン |
| `others/stat_healing.webp` | 与える治療効果バフのアイコン |

## キャラを増やすとき
新しい武器、セット、キャラが必要になったら(キャラは `characters/<id>.webp`、必要なら新しい元素のアイコンも)、ID(英小文字+アンダースコア)を決めて、画像を置き、`manifest.json` に1行足してください。
