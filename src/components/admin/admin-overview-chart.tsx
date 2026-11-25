"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ActivityPoint = { label: string; evaluations: number; leads: number };

export function AdminOverviewChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-[250px] w-full" aria-label="Seven day evaluation and lead activity chart" role="img">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barGap={8}>
          <CartesianGrid vertical={false} stroke="#e7ebe6" strokeDasharray="4 4" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#7a8079", fontSize: 11, fontWeight: 600 }} dy={8} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#9aa099", fontSize: 10 }} />
          <Tooltip cursor={{ fill: "#f5f8f3" }} contentStyle={{ border: "1px solid #e4e5e2", borderRadius: 14, boxShadow: "0 8px 24px rgb(15 17 16 / 0.08)", fontSize: 12 }} labelStyle={{ color: "#0f1110", fontWeight: 700, marginBottom: 4 }} />
          <Bar dataKey="evaluations" name="Evaluations" fill="#bfe95e" radius={[5, 5, 0, 0]} maxBarSize={18} />
          <Bar dataKey="leads" name="Leads" fill="#9cbaf0" radius={[5, 5, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
