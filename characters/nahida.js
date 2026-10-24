// ナヒーダ専用データ + ダメージ計算 (滅浄三業 Lv10 / 草激化)
// 旧 nahida.html からの修正点: ①会心の冠のメイン(会心率31.1/会心ダメ62.2)を計算に追加 ②武器の会心サブステを追加
//                              ③熟知80+80の熟知+160を追加 ④金メッキの夢2セットの熟知+80を追加
//                              ⑤黄金の劇団 +70% (2セット20 + 4セット25 + 場にいない時25) ⑥深林の記憶2セット 草ダメ+15%
//                              ⑦神楽の真意 +48% (スキルダメ12%×3層 + 全元素ダメ12%)
//                              ⑧千夜に浮かぶ夢: 熟知+32を常時加算していたのをやめ、パーティの味方の元素で変化 (同元素→熟知+32 / 異元素→草ダメ+10%)
// 前提: ナヒーダは場にいない状態。流浪楽章・四風原典は効果なし(会心ダメ/会心率の武器として扱う)
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'nahida', name: 'ナヒーダ', element: 'dendro', weaponType: '法器',
  rarity: 5, version: '3.2', release: '2022-11-02',
  engine: 2,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 10360.04, atk: 298.97, def: 630.21, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { em: 115.2 },   // 突破ボーナス
  parties: [
    { key: 'dendro_2_electro_2', name: '草草雷雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_2_hydro_electro', name: '草草水雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_1_hydro_electro_other', name: '草水雷+草以外 (草共鳴なし)', same: 0, diff: 3 }
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
  calc({ weapon, set, mains, party, s }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0);
    let em = this.base.em + this.ascend.em + weapon.em + (weapon.sameEm || 0) * Math.min(3, pt.same) + 187 * n('em') + s.em;
    if (set.key === 'gilded_dreams') em += 80 + (party === 'dendro_1_hydro_electro_other' ? 150 : 100); // 2セット80 + 4セット(異元素×50)
    if (set.key === 'em_2_2') em += 160;
    if (party.includes('dendro_2')) em += 100;
    const atk = (this.base.atk + weapon.atk) * (1 + s.atkPct / 100) + 311 + s.atkFlat;
    const ex = Math.max(0, em - 200);
    const cr = Math.min(100, 5 + weapon.cr + n('cr') * 31.1 + s.cr + Math.min(24, ex * 0.03));
    const cd = 50 + weapon.cd + n('cd') * 62.2 + s.cd;
    // 元素バフ(表示用) = キャラ画面の草元素ダメージバフ: 杯 + 深林2セット15 + 武器(千夜: 異元素の味方×10 / 神楽: 12)
    const elemBuff = (n('dendro') ? 46.6 : 0) + (set.key === 'deepwood_memories' ? 15 : 0) + (weapon.elem || 0) + (weapon.diffBuff || 0) * Math.min(3, pt.diff);
    // スキルダメージ限定のバフ: 黄金の劇団 70 / 神楽 36
    const buff = Math.min(80, ex * 0.1) + elemBuff + (set.key === 'golden_troupe' ? 70 : 0) + weapon.buff;
    const base = atk * 1.8576 + em * 3.7152;
    const spread = 1.25 * 1446.85 * (1 + (5 * em) / (em + 1200));
    const res = set.key === 'deepwood_memories' ? 1.10 : 0.90;
    const damage = Math.round((base + spread) * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * res);
    return { damage, em, atk, cr, cd, buff, elemBuff, res };
  }
});
})();
