// ナヒーダ専用データ + ダメージ計算 (滅浄三業 Lv10 / 草激化)
// 旧 nahida.html からの修正点: ①会心の冠のメイン(会心率31.1/会心ダメ62.2)を計算に追加 ②武器の会心サブステを追加
//                              ③熟知80+80の熟知+160を追加 ④金メッキの夢2セットの熟知+80を追加
//                              ⑤黄金の劇団 +70% (2セット20 + 4セット25 + 場にいない時25) ⑥深林の記憶2セット 草ダメ+15%
//                              ⑦神楽の真意 +48% (スキルダメ12%×3層 + 全元素ダメ12%)
//                              ⑧千夜に浮かぶ夢: 熟知+32を常時加算していたのをやめ、パーティの味方の元素で変化 (同元素→熟知+32 / 異元素→草ダメ+10%)
// 前提: ナヒーダは場にいない状態。流浪楽章・四風原典は効果なし(会心ダメ/会心率の武器として扱う)
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'nahida', name: 'ナヒーダ', element: 'dendro', weaponType: '法器',
  rarity: 5, version: '3.2', release: '2022-11-02',
  engine: 4,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 10360.04, atk: 298.97, def: 630.21, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { em: 115.2 },   // 突破ボーナス
  parties: [
    { key: 'dendro_2_electro_2', members: ['dendro', 'electro', 'electro'], name: '草草雷雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_2_hydro_electro', members: ['dendro', 'hydro', 'electro'], name: '草草水雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_1_hydro_electro_other', members: ['hydro', 'electro', 'any'], name: '草水雷+草以外 (草共鳴なし)', same: 0, diff: 3 }
  ],
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],   // 参照ステ1, 2(無ければ空欄)
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  weapons: {
    a_thousand_floating_dreams:       { name: '千夜に浮かぶ夢', atk: 542, em: 265, cr: 0,    cd: 0,    buff: 0, sameEm: 32, diffBuff: 10 },  // 同元素の味方1人につき熟知+32 / 異元素の味方1人につき自元素ダメ+10% (各最大3層, R1)
    kaguras_verity:                { name: '神楽の真意',     atk: 608, em: 0,        cr: 0,    cd: 66.2, buff: 36, elem: 12 },
    the_widsith:               { name: '流浪楽章 (R5)',  atk: 510, em: 0,        cr: 0,    cd: 55.1, buff: 0 },
    sacrificial_fragments: { name: '祭礼の断片 (R5)', atk: 454, em: 221,      cr: 0,    cd: 0,    buff: 0 },
    lost_prayer_to_the_sacred_winds:           { name: '四風原典',       atk: 608, em: 0,        cr: 33.1, cd: 0,    buff: 0 }
  },
  sets: [
    { key: 'deepwood_memories', name: '深林の記憶 4' }, { key: 'golden_troupe', name: '黄金の劇団 4' },
    { key: 'gilded_dreams', name: '金メッキの夢 4' }, { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }, { name: '熟知', stat: 'em' }],
  calc({ weapon, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0), k = set.key;
    const E = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null, BF = X ? [] : null;   // 内訳の記録 (通常は null)
    let em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, '突破ボーナス (熟知)', this.ascend.em) + A(E, '武器の熟知', weapon.em)
      + A(E, '千夜: 同元素の味方×32', (weapon.sameEm || 0) * Math.min(3, pt.same)) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em);
    if (k === 'gilded_dreams') em += A(E, '金メッキの夢 (2セット80 + 異元素の味方×50)', 80 + (party === 'dendro_1_hydro_electro_other' ? 150 : 100));
    if (k === 'em_2_2') em += A(E, '熟知80 + 熟知80 (2+2)', 160);
    if (party.includes('dendro_2')) em += A(E, '草共鳴', 100);
    const atk = (this.base.atk + weapon.atk) * (1 + s.atkPct / 100) + 311 + s.atkFlat;
    const ex = Math.max(0, em - 200);
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', weapon.cr) + A(CRp, '冠 会心率', n('cr') * 31.1) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr) + A(CRp, '固有天賦 (熟知200超過×0.03%, 上限24%)', Math.min(24, ex * 0.03));
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ', weapon.cd) + A(CDp, '冠 会心ダメ', n('cd') * 62.2) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    // 元素バフ(表示用) = キャラ画面の草元素ダメージバフ
    const elemBuff = A(EB, '杯 草バフ', n('dendro') ? 46.6 : 0) + A(EB, '深林の記憶2セット', set.key === 'deepwood_memories' ? 15 : 0) + A(EB, '武器: 全元素ダメ', weapon.elem || 0) + A(EB, '千夜: 異元素の味方×10%', (weapon.diffBuff || 0) * Math.min(3, pt.diff));
    // スキルダメージ限定のバフを含む合計
    const buff = A(BF, '固有天賦 (熟知200超過×0.1%, 上限80%)', Math.min(80, ex * 0.1)) + A(BF, '元素バフ (上の内訳)', elemBuff) + A(BF, '黄金の劇団4 (スキルダメ)', set.key === 'golden_troupe' ? 70 : 0) + A(BF, '武器: スキルダメ', weapon.buff);
    const base = atk * 1.8576 + em * 3.7152;
    const spread = 1.25 * 1446.85 * (1 + (5 * em) / (em + 1200));
    const res = set.key === 'deepwood_memories' ? 1.10 : 0.90;
    const damage = Math.round((base + spread) * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * res);
    if (X) {
      const crit = 1 + (cr / 100) * (cd / 100), K = (1 + buff / 100) * crit * 0.5 * res;
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', weapon.atk]], [['サブステ 攻撃力% (固定2ロール)', s.atkPct]], [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (草ダメ)', '%', elemBuff, EB);
      putSum(X, 'buff', 'ダメージバフ合計 (スキル)', '%', buff, BF);
      const f = what => `${what} × (1 + ${buff.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 ${res}`;
      H(X, null, '滅浄三業 攻撃力分 (攻撃力×185.76%)', atk * 1.8576 * K, f(`${Math.round(atk)} × 185.76%`));
      H(X, null, '滅浄三業 熟知分 (熟知×371.52%)', em * 3.7152 * K, f(`${Math.round(em)} × 371.52%`));
      H(X, null, '草激化の追加ダメージ (1回分)', spread * K, f(`激化 ${Math.round(spread)}`));
    }
    return { damage, em, atk, cr, cd, buff, elemBuff, res };
  }
});
})();
