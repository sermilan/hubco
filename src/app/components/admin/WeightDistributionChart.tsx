// ============ 权重分布图表组件 ============
// 用于 ClauseEditor 底部展示权重分布

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeightDistributionData {
  level: string;
  count: number;
  label: string;
  color: string;
}

interface WeightDistributionChartProps {
  clauses: Array<{
    weight?: number;
  }>;
  className?: string;
}

export function WeightDistributionChart({
  clauses,
  className = "",
}: WeightDistributionChartProps) {
  // 计算权重分布
  const distribution = React.useMemo(() => {
    const stats = {
      critical: 0, // >= 12
      high: 0,     // 9-11
      medium: 0,   // 6-8
      low: 0,      // <= 5
    };

    clauses.forEach((clause) => {
      const weight = clause.weight || 0;
      if (weight >= 12) {
        stats.critical++;
      } else if (weight >= 9) {
        stats.high++;
      } else if (weight >= 6) {
        stats.medium++;
      } else {
        stats.low++;
      }
    });

    const data: WeightDistributionData[] = [
      {
        level: "critical",
        count: stats.critical,
        label: "核心(≥12)",
        color: "#ef4444", // red-500
      },
      {
        level: "high",
        count: stats.high,
        label: "高(9-11)",
        color: "#f97316", // orange-500
      },
      {
        level: "medium",
        count: stats.medium,
        label: "中(6-8)",
        color: "#3b82f6", // blue-500
      },
      {
        level: "low",
        count: stats.low,
        label: "低(≤5)",
        color: "#6b7280", // gray-500
      },
    ];

    return data;
  }, [clauses]);

  const total = clauses.length;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800">权重分布</h4>
        <span className="text-xs text-slate-500">
          共 {total} 条条款
        </span>
      </div>

      {/* 图表 */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} layout="vertical">
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={70}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as WeightDistributionData;
                  const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : "0";
                  return (
                    <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded">
                      {data.label}: {data.count} 条 ({percentage}%)
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {distribution.map((item) => (
          <div
            key={item.level}
            className="text-center p-2 rounded-lg"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: item.color }}
            >
              {item.count}
            </div>
            <div className="text-xs text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeightDistributionChart;
