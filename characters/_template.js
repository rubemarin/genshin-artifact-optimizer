// ===== キャラクターファイルのひな形 =====
// 使い方: このファイルを「キャラID.js」(例: furina.js) にコピーして、★の部分を書き換える
// 最後に index.html の CHARACTER_FILES の一覧に、キャラIDを1つ足す
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({

  // ★1 基本情報 ― id は画像名 images/characters/<id>.webp と一致させる
  id: 'キャラID', name: 'キャラ名', element: 'dendro', weaponType: '法器',
  rarity: 5, version: '3.2', release: '2022-11-02',   // レア度 / 実装バージョン / 実装日(YYYY-MM-DD。並び順に使う)
  engine: 2,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)

  // ★2 Lv90の基礎ステータスと突破ボーナス ― 計算で参照しないステータスも必ず記入する (小数2桁まで)
  base:   { hp: 10000.00, atk: 300.00, def: 600.00, em: 0 },
  ascend: { /* 例: dendroDmg: 28.8 / cr: 19.2 / em: 115.2 / atkPct: 24 */ },

  // ★3 パーティ構成 ― 計算に影響するものだけ。1つ目が初期値。same=同元素の味方数 / diff=異元素の味方数
  //    武器・セット・メインステがパーティで変わるなら weaponKeys / setKeys / clocks / cups / circlets を書く
  parties: [
    // members = リオセスリ自身を除く味方の元素 (画面のパーティ選択の下にアイコンで出る)。pyro hydro electro dendro anemo geo cryo / 不明は 'any'
    //           キャラ画像も出したいときは { el: 'dendro', char: 'nahida' } のように書く (images/characters/nahida.webp)
    { key: 'party_a', name: '構成A', members: ['dendro', 'electro', 'electro'], same: 1, diff: 2 }
  ],

  // ★4 一覧に出す参照ステ (優先度の高い順に最大2つ)。key は calc が返す値の名前
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],

  // ★5 割り振り対象のサブステ。最後のステが「残りロール」を受け取る。使える名前: atk(攻撃%) / hp(HP%) / em / cr / cd
  //    ※ 全サブステ(防御%・防御・HP・HP%・攻撃・攻撃%・チャージ・熟知・会心率・会心ダメ)には、KQM基準で
  //      固定2ロールずつが自動で入る (実数値も含む)。割り振りはその上に変動ロールとして足される
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],

  // ★6 武器 ― キーは images/weapons/<キー>.webp と同じ
  weapons: {
    weapon_id_1: { name: '武器名', atk: 600, em: 0, cr: 0, cd: 0, buff: 0 },
  },

  // ★7 聖遺物セット ― キーは images/artifacts/<キー>.webp と同じ
  sets: [
    { key: 'gilded_dreams', name: '金メッキの夢 4' },
    { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],

  // ★8 メインステの候補。stat は calc 内で数える名前 (em / atk / hp / er / cr / cd / 元素名 など)
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],

  // ★9 ダメージ計算 ― キャラごとに違う部分はここだけ
  //   受け取るもの: weapon / set / mains(mains.c[stat]=メインステの個数) / party(★3のkey) / s(サブステの合計値) / rolls(割り振り) / erRolls
  //   s の中身: s.atkPct s.atkFlat s.hpPct s.hpFlat s.defPct s.defFlat s.er s.em s.cr s.cd  (すべて 固定2ロール + 変動ロール込み)
  //   返すもの: damage (必須) / cr / cd / elemBuff (一覧の表示に必須) / refs で指定した値 / er (返さなければ 100% + s.er)
  calc({ weapon: w, set, mains, party, s }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0);                     // メインステに k が何個あるか
    const em = this.base.em + w.em + s.em;                // ← 熟知の合計を計算 (メイン・セット効果などを足す)
    const atk = (this.base.atk + w.atk) * (1 + s.atkPct / 100) + 311 + s.atkFlat;   // 311 = 羽の攻撃力
    // 最大HPが必要なら: this.base.hp * (1 + (HP%の合計) / 100) + 4780 + s.hpFlat    (4780 = 花のHP)
    const cr = Math.min(100, 5 + w.cr + n('cr') * 31.1 + s.cr);
    const cd = 50 + w.cd + n('cd') * 62.2 + s.cd;
    const elemBuff = n('dendro') ? 46.6 : 0;
    const damage = 0;                                     // ← 最終ダメージの式を書く
    return { damage, em, atk, cr, cd, elemBuff };
  }
});
})();
