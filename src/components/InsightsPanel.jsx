function InsightsPanel({ insights }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">AI planner notes</h2>
          <p className="panel-subtitle">Short takeaways based on your current income and spending mix.</p>
        </div>
      </div>
      <div className="insight-list">
        {insights.map((insight) => (
          <div key={insight} className="insight-row">
            {insight}
          </div>
        ))}
      </div>
    </article>
  );
}

export default InsightsPanel;
