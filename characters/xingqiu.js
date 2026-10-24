// 行秋専用データ + ダメージ計算 (元素スキル + 元素爆発50hit / 水元素・反応なし)
// 前提: 6凸 / 天賦Lv13 (★4キャラは6凸の方針) / 基礎ステータスはLv90 (小数2桁)
// 倍率: スキルLv13 = 357.00% + 405.875% (4凸の1.5倍は含まない) / 爆発Lv13 = 115.3875% × 50hit (6凸の波込み)
// 2凸: 敵の水耐性-15% (スキル・爆発の両方に適用: 耐性10% → -5% で ×1.025) / 4凸: スキルダメ×1.5 (独立乗算) / 固有天賦: 水ダメ+20%
// 黒蝕(R1): 爆発の会心ダメ+16% / 白昼の刃で攻撃力+20% (爆発hit後3秒。爆発中はずっと有効で、4凸の条件上スキルも爆発中に使うため両方に適用) / 魔導秘技なし
// 時計: チャージ効率サブステの武器(祭礼の剣)は チャージ/攻撃% から選択、それ以外の武器は チャージ効率に固定
// 霧切の廻光: 全元素+12% + 峰の印2層(R1: 16%) = 水ダメ+28% / 狼牙: 表にいる時のみの会心率効果は使わず、スキル・爆発ダメ+32%(R5)のみ
const CLK_ER = [{ name: 'チャージ', stat: 'er' }];   // 爆発を多く回すため、チャージ武器以外は時計をチャージ効率に固定
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'xingqiu', name: '行秋', element: 'hydro', weaponType: '片手剣',
  rarity: 4, version: '1.0', release: '2020-09-28',
  parties: [{ key: 'solo', name: '特になし (単体で計算)', same: 0, diff: 0 }],
  refs: [{ key: 'atk', label: '攻撃力' }],
  subStats: ['atk', 'cr', 'cd'], subLabels: ['攻', '率', '傷'],   // チャージ効率は画面の「チャージロール」で指定 (必ず消費)
  // atkPct/er/cr/cd=サブステ / hpPct・hpToAtk=磐岩結緑 / elem=水ダメ+% / skillBonus=スキルダメ+% / burst=爆発ダメ+% / burstCd=爆発の会心ダメ+% / atkBuff=攻撃力+% / skillCount=スキル回数
  weapons: {
    sacrificial_sword:      { name: '祭礼の剣 (R5)',  atk: 454, atkPct: 0,    er: 61.3, cr: 0,    cd: 0,    skillCount: 2 },   // スキルCTリセット → スキル2回
    primordial_jade_cutter: { name: '磐岩結緑 (R1)',  atk: 542, atkPct: 0,    er: 0,    cr: 44.1, cd: 0,    hpPct: 20, hpToAtk: 1.2, clocks: CLK_ER },
    lunar_dawn:             { name: '月紡ぎの曙光 (R5)', atk: 565, atkPct: 27.6, er: 0,    cr: 0,    cd: 0,    burst: 40, clocks: CLK_ER },      // 爆発+40% (エネルギー80>60のため追加分なし)
    mistsplitter_reforged:  { name: '霧切の廻光 (R1)',  atk: 674, atkPct: 0,    er: 0,    cr: 0,    cd: 44.1, elem: 12 + 16, clocks: CLK_ER },  // 全元素+12% + 峰の印2層16%
    wolf_fang:              { name: '狼牙 (R5)',       atk: 510, atkPct: 0,    er: 0,    cr: 27.6, cd: 0,    skillBonus: 32, burst: 32, clocks: CLK_ER },  // スキル・爆発ダメ+32% (会心率の効果は表にいる時のみのため除外)
    absolution:             { name: '黒蝕 (R1)',       atk: 608, atkPct: 0,    er: 0,    cr: 33.1, cd: 0,    burstCd: 16, atkBuff: 20, clocks: CLK_ER }  // 爆発の会心ダメ+16% / 攻撃力+20%
  },
  sets: [
    { key: 'emblem_of_severed_fate', name: '絶縁の旗印 4' },
    { key: 'noblesse_oblige',        name: '旧貴族のしつけ 4' },
    { key: 'nymphs_dream',           name: '水仙の夢 4' },
    { key: 'noblesse_2_hydro_2',     name: '旧貴族2 + 水仙/沈淪2' }
  ],
  clocks:   [{ name: 'チャージ', stat: 'er' }, { name: '攻撃%', stat: 'atk' }],
  cups:     [{ name: '水バフ', stat: 'hydro' }, { name: '攻撃%', stat: 'atk' }],
  circlets: [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }],
  calc({ weapon: w, set, mains, rolls, erRolls }) {
    const S = Engine.SUB, n = s => (mains.c[s] || 0), k = set.key;
    // チャージ効率
    const er = 100 + (w.er || 0) + 51.8 * n('er') + (k === 'emblem_of_severed_fate' ? 20 : 0) + Engine.ER_ROLL * erRolls;
    // 攻撃力
    let atkPct = 24 + S.atk * (2 + rolls.atk) + 46.6 * n('atk') + (w.atkPct || 0) + (w.atkBuff || 0);   // 突破24
    if (k === 'noblesse_oblige') atkPct += 20;       // 旧貴族4: チーム全員の攻撃+20%
    if (k === 'nymphs_dream') atkPct += 25;          // 水仙の夢4: 3層で攻撃+25%
    const maxHp = 10222 * (1 + (w.hpPct || 0) / 100) + 4780;   // 花のHP4780のみ
    const atk = (201.78 + w.atk) * (1 + atkPct / 100) + 311 + 33.08 + (w.hpToAtk ? maxHp * w.hpToAtk / 100 : 0);
    // 会心
    const cr = Math.min(100, 5 + w.cr + 31.1 * n('cr') + (2 + rolls.cr) * S.cr);
    const cd = 50 + w.cd + 62.2 * n('cd') + (2 + rolls.cd) * S.cd;
    const crit = 1 + (cr / 100) * (cd / 100);                              // スキル用
    const critBurst = 1 + (cr / 100) * ((cd + (w.burstCd || 0)) / 100);     // 爆発用 (爆発の会心ダメ+を含む)
    // 水元素ダメ (キャラ画面の水ダメ): 固有天賦20 + 杯 + セット
    let hydro = 20 + (n('hydro') ? 46.6 : 0) + (w.elem || 0);
    if (k === 'nymphs_dream') hydro += 15 + 15;      // 2セット15 + 4セット(3層)15
    if (k === 'noblesse_2_hydro_2') hydro += 15;     // 水仙/沈淪の2セット
    // 元素爆発ダメ+%
    let burstBonus = (w.burst || 0);
    if (k === 'noblesse_oblige' || k === 'noblesse_2_hydro_2') burstBonus += 20;
    if (k === 'emblem_of_severed_fate') burstBonus += Math.min(75, er * 0.25);
    // ダメージ (防御0.5 / 敵の水耐性10%。2凸で耐性-15% → -5% なのでスキル・爆発とも ×1.025)
    const skill = atk * 7.62875 * (w.skillCount || 1) * 1.5 * (1 + (hydro + (w.skillBonus || 0)) / 100) * crit * 0.5 * 1.025;   // 4凸 ×1.5
    const burst = atk * 57.69375 * (1 + (hydro + burstBonus) / 100) * critBurst * 0.5 * 1.025;
    return { damage: Math.round(skill + burst), atk, cr, cd, er, buff: hydro + burstBonus, elemBuff: hydro };
  }
});
