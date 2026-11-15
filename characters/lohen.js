// ローエン専用データ + ダメージ計算 (E N1C×2 Q N1C×5 sE N1C×4 / 氷)  前提: ★5限定=無凸 / 天賦Lv10 (sEは乗興でLv11)
// コンボ (全パーティ共通 / 溶解反応0回)
//  E(奇策状態に入る) → N1C×2 → Q → N1C×5 → sE → N1C×4   (N1C = 通常1段目1hit + 重撃2hit)
//  倍率(1hitあたり): N1 171.4% / C 209.1%×2hit / Q (213.8% + 0.4%×闘争心100)×6hit / sE (Lv11: 114.0% + 0.4%×闘争心100)×4hit  すべて攻撃力参照・氷元素
//  Q・sE の闘争心は100として計算
// 固有天賦 秀逸なる戯言: 攻撃力+15% (常時) / 魔導キャラ: 魔女の課題クリア済み・魔導秘儀は常時発動
//  魔導秘儀: Q と sE のあと6秒間 通常・重撃ダメ+40% → Q の後の N1C×5 と sE の後の N1C×4 に乗る (E の後の N1C×2 には乗らない)
// 武器「災憾」(R1): 無赦(通常・重撃+40%) / 無癒(スキル・爆発+40%) が魔導秘儀で×1.75 = +70%
//     無赦 = Q〜sE の N1C×5 にだけ乗る / 無癒 = Q と sE に常時乗る (ユーザー指定)
// 聖遺物 風立ちの日4: 攻撃力+18%(2セット) + 攻撃力+25% + 会心率+20% (魔女の課題クリア済み・常時) / 氷風を彷徨う勇士4: 氷ダメ+15% / 会心率+40% (凍結パーティのみ)
// パーティ3(ニコ+ドゥリン+シロネン): 攻撃力+900(ニコ) / 攻撃力+28%(ドゥリン) / 氷ダメ+40%(ニコ) / 与ダメ+26%(ニコ)+25.6%(シロネン) / 氷耐性-36%(シロネン) を全体に常時乗せる
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const DAY = 'a_day_carved_from_rising_winds', BLIZ = 'blizzard_strayer';
const ARCANE = 40;                                    // 魔導秘儀: 通常・重撃ダメ+40% (Q・sE のあと)
const RES_BASE = 10;                                  // 敵の氷耐性 10%
// 倍率 (Lv10 / sE は乗興でLv11)
const N1 = 1.714, C1 = 2.091, C_HITS = 2;
const Q1 = (213.8 + 0.4 * 100) / 100, Q_HITS = 6;      // 制裁の刻: 闘争心100
const SE1 = (114.0 + 0.4 * 100) / 100, SE_HITS = 4;    // 魂を穿つ痛み (Lv11): 闘争心100
const NC = N1 + C_HITS * C1;                           // N1C 1セット分の倍率
const CLK = [{ name: '攻撃%', stat: 'atk' }];
const CUP = [{ name: '氷バフ', stat: 'cryo' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'lohen', name: 'ローエン', element: 'cryo', weaponType: '長柄武器',
  rarity: 5, version: '6.6', release: '2026-06-09',   // Ver.6.6 Luna VII 後半 (前半 ニコ: 2026-05-20)
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 12858.21, atk: 344.42, def: 783.93, em: 0 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                        // 突破ボーナス: 会心ダメージ
  // members = ローエン自身を除く味方の元素 / resAtk = 炎共鳴 / resCr = 氷共鳴
  parties: [
    { key: 'melt', members: ['pyro', 'pyro', 'any'], name: '溶解 (ローエン+炎2+その他 / 炎共鳴 攻撃力+25% / 溶解反応0回)', same: 0, diff: 3, resAtk: 25, erRolls: 0,
      setKeys: [DAY], clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'freeze', members: ['cryo', 'hydro', 'hydro'], name: '凍結 (ローエン+氷1+水2 / 氷共鳴 会心率+15% / 水共鳴 HP+25%)', same: 1, diff: 2, resCr: 15, erRolls: 0,
      setKeys: [DAY, BLIZ], clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'team', members: [{ el: 'pyro', char: 'nicole' }, { el: 'pyro', char: 'durin' }, { el: 'geo', char: 'xilonen' }],
      name: 'ニコ+ドゥリン+シロネン (炎共鳴 攻撃力+25% / 味方のバフ込み)', same: 0, diff: 3, resAtk: 25, erRolls: 0,
      // 味方のバフ: 「ラベル, 値」の配列 (常時 / ローエンの全攻撃に乗る)
      team: {
        atkFlat: [['ニコ: 虚己の恵み', 600], ['ニコ: 聖祝の導き (魔導キャラは直接昇格)', 300]],
        atkPct:  [['ドゥリン: 黒蝕', 28]],
        elem:    [['ニコ: 天からの贈り物 (炎・氷ダメ)', 40]],
        dmg:     [['ニコ: 塵と光の七つの誓約 (与ダメ)', 26], ['シロネン: 岩峰を巡る歌 (与ダメ)', 25.6]],
        resDown: [['シロネン: サンプル音源 (元素耐性ダウン)', 36]]
      },
      setKeys: [DAY], clocks: CLK, cups: CUP, circlets: CIR }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }],
  subStats: ['atk', 'cr', 'cd'], subLabels: ['攻', '率', '傷'],
  // atk=基礎攻撃力 / atkPct=攻撃力%(効果) / cr,cd=会心 / dmg=与ダメ+% / nBonus=通常・重撃ダメ+% (Q〜sEのN1C) / sBonus=スキル・爆発ダメ+% / er=チャージ効率+%
  weapons: {
    disaster_and_remorse:         { name: '災憾 (R1)',         atk: 674, atkPct: 0,  cr: 22.1, cd: 0, nBonus: 70, sBonus: 70 },   // 無赦・無癒 40% × 1.75 (魔導秘儀) = 70%
    primordial_jade_winged_spear: { name: '和璞鳶 (R1)',       atk: 674, atkPct: 22.4, cr: 22.1, cd: 0, dmg: 12 },                 // 攻撃力+3.2%×7層 / 7層で与ダメ+12% (常時7層)
    deathmatch:                   { name: '死闘の槍 (R5)',     atk: 454, atkPct: 48, cr: 36.8, cd: 0 },                           // 敵1人: 攻撃力+48%
    sacrificers_staff:            { name: '聖祭者の輝杖 (R5)', atk: 620, atkPct: 48, cr: 9.2,  cd: 0, er: 36 }                    // 攻撃力+16%×3層 / チャージ+12%×3層 (全コンボで常時3層)
  },
  sets: [
    { key: DAY,  name: '風立ちの日 4' },        // 攻撃力+18%+25% / 会心率+20% (魔女の課題クリア済み・常時)
    { key: BLIZ, name: '氷風を彷徨う勇士 4' }   // 凍結のみ: 氷ダメ+15% / 会心率 氷の影響+20% + 凍結状態+20% = +40% (常時)
  ],
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), T = pt.team || null;
    const n = k => (mains.c[k] || 0), k = set.key;
    const AP = X ? [] : null, AF = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null, RD = X ? [] : null;
    const sumT = (key, arr) => (T && T[key]) ? T[key].reduce((t, [l, v]) => t + A(arr, l, v), 0) : 0;   // 味方のバフを合計しつつ内訳に記録
    // 攻撃力: サブ% + メイン% + 武器% + 固有天賦15% + 炎共鳴 + 味方(ドゥリン28%) + 風立ちの日(18%+25%)
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, '時計 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力%', w.atkPct)
      + A(AP, '固有天賦 秀逸なる戯言', 15) + A(AP, '炎共鳴', pt.resAtk || 0) + sumT('atkPct', AP);
    if (k === DAY) atkPct += A(AP, '風立ちの日 2セット', 18) + A(AP, '風立ちの日 4セット (風と牧歌の決意)', 25);
    const atkFlatT = sumT('atkFlat', AF);   // ニコ: 攻撃力+実数 (%の外に足す)
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + atkFlatT;
    // 会心 (風立ちの日4: 会心率+20% / 氷共鳴+15% / 勇士4: +40%)
    let cr = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr) + A(CRp, '氷共鳴', pt.resCr || 0);
    if (k === DAY) cr += A(CRp, '風立ちの日4 (風と牧歌の決意)', 20);
    if (k === BLIZ) cr += A(CRp, '氷風を彷徨う勇士4 (氷の影響+20% + 凍結+20%)', 40);
    const crRaw = cr; cr = Math.min(100, cr);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // 氷ダメ+与ダメ (同じ足し算の枠): 杯 + 勇士2セット + ニコ(氷40%) + 和璞鳶(与ダメ12%) + ニコ(26%) + シロネン(25.6%)
    const elem = A(EB, '杯 氷バフ', n('cryo') ? 46.6 : 0) + A(EB, '氷風を彷徨う勇士 (2セット)', k === BLIZ ? 15 : 0) + sumT('elem', EB)
      + A(EB, '武器: 和璞鳶 (7層) 与ダメ', w.dmg || 0) + sumT('dmg', EB);
    // 敵の耐性: 10% - 耐性ダウン。0未満のとき 1 - 耐性/2
    const shred = sumT('resDown', RD), resPct = RES_BASE - shred;
    const resM = resPct >= 0 ? 1 - resPct / 100 : 1 - resPct / 200;
    const K = crit * 0.5 * resM;   // 会心 × 防御0.5 × 耐性
    // ダメージアップの枠 (氷ダメ+与ダメ + 種類別)
    const nb0 = elem;                                      // E の後 N1C×2: 通常・重撃の追加なし
    const nb1 = elem + ARCANE + (w.nBonus || 0);           // Q の後 N1C×5: 魔導秘儀40 + 無赦
    const nb2 = elem + ARCANE;                             // sE の後 N1C×4: 魔導秘儀40
    const sb = elem + (w.sBonus || 0);                     // Q と sE: 無癒
    const total = atk * (NC * 2 * (1 + nb0 / 100) + NC * 5 * (1 + nb1 / 100) + NC * 4 * (1 + nb2 / 100) + (Q1 * Q_HITS + SE1 * SE_HITS) * (1 + sb / 100));
    const damage = Math.round(total * K);
    const er = 100 + s.er + (w.er || 0);
    if (X) {
      const pc = v => (v * 100).toFixed(2) + '%';
      const f = (mult, cnt, bonus) => `${Math.round(atk)} × ${pc(mult)}${cnt > 1 ? ' × ' + cnt : ''} × (1 + ${bonus.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 ${resM.toFixed(3)}`;
      const h = (g, nm, mult, cnt, bonus) => H(X, g, nm, atk * mult * cnt * (1 + bonus / 100) * K, f(mult, cnt, bonus));
      h('E → N1C ×2 (魔導秘儀・無赦なし)', 'N1 ×2', N1, 2, nb0);
      h('E → N1C ×2 (魔導秘儀・無赦なし)', `C (${C_HITS}hit) ×2`, C1, C_HITS * 2, nb0);
      h('Q 制裁の刻', `Q ${Q_HITS}hit` + (w.sBonus ? ' (無癒)' : ''), Q1, Q_HITS, sb);
      h('Q → N1C ×5 (魔導秘儀' + (w.nBonus ? '・無赦' : '') + ')', 'N1 ×5', N1, 5, nb1);
      h('Q → N1C ×5 (魔導秘儀' + (w.nBonus ? '・無赦' : '') + ')', `C (${C_HITS}hit) ×5`, C1, C_HITS * 5, nb1);
      h('sE 魂を穿つ痛み', `sE ${SE_HITS}hit` + (w.sBonus ? ' (無癒)' : ''), SE1, SE_HITS, sb);
      h('sE → N1C ×4 (魔導秘儀)', 'N1 ×4', N1, 4, nb2);
      h('sE → N1C ×4 (魔導秘儀)', `C (${C_HITS}hit) ×4`, C1, C_HITS * 4, nb2);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(AF), atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (氷ダメ + 与ダメ)', '%', elem, EB, '(氷ダメと与ダメは同じ足し算の枠。全攻撃に乗る)');
      putSum(X, 'nb', '種類別ダメージ+%', '%', ARCANE + (w.nBonus || 0), [['魔導秘儀 (Q・sE のあとの N1C のみ)', ARCANE], ['災憾 無赦 (Q〜sE の N1C のみ)', w.nBonus || 0]].filter(l => l[1]),
        `(通常・重撃) 上の合計は Q〜sE の N1C に乗る値。sE のあとの N1C は魔導秘儀 ${ARCANE}% のみ / 災憾の無癒 ${w.sBonus || 0}% は Q・sE に乗る`);
      putSum(X, 'res', '敵の氷耐性', '%', resPct, [['敵の基礎耐性', RES_BASE]].concat(RD.map(([l, v]) => [l, -v])), `(耐性倍率 = ${resM.toFixed(3)} ${resPct < 0 ? '← 耐性が0未満なので 1 - 耐性/2' : ''})`);
      putSum(X, 'er', 'チャージ効率', '%', er, [['初期値', 100], ['サブステ チャージ (固定2ロール + チャージロール)', s.er], ['武器: 聖祭者の輝杖 (3層)', w.er || 0]]);
    }
    return { damage, em: 0, atk, cr, cd, er, buff: elem, elemBuff: elem };
  }
});
})();
