// 八重神子専用データ + ダメージ計算 (殺生桜 壱〜参階 3HIT 416.34% / 激化・過負荷・星電導)  前提: 無凸 / 天賦Lv10
// 旧 yaemiko.html からの修正点: 味方の元素に応じて 金メッキの夢(熟知+50×異元素 / 攻撃+14%×同元素)と千夜(熟知+32×同元素 / 元素ダメ+10%×異元素)を変化
//                              過負荷は4人目が雷(overload_electro)か炎(overload_pyro)かで2パーティに分割
// メインステの stat 名: 'atk' = 攻撃力% (サブステの atk と同じ名前にして上限計算を合わせる)
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK_EM  = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP_EM  = [{ name: '雷バフ', stat: 'electro' }, { name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CLK_ATK = [{ name: '攻撃%', stat: 'atk' }];
const CUP_ATK = [{ name: '雷バフ', stat: 'electro' }, { name: '攻撃%', stat: 'atk' }];
const CIR     = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'yaemiko', name: '八重神子', element: 'electro', weaponType: '法器',
  rarity: 5, version: '2.5', release: '2022-02-16',
  engine: 4,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 10372.29, atk: 339.63, def: 568.73, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { cr: 19.2 },   // 突破ボーナス
  // パーティごとに 武器・セット・メインステの候補が変わる (common.js の avail が上書きする)
  // same=八重神子と同元素(雷)の味方の数 / diff=異元素の味方の数。resEm/resAtk/resCr=元素共鳴 / aggravate・star=反応モード
  parties: [
    { key: 'aggravate', members: ['electro', 'dendro', 'dendro'], name: '激化 (八重神子+雷1+草2 / 草共鳴 熟知+100 / 超激化1回)', same: 1, diff: 2, resEm: 100, aggravate: true,
      weaponKeys: ['kaguras_verity', 'a_thousand_floating_dreams', 'lost_prayer_to_the_sacred_winds', 'the_widsith'],
      setKeys: ['golden_troupe', 'gilded_dreams', 'em_2_2'], clocks: CLK_EM, cups: CUP_EM, circlets: CIR },
    { key: 'overload_electro', members: ['electro', 'pyro', 'pyro'], name: '過負荷 (八重神子+雷1+炎2 / 炎共鳴 攻撃+25%)', same: 1, diff: 2, resAtk: 25,
      weaponKeys: ['kaguras_verity', 'lost_prayer_to_the_sacred_winds', 'skyward_atlas', 'the_widsith'],
      setKeys: ['golden_troupe', 'gilded_dreams', 'atk_2_2'], clocks: CLK_ATK, cups: CUP_ATK, circlets: CIR },
    { key: 'overload_pyro', members: ['pyro', 'pyro', 'pyro'], name: '過負荷 (八重神子+炎3 / 炎共鳴 攻撃+25%)', same: 0, diff: 3, resAtk: 25,
      weaponKeys: ['kaguras_verity', 'lost_prayer_to_the_sacred_winds', 'skyward_atlas', 'the_widsith'],
      setKeys: ['golden_troupe', 'gilded_dreams', 'atk_2_2'], clocks: CLK_ATK, cups: CUP_ATK, circlets: CIR },
    { key: 'star_conduct', members: ['electro', 'cryo', 'cryo'], name: '星電導 (八重神子+雷1+氷2 / 氷共鳴 会心率+15% / 星電導200%追撃)', same: 1, diff: 2, resCr: 15, star: true,
      weaponKeys: ['kaguras_verity', 'echoes_of_the_heart', 'lost_prayer_to_the_sacred_winds', 'the_widsith'],
      setKeys: ['disenchantment_in_deep_shadow', 'heart_of_the_furnace', 'golden_troupe', 'gilded_dreams'], clocks: CLK_EM, cups: CUP_EM, circlets: CIR }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'em', label: '熟知' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / atkPct,em,cr,cd=サブステ / elem=元素ダメ+% / skillBuff=スキルダメ+% / star=星電導ダメ+(係数)
  weapons: {
    kaguras_verity:          { name: '神楽の真意 (R1)',   atk: 608, atkPct: 0,    em: 0,   cr: 0,    cd: 66.2, elem: 12, skillBuff: 36, star: 0.36 },
    echoes_of_the_heart:   { name: '胸中の谺 (R5)',     atk: 565, atkPct: 27.6, em: 120, cr: 0,    cd: 0,    elem: 0,  skillBuff: 0,  star: 0.32 },
    a_thousand_floating_dreams: { name: '千夜に浮かぶ夢 (R1)', atk: 542, atkPct: 0,    em: 265, cr: 0,    cd: 0,    elem: 0,  skillBuff: 0,  star: 0, sameEm: 32, diffElem: 10 },  // 同元素の味方×熟知+32 / 異元素の味方×元素ダメ+10% (各最大3層)
    lost_prayer_to_the_sacred_winds:     { name: '四風原典 (R1)',     atk: 608, atkPct: 0,    em: 0,   cr: 33.1, cd: 0,    elem: 0,  skillBuff: 0,  star: 0 },
    the_widsith:         { name: '流浪楽章 (R5)',     atk: 510, atkPct: 0,    em: 0,   cr: 0,    cd: 55.1, elem: 0,  skillBuff: 0,  star: 0 },
    skyward_atlas:   { name: '天空の巻 (R1)',     atk: 608, atkPct: 33.1, em: 0,   cr: 0,    cd: 0,    elem: 12, skillBuff: 0,  star: 0 }
  },
  sets: [
    { key: 'golden_troupe', name: '黄金の劇団 4' }, { key: 'gilded_dreams', name: '金メッキの夢 4' },
    { key: 'em_2_2', name: '熟知80 + 熟知80' }, { key: 'atk_2_2', name: '攻撃18% + 攻撃18%' },
    { key: 'disenchantment_in_deep_shadow', name: '影に沈む幻 4' }, { key: 'heart_of_the_furnace', name: '炉炎溶錬の心 4' }
  ],
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0), k = set.key;
    const E = X ? [] : null, AP = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null, BF = X ? [] : null;
    // 熟知
    let em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, '武器の熟知', w.em) + A(E, '千夜: 同元素の味方×32', (w.sameEm || 0) * Math.min(3, pt.same)) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em);
    if (k === 'gilded_dreams') em += A(E, '金メッキの夢 (2セット80 + 異元素の味方×50)', 80 + 50 * Math.min(3, pt.diff));
    if (k === 'em_2_2') em += A(E, '熟知80 + 熟知80 (2+2)', 160);
    em += A(E, '草共鳴', pt.resEm || 0);
    // 攻撃力
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力%', w.atkPct);
    if (k === 'gilded_dreams') atkPct += A(AP, '金メッキの夢4 (同元素の味方×14%)', 14 * Math.min(3, pt.same));
    if (k === 'disenchantment_in_deep_shadow') atkPct += A(AP, '影に沈む幻 (2セット)', 18);
    if (k === 'heart_of_the_furnace') atkPct += A(AP, '炉炎溶錬の心 (2セット18 + 4セット12)', 30);
    if (k === 'atk_2_2') atkPct += A(AP, '攻撃力18% + 攻撃力18% (2+2)', 36);
    atkPct += A(AP, '炎共鳴', pt.resAtk || 0);
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat;
    // 会心
    let cr = A(CRp, '初期値', 5) + A(CRp, '突破 会心率', this.ascend.cr) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr);
    cr += A(CRp, '氷共鳴', pt.resCr || 0);
    if (k === 'disenchantment_in_deep_shadow') cr += A(CRp, '影に沈む幻4 (星電導の影響下)', 16);
    const crRaw = cr; cr = Math.min(100, cr);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // バフ (元素バフ=キャラ画面の雷ダメ / スキル限定バフは分離)
    const elemBuff = A(EB, '杯 雷バフ', n('electro') ? 46.6 : 0) + A(EB, '武器: 全元素ダメ', w.elem) + A(EB, '千夜: 異元素の味方×10%', (w.diffElem || 0) * Math.min(3, pt.diff));
    const buff = A(BF, '元素バフ (上の内訳)', elemBuff) + A(BF, '固有天賦 (熟知×0.15%)', em * 0.15) + A(BF, '黄金の劇団4 (スキルダメ)', k === 'golden_troupe' ? 70 : 0) + A(BF, '武器: スキルダメ', w.skillBuff);
    // ダメージ (殺生桜 壱〜参階 = 109.21% + 136.51% + 170.64% = 416.36%)
    const aggr = pt.aggravate ? 1.15 * 1446.85 * (1 + (5 * em) / (em + 1200)) : 0;
    const normal = (atk * 4.1636 + aggr) * (1 + buff / 100) * crit * 0.5 * 0.90;
    let star = 0, starBuff = 0;
    if (pt.star) {
      starBuff = (k === 'disenchantment_in_deep_shadow' ? 0.40 : 0) + (k === 'heart_of_the_furnace' ? 0.50 : 0) + w.star;
      star = 1.8 * atk * 2.00 * (1 + (6 * em) / (em + 2000) + starBuff) * crit * 0.90;
    }
    if (X) {
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (雷ダメ)', '%', elemBuff, EB);
      putSum(X, 'buff', 'ダメージバフ合計 (スキル)', '%', buff, BF);
      const K = (1 + buff / 100) * crit * 0.5 * 0.90;
      const f = what => `${what} × (1 + ${buff.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
      H(X, null, '殺生桜 壱〜参階 (攻撃力×416.36%)', atk * 4.1636 * K, f(`${Math.round(atk)} × 416.36%`));
      if (aggr) H(X, null, '超激化の追加ダメージ (係数1.15)', aggr * K, f(`激化 ${Math.round(aggr)}`));
      if (pt.star) H(X, null, '星電導の追撃 (反応係数1.8 × 攻撃力 × 200%)', star, `1.8 × ${Math.round(atk)} × 200% × (1 + 熟知${(600 * em / (em + 2000)).toFixed(1)}% + 星電導${(starBuff * 100).toFixed(0)}%) × 会心 ${crit.toFixed(3)} × 耐性 0.9 (防御・ダメバフなし)`);
    }
    return { damage: Math.round(normal + star), em, atk, cr, cd, buff, elemBuff };
  }
});
})();
