// 行秋専用データ + ダメージ計算 (元素スキル + 元素爆発50hit / 水元素・反応なし)
// 前提: 6凸 / 天賦Lv13 (★4キャラは6凸の方針) / 基礎ステータスはLv90 (小数2桁)
// 倍率: スキルLv13 = 357.00% + 405.875% (4凸の1.5倍は含まない) / 爆発Lv13 = 115.3875% × 50hit (6凸の波込み)
// 2凸: 敵の水耐性-15% (スキル・爆発の両方に適用: 耐性10% → -5% で ×1.025) / 4凸: スキルダメ×1.5 (独立乗算) / 固有天賦: 水ダメ+20%
// 黒蝕(R1): 爆発の会心ダメ+16% / 白昼の刃で攻撃力+20% (爆発hit後3秒。爆発中はずっと有効で、4凸の条件上スキルも爆発中に使うため両方に適用) / 魔導秘技なし
// 時計: チャージ効率サブステの武器(祭礼の剣)は チャージ/攻撃% から選択、それ以外の武器は チャージ効率に固定
// 霧切の廻光: 全元素+12% + 峰の印2層(R1: 16%) = 水ダメ+28% / 狼牙: 表にいる時のみの会心率効果は使わず、スキル・爆発ダメ+32%(R5)のみ
(() => {   // このファイルの const 名が他のキャラのファイルと衝突しないように、囲いの中に入れる
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK_ER = [{ name: 'チャージ', stat: 'er' }];   // 爆発を多く回すため、チャージ武器以外は時計をチャージ効率に固定
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'xingqiu', name: '行秋', element: 'hydro', weaponType: '片手剣',
  rarity: 4, version: '1.0', release: '2020-09-28',
  engine: 4,   // このファイルが必要とする common.js の版 (古い common.js だと、画面に警告が出る)
  base: { hp: 10222.42, atk: 201.78, def: 757.60, em: 0 },   // Lv90の基礎ステータス (計算で参照しないものも記入)
  ascend: { atkPct: 24 },   // 突破ボーナス
  parties: [{ key: 'solo', members: [], name: '特になし (単体で計算)', same: 0, diff: 0 }],
  refs: [{ key: 'atk', label: '攻撃力' }],
  subStats: ['atk', 'cr', 'cd'], subLabels: ['攻', '率', '傷'],   // チャージ効率は画面の「チャージロール」で指定 (必ず消費)
  // atkPct/er/cr/cd=サブステ / hpPct・hpToAtk=磐岩結緑 / elem=水ダメ+% / skillBonus=スキルダメ+% / burst=爆発ダメ+% / burstCd=爆発の会心ダメ+% / atkBuff=攻撃力+% / skillCount=スキル回数
  weapons: {
    sacrificial_sword:      { name: '祭礼の剣 (R5)',  atk: 454, atkPct: 0,    er: 61.3, cr: 0,    cd: 0,    skillCount: 2 },   // スキルCTリセット → スキル2回
    primordial_jade_cutter: { name: '磐岩結緑 (R1)',  atk: 542, atkPct: 0,    er: 0,    cr: 44.1, cd: 0,    hpPct: 20, hpToAtk: 1.2, clocks: CLK_ER },
    moonweavers_dawn:             { name: '月紡ぎの曙光 (R5)', atk: 565, atkPct: 27.6, er: 0,    cr: 0,    cd: 0,    burst: 40, clocks: CLK_ER },      // 爆発+40% (エネルギー80>60のため追加分なし)
    mistsplitter_reforged:  { name: '霧切の廻光 (R1)',  atk: 674, atkPct: 0,    er: 0,    cr: 0,    cd: 44.1, elem: 12 + 16, clocks: CLK_ER },  // 全元素+12% + 峰の印2層16%
    wolf_fang:              { name: '狼牙 (R5)',       atk: 510, atkPct: 0,    er: 0,    cr: 27.6, cd: 0,    skillBonus: 32, burst: 32, clocks: CLK_ER },  // スキル・爆発ダメ+32% (会心率の効果は表にいる時のみのため除外)
    athame_artis:             { name: '黒蝕 (R1)',       atk: 608, atkPct: 0,    er: 0,    cr: 33.1, cd: 0,    burstCd: 16, atkBuff: 20, clocks: CLK_ER }  // 爆発の会心ダメ+16% / 攻撃力+20%
  },
  sets: [
    { key: 'emblem_of_severed_fate', name: '絶縁の旗印 4' },
    { key: 'noblesse_oblige',        name: '旧貴族のしつけ 4' },
    { key: 'nymphs_dream',           name: '水仙の夢 4' },
    { key: 'atk_2_2',                name: '攻撃18% + 攻撃18% (2+2)' }
  ],
  clocks:   [{ name: 'チャージ', stat: 'er' }, { name: '攻撃%', stat: 'atk' }],
  cups:     [{ name: '水バフ', stat: 'hydro' }, { name: '攻撃%', stat: 'atk' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],
  calc({ weapon: w, set, mains, s, x: X }) {
    const n = k => (mains.c[k] || 0), k = set.key;
    const ERp = X ? [] : null, AP = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, HY = X ? [] : null, BB = X ? [] : null;
    // チャージ効率
    const er = A(ERp, '初期値', 100) + A(ERp, '武器: チャージ', w.er || 0) + A(ERp, 'メインステ 時計 チャージ', 51.8 * n('er')) + A(ERp, '絶縁の旗印 (2セット)', k === 'emblem_of_severed_fate' ? 20 : 0) + A(ERp, 'サブステ チャージ (固定2ロール+チャージロール)', s.er);
    // 攻撃力
    let atkPct = A(AP, '突破 攻撃力%', this.ascend.atkPct) + A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力%', w.atkPct || 0) + A(AP, '武器: 白昼の刃', w.atkBuff || 0);
    if (k === 'noblesse_oblige') atkPct += A(AP, '旧貴族のしつけ4 (チーム攻撃+20%)', 20);
    if (k === 'nymphs_dream') atkPct += A(AP, '水仙の夢4 (3層)', 25);
    if (k === 'atk_2_2') atkPct += A(AP, '攻撃力18% + 攻撃力18% (2+2)', 36);
    const maxHp = this.base.hp * (1 + ((w.hpPct || 0) + s.hpPct) / 100) + 4780 + s.hpFlat;   // 花4780 + サブ (磐岩結緑用)
    const hpAtk = w.hpToAtk ? maxHp * w.hpToAtk / 100 : 0;
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + hpAtk;
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);                              // スキル用
    const critBurst = 1 + (cr / 100) * ((cd + (w.burstCd || 0)) / 100);     // 爆発用 (爆発の会心ダメ+を含む)
    // 水元素ダメ (キャラ画面の水ダメ): 固有天賦20 + 杯 + セット
    let hydro = A(HY, '固有天賦 (水ダメ)', 20) + A(HY, '杯 水バフ', n('hydro') ? 46.6 : 0) + A(HY, '武器: 全元素ダメ', w.elem || 0);
    if (k === 'nymphs_dream') hydro += A(HY, '水仙の夢 (2セット15 + 4セット15)', 15 + 15);
    // 元素爆発ダメ+%
    let burstBonus = A(BB, '武器: 爆発ダメ+', w.burst || 0);
    if (k === 'noblesse_oblige') burstBonus += A(BB, '旧貴族のしつけ (2セット)', 20);
    if (k === 'emblem_of_severed_fate') burstBonus += A(BB, '絶縁の旗印4 (チャージ効率×25%, 上限75%)', Math.min(75, er * 0.25));
    // ダメージ (防御0.5 / 敵の水耐性10%。2凸で耐性-15% → -5% なのでスキル・爆発とも ×1.025)
    // スキル Lv13 = 357% + 406.3% = 763.3% / 爆発 Lv13 = 115.32375% × 50hit
    const skill = atk * 7.633 * (w.skillCount || 1) * 1.5 * (1 + (hydro + (w.skillBonus || 0)) / 100) * crit * 0.5 * 1.025;   // 4凸 ×1.5
    const burst = atk * (1.1532375 * 50) * (1 + (hydro + burstBonus) / 100) * critBurst * 0.5 * 1.025;
    if (X) {
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(hpAtk ? [['武器: 最大HP×' + w.hpToAtk + '%', hpAtk]] : []), atk);
      if (hpAtk) putMul(X, 'hp', '最大HP (磐岩結緑の計算用)', [['キャラ基礎HP', this.base.hp]], [['武器 HP%', w.hpPct || 0], ['サブステ HP% (固定2ロール)', s.hpPct]], [['花のHP (固定)', 4780], ['サブステ HP実数値 (固定2ロール)', s.hpFlat]], maxHp);
      putSum(X, 'er', 'チャージ効率', '%', er, ERp);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp, w.burstCd ? `(爆発だけ +${w.burstCd}% → ${(cd + w.burstCd).toFixed(1)}%)` : '');
      putSum(X, 'elem', '元素バフ (水ダメ)', '%', hydro, HY);
      putSum(X, 'burst', '元素爆発ダメージ+%', '%', burstBonus, BB);
      const f = (what, bonus, cc) => `${what} × (1 + ${bonus.toFixed(1)}%) × 会心 ${cc.toFixed(3)} × 防御 0.5 × 耐性 ×1.025 (2凸 -15%)`;
      H(X, null, 'スキル' + ((w.skillCount || 1) > 1 ? ` (×${w.skillCount}回)` : '') + ' (攻撃力×763.3% × 4凸1.5)', skill, f(`${Math.round(atk)} × 763.3% × 1.5 × ${w.skillCount || 1}回`, hydro + (w.skillBonus || 0), crit));
      H(X, null, '元素爆発 剣雨 (115.32375% × 50hit の合計)', burst, f(`${Math.round(atk)} × 5766.19% (1hit = ${(burst / 50).toFixed(0)})`, hydro + burstBonus, critBurst));
    }
    return { damage: Math.round(skill + burst), atk, cr, cd, er, buff: hydro + burstBonus, elemBuff: hydro };
  }
});
})();
