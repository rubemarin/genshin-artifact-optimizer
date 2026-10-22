# 画像の置き場所

```
images/
├── weapons/      ← 武器画像
├── artifacts/    ← 聖遺物セット画像
├── characters/   ← キャラ画像 (ファイル名は キャラID.png)
├── others/       ← その他の画像(元素・ステータスのアイコン)
└── manifest.json ← ID と日本語名の対応表
```

## ルール
- 形式は **PNG**、拡張子は小文字の `.png`
- ファイル名は下の表のとおり(**半角英小文字とアンダースコア**。日本語名や大文字は使わない)
- サイズは正方形で **128×128px 程度** にそろえると見た目と読み込みが安定します
- 画像が無い項目は、名前の文字で表示される想定です(無くても動きます)
- 画像は、使用が認められているものを自分で用意してください

## 武器 (`images/weapons/`)
| ファイル名 | 名前 | 使うキャラ |
|---|---|---|
| `weapons/thousand_dreams.png` | 千夜に浮かぶ夢 | ナヒーダ/八重神子 |
| `weapons/kagura.png` | 神楽の真意 | ナヒーダ/八重神子 |
| `weapons/widsith.png` | 流浪楽章 | ナヒーダ/八重神子 |
| `weapons/sacrificial_fragments.png` | 祭礼の断片 | ナヒーダ |
| `weapons/lost_prayer.png` | 四風原典 | ナヒーダ/八重神子 |
| `weapons/light_of_foliar_incision.png` | 裁葉の垂杖 | アルハイゼン |
| `weapons/primordial_jade_cutter.png` | 磐岩結緑 | アルハイゼン |
| `weapons/iron_sting.png` | 鉄蜂の刺し | アルハイゼン |
| `weapons/harbinger_of_dawn.png` | 黎明の神剣 | アルハイゼン |
| `weapons/hunters_path.png` | 猟人の道 | ティナリ |
| `weapons/aqua_simulacra.png` | 若水 | ティナリ |
| `weapons/slingshot.png` | 弾弓 | ティナリ |
| `weapons/echoing_sound.png` | 胸中の谺 | 八重神子 |
| `weapons/skyward_atlas.png` | 天空の巻 | 八重神子 |

## 聖遺物セット (`images/artifacts/`)
| ファイル名 | 名前 | 使うキャラ |
|---|---|---|
| `artifacts/deepwood_memories.png` | 深林の記憶 | ナヒーダ |
| `artifacts/golden_troupe.png` | 黄金の劇団 | ナヒーダ/八重神子 |
| `artifacts/gilded_dreams.png` | 金メッキの夢 | ナヒーダ/アルハイゼン/ティナリ/八重神子 |
| `artifacts/marechaussee_hunter.png` | ファントムハンター | アルハイゼン |
| `artifacts/wanderers_troupe.png` | 大地を流浪する楽団 | ティナリ |
| `artifacts/shadow_phantom.png` | 影に沈む幻 | 八重神子 |
| `artifacts/furnace_heart.png` | 炉炎溶錬の心 | 八重神子 |
| `artifacts/em_2_2.png` | 熟知80 + 熟知80 (2セット組) | ナヒーダ/アルハイゼン/ティナリ/八重神子 |
| `artifacts/atk_2_2.png` | 攻撃18% + 攻撃18% (2セット組) | 八重神子 |

`em_2_2` と `atk_2_2` は、2種類のセットを組み合わせた構成です。代表の聖遺物の画像や、簡単なアイコンを使ってください。

## キャラ (`images/characters/`)
ファイル名は、キャラのID(`characters/○○.js` の `id`)に `.png` を付けます。

| ファイル名 | キャラ |
|---|---|
| `characters/nahida.png` | ナヒーダ |
| `characters/alhaitham.png` | アルハイゼン |
| `characters/tighnari.png` | ティナリ |
| `characters/yaemiko.png` | 八重神子 |

## その他 (`images/others/`)
ファイル名の頭で種類を分けています: `element_` = 元素、`stat_` = ステータス。いまの画面では未使用です。

| ファイル名 | 名前 |
|---|---|
| `others/element_dendro.png` | 草元素アイコン |
| `others/element_electro.png` | 雷元素アイコン |
| `others/stat_atk.png` | 攻撃力アイコン |
| `others/stat_em.png` | 元素熟知アイコン |
| `others/stat_crit_rate.png` | 会心率アイコン |
| `others/stat_crit_dmg.png` | 会心ダメージアイコン |
| `others/stat_er.png` | 元素チャージ効率アイコン |
| `others/stat_dmg_bonus.png` | 元素ダメージバフアイコン |

## キャラを増やすとき
新しい武器、セット、キャラが必要になったら(キャラは `characters/<id>.png`、必要なら新しい元素のアイコンも)、ID(英小文字+アンダースコア)を決めて、画像を置き、`manifest.json` に1行足してください。
