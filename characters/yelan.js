// 夜蘭専用データ + ダメージ計算 (HP参照 / 元素スキル1回 + 元素爆発 + 玲瓏の賽の追撃12回発動×3hit / 蒸発なし)  前提: 無凸 / 天賦Lv10
// 倍率(最大HPに対する%): スキル 40.698 / 爆発 13.158 / 追撃 8.766×3hit×12回 (追撃は爆発ダメージとして扱う)
// 固有天賦(Turn Control): チーム内の元素の種類が 1/2/3/4 のとき 最大HP +6/12/18/30%
// 突破: 会心率 5% + 19.2% / 基礎: HP14450.17 / HP固定値: 花4780 + サブ固定ロール 253.94×2
// ※ 固有天賦(Adapt With Ease: 爆発中 毎秒+3.5% 最大+50%)は、フィールド上のキャラのダメージが上がる効果。
//    夜蘭は裏から攻撃するため乗らない → 0 (表で戦わせる場合だけ値を入れる)
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const A4_DMG = 0;
const CLK_ER = [{ name: 'チャージ', stat: 'er' }];   // チャージ武器以外は時計をチャージ効率に固定
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'yelan', name: '夜蘭', element: 'hydro', weaponType: '弓',
  rarity: 5, version: '2.7', release: '2022-05-31',
  engine: 4,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 14450.17, atk: 243.96, def: 547.98, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { cr: 19.2 },   // 突破ボーナス
  // passiveHp=Turn Control / resHp=水共鳴(HP+25%) / resCr=氷共鳴(会心率+15%)
  parties: [
    { key: 'types4', members: ['any', 'any', 'any'],       name: '異属性4 (水+3元素 / 共鳴なし)',                     same: 0, diff: 3, passiveHp: 30 },
    { key: 'hydro2', members: ['hydro', 'any', 'any'],       name: '水2+その他2種 (水共鳴 HP+25%)',                     same: 1, diff: 2, passiveHp: 18, resHp: 25 },
    { key: 'cryo2_hydro2', members: ['hydro', 'cryo', 'cryo'], name: '氷2+水2 (氷共鳴 会心率+15% / 水共鳴 HP+25%)',        same: 1, diff: 2, passiveHp: 12, resHp: 25, resCr: 15 }
  ],
  refs: [{ key: 'hp', label: '最大HP' }],
  subStats: ['hp', 'cr', 'cd'], subLabels: ['HP', '率', '傷'],   // チャージ効率は画面の「チャージロール」で指定
  // hpPct/er/cr/cd=サブステ・武器効果 / dmg=与ダメ+%(全般) / sb=スキル・爆発ダメ+%
  weapons: {
    aqua_simulacra:  { name: '若水 (R1)',               atk: 542, hpPct: 16,   er: 0,    cr: 0,    cd: 88.2, dmg: 20, clocks: CLK_ER },   // HP+16% / 敵が近くにいる時 与ダメ+20%
    favonius_warbow: { name: '西風猟弓 (R5)',           atk: 454, hpPct: 0,    er: 61.3, cr: 0,    cd: 0 },                            // ダメージ効果なし (チャージ武器)
    fading_twilight: { name: '落霞 (R5・3効果の平均)',   atk: 565, hpPct: 0,    er: 30.6, cr: 0,    cd: 0,    dmg: 20 },                // 与ダメ 12/20/28% の平均 20% (チャージ武器)
    slingshot:       { name: '弾弓 (R5)',               atk: 354, hpPct: 0,    er: 0,    cr: 31.2, cd: 0,    clocks: CLK_ER },         // 効果は通常・重撃のみ → スキル/爆発には効かない
    recurve_bow:     { name: 'リカーブボウ (R5)',       atk: 354, hpPct: 46.9, er: 0,    cr: 0,    cd: 0,    clocks: CLK_ER },         // 効果は回復のみ
    the_stringless:  { name: '絶弦 (R5)',               atk: 510, hpPct: 0,    er: 0,    cr: 0,    cd: 0,    sb: 48, clocks: CLK_ER }   // スキル・爆発ダメ+48% (熟知は使わない)
  },
  sets: [
    { key: 'emblem_of_severed_fate', name: '絶縁の旗印 4' },
    { key: 'hp_2_2',                 name: 'HP20% + HP20% (2+2)' }
  ],
  clocks:   [{ name: 'HP%', stat: 'hp' }, { name: 'チャージ', stat: 'er' }],
  cups:     [{ name: '水バフ', stat: 'hydro' }, { name: 'HP%', stat: 'hp' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }, { name: 'HP%', stat: 'hp' }],
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0), k = set.key;
    const ERp = X ? [] : null, HPp = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, BF = X ? [] : null;
    // チャージ効率
    const er = A(ERp, '初期値', 100) + A(ERp, '武器: チャージ', w.er || 0) + A(ERp, 'メインステ 時計 チャージ', 51.8 * n('er')) + A(ERp, '絶縁の旗印 (2セット)', k === 'emblem_of_severed_fate' ? 20 : 0) + A(ERp, 'サブステ チャージ (固定2ロール+チャージロール)', s.er);
    // 最大HP
    let hpPct = A(HPp, '武器: HP%', w.hpPct || 0) + A(HPp, 'メインステ HP%', 46.6 * n('hp')) + A(HPp, 'サブステ HP% (固定2ロール+割り振り)', s.hpPct) + A(HPp, '固有天賦 (チームの元素の種類)', pt.passiveHp) + A(HPp, '水共鳴', pt.resHp || 0);
    if (k === 'hp_2_2') hpPct += A(HPp, 'HP20% + HP20% (2+2)', 40);            // HP2セット×2
    const hp = this.base.hp * (1 + hpPct / 100) + 4780 + s.hpFlat;   // 花4780 + サブ固定ロール
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '突破 会心率', this.ascend.cr) + A(CRp, '氷共鳴', pt.resCr || 0) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // バフ
    const hydro = n('hydro') ? 46.6 : 0;                                           // 水元素ダメ (キャラ画面)
    const common = hydro + (w.dmg || 0) + A4_DMG;                                   // スキル・爆発共通
    const skillB = common + (w.sb || 0);
    const burstB = common + (w.sb || 0) + (k === 'emblem_of_severed_fate' ? Math.min(75, er * 0.25) : 0);
    // ダメージ (防御0.5 / 水耐性10%)
    const skill = hp * 0.40698 * (1 + skillB / 100) * crit * 0.5 * 0.90;
    const burst = hp * (0.13158 + 0.08766 * 3 * 12) * (1 + burstB / 100) * crit * 0.5 * 0.90;
    if (X) {
      putMul(X, 'hp', '最大HP', [['キャラ基礎HP', this.base.hp]], HPp, [['花のHP (固定)', 4780], ['サブステ HP実数値 (固定2ロール)', s.hpFlat]], hp);
      putSum(X, 'er', 'チャージ効率', '%', er, ERp);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (水ダメ)', '%', hydro, [['杯 水バフ', hydro]].filter(l => l[1]));
      putSum(X, 'buff', 'ダメージバフ (スキル / 爆発)', '%', skillB, [['杯 水バフ', hydro], ['武器: 与ダメージ+', w.dmg || 0], ['固有天賦 (爆発中の上昇: 裏からのため0)', A4_DMG], ['武器: スキル・爆発ダメ+', w.sb || 0]].filter(l => l[1]),
        k === 'emblem_of_severed_fate' ? `(爆発はさらに 絶縁の旗印 +${Math.min(75, er * 0.25).toFixed(1)}% → ${burstB.toFixed(1)}%)` : '');
      const f = (what, bonus) => `${what} × (1 + ${bonus.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
      H(X, null, 'スキル (最大HP×40.698%)', skill, f(`${Math.round(hp)} × 40.698%`, skillB));
      H(X, null, '元素爆発 初撃 (最大HP×13.158%)', hp * 0.13158 * (1 + burstB / 100) * crit * 0.5 * 0.90, f(`${Math.round(hp)} × 13.158%`, burstB));
      H(X, null, '元素爆発 追撃 (最大HP×8.766% × 3hit × 12回 = 36hit)', hp * 0.08766 * 3 * 12 * (1 + burstB / 100) * crit * 0.5 * 0.90, f(`${Math.round(hp)} × 315.576% (1hit = 8.766%)`, burstB));
    }
    return { damage: Math.round(skill + burst), hp, cr, cd, er, buff: burstB, elemBuff: hydro };
  }
});
})();
