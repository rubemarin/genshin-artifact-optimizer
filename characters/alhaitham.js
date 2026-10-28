// アルハイゼン専用データ + ダメージ計算 (琢光鏡 3段 / 草激化2回)  前提: 無凸 / 天賦Lv10
// 旧 alhaitham.html からの修正点: 金メッキの夢の熟知(+50×異元素)・攻撃力(+14%×同元素)をパーティの構成で変化させる
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'alhaitham', name: 'アルハイゼン', element: 'dendro', weaponType: '片手剣',
  rarity: 5, version: '3.4', release: '2023-01-18',
  engine: 4,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 13348.04, atk: 313.32, def: 781.62, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { dendroDmg: 28.8 },   // 突破ボーナス
  parties: [
    { key: 'dendro_2_electro_2', members: ['dendro', 'electro', 'electro'], name: '草草雷雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_2_hydro_electro', members: ['dendro', 'hydro', 'electro'], name: '草草水雷 (草共鳴 熟知+100)', same: 1, diff: 2 },
    { key: 'dendro_1_hydro_electro_other', members: ['hydro', 'electro', 'any'], name: '草水雷+草以外 (草共鳴なし)', same: 0, diff: 3 }
  ],
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  weapons: {
    light_of_foliar_incision: { name: '萃光の裁葉 (R1)', atk: 542, em: 0,   cr: 4,    cd: 88.2, buff: 0,  emDmg: 1.20 },
    primordial_jade_cutter:   { name: '磐岩結緑 (R1)',   atk: 542, em: 0,   cr: 44.1, cd: 0,    buff: 0,  emDmg: 0,    hpPct: 20, hpToAtk: 1.2 },
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
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);   // same=同元素の味方数 / diff=異元素の味方数
    const n = k => (mains.c[k] || 0), k = set.key;
    const E = X ? [] : null, AP = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null, BF = X ? [] : null;
    let em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, '武器の熟知', w.em) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em);
    if (k === 'gilded_dreams') em += A(E, '金メッキの夢 (2セット80 + 異元素の味方×50)', 80 + 50 * Math.min(3, pt.diff));
    if (k === 'em_2_2') em += A(E, '熟知80 + 熟知80 (2+2)', 160);
    if (party.includes('dendro_2')) em += A(E, '草共鳴', 100);
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct);
    if (k === 'gilded_dreams') atkPct += A(AP, '金メッキの夢4 (同元素の味方×14%)', 14 * Math.min(3, pt.same));
    const maxHp = this.base.hp * (1 + ((w.hpPct || 0) + s.hpPct) / 100) + 4780 + s.hpFlat;           // 磐岩結緑用 (花4780 + サブ)
    const hpAtk = w.hpToAtk ? maxHp * w.hpToAtk / 100 : 0;
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + hpAtk;
    let cr = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', n('cr') * 31.1) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr);
    if (k === 'marechaussee_hunter') cr += A(CRp, 'ファントムハンター4 (会心率+12%×3層)', 36);
    const crRaw = cr; cr = Math.min(100, cr);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', n('cd') * 62.2) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const elemBuff = A(EB, '突破 草ダメ', this.ascend.dendroDmg) + A(EB, '杯 草バフ', n('dendro') ? 46.6 : 0);   // 突破の草ダメ + 杯
    const buff = A(BF, '元素バフ (上の内訳)', elemBuff) + A(BF, '固有天賦 (熟知×0.1%, 上限100%)', Math.min(100, em * 0.1)) + A(BF, '武器: ダメージ+', w.buff);
    const hit1 = atk * 1.2096 + em * 2.4192 + em * w.emDmg;
    const spread = 1.25 * 1446.85 * (1 + (5 * em) / (em + 1200)) * 2;
    const damage = Math.round((hit1 * 3 + spread) * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * 0.90);
    if (X) {
      const crit = 1 + (cr / 100) * (cd / 100), K = (1 + buff / 100) * crit * 0.5 * 0.90;
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(hpAtk ? [['武器: 最大HP×' + w.hpToAtk + '%', hpAtk]] : []), atk);
      if (hpAtk) putMul(X, 'hp', '最大HP (磐岩結緑の計算用)', [['キャラ基礎HP', this.base.hp]], [['武器 HP%', w.hpPct || 0], ['サブステ HP% (固定2ロール)', s.hpPct]], [['花のHP (固定)', 4780], ['サブステ HP実数値 (固定2ロール)', s.hpFlat]], maxHp);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (草ダメ)', '%', elemBuff, EB);
      putSum(X, 'buff', 'ダメージバフ合計', '%', buff, BF);
      const f = what => `${what} × (1 + ${buff.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
      for (let i = 1; i <= 3; i++) H(X, null, `光幕 ${i}HIT目 (攻撃力×120.96% + 熟知×241.92%${w.emDmg ? ' + 熟知×' + Math.round(w.emDmg * 100) + '%' : ''})`, hit1 * K, f(`${Math.round(hit1)}`));
      H(X, null, '草激化の追加ダメージ (2回分)', spread * K, f(`激化 ${Math.round(spread)}`));
    }
    return { damage, em, atk, cr, cd, buff, elemBuff };
  }
});
})();
