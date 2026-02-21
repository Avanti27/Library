import React, { useState } from "react";
import API from "../api";

function AddBookForm({ refresh }) {
  const [form, setForm] = useState({
    title: "",
    genre: "",
    price: "",
    description: "",
  });

  const handleSubmit = async () => {
    await API.post("books/", form);
    refresh();
  };

  return (
    <div>
      <h3>Add Book</h3>
      <input placeholder="Title" onChange={(e)=>setForm({...form, title:e.target.value})}/><br/>
      <input placeholder="Genre" onChange={(e)=>setForm({...form, genre:e.target.value})}/><br/>
      <input placeholder="Price" onChange={(e)=>setForm({...form, price:e.target.value})}/><br/>
      <input placeholder="Description" onChange={(e)=>setForm({...form, description:e.target.value})}/><br/>
      <button onClick={handleSubmit}>Add Book</button>
    </div>
  );
}

export default AddBookForm;