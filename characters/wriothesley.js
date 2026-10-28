// リオセスリ専用データ + ダメージ計算 (通常攻撃N3C×7 / 氷)  前提: 1凸 (鍛錬の道で交換できるため) / 天賦Lv10
// コンボ
//  パーティ2(凍結): N5C×4 + N3。5段目まで出すので 1凸で重撃は常に強化重撃。逆溶解なし / しめ縄4は最初のN5C×3まで / 氷共鳴 会心率+15% / 水共鳴 HP+25%
//  パーティ3(星電導): N5C×4 + N3。N3・N5・重撃は「星電導ダメージ扱い」: 反応係数1.6 × 攻撃力 × 天賦倍率(N3/N5はスキルの通常強化×1.7031込み) × 特殊乗算(N3 0.6 / N5 0.8 / 重撃 1.0)
//     × (1 + 6×熟知/(熟知+2000) + 星電導ダメ+% の合計) × 会心 × 耐性0.9。与ダメ(氷ダメ・通常/重撃ダメ+%・強化重撃+200%)と防御はかからない
//     星電導ダメ+% = 固有天賦+30% + 影に沈む幻4の+40% + 凛流+42% + 胸中の谺+32% + 1凸「輝映」+50%(最初のN5を除くN5と、すべての重撃) ※+50%は足し算の中
//     N1・N2・N4 は通常の氷ダメージ(氷ダメ + 通常攻撃ダメ+%)。氷共鳴 会心率+15%
//  パーティ1(燃焼溶解): N3C × 7 = (通常1・2・3段 + 重撃) × 7。重撃は 通常→強化→通常→強化→通常→強化→通常 の順(強化3回)
//   逆溶解(氷→炎) ×1.5 × 熟知ボーナス は 通常1段目と重撃にかかる。スキルの通常強化 ×1.7031 は通常攻撃のみ(重撃にはかからない)
//   強化重撃(誅罰・ヴォールティングアッパー)は 1凸でダメージ+200% (ダメージバフに加算) / 固有天賦: 抵罪の赦免 5層 = 攻撃力+30%
//   最大HPは (基礎HP × (1 + サブHP%2個) + 4780 + サブHP実数値2個) = サブステの固定2ロール分 (純水流華の契約の計算に使う)
(() => {
const { add: A, putSum, putMul, hit: H } = Engine;   // 内訳の記録 (タップで詳細を出すため)
const CLK = [{ name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CUP = [{ name: '氷バフ', stat: 'cryo' }, { name: '攻撃%', stat: 'atk' }, { name: '熟知', stat: 'em' }];
const CIR = [{ name: '会心率', stat: 'cr' }, { name: '会心ダメ', stat: 'cd' }];
const CLK_NOEM = [{ name: '攻撃%', stat: 'atk' }];                                    // 凍結は熟知メインなし
const CUP_NOEM = [{ name: '氷バフ', stat: 'cryo' }, { name: '攻撃%', stat: 'atk' }];
const WEAPONS5 = ['cashflow_supervision', 'clash_of_kings', 'the_widsith', 'reliquary_of_truth', 'flowing_purity'];
const WEAPONS6 = WEAPONS5.concat(['echoes_of_the_heart']);   // 胸中の谺は星電導のみ
(globalThis.CHARACTERS = globalThis.CHARACTERS || []).push({
  id: 'wriothesley', name: 'リオセスリ', element: 'cryo', weaponType: '法器',
  rarity: 5, version: '4.1', release: '2023-10-18',
  engine: 4,   // このファイルが必要とする common.js の版
  base:   { hp: 13592.96, atk: 310.93, def: 763.17, em: 0 },   // Lv90の基礎ステータス
  ascend: { cd: 38.4 },                                        // 突破ボーナス: 会心ダメージ
  // members = リオセスリ自身を除く味方の元素 / resAtk = 炎共鳴
  parties: [
    { key: 'melt_burn', combo: 'n3c7', members: ['pyro', 'pyro', 'dendro'], name: '燃焼溶解 (リオセスリ+炎2+草1 / 炎共鳴 攻撃力+25%)', same: 0, diff: 3, resAtk: 25,
      weaponKeys: WEAPONS5, setKeys: ['marechaussee_hunter', 'shimenawas_reminiscence'], clocks: CLK, cups: CUP, circlets: CIR },
    { key: 'freeze', combo: 'n5c4n3', members: ['cryo', 'hydro', 'hydro'], name: '凍結 (リオセスリ+氷1+水2 / 氷共鳴 会心率+15% / 水共鳴 HP+25%)', same: 1, diff: 2, resCr: 15, resHp: 25,
      weaponKeys: WEAPONS5, setKeys: ['marechaussee_hunter', 'shimenawas_reminiscence', 'blizzard_strayer'], clocks: CLK_NOEM, cups: CUP_NOEM, circlets: CIR },
    { key: 'star', combo: 'n5c4n3_star', members: ['cryo', 'electro', 'any'], name: '星電導 (リオセスリ+氷1+雷1+その他 / 氷共鳴 会心率+15%)', same: 1, diff: 2, resCr: 15,
      weaponKeys: WEAPONS6, setKeys: ['marechaussee_hunter', 'disenchantment_in_deep_shadow'], clocks: CLK, cups: CUP, circlets: CIR }
  ],
  refs: [{ key: 'atk', label: '攻撃力' }, { key: 'em', label: '熟知' }],
  subStats: ['atk', 'em', 'cr', 'cd'], subLabels: ['攻', '熟', '率', '傷'],
  // atk=基礎攻撃力 / atkPct=攻撃力%(サブ+効果) / em=熟知 / cr,cd=会心(サブ+効果) / elem=全元素ダメ+% / nBonus,cBonus=通常・重撃ダメ+% / fp=純水流華
  weapons: {
    cashflow_supervision: { name: '凛流の監視者 (R1)',        atk: 674, atkPct: 16, em: 0,   cr: 22.1, cd: 0,    nBonus: 48, cBonus: 42, star: 42 },   // HPが常に増減 → 3層固定 (通常16%×3 / 重撃14%×3)
    clash_of_kings:       { name: '諸王の対局 (R5)',          atk: 510, atkPct: 40, em: 200, cr: 27.6, cd: 0 },                             // 盤上の規則: 常時有効
    the_widsith:          { name: '流浪楽章 (R5・平均の半減)', atk: 510, atkPct: 20, em: 80,  cr: 0,    cd: 55.1, elem: 16 },             // 3曲の平均(÷3)を、2ローテに1回なので半減(÷2)
    reliquary_of_truth:   { name: '真言の匣 (R1)',            atk: 542, atkPct: 0,  em: 80,  cr: 8,    cd: 88.2 },                       // 会心率+8% / 嘘の秘密: 熟知+80 (常時)
    echoes_of_the_heart:  { name: '胸中の谺 (R5)',           atk: 565, atkPct: 27.6, em: 120, cr: 0,   cd: 0,    star: 32 },                          // 熟知+120 / 星反応ダメ+32% (星電導のみ)
    flowing_purity:       { name: '純水流華 (R5)',            atk: 565, atkPct: 27.6, em: 0, cr: 0,    cd: 0,    fp: { first: 16, ratio: 0.48, per: 4, cap: 24 } }   // スキル時 全元素+16% + 命の契約(最大HPの48%、1000ごとに+4%、上限24%)
  },
  sets: [
    { key: 'marechaussee_hunter',     name: 'ファントムハンター 4' },
    { key: 'shimenawas_reminiscence', name: '追憶のしめ縄 4' },
    { key: 'disenchantment_in_deep_shadow', name: '影に沈む幻 4' },   // 星電導のみ: 攻撃力+18% / 星電導ダメ+40% / 会心率+16%(常時)
    { key: 'blizzard_strayer',        name: '氷風を彷徨う勇士 4' }   // 凍結のみ: 氷ダメ+15% / 会心率 氷の影響+20% + 凍結状態+20% = +40%(常時)
  ],
  clocks: [], cups: [], circlets: [],   // パーティ側で指定
  calc({ weapon: w, set, mains, party, s, x: X }) {
    const pt = this.parties.find(x => x.key === party);
    const n = k => (mains.c[k] || 0), k = set.key;
    const E = X ? [] : null, AP = X ? [] : null, CRp = X ? [] : null, CDp = X ? [] : null, EB = X ? [] : null;
    // 熟知
    const em = A(E, 'キャラ基礎熟知', this.base.em) + A(E, '武器の熟知', w.em) + A(E, 'メインステ 熟知', 187 * n('em')) + A(E, 'サブステ 熟知 (固定2ロール+割り振り)', s.em);
    // 攻撃力: 抵罪の赦免5層(+30%) + 炎共鳴(+25%) + しめ縄/影に沈む幻の2セット(+18%)
    let atkPct = A(AP, 'サブステ 攻撃力% (固定2ロール+割り振り)', s.atkPct) + A(AP, 'メインステ 攻撃%', 46.6 * n('atk')) + A(AP, '武器: 攻撃力%', w.atkPct) + A(AP, '固有天賦 抵罪の赦免 (5層×6%)', 30) + A(AP, '炎共鳴', pt.resAtk || 0);
    if (k === 'shimenawas_reminiscence' || k === 'disenchantment_in_deep_shadow') atkPct += A(AP, '2セット 攻撃力+18%', 18);   // しめ縄 / 影に沈む幻 の2セット
    const atk = (this.base.atk + w.atk) * (1 + atkPct / 100) + 311 + s.atkFlat;
    // 会心 (ファントムハンター4: 会心率+12%×3層 / 氷共鳴 +15% / 勇士4: +40% / 影に沈む幻4: +16%)
    let cr = A(CRp, '初期値', 5) + A(CRp, '武器の会心率', w.cr) + A(CRp, '冠 会心率', 31.1 * n('cr')) + A(CRp, 'サブステ 会心率 (固定2ロール+割り振り)', s.cr) + A(CRp, '氷共鳴', pt.resCr || 0);
    if (k === 'marechaussee_hunter') cr += A(CRp, 'ファントムハンター4 (会心率+12%×3層)', 36);
    if (k === 'blizzard_strayer') cr += A(CRp, '氷風を彷徨う勇士4 (氷の影響+20% + 凍結+20%)', 40);
    if (k === 'disenchantment_in_deep_shadow') cr += A(CRp, '影に沈む幻4 (星電導の影響下の敵)', 16);   // 星電導の影響下の敵への攻撃
    const crRaw = cr; cr = Math.min(100, cr);
    const cd = A(CDp, '初期値', 50) + A(CDp, '突破 会心ダメ', this.ascend.cd) + A(CDp, '武器の会心ダメ', w.cd) + A(CDp, '冠 会心ダメ', 62.2 * n('cd')) + A(CDp, 'サブステ 会心ダメ (固定2ロール+割り振り)', s.cd);
    const crit = 1 + (cr / 100) * (cd / 100);
    // 最大HP = 基礎HP × (1 + HP%) + 4780 + HP実数値 (純水流華の命の契約用。水共鳴のHP+25%を含む)
    const maxHp = this.base.hp * (1 + (s.hpPct + 46.6 * n('hp') + (pt.resHp || 0)) / 100) + 4780 + s.hpFlat;
    // 氷ダメ(キャラ画面) = 杯 + 全元素ダメ(武器) + 純水流華 + 勇士2セット15%
    let cryo = A(EB, '杯 氷バフ', n('cryo') ? 46.6 : 0) + A(EB, '武器: 全元素ダメ', w.elem || 0) + A(EB, '氷風を彷徨う勇士 (2セット)', k === 'blizzard_strayer' ? 15 : 0);
    let fpExtra = 0;
    if (w.fp) {
      fpExtra = Math.min(w.fp.cap, Math.floor((w.fp.ratio * maxHp) / 1000) * w.fp.per);
      cryo += A(EB, '純水流華: スキル発動時 全元素ダメ', w.fp.first) + A(EB, '純水流華: 命の契約 (最大HP基準)', fpExtra);
    }
    // 通常攻撃・重撃のダメージアップ (ファントムハンター2セット15% + 武器)
    const common = k === 'marechaussee_hunter' ? 15 : 0;
    const nb = common + (w.nBonus || 0), cb = common + (w.cBonus || 0);
    const shimSet = k === 'shimenawas_reminiscence';
    // 倍率(Lv10): 通常 N1 105.48% / N2 102.39% / N3 132.88% / N4 74.93%×2 / N5 179.37% (スキルの通常強化 ×1.7031) / 重撃 275.33%
    const NH = [1.0548, 1.0239, 1.3288, 0.7493 * 2, 1.7937].map(v => v * 1.7031), C = 2.7533;
    const K0 = crit * 0.5 * 0.90;                                    // 会心・防御・耐性 (通常の氷ダメ用)
    const pc = v => (v * 100).toFixed(2) + '%';
    const nf = (mult, bonus, melt) => `${Math.round(atk)} × ${pc(mult)}${melt ? ' × 逆溶解 ' + melt.toFixed(3) : ''} × (1 + ${bonus.toFixed(1)}%) × 会心 ${crit.toFixed(3)} × 防御 0.5 × 耐性 0.9`;
    let total, starPart = 0, starBase = 0;   // total=防御がかかる分(通常の氷ダメ) / starPart=星電導ダメージ扱い(防御なし)
    if (pt.combo === 'n3c7') {
      // 逆溶解 ×1.5 × (1 + 2.78×熟知/(熟知+1400)) は 通常1段目と重撃にかかる
      const melt = 1.5 * (1 + (2.78 * em) / (em + 1400));
      // 1サイクル = 通常1(溶解)+通常2+通常3+重撃(溶解)。shim=しめ縄4(通常・重撃+50%)が乗る / enh=強化重撃(ダメージ+200%)
      const cycle = (shim, enh) => {
        const sb = shimSet && shim ? 50 : 0;
        const nBr = 1 + (cryo + nb + sb) / 100, cBr = 1 + (cryo + cb + sb + (enh ? 200 : 0)) / 100;
        return atk * (NH[0] * melt * nBr + NH[1] * nBr + NH[2] * nBr + C * melt * cBr);
      };
      // N3C×7: 重撃は 通常→強化→通常→強化→通常→強化→通常 / しめ縄は前半5サイクルのみ
      const seq = [[1, 0], [1, 1], [1, 0], [1, 1], [1, 0], [0, 1], [0, 0]];
      total = 0;
      for (const [sh, en] of seq) total += cycle(sh, en);
      if (X) {
        seq.forEach(([sh, en], i) => {
          const sb = shimSet && sh ? 50 : 0, bn = cryo + nb + sb, bc = cryo + cb + sb + (en ? 200 : 0);
          const g = `N3C ${i + 1}回目` + (shimSet ? (sh ? ' (しめ縄4あり)' : ' (しめ縄4なし)') : '') + (en ? ' / 強化重撃' : '');
          H(X, g, 'N1 (逆溶解)', atk * NH[0] * melt * (1 + bn / 100) * K0, nf(NH[0], bn, melt));
          H(X, g, 'N2', atk * NH[1] * (1 + bn / 100) * K0, nf(NH[1], bn));
          H(X, g, 'N3', atk * NH[2] * (1 + bn / 100) * K0, nf(NH[2], bn));
          H(X, g, en ? 'C (強化重撃・逆溶解)' : 'C (逆溶解)', atk * C * melt * (1 + bc / 100) * K0, nf(C, bc, melt) + (en ? '  ※強化重撃 +200% を含む' : ''));
        });
      }
    } else if (pt.combo === 'n5c4n3_star') {
      // N5C×4 + N3 (星電導): N1・N2・N4=通常の氷ダメージ / N3・N5・重撃=星電導ダメージ扱い
      const nBr = 1 + (cryo + nb) / 100;
      const emBonus = (6 * em) / (em + 2000);
      starBase = 30 + (w.star || 0) + (k === 'disenchantment_in_deep_shadow' ? 40 : 0);   // 星電導ダメ+% (固有天賦30 + 武器 + 影に沈む幻40)
      const COEF = 1.6, SP = { N3: 0.6, N5: 0.8, C: 1.0 };
      const star = (talent, sp, c1) => COEF * atk * talent * sp * (1 + emBonus + (starBase + (c1 ? 50 : 0)) / 100);   // 1凸の+50%は星電導ダメ+%の足し算の中
      const normalHits = atk * (NH[0] + NH[1] + NH[3]) * nBr;      // N1・N2・N4
      let t = 0, st = 0;
      for (let i = 0; i < 4; i++) {
        t += normalHits;
        st += star(NH[2], SP.N3, 0) + star(NH[4], SP.N5, i > 0) + star(C, SP.C, 1);   // 最初のN5だけ+50%なし / 重撃は常に+50%
      }
      t += atk * (NH[0] + NH[1]) * nBr;   // 最後のN3 (N1・N2)
      st += star(NH[2], SP.N3, 0);        // 最後のN3 (星電導扱い)
      total = t; starPart = st;
      if (X) {
        const sf = (talent, sp, c1) => `1.6 × ${Math.round(atk)} × ${pc(talent)} × 特殊乗算 ${sp} × (1 + 熟知 ${(emBonus * 100).toFixed(1)}% + 星電導 ${starBase + (c1 ? 50 : 0)}%) × 会心 ${crit.toFixed(3)} × 耐性 0.9 (防御・ダメバフなし)`;
        const bn = cryo + nb, sd = v => v * crit * 0.90;
        for (let i = 0; i < 4; i++) {
          const g = `N5C ${i + 1}回目`;
          H(X, g, 'N1', atk * NH[0] * nBr * K0, nf(NH[0], bn));
          H(X, g, 'N2', atk * NH[1] * nBr * K0, nf(NH[1], bn));
          H(X, g, 'sN3 (星電導扱い)', sd(star(NH[2], SP.N3, 0)), sf(NH[2], SP.N3, 0));
          H(X, g, 'N4-1', atk * (NH[3] / 2) * nBr * K0, nf(NH[3] / 2, bn));
          H(X, g, 'N4-2', atk * (NH[3] / 2) * nBr * K0, nf(NH[3] / 2, bn));
          H(X, g, 'sN5 (星電導扱い)' + (i > 0 ? ' +50%' : ''), sd(star(NH[4], SP.N5, i > 0)), sf(NH[4], SP.N5, i > 0));
          H(X, g, 'sC (星電導扱い) +50%', sd(star(C, SP.C, 1)), sf(C, SP.C, 1));
        }
        H(X, 'N3 (締め)', 'N1', atk * NH[0] * nBr * K0, nf(NH[0], bn));
        H(X, 'N3 (締め)', 'N2', atk * NH[1] * nBr * K0, nf(NH[1], bn));
        H(X, 'N3 (締め)', 'sN3 (星電導扱い)', sd(star(NH[2], SP.N3, 0)), sf(NH[2], SP.N3, 0));
      }
    } else {
      // N5C×4 + N3 (凍結): 重撃は常に強化重撃(+200%) / しめ縄4は最初のN5C×3まで (4回目のN5Cと最後のN3には乗らない)
      const n5c = shim => {
        const sb = shimSet && shim ? 50 : 0;
        return atk * ((NH[0] + NH[1] + NH[2] + NH[3] + NH[4]) * (1 + (cryo + nb + sb) / 100) + C * (1 + (cryo + cb + sb + 200) / 100));
      };
      total = 3 * n5c(1) + n5c(0) + atk * (NH[0] + NH[1] + NH[2]) * (1 + (cryo + nb) / 100);
      if (X) {
        for (let i = 0; i < 4; i++) {
          const sb = shimSet && i < 3 ? 50 : 0, bn = cryo + nb + sb, bc = cryo + cb + sb + 200;
          const g = `N5C ${i + 1}回目` + (shimSet ? (sb ? ' (しめ縄4あり)' : ' (しめ縄4なし)') : '');
          H(X, g, 'N1', atk * NH[0] * (1 + bn / 100) * K0, nf(NH[0], bn));
          H(X, g, 'N2', atk * NH[1] * (1 + bn / 100) * K0, nf(NH[1], bn));
          H(X, g, 'N3', atk * NH[2] * (1 + bn / 100) * K0, nf(NH[2], bn));
          H(X, g, 'N4-1', atk * (NH[3] / 2) * (1 + bn / 100) * K0, nf(NH[3] / 2, bn));
          H(X, g, 'N4-2', atk * (NH[3] / 2) * (1 + bn / 100) * K0, nf(NH[3] / 2, bn));
          H(X, g, 'N5', atk * NH[4] * (1 + bn / 100) * K0, nf(NH[4], bn));
          H(X, g, 'C (強化重撃)', atk * C * (1 + bc / 100) * K0, nf(C, bc) + '  ※強化重撃 +200% を含む');
        }
        const bn = cryo + nb;
        H(X, 'N3 (締め)', 'N1', atk * NH[0] * (1 + bn / 100) * K0, nf(NH[0], bn));
        H(X, 'N3 (締め)', 'N2', atk * NH[1] * (1 + bn / 100) * K0, nf(NH[1], bn));
        H(X, 'N3 (締め)', 'N3', atk * NH[2] * (1 + bn / 100) * K0, nf(NH[2], bn));
      }
    }
    const damage = Math.round((total * 0.5 + starPart) * crit * 0.90);   // 防御0.5は通常の氷ダメのみ(星電導扱いは防御なし) / 氷耐性10%
    if (X) {
      putSum(X, 'em', '元素熟知', '', em, E);
      putMul(X, 'atk', '攻撃力', [['キャラ基礎攻撃力', this.base.atk], ['武器の基礎攻撃力', w.atk]], AP, [['羽の攻撃力 (固定)', 311], ['サブステ 攻撃実数値 (固定2ロール)', s.atkFlat]], atk);
      putSum(X, 'cr', '会心率', '%', cr, CRp, crRaw > 100 ? '(上限100%で頭打ち)' : '');
      putSum(X, 'cd', '会心ダメージ', '%', cd, CDp);
      putSum(X, 'elem', '元素バフ (氷ダメ)', '%', cryo, EB, w.fp ? `(命の契約: 最大HP ${Math.round(maxHp)} × ${w.fp.ratio * 100}% = ${Math.round(w.fp.ratio * maxHp)} → ${Math.floor((w.fp.ratio * maxHp) / 1000)}区切り × ${w.fp.per}% 、上限${w.fp.cap}%)` : '');
      putSum(X, 'nb', '通常・重撃ダメ+%', '%', nb, [['ファントムハンター2セット (通常・重撃)', common], ['武器: 通常攻撃', w.nBonus || 0]].filter(l => l[1]), `(通常の氷ダメージ N1・N2・N4 などにだけ乗る。重撃は ${cb.toFixed(1)}% = ファントムハンター ${common}% + 武器の重撃 ${w.cBonus || 0}%)`);
      if (pt.combo === 'n5c4n3_star') putSum(X, 'star', '星電導ダメ+%', '%', starBase, [['固有天賦', 30], ['武器', w.star || 0], ['影に沈む幻4', k === 'disenchantment_in_deep_shadow' ? 40 : 0]].filter(l => l[1]), '(星電導扱いの攻撃 sN3・sN5・sC にだけ乗る。1凸「輝映」+50% は 2回目以降のN5と、すべての重撃に加算)');
    }
    return { damage, em, atk, cr, cd, buff: cryo + nb, elemBuff: cryo };
  }
});
})();
