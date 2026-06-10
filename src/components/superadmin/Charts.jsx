import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatShort = (value) => {
  const number = Number(value || 0);
  if (number >= 100000) return `${(number / 100000).toFixed(1)}L`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k`;
  return number;
};

function Charts({ data = [], type = "bar", dataKey = "revenue", secondaryKey }) {
  return (
    <div className="sa-chart">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data} margin={{ top: 18, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={formatShort} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
            {secondaryKey ? <Line type="monotone" dataKey={secondaryKey} stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} /> : null}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 18, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={formatShort} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#0f766e" radius={[8, 8, 0, 0]} />
            {secondaryKey ? <Bar dataKey={secondaryKey} fill="#2563eb" radius={[8, 8, 0, 0]} /> : null}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default Charts;

