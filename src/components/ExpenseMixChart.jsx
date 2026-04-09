import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { currencyFormatter } from "../lib/finance";

function ExpenseMixChart({ categoryBreakdown }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Expense mix</h2>
          <p className="panel-subtitle">Auto-categorized spending grouped for quick review.</p>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={3}>
              {categoryBreakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => currencyFormatter(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend-list">
        {categoryBreakdown.map((entry) => (
          <div key={entry.name} className="legend-row">
            <span className="legend-name">
              <span className="legend-swatch" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <strong>{currencyFormatter(entry.value)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export default ExpenseMixChart;
