import HeroSection from "../components/HeroSection";
import HomeAttentionPanel from "../components/HomeAttentionPanel";
import HomeChartPanel from "../components/HomeChartPanel";
import HomeOverviewPanel from "../components/HomeOverviewPanel";
import MetricsGrid from "../components/MetricsGrid";
import TransactionsTable from "../components/TransactionsTable";

function HomePage({
  budgetTarget,
  categoryBreakdown,
  categoryBudgetSummaries,
  financials,
  monthlyTrend,
  recentTransactions,
  userEmail,
}) {
  return (
    <>
      <HeroSection budgetTarget={budgetTarget} financials={financials} userEmail={userEmail} />

      <MetricsGrid financials={financials} />

      <section className="home-dashboard-grid">
        <HomeAttentionPanel
          categoryBudgetSummaries={categoryBudgetSummaries}
          financials={financials}
          recentTransactions={recentTransactions}
        />
        <HomeOverviewPanel budgetTarget={budgetTarget} financials={financials} />
      </section>

      <HomeChartPanel
        budgetTarget={budgetTarget}
        categoryBreakdown={categoryBreakdown}
        financials={financials}
        monthlyTrend={monthlyTrend}
      />

      <TransactionsTable
        transactions={recentTransactions.slice(0, 6)}
        title="Recent transactions"
        subtitle="Your latest saved activity. Open Transactions to search, edit, or review the full history."
        emptyMessage="Recent transactions will show up here as you add or import them."
        hideActions
      />
    </>
  );
}

export default HomePage;
