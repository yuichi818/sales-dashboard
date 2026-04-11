import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* ─── SVG color map（Tailwind は SVG stroke を動的に制御できないため） ── */
const SV = {
  track:   "#334155",
  emerald: "#34d399",
  amber:   "#fbbf24",
  rose:    "#fb7185",
  text:    "#f1f5f9",
  muted:   "#94a3b8",
  indigo:  "#818cf8",
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const toRad  = (d: number) => (d * Math.PI) / 180;
const yen    = (n: number) => `¥${n.toLocaleString()}万`;
const pctOf  = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;
const diffOf = (a: number, b: number) => {
  const v = +((a / b) * 100 - 100).toFixed(1);
  return v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`;
};
const isPos  = (s: string) => s.startsWith("+");
const posCls = (d: string) => isPos(d) ? "text-emerald-400" : "text-rose-400";

/* ─── Data ────────────────────────────────────────────────────── */
type Row = { month: string; target: number; actual: number | null; lastYear: number };

const HALF_MONTHLY: Row[] = [
  { month: "4月", target: 5000, actual: 4800, lastYear: 4500 },
  { month: "5月", target: 5000, actual: 5200, lastYear: 4800 },
  { month: "6月", target: 5500, actual: 5100, lastYear: 5000 },
  { month: "7月", target: 5500, actual: 5800, lastYear: 5200 },
  { month: "8月", target: 5000, actual: 4900, lastYear: 4700 },
  { month: "9月", target: 6000, actual: 5600, lastYear: 5500 },
];

const S = {
  monthTarget:    6_500,
  monthActual:    6_100,
  lastYearActual: 6_000,
  halfTarget:    35_000,
  halfActual:    33_200,
  dealCount:         48,
  prevDealCount:     45,
};

/* ─── Gauge ────────────────────────────────────────────────────── */
function Gauge({ value, max }: { value: number; max: number }) {
  const ratio = Math.min(Math.max(value / max, 0.001), 0.9999);
  const R = 76, cx = 110, cy = 98, sw = 14;
  const bgD  = `M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy}`;
  const θ    = 180 + ratio * 180;
  const valD = `M ${cx - R} ${cy} A ${R} ${R} 0 ${ratio > 0.5 ? 1 : 0} 1 ${
    cx + R * Math.cos(toRad(θ))} ${cy + R * Math.sin(toRad(θ))}`;
  const color = ratio >= 1 ? SV.emerald : ratio >= 0.9 ? SV.amber : SV.rose;

  return (
    <svg viewBox="0 0 220 112" className="w-full max-w-[240px]">
      <path d={bgD}  fill="none" stroke={SV.track} strokeWidth={sw} strokeLinecap="round" />
      <path d={valD} fill="none" stroke={color}    strokeWidth={sw} strokeLinecap="round" />
      <text x={cx} y={cy - 12} textAnchor="middle"
        fill={SV.text} fontSize={26} fontWeight="bold" fontFamily="Inter,sans-serif">
        {pctOf(value, max)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle"
        fill={SV.muted} fontSize={11} fontFamily="Inter,sans-serif">
        {yen(value)} / {yen(max)}
      </text>
      <text x={cx - R - 2} y={cy + 22} textAnchor="middle"
        fill={SV.muted} fontSize={9} fontFamily="Inter,sans-serif">0%</text>
      <text x={cx + R + 2} y={cy + 22} textAnchor="middle"
        fill={SV.muted} fontSize={9} fontFamily="Inter,sans-serif">100%</text>
    </svg>
  );
}

/* ─── KPI Card（実績を主役にした大カード） ─────────────────────── */
function Kpi({
  label, value, sub, primary = false,
}: {
  label: string; value: string; sub?: string; primary?: boolean;
}) {
  return (
    <div className={[
      "rounded-xl p-4 min-w-[120px]",
      primary
        ? "flex-[2_1_160px] bg-blue-950 border border-blue-800 ring-1 ring-blue-700/40"
        : "flex-1 bg-slate-800 border border-slate-700",
    ].join(" ")}>
      <p className="text-slate-400 text-[10px] font-semibold tracking-widest uppercase">
        {label}
      </p>
      <p className={[
        "mt-1.5 font-bold leading-none text-slate-100",
        primary ? "text-[1.85rem]" : "text-2xl",
      ].join(" ")}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-slate-400 text-[11px]">{sub}</p>}
    </div>
  );
}

/* ─── Diff Card（対比%を主役にしたカード） ──────────────────────── */
function DiffCard({
  label, diff, note,
}: {
  label: string; diff: string; note?: string;
}) {
  const pos = isPos(diff);
  return (
    <div className="flex-1 min-w-[110px] bg-slate-800 border border-slate-700 rounded-xl p-4">
      <p className="text-slate-400 text-[10px] font-semibold tracking-widest uppercase">
        {label}
      </p>
      <p className={`mt-1.5 text-[1.85rem] font-bold leading-none ${posCls(diff)}`}>
        {diff}
      </p>
      {note && <p className="mt-1.5 text-slate-400 text-[11px]">{note}</p>}
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────── */
function Section({
  title, children,
}: {
  title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/60 rounded-2xl p-5 mb-4 backdrop-blur-sm">
      <p className="text-slate-500 text-[10px] font-bold tracking-[0.15em] uppercase mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Chart Tooltip ─────────────────────────────────────────────── */
function Tip({ active, payload, label }: {
  active?: boolean;
  payload?: { dataKey: string; name: string; color: string; value: number | null }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #334155",
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
    }}>
      <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#f1f5f9" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: {p.value != null ? `¥${p.value.toLocaleString()}万` : "—"}
        </p>
      ))}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────── */
export default function SalesDashboard() {
  const halfStats: [string, string, string][] = [
    ["目標",   yen(S.halfTarget),                   "text-slate-100"],
    ["実績",   yen(S.halfActual),                    "text-emerald-400"],
    ["達成率", pctOf(S.halfActual, S.halfTarget),   "text-sky-400"],
    ["残額",   yen(S.halfTarget - S.halfActual),     "text-rose-400"],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            売上進捗ダッシュボード
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            2025年11月 &nbsp;/&nbsp; 上半期: 2025年4〜9月
          </p>
        </div>
        <span className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400">
          最終更新: 2025/11/11
        </span>
      </div>

      {/* ════ 今月 ════ */}
      <Section title="今月">
        <div className="flex flex-wrap gap-3">
          <Kpi
            label="売上実績"
            value={yen(S.monthActual)}
            sub={`目標: ${yen(S.monthTarget)}`}
            primary
          />
          <DiffCard
            label="目標対比"
            diff={diffOf(S.monthActual, S.monthTarget)}
          />
          <DiffCard
            label="昨年比"
            diff={diffOf(S.monthActual, S.lastYearActual)}
            note={`昨年実績: ${yen(S.lastYearActual)}`}
          />
        </div>
      </Section>

      {/* ════ 上半期 ════ */}
      <Section title="上半期（4〜9月）">
        {/* KPIs */}
        <div className="flex flex-wrap gap-3 mb-5">
          <Kpi
            label="半期実績"
            value={yen(S.halfActual)}
            sub={`目標: ${yen(S.halfTarget)}`}
            primary
          />
          <DiffCard
            label="半期目標比"
            diff={diffOf(S.halfActual, S.halfTarget)}
          />
        </div>

        {/* グラフ row */}
        <div className="flex flex-wrap gap-4">

          {/* 月次推移: 目標=棒 / 実績=折れ線 / 昨年=折れ線点線 */}
          <div className="flex-[3_1_360px] bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold mb-3">月次推移</p>
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart
                data={HALF_MONTHLY}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<Tip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
                />
                {/* 目標 = 棒グラフ */}
                <Bar
                  dataKey="target" name="目標"
                  fill={SV.indigo} opacity={0.4}
                  radius={[4, 4, 0, 0]} maxBarSize={28}
                />
                {/* 実績 = 折れ線 */}
                <Line
                  dataKey="actual" name="実績"
                  stroke={SV.emerald} strokeWidth={2.5}
                  dot={{ fill: SV.emerald, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                {/* 昨年 = 折れ線点線 */}
                <Line
                  dataKey="lastYear" name="昨年"
                  stroke={SV.amber} strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 半期累積 達成メーター */}
          <div className="flex-[1_1_180px] bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center">
            <p className="self-start text-slate-400 text-xs font-semibold mb-1">
              半期累積 達成メーター
            </p>
            <Gauge value={S.halfActual} max={S.halfTarget} />
            <div className="w-full mt-3 space-y-2">
              {halfStats.map(([k, v, cls]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-400">{k}</span>
                  <span className={`font-semibold ${cls}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* ════ 件数 ════ */}
      <Section title="件数">
        <div className="flex flex-wrap gap-3">
          <Kpi
            label="今月件数"
            value={`${S.dealCount}件`}
            sub={`前月: ${S.prevDealCount}件`}
            primary
          />
          <DiffCard
            label="前月比"
            diff={diffOf(S.dealCount, S.prevDealCount)}
          />
          <div className="flex-[3]" />
        </div>
      </Section>

    </div>
  );
}
