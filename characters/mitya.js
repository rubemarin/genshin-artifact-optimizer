// ミティヤ専用データ + ダメージ計算 (雷 / 法器 / ★5 / 無凸 / 天賦Lv10 / Ver.7.2 2026-11-04)
// 反応: 超電導が星電導に変わる (星電導の反応係数 1.8)
// メインモード (パーティ1・2): E → sE(モード切替) → C → Q → C
//   雷ダメ(攻撃力・防御0.5・雷元素ダメ+%がかかる): E 攻撃163.3%×1 / 安定コア 攻撃129.6%×2 / C 攻撃302.4%×3 / Q 攻撃600.48% + 熟知1200.96% ×1
//   星電導ダメ: C[星] 熟知403.2% × 14hit (5+4+5)
// サブモード (パーティ3・4): Eの単押しのみ
//   雷ダメ: E 攻撃163.3%×1 / 安定コア 攻撃129.6%×12
//   星電導ダメ: 溢れたコア 熟知144%×9 / スキル再設置の爆破 熟知165.6%×4
// 星電導ダメージ = { 1.8 × 熟知 × 倍率 × (1 + 基礎ダメ%) × (1 + 6×熟知/(熟知+2000) + 星電導ダメ+%) + 実数加算 } × 会心(星電導の会心ダメ込み) × 耐性0.9
//   防御と元素ダメ・与ダメバフはかからない / 実数加算(バレリー6凸 +9500)は星電導の1撃ごとに足す
// 固有天賦: 熟知+30×4層=+120 (サブモードのみ。メインモードでは使えない) / 会心率+5%×4層=+20% (全パーティ) / 星電導の基礎ダメ+(熟知×0.028%) 上限14% (小数第3位以降切り捨て)
// 雪に沈む心 R5: 氷か雷のキャラ4人(全パーティで常に4人) → 熟知+160 / 星反応ダメ+48% (輝映・星閃の効果)
// 秘星の聖典 R1: 会心ダメ+24% / 熟知 48+24×3層=+120 / 星電導の会心ダメ+36%(12%×3層)
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK = [{ name: '熟知', stat: 'em' }];
const CUP = [{ name: '熟知', stat: 'em' }];
const CIR = [{ name: '熟知', stat: 'em' }, { name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
const W_MAIN = ['starsealed_edict', 'winters_heavy_heart', 'etherlight_spindlelute', 'sacrificial_fragments', 'dawning_frost', 'clash_of_kings'];
const W_SUB = ['starsealed_edict', 'winters_heavy_heart', 'etherlight_spindlelute', 'sacrificial_fragments', 'wandering_evenstar'];
const S_MAIN = ['disenchantment_in_deep_shadow', 'em_2_2'];
const S_SUB = ['disenchantment_in_deep_shadow', 'em_2_2', 'tenacity_of_the_millelith'];
// コンボ: [名前, 攻撃力倍率, 熟知倍率, 回数] (雷ダメ) / [名前, 熟知倍率, 回数] (星電導ダメ)
const COMBO = {
  main: { light: [['E', 1.633, 0, 1], ['安定コア', 1.296, 0, 2], ['C', 3.024, 0, 3], ['Q', 6.0048, 12.0096, 1]],
          star:  [['C[星] (5+4+5hit)', 4.032, 14]] },
  sub:  { light: [['E', 1.633, 0, 1], ['安定コア', 1.296, 0, 12]],
          star:  [['溢れたコア', 1.44, 9], ['スキル再設置の爆破', 1.656, 4]] }
};
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'mitya', name: 'ミティヤ', element: 'electro', weaponType: '法器',
  rarity: 5, version: '7.2', release: '2026-11-04',
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 11633.62, atk: 263.10, def: 791.61, em: 100.00 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                            // 突破ボーナス: 会心ダメージ
  // erRolls = そのパーティを選んだときに、チャージロール数の入力欄へ自動で入れる値 (メイン2 / サブ0)
  // members = ミティヤ自身を除く味方の元素 (char を指定するとキャラ画像) / team = 味方からのバフ (ラベル, 値)
  parties: [
    { key: 'main_ice', erRolls: 2, combo: 'main', members: ['electro', 'electro', 'cryo'], name: 'メイン (ミティヤ+雷2+氷1)',
      weaponKeys: W_MAIN, setKeys: S_MAIN, clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'main_team', erRolls: 2, combo: 'main', members: [{ el: 'cryo', char: 'odette' }, { el: 'electro', char: 'yaemiko' }, { el: 'electro', char: 'valeriy' }],
      name: 'メイン (ミティヤ+オデット+八重神子1凸+バレリー6凸)',
      team: {
        em: [['バレリー6凸 熟知', 100]],
        cr: [['バレリー6凸 雷キャラの会心率', 10]],
        starPct: [['オデット 炉炎 (星バフ)', 50], ['オデット 固有天賦 (星バフ 15%×4)', 60], ['八重神子1凸 (星バフ)', 50]],
        starCd: [['バレリー6凸 星電導の会心ダメ', 40]],
        base: [['オデット 固有天賦 (星基礎値)', 14]],
        elem: [['八重神子1凸 雷元素ダメ', 50]],
        flat: [['バレリー6凸 基礎加算バフ', 9500]]
      },
      weaponKeys: W_MAIN, setKeys: S_MAIN, clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'sub_ice', erRolls: 0, combo: 'sub', members: ['cryo', 'cryo', 'electro'], name: 'サブ (ミティヤ+氷2+雷1)',
      weaponKeys: W_SUB, setKeys: S_SUB, clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'sub_team', erRolls: 0, combo: 'sub', members: [{ el: 'cryo', char: 'sandrone' }, { el: 'cryo', char: 'odette' }, { el: 'electro', char: 'alyosha' }],
      name: 'サブ (ミティヤ+サンドローネ+オデット+アリョーシャ)',
      team: {
        starPct: [['オデット 炉炎 (星バフ)', 50], ['オデット 固有天賦 (星バフ 15%×4)', 60]],
        base: [['オデット 固有天賦 (星基礎値)', 14], ['サンドローネ (星基礎値)', 14]]
      },
      weaponKeys: W_SUB, setKeys: S_SUB, clocks: CLK, cups: CUP, circlets: CIR }
  ],
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],
  subStats: ['em', 'cr', 'cd'], subLabels: ['熟', '率', '傷'],
  // atk=基礎攻撃力 / atkPct=攻撃力% / em=熟知 / cr,cd=会心 / er=チャージ / starPct=星反応ダメ+% / starCd=星電導の会心ダメ / emAtk=熟知×この値が攻撃力に加算
  weapons: {
    starsealed_edict:       { name: '秘星の聖典 (R1)',        atk: 542, atkPct: 0,  em: 120, cr: 0,    cd: 112.2, er: 0,    starCd: 36 },   // 会心ダメ 88.2+24 / 熟知 48+24×3層 / 星電導の会心ダメ 12%×3層
    winters_heavy_heart:    { name: '雪に沈む心 (R5)',        atk: 510, atkPct: 0,  em: 160, cr: 0,    cd: 55.1,  er: 0,    starPct: 48 },  // 輝映・星閃: 氷/雷4人 × (熟知+40 / 星反応ダメ+12%)
    etherlight_spindlelute: { name: '天光のリュート (R5)',    atk: 510, atkPct: 0,  em: 200, cr: 0,    cd: 0,     er: 45.9 },               // スキル後 熟知+200 (常時)
    sacrificial_fragments:  { name: '祭礼の断片 (R5)',        atk: 454, atkPct: 0,  em: 221, cr: 0,    cd: 0,     er: 0 },
    dawning_frost:          { name: '霜辰 (R5)',              atk: 510, atkPct: 0,  em: 240, cr: 0,    cd: 55.1,  er: 0 },                // 重撃命中 +144 / スキル命中 +96 (どちらも常時)
    clash_of_kings:         { name: '諸王の対局 (R5)',        atk: 510, atkPct: 40, em: 200, cr: 27.6, cd: 0,     er: 0 },                // 盤上の規則 (常時)
    wandering_evenstar:     { name: '彷徨える星 (R5)',        atk: 510, atkPct: 0,  em: 165, cr: 0,    cd: 0,     er: 0, emAtk: 0.48 }  // 熟知の48%を攻撃力に加算 (自身のみ・常時)
  },
  sets: [
    { key: 'disenchantment_in_deep_shadow', name: '影に沈む幻 4' },        // 攻撃力+18% / 星電導ダメ+40% / 会心率+16%(常時)
    { key: 'em_2_2', name: '熟知 2+2' },                                    // 熟知+80 + 80
    { key: 'tenacity_of_the_millelith', name: '千岩牢固 4' }                 // サブのみ: 攻撃力+20% (常時) ※HPは使わない
  ],
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), T = pt.team || {};
    const n = k => (mains.c[k] || 0), k = set.key, dds = k === 'disenchantment_in_deep_shadow';
    const E = X ? [] : null, AP = X ? [] : null, AF = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null,
          SP = X ? [] : null, SC = X ? [] : null, BB = X ? [] : null, FL = X ? [] : null;
    const tl = (arr, a) => arr ? arr.reduce((t, p) => t + A(a, p[0], p[1]), 0) : 0;   // team のバフを足して、内訳にも記録
    // 熟知
    const em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, '武器の熟知', w.em) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em)
      + (pt.combo === 'sub' ? A(E, '固有天賦 基準耐圧テスト (30×4層・サブモードのみ)', 120) : 0) + (k === 'em_2_2' ? A(E, '熟知2セット×2 (80+80)', 160) : 0) + tl(T.em, E);
    // 攻撃力
    const atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, '武器: 攻撃力%', w.atkPct)
      + (dds ? A(AP, '影に沈む幻 2セット 攻撃力+18%', 18) : 0) + (k === 'tenacity_of_the_millelith' ? A(AP, '千岩牢固4 攻撃力+20%', 20) : 0);
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + A(AF, '武器: 熟知の48%', em * (w.emAtk || 0));
    // 会心
    let cr = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr)
      + A(CRp, '固有天賦 臨界爆発性試薬 (5%×4層)', 20) + (dds ? A(CRp, '影に沈む幻4 (星電導の影響下の敵)', 16) : 0) + tl(T.cr, CRp);
    const crRaw = cr; cr = Math.min(100, cr);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const scd = cd + A(SC, '武器: 星電導の会心ダメ', w.starCd || 0) + tl(T.starCd, SC);   // 星電導ダメージの会心ダメ
    const critL = 1 + (cr / 100) * (cd / 100), critS = 1 + (cr / 100) * (scd / 100);
    // 雷元素ダメ+% (雷ダメの攻撃にだけ乗る)
    const elem = tl(T.elem, EB);
    // 星電導: 基礎ダメ+% (ミティヤ固有天賦 熟知×0.028% 上限14%・小数第3位以降切り捨て + 味方) / 星電導ダメ+% / 実数加算
    const baseMit = Math.min(14, Math.floor(em * 2.8 + 1e-9) / 100);
    const base = A(BB, 'ミティヤ 固有天賦 (熟知×0.028%・上限14%)', baseMit) + tl(T.base, BB);
    const starPct = A(SP, '武器: 星反応ダメ+%', w.starPct || 0) + (dds ? A(SP, '影に沈む幻4 星電導ダメ+40%', 40) : 0) + tl(T.starPct, SP);
    const flat = tl(T.flat, FL);
    const emB = (6 * em) / (em + 2000);
    const er = 100 + s.er + (w.er || 0);
    // ダメージ (雷ダメ: 防御0.5・耐性0.9・雷元素ダメ / 星電導: 防御・元素ダメなし・耐性0.9)
    const kL = (1 + elem / 100) * critL * 0.5 * 0.90;
    const starOne = mult => (1.8 * em * mult * (1 + base / 100) * (1 + emB + starPct / 100) + flat) * critS * 0.90;
    const cb = COMBO[pt.combo];
    let total = 0;
    for (const [, am, em2, cnt] of cb.light) total += (atk * am + em * em2) * kL * cnt;
    for (const [, mult, cnt] of cb.star) total += starOne(mult) * cnt;
    const damage = Math.round(total);
    if (X) {
      const g = pt.combo === 'main' ? 'メインモード' : 'サブモード';
      const r0 = Math.round(atk), pc = v => (v * 100).toFixed(2) + '%';
      for (const [nm, am, em2, cnt] of cb.light) {
        const one = (atk * am + em * em2) * kL;
        H(X, g + ' (雷ダメ)', `${nm} ×${cnt}`, one * cnt,
          `${r0} × ${pc(am)}${em2 ? ' + 熟知 ' + Math.round(em) + ' × ' + pc(em2) : ''} × (1 + 雷元素ダメ ${elem.toFixed(1)}%) × 会心 ${critL.toFixed(3)} × 防御 0.5 × 耐性 0.9 ×${cnt}回`);
      }
      for (const [nm, mult, cnt] of cb.star) {
        H(X, g + ' (星電導ダメ)', `${nm} ×${cnt}`, starOne(mult) * cnt,
          `{1.8 × 熟知 ${Math.round(em)} × ${pc(mult)} × (1 + 基礎ダメ ${base.toFixed(2)}%) × (1 + 熟知 ${(emB * 100).toFixed(1)}% + 星電導 ${starPct}%)${flat ? ' + 実数加算 ' + flat : ''}} × 会心 ${critS.toFixed(3)} × 耐性 0.9 (防御・ダメバフなし) ×${cnt}回`);
      }
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(AF), atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp, '(雷ダメ用)');
      putSum(X, 'scd', '星電導の会心ダメージ', '%', scd, [['会心ダメージ (雷ダメ用と同じ)', cd]].concat(SC), '(星電導ダメージ用)');
      putSum(X, 'elem', '元素バフ (雷ダメ)', '%', elem, EB, '(雷ダメの攻撃 E・安定コア・C・Q にだけ乗る)');
      putSum(X, 'base', '星電導 基礎ダメ+%', '%', base, BB, `(ミティヤ分は 熟知 ${Math.round(em)} × 0.028% = ${(em * 0.028).toFixed(3)}% → 上限14%・小数第3位以降切り捨て)`);
      putSum(X, 'star', '星電導ダメ+%', '%', starPct, SP, '(星電導ダメージにだけ乗る。熟知による 6×熟知/(熟知+2000) は別に加算)');
      if (T.flat) putSum(X, 'flat', '実数加算', '', flat, FL, '(星電導の1撃ごとに足す)');
      putSum(X, 'er', 'チャージ効率', '%', er, [['初期値', 100], ['武器のチャージ', w.er || 0], ['サブステ チャージ (固定2ロール + チャージロール)', s.er]].filter(l => l[1]));
    }
    return { damage, em, atk, cr, cd, buff: elem, elemBuff: elem, er };
  }
});
})();
