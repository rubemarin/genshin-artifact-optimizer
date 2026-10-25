// 八重神子専用データ + ダメージ計算 (殺生桜 壱〜参階 3HIT 416.34% / 激化・過負荷・星電導)  前提: 無凸 / 天賦Lv10
// 旧 yaemiko.html からの修正点: 味方の元素に応じて 金メッキの夢(熟知+50×異元素 / 攻撃+14%×同元素)と千夜(熟知+32×同元素 / 元素ダメ+10%×異元素)を変化
//                              過負荷は4人目が雷(overload_electro)か炎(overload_pyro)かで2パーティに分割
// メインステの stat 名: 'atk' = 攻撃力% (サブステの atk と同じ名前にして上限計算を合わせる)
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const CLK_EM  = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP_EM  = [{ name: '雷バフ', stat: 'electro' }, { name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CLK_ATK = [{ name: '攻撃%', stat: 'atk' }];
const CUP_ATK = [{ name: '雷バフ', stat: 'electro' }, { name: '攻撃%', stat: 'atk' }];
const CIR     = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'yaemiko', name: '八重神子', element: 'electro', weaponType: '法器',
  rarity: 5, version: '2.5', release: '2022-02-16',
  engine: 2,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 10372.29, atk: 339.63, def: 568.73, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { cr: 19.2 },   // 突破ボーナス
  // パーティごとに 武器・セット・メインステの候補が変わる (common.js の avail が上書きする)
  // same=八重神子と同元素(雷)の味方の数 / diff=異元素の味方の数。resEm/resAtk/resCr=元素共鳴 / aggravate・star=反応モード
  parties: [
    { key: 'aggravate', name: '激化 (八重神子+雷1+草2 / 草共鳴 熟知+100 / 超激化1回)', same: 1, diff: 2, resEm: 100, aggravate: true,
      weaponKeys: ['kaguras_verity', 'a_thousand_floating_dreams', 'lost_prayer_to_the_sacred_winds', 'the_widsith'],
      setKeys: ['golden_troupe', 'gilded_dreams', 'em_2_2'], clocks: CLK_EM, cups: CUP_EM, circlets: CIR },
    { key: 'overload_electro', name: '過負荷 (八重神子+雷1+炎2 / 炎共鳴 攻撃+25%)', same: 1, diff: 2, resAtk: 25,
      weaponKeys: ['kaguras_verity', 'lost_prayer_to_the_sacred_winds', 'skyward_atlas', 'the_widsith'],
      setKeys: ['golden_troupe', 'gilded_dreams', 'atk_2_2'], clocks: CLK_ATK, cups: CUP_ATK, circlets: CIR },
    { key: 'overload_pyro', name: '過負荷 (八重神子+炎3 / 炎共鳴 攻撃+25%)', same: 0, diff: 3, resAtk: 25,
      weaponKeys: ['kaguras_verity', 'lost_prayer_to_the_sacred_winds', 'skyward_atlas', 'the_widsith'],
      setKeys: ['golden_troupe', 'gilded_dreams', 'atk_2_2'], clocks: CLK_ATK, cups: CUP_ATK, circlets: CIR },
    { key: 'star_conduct', name: '星電導 (八重神子+雷1+氷2 / 氷共鳴 会心率+15% / 星電導200%追撃)', same: 1, diff: 2, resCr: 15, star: true,
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
  calc({ weapon: w, set, mains, party, s }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0), k = set.key;
    // 熟知
    let em = this.base.em + 187 * n('em') + w.em + (w.sameEm || 0) * Math.min(3, pt.same) + s.em;
    if (k === 'gilded_dreams') em += 80 + 50 * Math.min(3, pt.diff);   // 2セット80 + 4セット(異元素の味方×50)
    if (k === 'em_2_2') em += 160;
    em += pt.resEm || 0;                                        // 草共鳴
    // 攻撃力
    let atkPct = s.atkPct + 46.6 * n('atk') + w.atkPct;
    if (k === 'gilded_dreams') atkPct += 14 * Math.min(3, pt.same);   // 同元素の味方×14%
    if (k === 'disenchantment_in_deep_shadow') atkPct += 18;
    if (k === 'heart_of_the_furnace') atkPct += 30;
    if (k === 'atk_2_2') atkPct += 36;
    atkPct += pt.resAtk || 0;                                   // 炎共鳴
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat;
    // 会心
    let cr = 5 + this.ascend.cr + w.cr + 31.1 * n('cr') + s.cr;
    cr += pt.resCr || 0;                                        // 氷共鳴
    if (k === 'disenchantment_in_deep_shadow') cr += 16;
    cr = Math.min(100, cr);
    const cd = 50 + w.cd + 62.2 * n('cd') + s.cd;
    const crit = 1 + (cr / 100) * (cd / 100);
    // バフ (元素バフ=キャラ画面の雷ダメ / スキル限定バフは分離)
    const elemBuff = (n('electro') ? 46.6 : 0) + w.elem + (w.diffElem || 0) * Math.min(3, pt.diff);
    const buff = elemBuff + em * 0.15 + (k === 'golden_troupe' ? 70 : 0) + w.skillBuff;
    // ダメージ (殺生桜 壱〜参階 = 109.21% + 136.51% + 170.64% = 416.36%)
    const aggr = pt.aggravate ? 1.15 * 1446.85 * (1 + (5 * em) / (em + 1200)) : 0;
    const normal = (atk * 4.1636 + aggr) * (1 + buff / 100) * crit * 0.5 * 0.90;
    let star = 0;
    if (pt.star) {
      const starBuff = (k === 'disenchantment_in_deep_shadow' ? 0.40 : 0) + (k === 'heart_of_the_furnace' ? 0.50 : 0) + w.star;
      star = 1.8 * atk * 2.00 * (1 + (6 * em) / (em + 2000) + starBuff) * crit * 0.90;
    }
    return { damage: Math.round(normal + star), em, atk, cr, cd, buff, elemBuff };
  }
});
})();
