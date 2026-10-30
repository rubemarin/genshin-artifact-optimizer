// オデット専用データ + ダメージ計算 (E + sE(払暁のコーダ) / 氷)  前提: 無凸(★5限定) / 天賦Lv10
// コンボ: E(攻撃力194.54%)  +  sE(通常の氷ダメ 攻撃力172.51% + 星反応扱い: 星電導 550.37% / 星拡散 825.55%)
//   星反応扱い = 反応係数 × 攻撃力 × 天賦倍率 × 特殊乗算 × (1 + 基礎ダメージボーナス) × (1 + 6×熟知/(熟知+2000) + 星反応ダメ+%) × 会心 × 耐性0.9  (与ダメバフ・防御なし)
//     反応係数: 星電導 1.8 / 星拡散 1 (そのぶん天賦倍率が高い)
//     特殊乗算 = 1 + 悲しき歌 (攻撃力の1000超過分 100あたり+1.5%、最大30%)   基礎ダメージボーナス = 銀暁の舞 (攻撃力100あたり+0.7%、最大14%)  ※どちらも小数第3位以降を切り捨て
//     星反応ダメ+% = 春の華 4層×15% = 60% + 武器 + 炉炎溶錬の心4の50%
//   層のある武器・セット効果(白銀・新たなる枝・銀灯・炉炎溶錬の心4の+12%)は sE にだけ乗せる (E には層がたまっていない前提)
//   氷共鳴(氷2人) 会心率+15%
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
const WEAPONS5 = ['whitelake_frostfeather', 'beyond_the_chrysalis', 'new_bough', 'silver_light', 'exaiphanes_blade'];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'odette', name: 'オデット', element: 'cryo', weaponType: '片手剣',
  rarity: 5, version: '7.0', release: '2026-08-12',
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 12980.67, atk: 334.85, def: 787.00, em: 0 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                        // 突破ボーナス: 会心ダメージ
  // members = オデット自身を除く味方の元素 / resCr = 氷共鳴 / coef = 星反応の反応係数 / talent = sEの星反応扱い部分の天賦倍率
  parties: [
    { key: 'stellar_conduct', members: ['cryo', 'electro', 'electro'], name: '星電導 (オデット+氷1+雷2 / 氷共鳴 会心率+15% / 反応係数1.8)', same: 1, diff: 2, resCr: 15, coef: 1.8, talent: 5.5037,
      weaponKeys: WEAPONS5, setKeys: ['heart_of_the_furnace'], clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'stellar_swirl', members: ['cryo', 'anemo', 'anemo'], name: '星拡散 (オデット+氷1+風2 / 氷共鳴 会心率+15% / 反応係数1)', same: 1, diff: 2, resCr: 15, coef: 1, talent: 8.2555, swirl: true,
      weaponKeys: WEAPONS5, setKeys: ['heart_of_the_furnace'], clocks: CLK, cups: CUP, circlets: CIR }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'em', label: '熟知' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / cr,cd=サブステ / atkPct=攻撃力%(サブステ) / atkPctS,emS=sEだけに乗る層の効果 / cdBoth=E・sE の会心ダメ+% / starCd=星反応の会心ダメ+% / swirl=星拡散ダメ+% / star=星反応ダメ+%
  weapons: {
    whitelake_frostfeather: { name: '白銀の湖を舞う翼 (R1)',   atk: 674, atkPct: 0,    em: 0, cr: 22.1, cd: 0,    atkPctS: 24, starCd: 50 },     // 湖色の哀しみ3層: 攻撃力+24% / 星反応の会心ダメ+50%
    beyond_the_chrysalis:   { name: '蝶の羽化 (R1)',           atk: 674, atkPct: 0,    em: 0, cr: 0,    cd: 44.1, cdBoth: 56, swirl: 36 },       // 忠誠の風: 会心ダメ+56% / 叛逆の風: 星拡散ダメ+36% (星拡散のみ)
    new_bough:              { name: '新たなる枝 (R5・輝映)',   atk: 510, atkPct: 0,    em: 0, cr: 0,    cd: 55.1, atkPctS: 36, emS: 120, star: 16 }, // 繁茂3層(輝映・星閃): 攻撃力+12%×3 / 熟知+40×3 / 星反応ダメ+16%
    silver_light:           { name: '銀灯 (R5)',               atk: 510, atkPct: 41.3, em: 0, cr: 0,    cd: 0,    emS: 208 },                     // 熟知+104×2層 (sEのみ)
    exaiphanes_blade:       { name: '星鋒の剣 (R5)',           atk: 608, atkPct: 0,    em: 0, cr: 33.1, cd: 0 }                                    // 効果なし (会心率サブステのみ)
  },
  sets: [{ key: 'heart_of_the_furnace', name: '炉炎溶錬の心 4' }],   // 2セット: 攻撃力+18% / 4セット: 星反応後 攻撃力+12%・星反応ダメ+50%
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0);
    const AP = X ? [] : null, APS = X ? [] : null, EM = X ? [] : null, EMS = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, SB = X ? [] : null;
    // 攻撃力 (E: 層なし / sE: 層の効果あり)
    const pctCommon = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力% (サブステ)', w.atkPct) + A(AP, '炉炎溶錬の心 (2セット)', 18);
    const pctS = pctCommon + A(APS, '武器: 層の効果 (sEのみ)', w.atkPctS || 0) + A(APS, '炉炎溶錬の心4 (星反応後 攻撃力+12%)', 12);
    const flat = 311 + s.atkFlat;
    const atkE = (this.base.atk + w.atk) * (1 + pctCommon / 100) + flat;
    const atkS = (this.base.atk + w.atk) * (1 + pctS / 100) + flat;
    // 熟知
    const emE = A(EM, 'キャラ基礎熟知', this.base.em) + A(EM, 'メインステ 熟知', 187 * n('em')) + A(EM, 'サブステ 熟知 (固定2ロール+割り振り)', s.em);
    const emS = emE + A(EMS, '武器: 層の効果 (sEのみ)', w.emS || 0);
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr) + A(CRp, '氷共鳴', pt.resCr || 0);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const cdBoth = cd + (w.cdBoth || 0);                                  // 蝶の羽化 忠誠の風 (E・sE)
    const critE = 1 + (cr / 100) * (cdBoth / 100);                        // E と sE の氷ダメ部分
    const critStar = 1 + (cr / 100) * ((cdBoth + (w.starCd || 0)) / 100); // 星反応扱い部分 (白銀の星反応会心ダメ+50%を含む)
    // 悲しき歌 (特殊乗算) / 銀暁の舞 (基礎ダメージボーナス): どちらも小数第3位以降を切り捨て
    const extra = atkS > 1000 ? Math.min(30, Math.floor(((atkS - 1000) / 100 * 1.5) * 100) / 100) : 0;
    const baseB = Math.min(14, Math.floor((atkS / 100 * 0.7) * 100) / 100);
    // 星反応ダメ+%
    const starBonus = A(SB, '選ばれし者の祝祭 春の華 (4層×15%)', 60) + A(SB, '武器: 星反応ダメ+% (叛逆の風は星拡散のみ)', (w.star || 0) + (pt.swirl ? (w.swirl || 0) : 0)) + A(SB, '炉炎溶錬の心4 (星反応ダメ+50%)', 50);
    const emB = (6 * emS) / (emS + 2000);
    const star = pt.coef * atkS * pt.talent * (1 + extra / 100) * (1 + baseB / 100) * (1 + emB + starBonus / 100) * critStar * 0.90;   // 防御・ダメバフなし
    const eHit = atkE * 1.9454 * critE * 0.5 * 0.90;     // E (氷ダメージ。杯が氷バフではないので氷ダメ加算なし)
    const sHit = atkS * 1.7251 * critE * 0.5 * 0.90;     // sE の通常の氷ダメージ部分
    if (X) {
      putMul(X, 'atk', '攻撃力 (sE)', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP.concat(APS), [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atkS);
      putMul(X, 'atkE', '攻撃力 (E: 層の効果なし)', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atkE);
      putSum(X, 'em', '元素熟知 (sE)', '', emS, EM.concat(EMS));
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp, `(E・sE は 武器の追加 +${w.cdBoth || 0}% → ${cdBoth.toFixed(1)}% / 星反応扱い部分はさらに +${w.starCd || 0}% → ${(cdBoth + (w.starCd || 0)).toFixed(1)}%)`);
      putSum(X, 'elem', '元素バフ (氷ダメ)', '%', 0, [], '(杯が 攻撃%/熟知 のため、氷ダメの加算なし)');
      putSum(X, 'star', '星反応ダメ+%', '%', starBonus, SB);
      putSum(X, 'sp', '特殊乗算: 悲しき歌', '%', extra, [['攻撃力(sE) ' + Math.round(atkS) + ' の1000超過分 ÷100 × 1.5% (最大30%、小数第3位以降切り捨て)', extra]].filter(l => l[1]), `特殊乗算 = 1 + ${extra}% = ${(1 + extra / 100).toFixed(4)}`);
      putSum(X, 'base', '基礎ダメージボーナス: 銀暁の舞', '%', baseB, [['攻撃力(sE) ' + Math.round(atkS) + ' ÷100 × 0.7% (最大14%、小数第3位以降切り捨て)', baseB]].filter(l => l[1]), `(1 + ${baseB}%) = ${(1 + baseB / 100).toFixed(4)}`);
      H(X, null, 'E (スキル) 攻撃力×194.54%', eHit, `${Math.round(atkE)} × 194.54% × 会心 ${critE.toFixed(3)} × 防御 0.5 × 耐性 0.9`);
      H(X, null, 'sE 氷ダメージ部分 (攻撃力×172.51%)', sHit, `${Math.round(atkS)} × 172.51% × 会心 ${critE.toFixed(3)} × 防御 0.5 × 耐性 0.9`);
      H(X, null, `sE 星${pt.swirl ? '拡散' : '電導'}扱い部分 (攻撃力×${(pt.talent * 100).toFixed(2)}%)`, star,
        `${pt.coef} × ${Math.round(atkS)} × ${(pt.talent * 100).toFixed(2)}% × 特殊乗算 ${(1 + extra / 100).toFixed(4)} × (1 + 基礎ダメ ${baseB}%) × (1 + 熟知 ${(emB * 100).toFixed(1)}% + 星反応 ${starBonus}%) × 会心 ${critStar.toFixed(3)} × 耐性 0.9 (防御・ダメバフなし)`);
    }
    return { damage: Math.round(eHit + sHit + star), em: emS, atk: atkS, cr, cd, buff: starBonus, elemBuff: 0 };
  }
});
})();
