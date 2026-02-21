import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  /* ================= FETCH ================= */

  const fetchBooks = async () => {
    const res = await API.get("books/");
    setBooks(res.data);
  };

  const fetchUsers = async () => {
    if (role === "superadmin") {
      const res = await API.get("users/");
      setUsers(res.data);
    }
  };

  const fetchCategories = async () => {
    const res = await API.get("categories/");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchBooks();
    fetchUsers();
    fetchCategories();
  }, []);

  /* ================= CRUD ================= */

  const handleBookSubmit = async () => {
    if (editingId) {
      await API.put(`books/update/${editingId}/`, formData);
    } else {
      await API.post("books/add/", formData);
    }
    closeModal();
    fetchBooks();
  };

  const deleteBook = async (id) => {
    if (window.confirm("Delete this book?")) {
      await API.delete(`books/delete/${id}/`);
      fetchBooks();
    }
  };

  const handleUserSubmit = async () => {
    if (editingId) {
      await API.put(`users/update/${editingId}/`, formData);
    } else {
      await API.post("users/create/", formData);
    }
    closeModal();
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      await API.delete(`users/delete/${id}/`);
      fetchUsers();
    }
  };

  const handleScrape = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    await API.post("scrape_books/", { category: selectedCategory });
    fetchBooks();
    setLoading(false);
    alert("Scraping completed!");
  };

  const openModal = (type, data = {}, id = null) => {
    setModalType(type);
    setFormData(data);
    setEditingId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white px-12 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Library Management
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {username}
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Books" value={books.length} />
        {role === "superadmin" && (
          <StatCard title="Total Users" value={users.length} />
        )}
        <StatCard title="Role" value={role.toUpperCase()} />
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <Tab
          label="Books"
          active={activeTab === "books"}
          onClick={() => setActiveTab("books")}
        />

        {role === "superadmin" && (
          <Tab
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
        )}

        {(role === "admin" || role === "superadmin") && (
          <Tab
            label="Scrape"
            active={activeTab === "scrape"}
            onClick={() => setActiveTab("scrape")}
          />
        )}
      </div>

      {/* BOOKS */}
      {activeTab === "books" && (
      <Section>

        {/* Add Book Button */}
        {(role === "admin" || role === "superadmin") && (
          <button
            onClick={() => openModal("book")}
            className="mb-6 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl font-semibold transition"
          >
            + Add Book
          </button>
        )}

        <ModernTable headers={["Title", "Genre", "Price", "Actions"]}>
          {books.map(book => (
            <tr key={book.id} className="hover:bg-gray-900 transition">
              <td className="px-6 py-5 font-medium">
                {book.title}
              </td>

              <td className="px-6 py-5 text-gray-400 capitalize">
                {book.genre}
              </td>

              <td className="px-6 py-5 text-indigo-400 font-semibold">
                ${book.price}
              </td>

              <td className="px-6 py-5">
                <div className="flex gap-3">

                  {/* USER → View only */}
                  {role === "user" && (
                    <span className="text-gray-500 text-sm">
                      View Only
                    </span>
                  )}

                  {/* ADMIN → Edit only */}
                  {role === "admin" && (
                    <button
                      onClick={() => openModal("book", book, book.id)}
                      className="px-4 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-black transition"
                    >
                      Edit
                    </button>
                  )}

                  {/* SUPERADMIN → Edit + Delete */}
                  {role === "superadmin" && (
                    <>
                      <button
                        onClick={() => openModal("book", book, book.id)}
                        className="px-4 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-black transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteBook(book.id)}
                        className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                      >
                        Delete
                      </button>
                    </>
                  )}

                </div>
              </td>
            </tr>
          ))}
        </ModernTable>

      </Section>
    )}
      

      {/* USERS */}
      {activeTab === "users" && role === "superadmin" && (
        <Section>
          <button
            onClick={() => openModal("user")}
            className="mb-6 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl font-semibold transition"
          >
            + Add User
          </button>

          <ModernTable headers={["Username", "Role", "Actions"]}>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-900 transition">
                <td className="px-6 py-5 font-medium">{user.username}</td>
                <td className="px-6 py-5 text-indigo-400 capitalize">{user.role}</td>
                <td className="px-6 py-5">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal("user", user, user.id)}
                      className="px-4 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-black transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </ModernTable>
        </Section>
      )}

      {/* SCRAPE */}
      {activeTab === "scrape" && (
        role === "admin" || role === "superadmin") && (
        <Section>
          <h2 className="text-2xl font-semibold mb-6">
            Scrape Books by Category
          </h2>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 p-4 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <button
            disabled={!selectedCategory || loading}
            onClick={handleScrape}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Scraping..." : "Start Scraping"}
          </button>
        </Section>
      )}

      {/* MODAL */}
      {showModal && (
        <Modal onClose={closeModal}>
          {modalType === "book" && (
            <BookForm formData={formData} setFormData={setFormData} onSubmit={handleBookSubmit} />
          )}
          {modalType === "user" && (
            <UserForm formData={formData} setFormData={setFormData} onSubmit={handleUserSubmit} />
          )}
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
    <p className="text-gray-400">{title}</p>
    <h3 className="text-3xl font-bold mt-2">{value}</h3>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-semibold transition ${
      active
        ? "bg-indigo-600"
        : "bg-gray-800 hover:bg-gray-700"
    }`}
  >
    {label}
  </button>
);

const Section = ({ children }) => (
  <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 shadow-2xl">
    {children}
  </div>
);

const ModernTable = ({ headers, children }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-800">
    <table className="w-full text-left">
      <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-4 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800">
        {children}
      </tbody>
    </table>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
    <div className="bg-gray-950 border border-gray-800 p-8 rounded-2xl w-96 shadow-2xl">
      <button onClick={onClose} className="text-red-500 mb-4">Close</button>
      {children}
    </div>
  </div>
);

const BookForm = ({ formData, setFormData, onSubmit }) => (
  <div className="space-y-4">
    <input placeholder="Title" value={formData.title || ""} onChange={e => setFormData({...formData, title:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800" />
    <input placeholder="Genre" value={formData.genre || ""} onChange={e => setFormData({...formData, genre:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800" />
    <input placeholder="Price" value={formData.price || ""} onChange={e => setFormData({...formData, price:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800" />
    <textarea placeholder="Description" value={formData.description || ""} onChange={e => setFormData({...formData, description:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800" />
    <button onClick={onSubmit} className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Submit</button>
  </div>
);

const UserForm = ({ formData, setFormData, onSubmit }) => (
  <div className="space-y-4">
    <input placeholder="Username" value={formData.username || ""} onChange={e => setFormData({...formData, username:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800" />
    <input type="password" placeholder="Password" value={formData.password || ""} onChange={e => setFormData({...formData, password:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800" />
    <select value={formData.role || "user"} onChange={e => setFormData({...formData, role:e.target.value})} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800">
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>
    <button onClick={onSubmit} className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Submit</button>
  </div>
);