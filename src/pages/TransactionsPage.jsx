import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransactionsTable from "../components/TransactionsTable";

function TransactionsPage({ onDelete, onEdit, transactions }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryOptions = useMemo(
    () => [...new Set(transactions.map((entry) => entry.category).filter(Boolean))].sort((left, right) => left.localeCompare(right)),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactions.filter((entry) => {
      const matchesSearch =
        !normalizedSearch
        || entry.description.toLowerCase().includes(normalizedSearch)
        || entry.source.toLowerCase().includes(normalizedSearch)
        || entry.notes.toLowerCase().includes(normalizedSearch);
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [categoryFilter, searchTerm, transactions, typeFilter]);

  function handleEditFromHistory(transaction) {
    onEdit(transaction);
    navigate("/import");
  }

  return (
    <>
      <section className="page-intro">
        <span className="eyebrow">Transactions</span>
        <h2 className="page-title">View the full saved history in one place.</h2>
        <p className="page-copy">
          Search, filter, edit, and clean up your saved transactions all from one place.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">History filters</h2>
            <p className="panel-subtitle">Narrow the transaction history by keyword, type, or category.</p>
          </div>
        </div>

        <div className="filters-grid">
          <label className="field">
            <span className="field-label">Search</span>
            <input
              className="field-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search description, source, or notes"
            />
          </label>

          <label className="field">
            <span className="field-label">Type</span>
            <select className="field-input" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Category</span>
            <select className="field-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <TransactionsTable
        transactions={filteredTransactions}
        onDelete={onDelete}
        onEdit={handleEditFromHistory}
        title="Full transaction history"
        subtitle="Every saved transaction is listed here for review, editing, and cleanup."
        emptyMessage="No saved transactions match the current filters."
      />
    </>
  );
}

export default TransactionsPage;
