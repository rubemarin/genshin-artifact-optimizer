// ===== キャラクターファイルのひな形 =====
// 使い方: このファイルを「キャラID.js」(例: tighnari.js) にコピーして、★の部分を書き換える
// 最後に index.html の <script src="characters/nahida.js"></script> の下に1行追加する
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({

  // ★1 基本情報 ― id は画像名 images/others/char_<id>.png と一致させる
  id: 'キャラID', name: 'キャラ名', element: 'dendro', weaponType: '法器',
  rarity: 5, version: '3.2', release: '2022-11-02',   // レア度 / 実装バージョン / 実装日(YYYY-MM-DD。並び順に使う)

  // ★2 パーティ構成 ― 計算に影響するものだけ。1つ目が初期値になる
  parties: [
    { key: 'party_a', name: '構成A' },
    { key: 'party_b', name: '構成B' }
  ],

  // ★3 一覧に出す参照ステ (最大2つ。1つなら2つ目は空欄になる)。key は calc が返す値の名前
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],

  // ★4 サブステ割り振り対象。最後のステが「残りロール」を受け取る
  //    使える名前: atk / em / cr / cd
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],

  // ★5 武器 ― キーは images/weapons/<キー>.png と同じ(README の表に合わせる)
  weapons: {
    weapon_id_1: { name: '武器名', atk: 600, em: 0 },   // em = 武器が与える熟知など、必要な値を足す
  },

  // ★6 聖遺物セット ― キーは images/artifacts/<キー>.png と同じ
  sets: [
    { key: 'gilded_dreams', name: '金メッキの夢 4' },
    { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],

  // ★7 メインステの候補。stat は calc 内で数える名前 (em / atk / cr / cd / 元素名など)
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],

  // ★8 ダメージ計算 ― キャラごとに違う部分はここだけ
  //   受け取るもの: weapon(★5の1件), set, mains(['em','dendro','cr']のような配列), rolls({em:3,cr:5,cd:6}), party(★2のkey)
  //   返すもの: damage (必須) / cr / cd / elemBuff (一覧の表示に必須) / refs で指定した値
  calc({ weapon, set, mains, rolls, party }) {
    const S = Engine.SUB;                           // 1ロールの上昇値 {atk, em, cr, cd}
    const n = s => (mains.c[s] || 0); // メインステに s が何個あるか
    const em = 0;                                   // ← 熟知の合計を計算
    const atk = 0;                                  // ← 攻撃力の合計を計算
    const cr = Math.min(100, 5 + (2 + rolls.cr) * S.cr);
    const cd = 50 + (2 + rolls.cd) * S.cd;
    const elemBuff = n('dendro') ? 46.6 : 0;
    const damage = 0;                               // ← 最終ダメージの式を書く
    return { damage, em, atk, cr, cd, elemBuff };
  }
});
