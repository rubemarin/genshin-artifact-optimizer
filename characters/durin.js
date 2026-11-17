// ドゥリン専用データ + ダメージ計算 (爆発の龍の継続攻撃 1hit / 炎)  前提: ★5限定=無凸 / 天賦Lv10
// ダメージ = 龍の継続攻撃 1hit (元素爆発ダメージ扱い・攻撃力参照・炎元素)。E・Q初撃・攻撃回数は使わない
//  倍率 (Lv10 / 小数2桁): 白焔の龍 170.35% (白モード=PT1・PT2) / 黒蝕の龍 233.71% (黒モード=PT3・PT4)
// 固有天賦1 顕現せし光霊 (魔導秘儀 常時 = 全パーティで効果×1.75)
//  白: 炎耐性・反応元素の耐性-35% は味方向けなので自分のダメージには入れない
//  黒: 溶解ダメージ +40% × 1.75 = +70% → 溶解の反応ボーナスに足す (溶解は常に発動 / 炎→氷 ×2)
// 固有天賦2 混沌を創りし闇夜 (原象): 1hitに常に乗る。元ダメージ × (1 + 攻撃力100ごと3% (小数2桁で切り捨て、上限75%))
// 溶解 = 2 × (1 + 2.78×熟知/(熟知+1400) + 70%) / 敵: 防御 ×0.5、炎耐性10%
// 武器: 黒蝕(R1) 爆発会心ダメ+16% / 攻撃力+35% (白昼の刃 20%×1.75・常時) / 磐岩結緑(R1) HP+20%・最大HPの1.2%を攻撃力に加算
//       狼牙(R5) 爆発ダメ+32% / 月紡ぎの曙光(R5) 爆発ダメ+40% (エネルギー70なので追加なし) / 匣中龍吟(R5) 与ダメ+36% (炎の影響を受けた敵に常時)
// 聖遺物: 旧貴族4 (爆発ダメ+20% / 攻撃力+20% 常時) / 絶縁4 (チャージ+20% / 爆発ダメ+チャージ×25% 上限75%)
//         風立ちの日4 (攻撃力+18%+25% / 会心率+20% 魔女の課題クリア済み・常時) / 攻撃力2+2 (+36%)
// 味方のバフ (team): PT2 と PT4 のみ。PT1・PT3 は味方が未定なので入れない (炎共鳴 攻撃力+25% は全パーティ)
//  PT2: ニコ 攻撃力+600 (虚己の恵み) / 炎ダメ+40% (天からの贈り物4 = 20%×魔導秘儀 / 炎・氷ダメ) / 与ダメ+26%
//       プルーネ 与ダメ+50% (鈴の鼓舞・上限) / 炎耐性-40% (翠緑の影4・炎拡散)   ファルカ 炎拡散でドゥリン固有天賦1を起動 → 炎耐性-35% (20%×1.75)
//       敵の炎耐性 10% - 35% - 40% = -65% (0未満なので耐性倍率 = 1 - 耐性/2 = 1.325)
//  PT4: ニコ (PT2と同じ) / シロネン 与ダメ+25.6%・元素耐性ダウン36% (炎耐性 10% → -26%) / ローエン 攻撃力+15% (秀逸なる戯言・氷関連反応のあと8秒 = 常時)
//  聖祝の導き(+300)・プルーネの凸バフは表キャラ向けなので乗らない (ドゥリンは裏からの火力)
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const NOB = 'noblesse_oblige', EMB = 'emblem_of_severed_fate', DAY = 'a_day_carved_from_rising_winds', ATK22 = 'atk_2_2';
const WHITE = 1.7035, BLACK = 2.3371;                  // 白焔の龍 / 黒蝕の龍 (Lv10)
const MELT_UP = 40 * 1.75;                             // 黒蝕の龍: 溶解ダメージ+40% × 魔導秘儀1.75 = 70%
const RES_BASE = 10;                                   // 敵の炎耐性 10%
const CLK = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP = [{ name: '炎バフ', stat: 'pyro' }, { name: '攻撃%', stat: 'atk' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメージ', stat: 'cd' }];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'durin', name: 'ドゥリン', element: 'pyro', weaponType: '片手剣',
  rarity: 5, version: '6.2', release: '2025-12-03',   // Ver.6.2 Luna III 前半
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 12429.60, atk: 346.81, def: 822.35, em: 0 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                        // 突破ボーナス: 会心ダメージ
  // mode: white=白焔の龍 (白モード) / black=黒蝕の龍 (黒モード) / resAtk = 炎共鳴 (ドゥリン+炎1人)
  parties: [
    { key: 'pt1', mode: 'white', members: ['pyro', 'anemo', 'anemo'],
      name: 'PT1 白 (ドゥリン+炎+風2 / 炎共鳴 攻撃力+25% / 魔導秘儀)', same: 1, diff: 2, resAtk: 25, erRolls: 2 },
    { key: 'pt2', mode: 'white', members: [{ el: 'anemo', char: 'varka' }, { el: 'anemo', char: 'prune' }, { el: 'pyro', char: 'nicole' }],
      name: 'PT2 白 (ドゥリン+ファルカ+プルーネ+ニコ / 炎共鳴 攻撃力+25% / 魔導秘儀 / 味方のバフ込み)', same: 1, diff: 2, resAtk: 25, erRolls: 2,
      // 味方のバフ: 「ラベル, 値」の配列 (常時 / 龍の攻撃に乗る)
      team: {
        atkFlat: [['ニコ: 虚己の恵み', 600]],
        elem:    [['ニコ: 天からの贈り物 (炎ダメ)', 40]],
        dmg:     [['ニコ: 塵と光の七つの誓約 (与ダメ)', 26], ['プルーネ: 鈴の鼓舞 (与ダメ・上限)', 50]],
        resDown: [['ファルカ: 炎拡散でドゥリンの固有天賦1を起動 (炎耐性ダウン 20%×1.75)', 35], ['プルーネ: 翠緑の影4 (炎拡散 炎耐性ダウン)', 40]]
      } },
    { key: 'pt3', mode: 'black', members: ['pyro', 'cryo', 'any'],
      name: 'PT3 黒・溶解 (ドゥリン+炎+氷+その他 / 炎共鳴 攻撃力+25% / 魔導秘儀)', same: 1, diff: 2, resAtk: 25, erRolls: 2 },
    { key: 'pt4', mode: 'black', members: [{ el: 'cryo', char: 'lohen' }, { el: 'pyro', char: 'nicole' }, { el: 'geo', char: 'xilonen' }],
      name: 'PT4 黒・溶解 (ドゥリン+ローエン+ニコ+シロネン / 炎共鳴 攻撃力+25% / 魔導秘儀 / 味方のバフ込み)', same: 1, diff: 2, resAtk: 25, erRolls: 2,
      team: {
        atkFlat: [['ニコ: 虚己の恵み', 600]],
        atkPct:  [['ローエン: 秀逸なる戯言 (氷関連反応のあと8秒・常時)', 15]],
        elem:    [['ニコ: 天からの贈り物 (炎ダメ)', 40]],
        dmg:     [['ニコ: 塵と光の七つの誓約 (与ダメ)', 26], ['シロネン: 岩峰を巡る歌 (与ダメ)', 25.6]],
        resDown: [['シロネン: サンプル音源 (元素耐性ダウン)', 36]]
      } }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'em', label: '熟知' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / atkPct=攻撃力%(サブ) / atkBuff=攻撃力+% (黒蝕) / cr,cd=会心 / burstCd=爆発の会心ダメ+% / burst=爆発ダメ+% / dmg=与ダメ+% / hpPct・hpToAtk=磐岩結緑
  weapons: {
    athame_artis:           { name: '黒蝕 (R1)',         atk: 608, atkPct: 0,    cr: 33.1, cd: 0, burstCd: 16, atkBuff: 20 * 1.75 },   // 白昼の刃 20% × 魔導秘儀1.75 = 35%
    primordial_jade_cutter: { name: '磐岩結緑 (R1)',     atk: 542, atkPct: 0,    cr: 44.1, cd: 0, hpPct: 20, hpToAtk: 1.2 },
    wolf_fang:              { name: '狼牙 (R5)',         atk: 510, atkPct: 0,    cr: 27.6, cd: 0, burst: 32 },                      // 会心率の効果は除外 (控えでは層が貯まらない)
    moonweavers_dawn:       { name: '月紡ぎの曙光 (R5)', atk: 565, atkPct: 27.6, cr: 0,    cd: 0, burst: 40 },                      // エネルギー70>60: 追加分なし
    lions_roar:             { name: '匣中龍吟 (R5)',     atk: 510, atkPct: 41.3, cr: 0,    cd: 0, dmg: 36 }                          // 炎の影響を受けた敵に与ダメ+36% (常時)
  },
  sets: [
    { key: NOB,   name: '旧貴族のしつけ 4' },        // 爆発ダメ+20% / 攻撃力+20% (常時)
    { key: EMB,   name: '絶縁の旗印 4' },            // チャージ+20% / 爆発ダメ+チャージ×25% (上限75%)
    { key: DAY,   name: '風立ちの日 4' },            // 攻撃力+18%+25% / 会心率+20% (魔女の課題クリア済み・常時)
    { key: ATK22, name: '攻撃18% + 攻撃18% (2+2)' } // 攻撃力+36%
  ],
  clocks: CLK, cups: CUP, circlets: CIR,
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), black = pt.mode === 'black', T = pt.team || null;
    const n = k => (mains.c[k] || 0), k = set.key;
    const AP = X ? [] : null, AF = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null, EMp = X ? [] : null, ERp = X ? [] : null, RD = X ? [] : null;
    const sumT = (key, arr) => (T && T[key]) ? T[key].reduce((t, [l, v]) => t + A(arr, l, v), 0) : 0;   // 味方のバフを合計しつつ内訳に記録
    // チャージ効率 (絶縁の旗印4の爆発ダメに使う)
    const er = A(ERp, '初期値', 100) + A(ERp, 'サブステ チャージ (固定2ロール+チャージロール)', s.er) + A(ERp, '絶縁の旗印 (2セット)', k === EMB ? 20 : 0);
    // 元素熟知 (溶解の倍率に使う)
    const em = A(EMp, 'サブステ 熟知 (固定2ロール+割り振り)', s.em) + A(EMp, '時計 熟知', 187 * n('em'));
    // 攻撃力: サブ% + メイン% + 武器% + 黒蝕(白昼の刃) + 炎共鳴 + セット
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力%', w.atkPct || 0)
      + A(AP, '武器: 黒蝕 白昼の刃 (20% × 魔導秘儀1.75)', w.atkBuff || 0) + A(AP, '炎共鳴', pt.resAtk || 0) + sumT('atkPct', AP);
    if (k === NOB) atkPct += A(AP, '旧貴族のしつけ4 (チーム攻撃+20%)', 20);
    if (k === DAY) atkPct += A(AP, '風立ちの日 2セット', 18) + A(AP, '風立ちの日 4セット (風と牧歌の決意)', 25);
    if (k === ATK22) atkPct += A(AP, '攻撃力18% + 攻撃力18% (2+2)', 36);
    const maxHp = this.base.hp * (1 + ((w.hpPct || 0) + s.hpPct) / 100) + 4780 + s.hpFlat;   // 花4780 + サブ (磐岩結緑用)
    const hpAtk = w.hpToAtk ? maxHp * w.hpToAtk / 100 : 0;
    const atkFlatT = sumT('atkFlat', AF);   // ニコ: 攻撃力+実数 (%の外に足す)
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + hpAtk + atkFlatT;
    // 原象: 攻撃力100ごとに元ダメージの3% (小数2桁で切り捨て・上限75%)
    const gensho = Math.min(75, Math.floor(atk * 3) / 100);
    // 会心 (爆発ダメージなので 武器の爆発会心ダメ+ を含む)
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr)
      + (k === DAY ? A(CRp, '風立ちの日4 (魔女の課題クリア済み)', 20) : 0);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '武器: 爆発の会心ダメ (黒蝕)', w.burstCd || 0)
      + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // ダメージアップの枠 (炎ダメ + 爆発ダメ + 与ダメ は同じ足し算)
    const elem = A(EB, '杯 炎バフ', 46.6 * n('pyro')) + A(EB, '武器: 爆発ダメージ+% (狼牙・月紡ぎの曙光)', w.burst || 0) + A(EB, '武器: 与ダメ+% (匣中龍吟)', w.dmg || 0)
      + (k === NOB ? A(EB, '旧貴族のしつけ (2セット) 爆発ダメ', 20) : 0)
      + (k === EMB ? A(EB, '絶縁の旗印4 (チャージ効率×25%, 上限75%)', Math.min(75, er * 0.25)) : 0) + sumT('elem', EB) + sumT('dmg', EB);
    // 溶解 (黒モードのみ): 2 × (1 + 2.78×熟知/(熟知+1400) + 70%)
    const meltEm = (2.78 * em) / (em + 1400);
    const melt = black ? 2 * (1 + meltEm + MELT_UP / 100) : 1;
    // 敵の炎耐性: 10% - 耐性ダウン。0未満のとき 1 - 耐性/2
    const shred = sumT('resDown', RD), resPct = RES_BASE - shred;
    const resM = resPct >= 0 ? 1 - resPct / 100 : 1 - resPct / 200;
    const coef = black ? BLACK : WHITE;
    const total = atk * coef * (1 + gensho / 100) * (1 + elem / 100) * 0.5 * resM * melt * crit;
    const damage = Math.round(total);
    if (X) {
      const pc = v => (v * 100).toFixed(2) + '%';
      const dragon = black ? '黒蝕の龍' : '白焔の龍';
      H(X, '爆発 龍の継続攻撃 1hit', `${dragon} ${pc(coef)} (炎${black ? '・溶解' : ''})`, total,
        `${Math.round(atk)} × ${pc(coef)} × 原象 (1 + ${gensho.toFixed(2)}%) × (1 + ${elem.toFixed(1)}%)` + (black ? ` × 溶解 ${melt.toFixed(3)}` : '') + ` × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 ${resM.toFixed(3)}`);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(hpAtk ? [['武器: 最大HP×' + w.hpToAtk + '%', hpAtk]] : []).concat(AF), atk);
      putSum(X, 'em', '元素熟知', '', em, EMp, black ? `(溶解の倍率 = 2 × (1 + ${meltEm.toFixed(4)} + ${MELT_UP}%) = ${melt.toFixed(3)})` : '(白モードは熟知を使わない)');
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (炎ダメ + 爆発ダメ + 与ダメ)', '%', elem, EB, '(同じ足し算の枠。龍の攻撃に乗る)');
      putSum(X, 'res', '敵の炎耐性', '%', resPct, [['敵の基礎耐性', RES_BASE]].concat(RD.map(([l, v]) => [l, -v])), `(耐性倍率 = ${resM.toFixed(3)} ${resPct < 0 ? '← 耐性が0未満なので 1 - 耐性/2' : ''})`);
      putSum(X, 'gensho', '原象 (固有天賦2)', '%', gensho, [['攻撃力100ごと+3% (小数2桁で切り捨て・上限75%)', gensho]], `(攻撃力 ${atk.toFixed(1)} → 元ダメージ × (1 + ${gensho.toFixed(2)}%))`);
      putSum(X, 'er', 'チャージ効率', '%', er, ERp);
    }
    return { damage, em, atk, cr, cd, er, buff: elem, elemBuff: elem };
  }
});
})();
