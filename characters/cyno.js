// セノ専用データ + ダメージ計算 (雷 / 長柄武器 / ★5 / 1凸 (鍛錬の道) / 天賦Lv10 / Ver.3.1 2022-09-28)
// 反応: 星電導 (反応係数 1.8)
// コンボ: Q N4 N4 N2 sE (N4 N4 sE)×3   → Q=ダメージなし (熟知+100) / N4 ×8 (1回=2hit → 16hit) / N2 ×1 / sE ×4
//   雷ダメ (攻撃力参照・防御0.5・耐性0.9・雷元素ダメ+%などのダメバフがかかる):
//     N2 = 攻撃力163.0% + 熟知150% (1hit) / N4 = (攻撃力102.2% + 熟知150%) × 2hit
//     sE (冥祭) = 攻撃力282.2% ×1 (固有天賦「落羽の裁決」の裁定: 与ダメ+35% をダメバフ欄に加算。冥祭にだけ乗る)
//   星電導ダメ: sE (渡荒の雷・伴星) 3本 × 4回 = 12本。1本 = 反応係数1.8 × (攻撃力200% + 熟知600%)
//     × (1 + 基礎ダメ) × (1 + 6×熟知/(熟知+2000) + 星反応ダメ+%) × 会心 × 耐性0.9 (防御・与ダメバフなし)
//   固有天賦「九弓の権能」: 通常攻撃に熟知の150% (1hitごと) / 伴星に熟知の600% を倍率へ加算
//   4回のsEすべてで「裁定」が発動し、伴星が3本出る前提。通常の渡荒の雷 (攻撃力100%×3本・熟知250%) はコンボに無いので入れない
// 1凸「輝映・星電導」: 日出昇天 熟知+200 (常時) / Q: 熟知+100 (自己バフ・常時) → 熟知+300
// 武器: 赤砂の杖 R1 (熟知×136% を攻撃力に加算 = 52% + 28%×3層) / 和璞鳶 R1 (攻撃+3.2%×7層 + 与ダメ+12%)
//       死闘の槍 R5 (敵1人: 攻撃+48%) / 遠望の歌 R5 (星反応後 攻撃+40% 常時)
// 聖遺物: 影に沈む幻4 / 金メッキの夢4 (同元素×攻撃+14% 異元素×熟知+50) / 熟知2+2 — どれも常時
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP = [{ name: '雷バフ', stat: 'electro' }, { name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'cyno', name: 'セノ', element: 'electro', weaponType: '長柄武器',
  rarity: 5, version: '3.1', release: '2022-09-28',
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 12490.83, atk: 318.11, def: 859.24, em: 0 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                        // 突破ボーナス: 会心ダメージ
  // erRolls = そのパーティを選んだときに、チャージロール数の入力欄へ自動で入れる値 / members = セノ自身を除く味方 (char を指定するとキャラ画像)
  // same / diff = 同元素 / 異元素の味方の数 (金メッキの夢4で使う) / team = 味方からのバフ (ラベル, 値)
  parties: [
    { key: 'electro2_cryo', erRolls: 2, members: ['electro', 'electro', 'cryo'], name: '星電導 (セノ+雷2+氷1)', same: 2, diff: 1 },
    { key: 'team', erRolls: 2, members: [{ el: 'electro', char: 'yaemiko' }, { el: 'electro', char: 'alyosha' }, { el: 'cryo', char: 'odette' }],
      name: '星電導 (セノ+八重神子1凸+アリョーシャ6凸+オデット / 味方のバフ込み)', same: 2, diff: 1,
      team: {
        atkPct: [['アリョーシャ6凸 (旧貴族込み): 攻撃力+25%×2 +20%', 70]],
        em: [['アリョーシャ6凸: 熟知+100', 100]],
        starPct: [['オデット 炉炎 (星バフ)', 50], ['オデット 固有天賦 (星バフ 15%×4)', 60], ['八重神子1凸 (星バフ)', 50], ['アリョーシャ6凸 星電導+20%×2', 40]],
        base: [['オデット 固有天賦 (星基礎値)', 14]],
        elem: [['八重神子1凸 雷元素ダメ', 50]]
      } }
  ],
  refs: [{ key: 'em', label: '熟知' }, { key: 'atk', label: '攻撃力' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / cr=会心率(サブステ) / em=熟知(サブステ) / atkBuff=攻撃力+%(効果) / emAtk=熟知×この値が攻撃力に加算 / dmgBuff=与ダメ+%(効果)
  weapons: {
    staff_of_the_scarlet_sands:   { name: '赤砂の杖 (R1)',   atk: 542, em: 0,   cr: 44.1, atkBuff: 0,    emAtk: 1.36 },   // 熟知の52% + 赤砂の夢 28%×3層 (常時) = 136%
    primordial_jade_winged_spear: { name: '和璞鳶 (R1)',     atk: 674, em: 0,   cr: 22.1, atkBuff: 22.4, dmgBuff: 12 },   // 攻撃力+3.2%×7層 / 7層で与ダメ+12% (雷ダメにだけ乗る)
    deathmatch:                   { name: '死闘の槍 (R5)',   atk: 454, em: 0,   cr: 36.8, atkBuff: 48 },                // 敵1人: 攻撃力+48%
    song_of_the_vigil:            { name: '遠望の歌 (R5)',   atk: 565, em: 110, cr: 0,    atkBuff: 40 }                 // 星反応後 攻撃力+40% (常時)
  },
  sets: [
    { key: 'disenchantment_in_deep_shadow', name: '影に沈む幻 4' },   // 攻撃力+18% / 星電導ダメ+40% / 会心率+16% (常時)
    { key: 'gilded_dreams', name: '金メッキの夢 4' },                  // 熟知+80 / 同元素×攻撃力+14% / 異元素×熟知+50
    { key: 'em_2_2', name: '熟知 2+2' }                                // 熟知+80 +80
  ],
  clocks: CLK, cups: CUP, circlets: CIR,
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party), T = pt.team || {};
    const n = k => (mains.c[k] || 0), k = set.key;
    const dds = k === 'disenchantment_in_deep_shadow', gd = k === 'gilded_dreams';
    const E = X ? [] : null, AP = X ? [] : null, AF = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null,
          SP = X ? [] : null, BB = X ? [] : null;
    const tl = (arr, a) => arr ? arr.reduce((t, p) => t + A(a, p[0], p[1]), 0) : 0;   // team のバフを足して、内訳にも記録
    // 熟知 (赤砂の杖が熟知を攻撃力に変えるので、攻撃力より先に出す)
    const em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, '武器の熟知', w.em) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em)
      + A(E, 'Q 自己バフ (熟知+100)', 100) + A(E, '1凸 輝映・星電導 日出昇天 (熟知+200)', 200)
      + (gd ? A(E, '金メッキの夢 (2セット80 + 異元素の味方×50)', 80 + 50 * Math.min(3, pt.diff)) : 0)
      + (k === 'em_2_2' ? A(E, '熟知2セット×2 (80+80)', 160) : 0) + tl(T.em, E);
    // 攻撃力
    const atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力+% (効果)', w.atkBuff || 0)
      + (dds ? A(AP, '影に沈む幻 2セット 攻撃力+18%', 18) : 0) + (gd ? A(AP, '金メッキの夢4 (同元素の味方×14%)', 14 * Math.min(3, pt.same)) : 0) + tl(T.atkPct, AP);
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat + A(AF, '武器: 熟知×' + ((w.emAtk || 0) * 100).toFixed(0) + '% を攻撃力に加算', em * (w.emAtk || 0));
    // 会心
    const crRaw = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr)
      + (dds ? A(CRp, '影に沈む幻4 (星電導の影響下の敵)', 16) : 0);
    const cr = Math.min(100, crRaw);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // 雷ダメのダメバフ欄: 雷元素ダメ+% (杯・八重神子) + 武器の与ダメ+% / 冥祭だけ 裁定 +35% を加算
    const elem = A(EB, '杯 雷バフ', 46.6 * n('electro')) + tl(T.elem, EB);
    const wBuff = w.dmgBuff || 0, SE_BUFF = 35;
    const buff = elem + wBuff, buffSE = buff + SE_BUFF;
    // 星電導: 基礎ダメ+% / 星電導ダメ+%
    const base = tl(T.base, BB);
    const starPct = (dds ? A(SP, '影に沈む幻4 星電導ダメ+40%', 40) : 0) + tl(T.starPct, SP);
    const emB = (6 * em) / (em + 2000);
    // ダメージ (雷ダメ: 防御0.5・耐性0.9・ダメバフ / 星電導: 防御・ダメバフなし・耐性0.9)
    const kN = b => (1 + b / 100) * crit * 0.5 * 0.90;
    const nHit = (a, e) => (atk * a + em * e) * kN(buff);
    const N4 = nHit(1.022, 1.5), N2 = nHit(1.630, 1.5);
    const SE = atk * 2.822 * kN(buffSE);
    const STAR = 1.8 * (atk * 2.0 + em * 6.0) * (1 + base / 100) * (1 + emB + starPct / 100) * crit * 0.90;
    const total = N4 * 16 + N2 + SE * 4 + STAR * 12;
    const damage = Math.round(total);
    if (X) {
      const r0 = Math.round(atk), pc = v => (v * 100).toFixed(1) + '%', em0 = Math.round(em);
      const nf = (a, e) => `(${r0} × ${pc(a)} + 熟知 ${em0} × ${pc(e)}) × (1 + ダメバフ ${buff.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
      H(X, '通常攻撃 (雷ダメ)', 'N4 ×8回 (2hit × 8 = 16hit)', N4 * 16, nf(1.022, 1.5) + ' ×16hit  (1hit = ' + Math.round(N4).toLocaleString() + ')');
      H(X, '通常攻撃 (雷ダメ)', 'N2 ×1', N2, nf(1.630, 1.5));
      H(X, 'sE (雷ダメ)', '冥祭 ×4回 (攻撃力282.2%)', SE * 4,
        `${r0} × 282.2% × (1 + ダメバフ ${buff.toFixed(1)}% + 裁定 35%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9 ×4回  (1回 = ${Math.round(SE).toLocaleString()})`);
      H(X, 'sE (星電導ダメ)', '渡荒の雷・伴星 ×12本 (3本 × 4回)', STAR * 12,
        `1.8 × (${r0} × 200% + 熟知 ${em0} × 600%) × (1 + 基礎ダメ ${base}%) × (1 + 熟知 ${(emB * 100).toFixed(1)}% + 星電導 ${starPct}%) × 会心 ${crit.toFixed(3)} × 耐性 0.9 (防御・ダメバフなし) ×12本  (1本 = ${Math.round(STAR).toLocaleString()})`);
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]].concat(AF), atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (雷ダメ)', '%', elem, EB, '(雷ダメ: 通常攻撃・sE冥祭にだけ乗る)');
      putSum(X, 'buff', 'ダメバフ (雷ダメ)', '%', buff, EB.concat(wBuff ? [['武器 和璞鳶 与ダメ+12% (7層)', wBuff]] : []), '(通常攻撃・sE冥祭の雷ダメに乗る。冥祭だけ 裁定+35% が加算され ' + buffSE.toFixed(1) + '%)');
      putSum(X, 'base', '星電導 基礎ダメ+%', '%', base, BB, `(1 + 基礎ダメ) = ${(1 + base / 100).toFixed(4)}`);
      putSum(X, 'star', '星電導ダメ+%', '%', starPct, SP, '(伴星にだけ乗る。熟知による 6×熟知/(熟知+2000) は別に加算)');
    }
    return { damage, em, atk, cr, cd, buff, elemBuff: elem };
  }
});
})();
