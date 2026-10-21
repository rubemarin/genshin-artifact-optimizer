// ナヒーダ専用データ + ダメージ計算 (滅浄三業 Lv10 / 草激化)  ※既存 nahida.html と同じ式
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'nahida', name: 'ナヒーダ', element: 'dendro', weaponType: '法器',
  parties: [
    { key: 'dendro_2_electro_2', name: '草草雷雷 (草共鳴 熟知+100)' },
    { key: 'dendro_2_hydro_electro', name: '草草水雷 (草共鳴 熟知+100)' },
    { key: 'dendro_1_hydro_electro_other', name: '草水雷+草以外 (草共鳴なし)' }
  ],
  refs: [{ key: 'em', label: '熟知' }],               // 参照ステ1, 2(無ければ空欄)
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  weapons: {
    thousand_dreams:       { name: '千夜に浮かぶ夢', atk: 542, em: 265 + 32 },
    kagura:                { name: '神楽の真意',     atk: 608, em: 0 },
    widsith:               { name: '流浪楽章 (R5)',  atk: 510, em: 0 },
    sacrificial_fragments: { name: '祭礼の断片 (R5)', atk: 454, em: 221 },
    lost_prayer:           { name: '四風原典',       atk: 608, em: 0 }
  },
  sets: [
    { key: 'deepwood_memories', name: '深林の記憶 4' }, { key: 'golden_troupe', name: '黄金の劇団 4' },
    { key: 'gilded_dreams', name: '金メッキの夢 4' }, { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }, { name: '熟知', stat: 'em' }],
  calc({ weapon, set, mains, rolls, party }) {
    const S = Engine.SUB, n = s => mains.filter(m => m === s).length;
    let em = 115 + weapon.em + 187 * n('em') + S.em * (2 + rolls.em);
    if (set.key === 'gilded_dreams') em += (party === 'dendro_1_hydro_electro_other' ? 150 : 100);
    if (party.includes('dendro_2')) em += 100;
    const atk = (299 + weapon.atk) * (1 + 2 * S.atk / 100) + 311 + 33.08;
    const ex = Math.max(0, em - 200);
    const cr = Math.min(100, 5 + (2 + rolls.cr) * S.cr + Math.min(24, ex * 0.03));
    const cd = 50 + (2 + rolls.cd) * S.cd;
    const elemBuff = n('dendro') ? 46.6 : 0;
    const buff = Math.min(80, ex * 0.1) + elemBuff + (set.key === 'golden_troupe' ? 20 : 0);
    const base = atk * 1.8576 + em * 3.7152;
    const spread = 1.25 * 1446.85 * (1 + (5 * em) / (em + 1200));
    const res = set.key === 'deepwood_memories' ? 1.10 : 0.90;
    const damage = Math.round((base + spread) * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * res);
    return { damage, em, atk, cr, cd, buff, elemBuff, res };
  }
});
