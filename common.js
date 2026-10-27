// 共通エンジン: 武器 × 聖遺物セット × メインステ を総当たりし、各組み合わせでサブステ割り振りを総当たりして最大値を探す
(function (g) {
  const SUB = { atk: 4.96, hp: 4.96, em: 19.82, cr: 3.31, cd: 6.62 }; // 1ロール(平均)あたりの上昇値 (割り振り対象のステ用)
  // KQM基準: 全サブステに2ロールずつ (実数値も含む)。1ロールあたり: 防御%=6.2 防御=19.68 HP=253.94 HP%=4.96 攻撃=16.54 攻撃%=4.96 チャージ=5.51 熟知=19.82 会心率=3.31 会心ダメ=6.62
  const SUBV = { defPct: 6.2, defFlat: 19.68, hpFlat: 253.94, hpPct: 4.96, atkFlat: 16.54, atkPct: 4.96, er: 5.51, em: 19.82, cr: 3.31, cd: 6.62 };
  const ER_ROLL = 5.51;                                      // チャージ効率1ロール
  const BASE_SUB = 2;                                        // 各サブステ初期ロール(固定)

  // そのパーティで使える候補 (パーティ側に weaponKeys / setKeys / clocks / cups / circlets があれば上書き。武器側の clocks / cups / circlets はさらに優先)
  // サブステの合計値 s を作る (全ステ 2ロール + 割り振り + チャージロール)。calc は ctx.s を参照する
  function fillSub(s, rolls, erRolls) {
    const B = BASE_SUB;
    s.atkPct = SUBV.atkPct * (B + (rolls.atk || 0));  s.atkFlat = SUBV.atkFlat * B;
    s.hpPct  = SUBV.hpPct  * (B + (rolls.hp  || 0));  s.hpFlat  = SUBV.hpFlat  * B;
    s.defPct = SUBV.defPct * (B + (rolls.def || 0));  s.defFlat = SUBV.defFlat * B;
    s.er = SUBV.er * (B + erRolls + (rolls.er || 0));
    s.em = SUBV.em * (B + (rolls.em || 0));
    s.cr = SUBV.cr * (B + (rolls.cr || 0));
    s.cd = SUBV.cd * (B + (rolls.cd || 0));
  }

  function avail(ch, partyKey) {
    const pt = (ch.parties || []).find(p => p.key === partyKey) || {};
    return {
      weapons: Object.entries(ch.weapons).filter(([k]) => !pt.weaponKeys || pt.weaponKeys.includes(k)),
      sets: ch.sets.filter(s => !pt.setKeys || pt.setKeys.includes(s.key)),
      clocks: pt.clocks || ch.clocks, cups: pt.cups || ch.cups, circlets: pt.circlets || ch.circlets
    };
  }

  function optimize(ch, o) {
    const budget = Math.max(0, o.rolls - o.erRolls);         // チャージロールは必ず消費
    const stats = ch.subStats;                               // 例 ['em','cr','cd'] (最後のステが残りを受け取る)
    const out = [], A = avail(ch, o.party);
    for (const [wk, w] of A.weapons)
      for (const set of A.sets)
        for (const clock of (w.clocks || A.clocks)) for (const cup of (w.cups || A.cups)) for (const circlet of (w.circlets || A.circlets)) {   // 武器側の指定があれば優先
          const mains = [clock.stat, cup.stat, circlet.stat];
          mains.c = {};                                   // メインステの個数 (calc 側は mains.c[stat] で参照: 計算のたびに数え直さない)
          for (const m of mains) mains.c[m] = (mains.c[m] || 0) + 1;
          const caps = {};
          for (const s of stats) caps[s] = Math.max(0, budget - (mains.c[s] || 0) * 4 - BASE_SUB);
          const rolls = {}; let best = null;
          const sub = {};
          const ctx = { weapon: w, set, mains, rolls, party: o.party, erRolls: o.erRolls, s: sub };   // 1組み合わせにつき1つ (rolls は使い回す)
          const ev = () => {
            fillSub(sub, rolls, o.erRolls);
            const r = ch.calc(ctx);
            if (r.er == null) r.er = 100 + sub.er;          // チャージ効率: calc が返さなければ 100% + サブステ分
            // CV用: 冠のメインステ + サブステ合計 のみ (初期値5%/50%・武器・突破・共鳴・天賦の会心は含めない。サブステには固定2ロールを含む)
            r.cvCr = 31.1 * (mains.c.cr || 0) + sub.cr;
            r.cvCd = 62.2 * (mains.c.cd || 0) + sub.cd;
            if (!best || r.damage > best.damage) best = Object.assign({}, r, { rolls: Object.assign({}, rolls) });
          };
          const rec = (i, rem) => {
            const s = stats[i];
            if (i === stats.length - 1) { if (rem > caps[s]) return; rolls[s] = rem; ev(); return; }
            for (let r = 0; r <= Math.min(rem, caps[s]); r++) { rolls[s] = r; rec(i + 1, rem - r); }
          };
          rec(0, budget);
          if (best) out.push(Object.assign(best, {
            weaponKey: wk, weaponName: w.name, setKey: set.key, setName: set.name,
            mainNames: `${clock.name} / ${cup.name} / ${circlet.name}`, caps
          }));
        }
    return out.sort((a, b) => b.damage - a.damage);
  }
  g.Engine = { version: 3, optimize, avail, SUB, SUBV, ER_ROLL, BASE_SUB };   // version: 2 = KQM基準(全サブステ2ロール / calc に s を渡す) / 3 = CV用の cvCr・cvCd を返す
  if (typeof module !== 'undefined') module.exports = g.Engine;
})(globalThis);
