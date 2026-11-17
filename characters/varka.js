// ファルカ専用データ + ダメージ計算 (1コンボ / 風+炎の2元素)  前提: ★5限定=無凸 / 天賦Lv10
// コンボ: E N1Cw N4sE N1Cw N1Cw N1Cw N1sE N1C  (w=歩きキャンセル。爆発は使わない)
//   E ×1 / N1 ×7 / N2・N3・N4 ×1 / 重撃(嵐と激情) ×5 / 特殊元素スキル 四風の昇天 ×2
// 倍率 (Lv10 / 攻撃力参照 / 小数2桁)  風 + 炎 (パーティの炎キャラ=右手の元素。優先順位は 炎>水>雷>氷)
//   E 501.12 (風のみ) / N1 161.75 (風のみ) / N2 110.08+59.27 / N3 148.85+80.15 / N4 73.75+136.97 / 重撃 113.94+211.61 / 四風の昇天 170.35+316.37
// 固有天賦1 暁の風の行軍: 風・炎ダメ+ (攻撃力1000ごと10%、上限25%、小数2桁で切り捨て・風と炎の両方に同じ値)
//   風2人+同元素2人 → 通常・重撃・四風の昇天は元ダメージ × 220% (Eには掛けない)
// 固有天賦2 風の御旗の導き: 蒼牙の誓い 4層 = ダメージバフ +30% (通常・重撃・四風の昇天。Eには乗らない / 常時4層)
// 魔導秘儀は常に有効 (狼の武勲詩の会心ダメ+30%を入れる)。四風の昇天のCT短縮はコンボの計算に影響しない
// 武器 (★5=R1 / ★4=R5): 狼の武勲詩 / 狼の末路 / 螭龍の剣 / アースシェイカー / 覇王魔剣
// 聖遺物: 風立ちの日4 / 追憶のしめ縄4 / 砂上の楼閣の史話4 / 攻撃力2+2
//  追憶のしめ縄4・砂上の楼閣の史話4 の通常・重撃ダメ+は 通常攻撃(N1〜N4)と重撃(C)に乗る。E・四風の昇天には乗らない
// 敵: 防御 ×0.5、風耐性10% / 炎耐性10% (耐性ダウン: 風はドゥリン35% / 炎はドゥリン35%+プルーネ40%。0未満は 1 - 耐性/2)
// 味方のバフ (team): PT2 のみ (PT1 は炎共鳴だけ)
//  ニコ 攻撃力+600 (虚己の恵み) +300 (聖祝の導き=表キャラ向け) / 炎ダメ+40% と 風ダメ+40% (天からの贈り物4 = 20%×魔導秘儀。炎=ニコ、風=表のファルカ) / 与ダメ+26%
//  プルーネ(完凸) 与ダメ+50% (鈴の鼓舞・上限) / 拡散した表キャラの攻撃力+30% (実際の挙動。公式文の+60%/+90%は採用しない) / 攻撃力+350 (6凸) / 炎拡散で炎耐性-40% (翠緑の影4)
//  ドゥリン(白モード) 炎耐性-35% と 風耐性-35% (20%×1.75。風にも乗る) / 武器 黒蝕 攻撃力+28% (16%×1.75)
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const DAY = 'a_day_carved_from_rising_winds', SHIME = 'shimenawas_reminiscence', DESERT = 'desert_pavilion_chronicle', ATK22 = 'atk_2_2';
const RES_BASE = 10;      // 敵の耐性 10%
const T220 = 2.2;         // 固有天賦1: 風2人+炎2人の自己バフ (元ダメージの220%)
const OATH = 30;          // 蒼牙の誓い 4層 (7.5% × 4)
const CLK = [{ name: '攻撃%', stat: 'atk' }];
const CUP = [{ name: '炎バフ', stat: 'pyro' }, { name: '風バフ', stat: 'anemo' }, { name: '攻撃%', stat: 'atk' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメージ', stat: 'cd' }];
// 1コンボの内訳: [グループ, 名前, 回数, 種類, 風の倍率%, 炎の倍率%]   種類: skill=E / na=通常攻撃 / ca=重撃 / sp=特殊元素スキル
const HITS = [
  ['E',         'スキル 風縛りの処断',        1, 'skill', 501.12, 0],
  ['通常攻撃',  'N1 (1段目) ×7',              7, 'na',    161.75, 0],
  ['通常攻撃',  'N2 (2段目)',                 1, 'na',    110.08, 59.27],
  ['通常攻撃',  'N3 (3段目)',                 1, 'na',    148.85, 80.15],
  ['通常攻撃',  'N4 (4段目)',                 1, 'na',    73.75, 136.97],
  ['重撃',      'C 嵐と激情の重撃 ×5',        5, 'ca',    113.94, 211.61],
  ['特殊スキル', '四風の昇天 ×2',             2, 'sp',    170.35, 316.37]
];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'varka', name: 'ファルカ', element: 'anemo', weaponType: '両手剣',
  rarity: 5, version: '6.4', release: '2026-02-25',   // Ver.6.4 Luna V 前半
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 12613.29, atk: 352.79, def: 795.45, em: 0 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                        // 突破ボーナス: 会心ダメージ
  // resAtk = 炎共鳴 (炎2人) / erRolls = チャージロール (爆発を使わないので0)
  parties: [
    { key: 'pt1', members: ['anemo', 'pyro', 'pyro'],
      name: 'PT1 (ファルカ+風+炎2 / 炎共鳴 攻撃力+25% / 魔導秘儀 / 固有天賦1 220%)', same: 1, diff: 2, resAtk: 25, erRolls: 0 },
    { key: 'pt2', members: [{ el: 'pyro', char: 'durin' }, { el: 'anemo', char: 'prune' }, { el: 'pyro', char: 'nicole' }],
      name: 'PT2 (ファルカ+ドゥリン+プルーネ+ニコ / 炎共鳴 攻撃力+25% / 魔導秘儀 / 味方のバフ込み)', same: 1, diff: 2, resAtk: 25, erRolls: 0,
      // 味方のバフ: 「ラベル, 値」の配列 (常時)
      team: {
        atkFlat:   [['ニコ: 虚己の恵み', 600], ['ニコ: 聖祝の導き (表キャラ向け)', 300], ['プルーネ: 6凸 攻撃力+350', 350]],
        atkPct:    [['プルーネ: 鈴の鼓舞 (拡散時 攻撃力+30%)', 30], ['ドゥリン: 黒蝕 (16% × 魔導秘儀1.75)', 28]],
        dmg:       [['ニコ: 塵と光の七つの誓約 (与ダメ)', 26], ['プルーネ: 鈴の鼓舞 (与ダメ・上限)', 50]],
        pyroElem:  [['ニコ: 天からの贈り物4 (炎ダメ)', 40]],
        windElem:  [['ニコ: 天からの贈り物4 (表キャラ=風ダメ)', 40]],
        resWind:   [['ドゥリン: 白モード 風耐性ダウン (20% × 1.75)', 35]],
        resPyro:   [['ドゥリン: 白モード 炎耐性ダウン (20% × 1.75)', 35], ['プルーネ: 翠緑の影4 (炎拡散 炎耐性ダウン)', 40]]
      } }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'cd', label: '会心ダメ' }],
  subStats: ['atk', 'cr', 'cd'], subLabels: ['攻', '率', '傷'],
  // atk=基礎攻撃力 / atkPct=攻撃力%(サブ) / atkBuff=攻撃力+% (効果) / cr,cd=会心 (サブ) / cdBuff=会心ダメ+% (効果) / er=チャージ(サブ) / dmg=与ダメ+% / skill=元素スキルダメ+%
  weapons: {
    gest_of_the_mighty_wolf:             { name: '狼の武勲詩 (R1)',    atk: 608, atkPct: 0,    cr: 33.1, cd: 0, dmg: 30, cdBuff: 30 },    // 四風の詩4層: 与ダメ+7.5%×4 / 魔導秘儀 会心ダメ+7.5%×4。攻撃速度は除外
    wolfs_gravestone:                    { name: '狼の末路 (R1)',      atk: 608, atkPct: 49.6, cr: 0,    cd: 0, atkBuff: 20 },             // チーム+40%は除外
    serpent_spine:                       { name: '螭龍の剣 (R5)',      atk: 510, atkPct: 0,    cr: 27.6, cd: 0, dmg: 50 },                // 与ダメ 10%×5重 (被ダメ増加は無視)
    earth_shaker:                        { name: 'アースシェイカー (R5)', atk: 565, atkPct: 27.6, cr: 0, cd: 0, skill: 32 },               // 炎反応のあと 元素スキルダメ+32%
    ultimate_overlords_mega_magic_sword: { name: '覇王魔剣 (R5)',      atk: 565, atkPct: 0,    cr: 0,    cd: 0, er: 30.6, atkBuff: 48 }   // 攻撃力+24%+24%
  },
  sets: [
    { key: DAY,    name: '風立ちの日 4' },               // 攻撃力+18%+25% / 会心率+20% (魔女の課題クリア済み・常時)
    { key: SHIME,  name: '追憶のしめ縄 4' },             // 攻撃力+18% / 通常・重撃ダメ+50%
    { key: DESERT, name: '砂上の楼閣の史話 4' },         // 風ダメ+15% / 通常・重撃ダメ+40%
    { key: ATK22,  name: '攻撃18% + 攻撃18% (2+2)' }    // 攻撃力+36%
  ],
  clocks: CLK, cups: CUP, circlets: CIR,
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), T = pt.team || null;
    const n = k => (mains.c[k] || 0), k = set.key;
    const AP = X ? [] : null, AF = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, ERp = X ? [] : null;
    const WB = X ? [] : null, PB = X ? [] : null, RD = X ? [] : null, RW = X ? [] : null;
    const sumT = (key, arr) => (T && T[key]) ? T[key].reduce((t, [l, v]) => t + A(arr, l, v), 0) : 0;   // 味方のバフを合計しつつ内訳に記録
    // 攻撃力: サブ% + メイン% + 武器 + 炎共鳴 + 味方(%) + セット
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力% (サブ)', w.atkPct || 0)
      + A(AP, '武器: 攻撃力+% (効果)', w.atkBuff || 0) + A(AP, '炎共鳴', pt.resAtk || 0) + sumT('atkPct', AP);
    if (k === DAY) atkPct += A(AP, '風立ちの日 2セット', 18) + A(AP, '風立ちの日 4セット (風と牧歌の決意)', 25);
    if (k === SHIME) atkPct += A(AP, '追憶のしめ縄 2セット', 18);
    if (k === ATK22) atkPct += A(AP, '攻撃力18% + 攻撃力18% (2+2)', 36);
    const atkFlatT = sumT('atkFlat', AF);   // 味方の攻撃力+実数 (%の外に足す)
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + atkFlatT;
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr || 0) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr)
      + (k === DAY ? A(CRp, '風立ちの日4 (魔女の課題クリア済み)', 20) : 0);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '武器の会心ダメ', w.cd || 0) + A(CDp, '武器: 会心ダメ+% (狼の武勲詩・魔導秘儀)', w.cdBuff || 0)
      + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    const er = A(ERp, '初期値', 100) + A(ERp, '武器 チャージ', w.er || 0) + A(ERp, 'サブステ チャージ (固定2ロール)', s.er);
    // 固有天賦1: 攻撃力1000ごとに10% (上限25%、小数2桁で切り捨て) → 風と炎の両方に同じ値
    const talent1 = Math.min(25, Math.floor(atk) / 100);
    // 全攻撃に乗るダメージバフ (風・炎共通)
    const common = (w.dmg || 0) + sumT('dmg', []);
    const wBase = A(WB, '固有天賦1 風ダメ (攻撃力1000ごと10%・上限25%)', talent1) + A(WB, '杯 風バフ', 46.6 * n('anemo')) + A(WB, '武器: 与ダメ+% (全攻撃)', common)
      + (k === DESERT ? A(WB, '砂上の楼閣の史話 2セット 風ダメ', 15) : 0) + sumT('windElem', WB);
    const pBase = A(PB, '固有天賦1 炎ダメ (攻撃力1000ごと10%・上限25%)', talent1) + A(PB, '杯 炎バフ', 46.6 * n('pyro')) + A(PB, '武器・味方: 与ダメ+% (全攻撃)', common)
      + sumT('pyroElem', PB);
    // 敵の耐性: 10% - 耐性ダウン。0未満のとき 1 - 耐性/2
    const resMul = pct => pct >= 0 ? 1 - pct / 100 : 1 - pct / 200;
    const resWPct = RES_BASE - sumT('resWind', RW), resPct = RES_BASE - sumT('resPyro', RD);
    const resW = resMul(resWPct), resP = resMul(resPct);
    // 攻撃の種類ごとの追加バフ
    const extra = kind => {
      let e = 0;
      if (kind === 'skill' || kind === 'sp') e += w.skill || 0;                                    // アースシェイカー: 元素スキルダメ
      if (kind === 'na' || kind === 'ca') e += (k === SHIME ? 50 : 0) + (k === DESERT ? 40 : 0);   // しめ縄・楼閣: 通常・重撃ダメ
      if (kind !== 'skill') e += OATH;                                                              // 蒼牙の誓い 4層 (Eには乗らない)
      return e;
    };
    let total = 0;
    for (const [grp, name, cnt, kind, wm, pm] of HITS) {
      const f220 = kind === 'skill' ? 1 : T220, e = extra(kind);
      for (const [el, m, base, res] of [['風', wm, wBase, resW], ['炎', pm, pBase, resP]]) {
        if (!m) continue;
        const d = atk * (m / 100) * cnt * f220 * (1 + (base + e) / 100) * crit * 0.5 * res;
        total += d;
        if (X) H(X, grp, `${name} ${el} ${m.toFixed(2)}%`, d,
          `${Math.round(atk)} × ${m.toFixed(2)}%${cnt > 1 ? ' × ' + cnt : ''}${f220 > 1 ? ' × 220%' : ''} × (1 + ${(base + e).toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 ${res.toFixed(3)}`);
      }
    }
    const damage = Math.round(total);
    if (X) {
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(AF), atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '風ダメージバフ (固有天賦1 + 杯 + 与ダメ + 味方)', '%', wBase, WB, '(風の攻撃に乗る。種類別の追加 (蒼牙の誓い・しめ縄など) は含まない)');
      putSum(X, 'pyro', '炎ダメージバフ (固有天賦1 + 杯 + 与ダメ + 味方)', '%', pBase, PB, '(炎の攻撃に乗る。種類別の追加 (蒼牙の誓い・しめ縄など) は含まない)');
      putSum(X, 'res', '敵の炎耐性', '%', resPct, [['敵の基礎耐性', RES_BASE]].concat(RD.map(([l, v]) => [l, -v])), `(耐性倍率 = ${resP.toFixed(3)} ${resPct < 0 ? '← 耐性が0未満なので 1 - 耐性/2' : ''})`);
      putSum(X, 'resw', '敵の風耐性', '%', resWPct, [['敵の基礎耐性', RES_BASE]].concat(RW.map(([l, v]) => [l, -v])), `(耐性倍率 = ${resW.toFixed(3)} ${resWPct < 0 ? '← 耐性が0未満なので 1 - 耐性/2' : ''})`);
      putSum(X, 'er', 'チャージ効率', '%', er, ERp);
    }
    return { damage, atk, cr, cd, er, buff: wBase, elemBuff: wBase };
  }
});
})();
