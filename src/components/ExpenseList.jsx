import React from "react";
import ExpenseItem from "./ExpenseItem";

function ExpenseList({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <ExpenseItem key={index} item={item} />
      ))}
    </ul>
  );
}

export default ExpenseList;