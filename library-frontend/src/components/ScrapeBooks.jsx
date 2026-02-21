import React, { useState } from "react";
import API from "../api";

const categories = [
  "Travel","Mystery","Historical Fiction","Classics",
  "Philosophy","Romance","Music","Art",
  "Science Fiction","Sports"
];

function ScrapeBooks({ refresh }) {
  const [category, setCategory] = useState("Travel");

  const handleScrape = async () => {
    await API.post("scrape/", { category });
    alert("Scraping completed!");
    refresh();
  };

  return (
    <div>
      <h3>Scrape Books</h3>
      <select onChange={(e)=>setCategory(e.target.value)}>
        {categories.map((cat)=>(
          <option key={cat}>{cat}</option>
        ))}
      </select>
      <button onClick={handleScrape}>Scrape</button>
    </div>
  );
}

export default ScrapeBooks;