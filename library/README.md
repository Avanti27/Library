# Book Library Management System

A full-stack Book Library Management System built using:

- 🔹 Django (Backend - REST APIs)
- 🔹 React + TailwindCSS (Frontend)
- 🔹 SQLite Database
- 🔹 JWT Authentication
- 🔹 Web Scraping using BeautifulSoup



## Project Description

This system allows managing books in a digital library with role-based access control.

The system also supports scraping book data from:
 http://books.toscrape.com/

Scraped data is stored in the local database.



##  User Roles & Permissions

| Role | Add | Edit | Delete | View | Manage Users | Scrape |
|------|------|------|--------|------|--------------|--------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| User | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

##  Test Login Credentials
SuperAdmin:
Username: superadmin
Password: Testing@123

Admin:
Username: admin
Password: Testing@123

User:
Username: avanti
Password: Testing@123





## Core Features

###  Books
- Add new books
- Update book details
- Delete books (Super Admin only)
- View all books
- Filter by category
- Search by title

###  Users (Super Admin Only)
- Create new users
- Assign role (admin/user)
- Update users
- Delete users

### Web Scraping
- Select category from dropdown
- Click "Scrape"
- Fetch book details:
  - Title
  - Genre
  - Price
  - Description
- Store in database



## Tech Stack

### Backend
- Django 5+
- Django REST Framework
- Simple JWT
- BeautifulSoup
- SQLite

### Frontend
- React
- TailwindCSS
- Axios


## Test Cases

### Authentication

1. Login with valid credentials → Success
2. Login with invalid password → Error message
3. Access dashboard without token → Redirect to login

### Books API

1. GET /api/books/ → Returns book list
2. POST /api/books/add/ (Admin) → Creates book
3. POST /api/books/add/ (User) → 403 Forbidden
4. PUT /api/books/update/:id → Updates book
5. DELETE /api/books/delete/:id (Super Admin only)


### User API

1. Super Admin creates user → Success
2. Admin tries to create user → 403 Forbidden
3. Cannot create another Super Admin
4. Role must be admin or user


### Scraping

1. Select category → Click Scrape → Books added
2. Scrape without category → Error
3. Scrape as user → Forbidden


