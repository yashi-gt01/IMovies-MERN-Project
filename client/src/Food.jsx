
import React, { useState } from "react";
import "./Food.css";

const foodItems = [
  { id: 1, name: "Popcorn", price: 120, emoji: "🍿" },
  { id: 2, name: "Nachos", price: 180, emoji: "🧀" },
  { id: 3, name: "Cold Drink", price: 80, emoji: "🥤" },
  { id: 4, name: "Burger", price: 150, emoji: "🍔" },
];

export default function Food() {
  const [cart, setCart] = useState({});

  const total = foodItems.reduce(
    (sum, item) => sum + item.price * (cart[item.id] || 0),
    0
  );

  return (
    <section className="food-page">
      <h2>Food & Drinks 🍿</h2>
      <div className="food-grid">
        {foodItems.map((item) => (
          <article className="food-card" key={item.id}>
            <div className="food-emoji">{item.emoji}</div>
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            <button
              onClick={() =>
                setCart((prev) => ({
                  ...prev,
                  [item.id]: (prev[item.id] || 0) + 1,
                }))
              }
            >
              Add to Cart {cart[item.id] ? `(${cart[item.id]})` : ""}
            </button>
          </article>
        ))}
      </div>
      <h3>Your Cart Total: ₹{total}</h3>
    </section>
  );
}
