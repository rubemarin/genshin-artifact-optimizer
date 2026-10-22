// アルハイゼン専用データ + ダメージ計算 (琢光鏡 3段 / 草激化2回)  前提: 無凸 / 天賦Lv10
// 旧 alhaitham.html からの修正点: 金メッキの夢の熟知(+50×異元素)・攻撃力(+14%×同元素)をパーティの構成で変化させる
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'alhaitham', name: 'アルハイゼン', element: 'dendro', weaponType: '片手剣',
  rarity: 5, version: '3.4', release: '2023-01-18',
  parties: [
    { key: 'dendro_2_electro_2', name: '草草雷雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_2_hydro_electro', name: '草草水雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_1_hydro_electro_other', name: '草水雷+草以外 (草共鳴なし)', same: 0, diff: 3 }
  ],
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  weapons: {
    light_of_foliar_incision: { name: '裁葉の垂杖 (R1)', atk: 542, em: 0,   cr: 4,    cd: 88.2, buff: 0,  emDmg: 1.20, atkFlat: 0 },
    primordial_jade_cutter:   { name: '磐岩結緑 (R1)',   atk: 542, em: 0,   cr: 44.1, cd: 0,    buff: 0,  emDmg: 0,    atkFlat: 13348 * 1.20 * 0.012 },
    iron_sting:               { name: '鉄蜂の刺し (R5)', atk: 510, em: 165, cr: 0,    cd: 0,    buff: 24, emDmg: 0,    atkFlat: 0 },
    harbinger_of_dawn:        { name: '黎明の神剣 (R5)', atk: 401, em: 0,   cr: 28,   cd: 46.9, buff: 0,  emDmg: 0,    atkFlat: 0 }
  },
  sets: [
    { key: 'gilded_dreams', name: '金メッキの夢 4' }, { key: 'marechaussee_hunter', name: 'ファントムハンター 4' },
    { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],
  calc({ weapon: w, set, mains, rolls, party }) {
    const pt = this.parties.find(x => x.key === party);   // same=同元素の味方数 / diff=異元素の味方数
    const S = Engine.SUB, n = s => mains.filter(m => m === s).length;
    let em = 187 * n('em') + w.em + S.em * (2 + rolls.em);
    if (set.key === 'gilded_dreams') em += 80 + 50 * Math.min(3, pt.diff);   // 2セット80 + 4セット(異元素の味方×50)
    if (set.key === 'em_2_2') em += 160;
    if (party.includes('dendro_2')) em += 100;
    let atkPct = 2 * S.atk; if (set.key === 'gilded_dreams') atkPct += 14 * Math.min(3, pt.same);   // 同元素の味方×14%
    const atk = (313 + w.atk) * (1 + atkPct / 100) + 311 + 33.08 + w.atkFlat;
    let cr = 5 + w.cr + n('cr') * 31.1 + (2 + rolls.cr) * S.cr; if (set.key === 'marechaussee_hunter') cr += 36;
    cr = Math.min(100, cr);
    const cd = 50 + w.cd + n('cd') * 62.2 + (2 + rolls.cd) * S.cd;
    const elemBuff = 28.8 + (n('dendro') ? 46.6 : 0);   // 突破の草ダメ28.8 + 杯
    const buff = elemBuff + Math.min(100, em * 0.1) + w.buff;
    const hit = atk * 1.2096 + em * 2.4192 + em * w.emDmg;
    const spread = 1.25 * 1446.85 * (1 + (5 * em) / (em + 1200)) * 2;
    const damage = Math.round((hit * 3 + spread) * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * 0.90);
    return { damage, em, atk, cr, cd, buff, elemBuff };
  }
});
