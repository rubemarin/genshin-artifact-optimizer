// サンドローネ専用データ + ダメージ計算 (3CA E Q 3CA E 3CA E / 氷 / 星電導)  前提: 無凸(★5限定) / 天賦Lv10
// コンボ: 3CA → E → Q → 3CA → E → 3CA → E
//   3CA = 重撃掃射 ×11 (通常の氷ダメ 85.00%) + 重撃冷却ビーム ×3 (星電導扱い 161.50%)
//   E   = プリズム弾1発目 58.3% (通常の氷ダメ) + 2発目 38.9% (星電導扱い。演算負荷50超で ×4 = 特殊乗算4)
//   Q   = 砲撃 158.8% ×3 (通常の氷ダメ) + 光線 397.0% (星電導扱い。改良戦術10層を全消費して ×2.0 = 特殊乗算2)
//   星電導扱い = 反応係数1.8 × 攻撃力 × 天賦倍率 × 特殊乗算 × (1 + 基礎ダメージボーナス) × (1 + 6×熟知/(熟知+2000) + 星反応ダメ+%) × 会心 × 耐性0.9 (与ダメバフ・防御なし)
//   固有天賦: 淑女の礼儀作法 = 攻撃力100ごとに熟知+8 (最大160) / 星光の祝福 = 攻撃力100ごとに基礎ダメ+0.7% (最大14%)  ※どちらも小数第3位以降を切り捨て
//   武器のバフ(超越の鍵・千烈の日輪・鉄彩の花・タイダル・シャドー)は、すべて乗る前提 / 氷共鳴 会心率+15%
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
const WEAPONS4 = ['a_teaspoon_of_transcendence', 'a_thousand_blazing_suns', 'mailed_flower', 'tidal_shadow'];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'sandrone', name: 'サンドローネ', element: 'cryo', weaponType: '両手剣',
  rarity: 5, version: '6.7', release: '2026-07-01',
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 13225.58, atk: 342.03, def: 752.41, em: 0 },   // Lv90の基礎ステータス
  ascend: { cr: 19.2 },                                        // 突破ボーナス: 会心率
  // members = サンドローネ自身を除く味方 / resCr = 氷共鳴 / coef = 星電導の反応係数 / team = 味方から受けるバフ (パーティ2のみ)
  parties: [
    { key: 'conduct', members: ['cryo', 'electro', 'electro'], name: '星電導 (サンドローネ+氷1+雷2 / 氷共鳴 会心率+15%)', same: 1, diff: 2, resCr: 15, coef: 1.8,
      weaponKeys: WEAPONS4, setKeys: ['disenchantment_in_deep_shadow'], clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'conduct_team', members: [{ el: 'cryo', char: 'odette' }, { el: 'electro', char: 'yaemiko' }, 'any'],
      name: '星電導 (サンドローネ+オデット+八重神子1凸+アリョーシャ6凸 / 氷共鳴 会心率+15% / 味方のバフ込み)', same: 1, diff: 2, resCr: 15, coef: 1.8,
      team: { atkPct: 70, em: 100, star: 200, base: 14 },
      teamText: {
        atkPct: 'アリョーシャ6凸 (旧貴族込み): 攻撃力+25%×2 +20%',
        em: 'アリョーシャ6凸: 熟知+100',
        star: 'オデット (炉炎込み) 星+50% +15%×4 = 110% / 八重神子1凸 星+50% / アリョーシャ6凸 星電導+20%×2 = 40%',
        base: 'オデット: 星基礎ダメ+14%'
      },
      weaponKeys: WEAPONS4, setKeys: ['disenchantment_in_deep_shadow'], clocks: CLK, cups: CUP, circlets: CIR }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'em', label: '熟知' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / atkPct=攻撃力%(サブステ) / em=熟知(サブステ) / cr,cd=会心(サブステ) / atkBuff=攻撃力+%(効果) / emBuff=熟知+(効果) / cdBuff=会心ダメ+(効果) / star=星電導ダメ+%
  weapons: {
    a_teaspoon_of_transcendence: { name: '超越の鍵 (R1)',         atk: 674, atkPct: 0,    em: 0,   cr: 0,    cd: 44.1, atkBuff: 28, star: 48 },      // 攻撃力+28% / 重撃で3層: 星電導・星拡散ダメ+16%×3
    a_thousand_blazing_suns:     { name: '千烈の日輪 (R1)',       atk: 741, atkPct: 0,    em: 0,   cr: 11.0, cd: 0,    atkBuff: 28, cdBuff: 20 },     // 焚光: 会心ダメ+20% / 攻撃力+28%
    mailed_flower:               { name: '鉄彩の花 (R5)',         atk: 565, atkPct: 0,    em: 110, cr: 0,    cd: 0,    atkBuff: 24, emBuff: 96 },     // 攻撃力+24% / 熟知+96
    tidal_shadow:                { name: 'タイダル・シャドー (R5)', atk: 510, atkPct: 41.3, em: 0,   cr: 0,    cd: 0,    atkBuff: 48 }                  // 治療後 攻撃力+48% (乗る前提)
  },
  sets: [{ key: 'disenchantment_in_deep_shadow', name: '影に沈む幻 4' }],   // 2セット: 攻撃力+18% / 4セット: 星電導ダメ+40%・会心率+16%
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), T = pt.team || null;
    const n = k => (mains.c[k] || 0);
    const AP = X ? [] : null, EMp = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, SB = X ? [] : null, BB = X ? [] : null;
    // 攻撃力
    const atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力% (サブステ)', w.atkPct) + A(AP, '武器: 攻撃力+% (効果)', w.atkBuff || 0)
      + A(AP, '影に沈む幻 (2セット)', 18) + A(AP, '味方のバフ (アリョーシャ)', T ? T.atkPct : 0);
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat;
    // 熟知: 淑女の礼儀作法 = 攻撃力100ごとに +8 (最大160、小数第3位以降切り捨て)
    const lady = Math.min(160, Math.floor((atk / 100 * 8) * 100) / 100);
    const em = A(EMp, 'キャラ基礎熟知', this.base.em) + A(EMp, 'メインステ 熟知', 187 * n('em')) + A(EMp, 'サブステ 熟知 (固定2ロール+割り振り)', s.em) + A(EMp, '武器: 熟知 (サブステ)', w.em)
      + A(EMp, '武器: 熟知+ (効果)', w.emBuff || 0) + A(EMp, '固有天賦 淑女の礼儀作法 (攻撃力100ごとに+8、最大160)', lady) + A(EMp, '味方のバフ (アリョーシャ)', T ? T.em : 0);
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '突破 会心率', this.ascend.cr) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr)
      + A(CRp, '氷共鳴', pt.resCr || 0) + A(CRp, '影に沈む幻4 (星電導の影響下の敵)', 16);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ (サブステ)', w.cd) + A(CDp, '武器: 会心ダメ+ (効果)', w.cdBuff || 0) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // 星電導ダメ+% / 基礎ダメージボーナス (星光の祝福: 攻撃力100ごとに+0.7%、最大14%、小数第3位以降切り捨て)
    const starBonus = A(SB, '影に沈む幻4 (星電導ダメ+40%)', 40) + A(SB, '武器: 星電導ダメ+% (重撃で3層)', w.star || 0) + A(SB, '味方のバフ (オデット・八重神子・アリョーシャ)', T ? T.star : 0);
    const own = Math.min(14, Math.floor((atk / 100 * 0.7) * 100) / 100);
    const baseB = A(BB, '固有天賦 星光の祝福 (攻撃力100ごとに+0.7%、最大14%)', own) + A(BB, '味方のバフ (オデット: 星基礎ダメ+14%)', T ? T.base : 0);
    const emB = (6 * em) / (em + 2000);
    // ダメージ
    const KS = crit * 0.90;                                   // 星電導扱い: 会心 × 耐性 (防御・ダメバフなし)
    const KN = crit * 0.5 * 0.90;                             // 通常の氷ダメ: 会心 × 防御 × 耐性
    const starHit = (talent, sp) => pt.coef * atk * talent * sp * (1 + baseB / 100) * (1 + emB + starBonus / 100) * KS;
    const normHit = mult => atk * mult * KN;
    const ca = 11 * normHit(0.85) + 3 * starHit(1.615, 1);    // 3CA = 重撃掃射×11 + 重撃冷却ビーム×3
    const e = normHit(0.583) + starHit(0.389, 4);             // E = プリズム弾1発目 + 2発目(演算負荷50超で ×4)
    const q = 3 * normHit(1.588) + starHit(3.97, 2.0);        // Q = 砲撃×3 + 光線 (改良戦術10層で ×2.0)
    const total = ca * 3 + e * 3 + q;                         // 3CA E Q 3CA E 3CA E
    if (X) {
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atk);
      putSum(X, 'em', '元素熟知', '', em, EMp);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (氷ダメ)', '%', 0, [], '(杯が 攻撃%/熟知 のため、氷ダメの加算なし)');
      putSum(X, 'star', '星電導ダメ+%', '%', starBonus, SB, T ? '(味方: ' + pt.teamText.star + ')' : '');
      putSum(X, 'base', '基礎ダメージボーナス', '%', baseB, BB, '(1 + 基礎ダメ) = ' + (1 + baseB / 100).toFixed(4) + (T ? ' / 味方: ' + pt.teamText.base : ''));
      const sf = (talent, sp, name) => `${pt.coef} × ${Math.round(atk)} × ${(talent * 100).toFixed(2)}%${sp !== 1 ? ' × 特殊乗算 ' + sp + (name ? ' (' + name + ')' : '') : ''} × (1 + 基礎ダメ ${baseB}%) × (1 + 熟知 ${(emB * 100).toFixed(1)}% + 星電導 ${starBonus}%) × 会心 ${crit.toFixed(3)} × 耐性 0.9 (防御・ダメバフなし)`;
      const nf = mult => `${Math.round(atk)} × ${(mult * 100).toFixed(2)}% × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
      const seq = [['3CA 1回目', 'ca'], ['E 1回目', 'e'], ['Q', 'q'], ['3CA 2回目', 'ca'], ['E 2回目', 'e'], ['3CA 3回目', 'ca'], ['E 3回目', 'e']];
      for (const [g, kind] of seq) {
        if (kind === 'ca') {
          H(X, g, '重撃掃射 ×11 (攻撃力×85.00%)', 11 * normHit(0.85), nf(0.85) + '  (1発 = ' + Math.round(normHit(0.85)).toLocaleString() + ')');
          H(X, g, '重撃冷却ビーム ×3 (星電導扱い 161.50%)', 3 * starHit(1.615, 1), sf(1.615, 1) + '  (1発 = ' + Math.round(starHit(1.615, 1)).toLocaleString() + ')');
        } else if (kind === 'e') {
          H(X, g, 'プリズム弾 1発目 (58.3%)', normHit(0.583), nf(0.583));
          H(X, g, 'プリズム弾 2発目 (星電導扱い 38.9% × 4)', starHit(0.389, 4), sf(0.389, 4, '演算負荷50超で400%'));
        } else {
          H(X, g, '砲撃 ×3 (攻撃力×158.8%)', 3 * normHit(1.588), nf(1.588) + '  (1発 = ' + Math.round(normHit(1.588)).toLocaleString() + ')');
          H(X, g, '光線 (星電導扱い 397.0% × 2.0)', starHit(3.97, 2.0), sf(3.97, 2.0, '改良戦術10層を全消費'));
        }
      }
    }
    return { damage: Math.round(total), em, atk, cr, cd, buff: starBonus, elemBuff: 0 };
  }
});
})();
