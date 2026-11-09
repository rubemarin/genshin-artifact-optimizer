// ヴェスナ専用データ + ダメージ計算 (風 / 星拡散)  前提: 無凸(★5限定) / 天賦Lv10
// コンボ: E → N1C → sE-1 → N1C → sE-2 → Q → sE-3 → N1C → sE-3 → N1C → sE-3
//   固有天賦: sE か Q を発動するたびに倍率+10% (最大+60%)。Qは3回目で×1.3 だが、ダメージが入る前に sE を入力できるので ×1.4 とする
//     sE-1 ×1.1 / sE-2 ×1.2 / Q ×1.4 / sE-3 ×1.4 → ×1.5 → ×1.6
//   風ダメージ(通常): E 72% / N1C 79.9%+263%+18.7%×2 = 380.3% / sE-1 72%×1.1  → ダメバフ・防御・風耐性あり
//   星拡散扱い: sE-2 201.6% / Q 473.8% / sE-3 80.6%×4+282.2% = 604.6%
//     = { 反応係数1 × 攻撃力 × 天賦倍率 × 特殊乗算(固有天賦の倍率) × (1 + 基礎ダメ) × (1 + 6×熟知/(熟知+2000) + 星反応ダメ+%) + 実数加算 } × 会心 × 風耐性 (ダメバフ・防御なし。実数加算は hit数 × 値)
//   固有天賦2: 氷・風のキャラ(自身込み)1人につき攻撃力+6% / それ以外の元素のキャラ1人につき熟知+25
//   固有天賦3: 攻撃力100につき星拡散の基礎ダメ+0.7% (最大14%、小数第3位以降切り捨て)
//   武器の効果(層・条件つき)は、すべてコンボ全体に常時乗る前提
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
const WEAPONS5 = ['beyond_the_chrysalis', 'whitelake_frostfeather', 'new_bough', 'emberwell', 'heretics_molten_blade'];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'vesna', name: 'ヴェスナ', element: 'anemo', weaponType: '片手剣',
  rarity: 5, version: '7.1', release: '2026-09-23',
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 13262.32, atk: 353.98, def: 730.13, em: 0 },   // Lv90の基礎ステータス
  ascend: { cr: 19.2 },                                        // 突破ボーナス: 会心率
  // members = ヴェスナ自身を除く味方 / resCr = 氷共鳴 / cw = 氷・風のキャラの人数(自身込み) / other = それ以外の元素の人数 / res = 敵の風耐性(味方の耐性ダウン込み)
  parties: [
    { key: 'swirl', members: ['anemo', 'cryo', 'cryo'], name: '星拡散 (ヴェスナ+風1+氷2 / 風共鳴・氷共鳴 会心率+15%)', same: 1, diff: 2, resCr: 15, cw: 4, other: 0, res: 0.10,
      weaponKeys: WEAPONS5, setKeys: ['scarlet_proof'], clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'hc', members: [{ el: 'anemo', char: 'faruzan' }, { el: 'cryo', char: 'odette' }, { el: 'hydro', char: 'vodyanitsa' }],
      name: 'ヴェスナHC (ヴェスナ+ファルザン+オデット+ヴォジャニーツァ / 風共鳴 / 味方のバフ込み)', same: 1, diff: 2, resCr: 0, cw: 3, other: 1, res: 0.10 - 0.30 - 0.35,
      team: { atkPct: 62, star: 110, base: 14, flat: 6500, anemo: 38.3 },
      teamText: {
        atkPct: 'ヴォジャニーツァ: 千岩牢固 攻撃+20% / 旋流の讃美歌 攻撃+42%',
        star: 'オデット (炉炎装備): 星反応ダメ+50% + 春の華 15%×4',
        base: 'オデット: 星基礎ダメ+14%',
        flat: 'ヴォジャニーツァ: 元素スキル 星拡散ダメ+6500 (1hitごとに加算)',
        anemo: 'ファルザン(★4完凸): 元素爆発 風ダメ+38.3% (通常の風ダメにだけ乗る)',
        res: '敵の風耐性 10% - ファルザン30% - ヴォジャニーツァ35% = -55%'
      },
      weaponKeys: WEAPONS5, setKeys: ['scarlet_proof'], clocks: CLK, cups: CUP, circlets: CIR }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'em', label: '熟知' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / em,cr,cd=サブステ / atkBuff=攻撃力+%(効果) / emBuff=熟知+(効果) / cdBuff=会心ダメ+(効果) / starCd=星反応の会心ダメ+% / swirl=星拡散ダメ+% / star=星反応ダメ+%
  weapons: {
    beyond_the_chrysalis:  { name: '蝶の羽化 (R1)',           atk: 674, em: 0,   cr: 0,    cd: 44.1, cdBuff: 56, swirl: 36 },                      // 忠誠の風 会心ダメ+56% / 叛逆の風 星拡散ダメ+36%
    whitelake_frostfeather:{ name: '白銀の湖を舞う翼 (R1)',   atk: 674, em: 0,   cr: 22.1, cd: 0,    atkBuff: 24, starCd: 50 },                  // 3層: 攻撃力+24% / 星反応の会心ダメ+50%
    new_bough:             { name: '新たなる枝 (R5・輝映)',   atk: 510, em: 0,   cr: 0,    cd: 55.1, atkBuff: 36, emBuff: 120, star: 16 },         // 繁茂3層(輝映・星閃): 攻撃力+12%×3 / 熟知+40×3 / 星反応ダメ+16%
    emberwell:             { name: '導炎の源 (R5)',           atk: 510, em: 165, cr: 0,    cd: 0,    atkBuff: 32, star: 32 },                      // 攻撃力+32% / 星反応ダメ+32%
    heretics_molten_blade: { name: '異端を狩る熔刃 (R5)',     atk: 510, em: 0,   cr: 27.6, cd: 0,    atkBuff: 54 }                                  // 攻撃力+36%〜72% の平均 54%
  },
  sets: [{ key: 'scarlet_proof', name: '紅血の証 4' }],   // 2セット: 攻撃力+18% / 4セット: 星拡散後 会心率+16%・星拡散ダメ+40%
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), T = pt.team || null;
    const n = k => (mains.c[k] || 0);
    const AP = X ? [] : null, EMp = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, SB = X ? [] : null, BB = X ? [] : null, EB = X ? [] : null;
    // 攻撃力
    const atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力+% (効果)', w.atkBuff || 0)
      + A(AP, '紅血の証 (2セット)', 18) + A(AP, '固有天賦2: 氷・風のキャラ(自身込み)×6%', 6 * pt.cw) + A(AP, '味方のバフ (ヴォジャニーツァ)', T ? T.atkPct : 0);
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat;
    // 熟知
    const em = A(EMp, 'キャラ基礎熟知', this.base.em) + A(EMp, 'メインステ 熟知', 187 * n('em')) + A(EMp, 'サブステ 熟知 (固定2ロール+割り振り)', s.em) + A(EMp, '武器: 熟知 (サブステ)', w.em)
      + A(EMp, '武器: 熟知+ (効果)', w.emBuff || 0) + A(EMp, '固有天賦2: それ以外の元素のキャラ×25', 25 * pt.other);
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '突破 会心率', this.ascend.cr) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr)
      + A(CRp, '氷共鳴', pt.resCr || 0) + A(CRp, '紅血の証4 (星拡散後)', 16);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ (サブステ)', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const cdN = cd + (w.cdBuff || 0), cdS = cdN + (w.starCd || 0);       // 蝶の羽化(会心ダメ+56%): 全攻撃 / 白銀(星反応の会心ダメ+50%): 星拡散扱いのみ
    const critN = 1 + (cr / 100) * (cdN / 100), critS = 1 + (cr / 100) * (cdS / 100);
    // 星拡散ダメ+% / 基礎ダメージボーナス (固有天賦3: 攻撃力100ごとに+0.7%、最大14%、小数第3位以降切り捨て)
    const starBonus = A(SB, '紅血の証4 (星拡散ダメ+40%)', 40) + A(SB, '武器: 星反応ダメ+%', (w.star || 0) + (w.swirl || 0)) + A(SB, '味方のバフ (オデット)', T ? T.star : 0);
    const baseB = A(BB, '固有天賦3 (攻撃力100ごとに+0.7%、最大14%)', Math.min(14, Math.floor((atk / 100 * 0.7) * 100) / 100)) + A(BB, '味方のバフ (オデット: 星基礎ダメ+14%)', T ? T.base : 0);
    const emB = (6 * em) / (em + 2000);
    const anemoB = A(EB, '味方のバフ (ファルザン: 風ダメ+%)', T ? T.anemo : 0);   // 通常の風ダメにだけ乗る
    const resM = pt.res < 0 ? 1 - pt.res / 2 : 1 - pt.res;                         // 風耐性が0未満なら 1 - 耐性/2
    const flat = T ? T.flat : 0;
    // ダメージ: 風ダメージ(通常) / 星拡散扱い
    const normal = (mult, sp) => atk * mult * sp * (1 + anemoB / 100) * critN * 0.5 * resM;
    const star = (talent, sp, hits) => (atk * talent * sp * (1 + baseB / 100) * (1 + emB + starBonus / 100) + flat * hits) * critS * resM;
    // E → N1C → sE-1 → N1C → sE-2 → Q → sE-3 → N1C → sE-3 → N1C → sE-3 (固有天賦: sE・Q のたびに倍率+10%、Qは ×1.4 とみなす)
    const N1C = 3.803;   // 79.9% + 263% + 18.7%×2
    const steps = [
      ['E', 'n', 0.72, 1], ['N1C', 'n', N1C, 1], ['sE-1', 'n', 0.72, 1.1], ['N1C', 'n', N1C, 1],
      ['sE-2', 's', 2.016, 1.2, 1], ['Q', 's', 4.738, 1.4, 1], ['sE-3', 's', 6.046, 1.4, 5],
      ['N1C', 'n', N1C, 1], ['sE-3', 's', 6.046, 1.5, 5], ['N1C', 'n', N1C, 1], ['sE-3', 's', 6.046, 1.6, 5]
    ];
    let total = 0;
    for (const [, k, m, sp, h] of steps) total += k === 'n' ? normal(m, sp) : star(m, sp, h);
    if (X) {
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atk);
      putSum(X, 'em', '元素熟知', '', em, EMp);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp, `(全攻撃に 武器 +${w.cdBuff || 0}% → ${cdN.toFixed(1)}% / 星拡散扱いはさらに +${w.starCd || 0}% → ${cdS.toFixed(1)}%)`);
      putSum(X, 'elem', '元素バフ (風ダメ)', '%', anemoB, anemoB ? [['味方のバフ (ファルザン)', anemoB]] : [], '(杯が 攻撃%/熟知 のため、自身の風ダメ加算なし。通常の風ダメ E・N1C・sE-1 にだけ乗る)');
      putSum(X, 'star', '星拡散ダメ+%', '%', starBonus, SB, T ? '(味方: ' + pt.teamText.star + ')' : '');
      putSum(X, 'base', '基礎ダメージボーナス', '%', baseB, BB, '(1 + 基礎ダメ) = ' + (1 + baseB / 100).toFixed(4));
      putSum(X, 'res', '敵の風耐性', '%', pt.res * 100, [['敵の風耐性', 10]].concat(T ? [['ファルザン: 風耐性ダウン', -30], ['ヴォジャニーツァ: 風耐性ダウン', -35]] : []), `耐性補正 = ${resM.toFixed(4)} (耐性が0未満のとき 1 - 耐性/2)`);
      const nf = (m, sp) => `${Math.round(atk)} × ${(m * 100).toFixed(1)}%${sp !== 1 ? ' × 固有天賦 ' + sp : ''} × (1 + 風ダメ ${anemoB}%) × 会心 ${critN.toFixed(3)} × 防御 0.5 × 風耐性 ${resM.toFixed(3)}`;
      const sf = (m, sp, h) => `{ 1 × ${Math.round(atk)} × ${(m * 100).toFixed(1)}% × 固有天賦 ${sp} × (1 + 基礎ダメ ${baseB}%) × (1 + 熟知 ${(emB * 100).toFixed(1)}% + 星拡散 ${starBonus}%)${flat ? ' + 加算 ' + flat + '×' + h + 'hit' : ''} } × 会心 ${critS.toFixed(3)} × 風耐性 ${resM.toFixed(3)} (防御・ダメバフなし)`;
      steps.forEach(([nm, k, m, sp, h], i) => {
        const label = `${i + 1}. ${nm}` + (k === 's' ? ' (星拡散扱い)' : '');
        H(X, null, label + (nm === 'N1C' ? ' (79.9%+263%+18.7%×2)' : nm === 'sE-3' ? ' (80.6%×4+282.2%)' : ''), k === 'n' ? normal(m, sp) : star(m, sp, h), k === 'n' ? nf(m, sp) : sf(m, sp, h));
      });
    }
    return { damage: Math.round(total), em, atk, cr, cd, buff: starBonus, elemBuff: anemoB };
  }
});
})();
