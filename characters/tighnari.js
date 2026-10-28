// ティナリ専用データ + ダメージ計算 (重撃: 花筐の矢 + 蔓纏の矢4発 / 草激化)  前提: 2凸 / 天賦Lv10 (恒常キャラは2凸、限定キャラは無凸の方針)
// パーティ: ティナリ+草1+雷2 (草共鳴 熟知+100)
// 旧 tighnari.html からの修正点: 1凸の重撃会心率+15%を追加 / 2凸の草ダメ+20%は旧ページから継続
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'tighnari', name: 'ティナリ', element: 'dendro', weaponType: '弓',
  rarity: 5, version: '3.0', release: '2022-08-24',
  engine: 4,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 10849.88, atk: 267.88, def: 630.21, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { dendroDmg: 28.8 },   // 突破ボーナス
  passive: { em: 50, heavyCr: 15, dendroDmg: 20 },   // 固有天賦の熟知+50 / 1凸 重撃会心率+15% / 2凸 草ダメ+20%
  // same=同元素(草)の味方数 / diff=異元素の味方数 / resEm=草共鳴の熟知
  parties: [{ key: 'aggravate', members: ['dendro', 'electro', 'electro'], name: '激化 (ティナリ+草1+雷2 / 草共鳴 熟知+100 / 2凸)', same: 1, diff: 2, resEm: 100 }],
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  weapons: {
    hunters_path:   { name: '狩人の道 (R1)', atk: 542, cr: 44.1, cd: 0,    buff: 0,  elem: 12, emFlat: 1.60 },
    aqua_simulacra: { name: '若水 (R1)',     atk: 542, cr: 0,    cd: 88.2, buff: 20, emFlat: 0 },
    slingshot:      { name: '弾弓 (R5)',     atk: 354, cr: 31.2, cd: 0,    buff: 60, emFlat: 0 },
    // 千鈞懸黎 (R5): 味方1人ごとに 同元素→熟知+128 / 異元素→攻撃力+24%。合計3層まで、同元素が優先 (R1は熟知64 / 攻撃力12%)
    jade_vista:      { name: '千鈞懸黎 (R5)', atk: 510, cr: 27.6, cd: 0,    buff: 0,  emFlat: 0, sameEm: 128, diffAtk: 24 }
  },
  sets: [
    { key: 'wanderers_troupe', name: '大地を流浪する楽団 4' }, { key: 'gilded_dreams', name: '金メッキの夢 4' },
    { key: 'em_2_2', name: '熟知80 + 熟知80' }
  ],
  clocks:   [{ name: '熟知', stat: 'em' }],
  cups:     [{ name: '草バフ', stat: 'dendro' }, { name: '熟知', stat: 'em' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],   // 既存ページの表示対象に合わせて2種
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);
    const sameN = Math.min(3, pt.same), diffN = Math.min(3 - sameN, pt.diff);   // 同元素優先で合計3層
    const n = k => (mains.c[k] || 0);
    const E = X ? [] : null, AP = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null, BF = X ? [] : null;
    let em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, '固有天賦 (熟知+50)', this.passive.em) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em) + A(E, '武器: 同元素の味方×128', (w.sameEm || 0) * sameN);
    if (set.key === 'wanderers_troupe') em += A(E, '大地を流浪する楽団 (2セット)', 80);
    if (set.key === 'gilded_dreams') em += A(E, '金メッキの夢 (2セット80 + 異元素の味方×50)', 80 + 50 * Math.min(3, pt.diff));
    if (set.key === 'em_2_2') em += A(E, '熟知80 + 熟知80 (2+2)', 160);
    em += A(E, '草共鳴', pt.resEm || 0);
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, '武器: 異元素の味方×24%', (w.diffAtk || 0) * diffN);
    if (set.key === 'gilded_dreams') atkPct += A(AP, '金メッキの夢4 (同元素の味方×14%)', 14 * Math.min(3, pt.same));
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat;
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '1凸 重撃の会心率', this.passive.heavyCr) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', n('cr') * 31.1) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr);
    const cr = Math.min(100, crRaw);   // 1凸: 重撃の会心率+15%
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', n('cd') * 62.2) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const elemBuff = A(EB, '突破 草ダメ', this.ascend.dendroDmg) + A(EB, '2凸 草ダメ', this.passive.dendroDmg) + A(EB, '杯 草バフ', n('dendro') ? 46.6 : 0) + A(EB, '武器: 全元素ダメ', w.elem || 0);
    const buff = A(BF, '元素バフ (上の内訳)', elemBuff) + A(BF, '固有天賦 (熟知×0.06%, 上限60%)', Math.min(60, em * 0.06)) + A(BF, '武器: ダメージ+', w.buff) + A(BF, '大地を流浪する楽団4 (重撃)', set.key === 'wanderers_troupe' ? 35 : 0);
    const hunter = em * w.emFlat;
    const spread = 1446.85 * 1.25 * (1 + (5 * em) / (em + 1200));
    const sum = (atk * 1.5696 + hunter + spread) + (atk * 0.6948 * 4 + hunter * 4 + spread);
    const damage = Math.round(sum * (1 + buff / 100) * (1 + (cr / 100) * (cd / 100)) * 0.5 * 0.90);
    if (X) {
      const crit = 1 + (cr / 100) * (cd / 100), K = (1 + buff / 100) * crit * 0.5 * 0.90;
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atk);
      putSum(X, 'cr', '会心率 (重撃)', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (草ダメ)', '%', elemBuff, EB);
      putSum(X, 'buff', 'ダメージバフ合計', '%', buff, BF);
      const f = what => `${what} × (1 + ${buff.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
      H(X, null, '花筐の矢 (攻撃力×156.96% + 熟知×' + (w.emFlat * 100) + '%)', (atk * 1.5696 + hunter) * K, f(`${Math.round(atk * 1.5696 + hunter)}`));
      H(X, null, '花筐の矢の草激化', spread * K, f(`激化 ${Math.round(spread)}`));
      for (let i = 1; i <= 4; i++) H(X, null, `蔓纏の矢 ${i}本目 (攻撃力×69.48%)`, (atk * 0.6948 + hunter) * K, f(`${Math.round(atk * 0.6948 + hunter)}`));
      H(X, null, '蔓纏の矢の草激化', spread * K, f(`激化 ${Math.round(spread)}`));
    }
    return { damage, em, atk, cr, cd, buff, elemBuff };
  }
});
})();
