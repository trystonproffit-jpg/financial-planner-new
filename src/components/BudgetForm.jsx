import React, { useState } from "react";

function BudgetForm({ onAdd }) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount) return;

        onAdd({ description, amount: parseFloat(amount) });
        setDescription("");
        setAmount("");
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
            <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginRight: "0.5rem" }}
            />
        </form>
    )
}

export default BudgetForm;