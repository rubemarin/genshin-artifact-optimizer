// ティナリ専用データ + ダメージ計算 (重撃: 花筐の矢 + 蔓纏の矢4発 / 草激化)  前提: 2凸 / 天賦Lv10 (恒常キャラは2凸、限定キャラは無凸の方針)
// 旧 tighnari.html からの修正点: 1凸の重撃会心率+15%を追加 / 2凸の草ダメ+20%は旧ページから継続
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'tighnari', name: 'ティナリ', element: 'dendro', weaponType: '弓',
  parties: [{ key: 'standard', name: '標準 (異元素3人 / 2凸)', same: 0, diff: 3 }],   // 既存ページにパーティ選択なし
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  weapons: {
    hunters_path:   { name: '猟人の道 (R1)', atk: 542, cr: 44.1, cd: 0,    buff: 0,  elem: 12, emFlat: 1.60 },
    aqua_simulacra: { name: '若水 (R1)',     atk: 542, cr: 0,    cd: 88.2, buff: 20, emFlat: 0 },
    slingshot:      { name: '弾弓 (R5)',     atk: 354, cr: 31.2, cd: 0,    buff: 60, emFlat: 0 }
  },
  sets: [
    { key: 'wanderers_troupe', name: '大地を流浪する楽団 4' }, { key: 'gilded_dreams', name: '金メッキの夢 4' },
    { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],   // 既存ページの表示対象に合わせて2種
  calc({ weapon: w, set, mains, rolls }) {
    const S = Engine.SUB, n = s => mains.filter(m => m === s).length;
    let em = 50 + 187 * n('em') + S.em * (2 + rolls.em);
    if (set.key === 'wanderers_troupe') em += 80;
    if (set.key === 'gilded_dreams') em += 80 + 150;
    if (set.key === 'em_2_2') em += 160;
    const atk = (268 + w.atk) * (1 + 2 * S.atk / 100) + 311 + 33.08;
    const cr = Math.min(100, 5 + 15 + w.cr + n('cr') * 31.1 + (2 + rolls.cr) * S.cr);   // 1凸: 重撃の会心率+15%
    const cd = 50 + w.cd + n('cd') * 62.2 + (2 + rolls.cd) * S.cd;
    const elemBuff = 48.8 + (n('dendro') ? 46.6 : 0) + (w.elem || 0);   // 突破28.8 + 2凸20 + 杯 + 武器の全元素ダメ
    const buff = elemBuff + Math.min(60, em * 0.06) + w.buff + (set.key === 'wanderers_troupe' ? 35 : 0);
    const hunter = em * w.emFlat;
    const spread = 1446.85 * 1.25 * (1 + (5 * em) / (em + 1200));
    const sum = (atk * 1.5696 + hunter + spread) + (atk * 0.6948 * 4 + hunter * 4 + spread);
    const damage = Math.round(sum * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * 0.90);
    return { damage, em, atk, cr, cd, buff, elemBuff };
  }
});
