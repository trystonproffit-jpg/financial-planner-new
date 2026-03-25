import React from "react";

function ExpenseItem({ item }) {
  return (
    <li>
      {item.description}: ${item.amount.toFixed(2)}
    </li>
  );
}

export default ExpenseItem;