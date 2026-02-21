from django.urls import path
from . import views

urlpatterns = [

    path('login/',views.login,name="login"),

    #################### USERS ###############################
    path('users/', views.get_users, name="get_users"),
    path('users/create/', views.create_user, name="create_user"),
    path('users/update/<int:id>/', views.update_user, name="update_user"),
    path('users/delete/<int:id>/', views.delete_user, name="delete_user"),


    #################### BOOKS ################################
    path('books/', views.get_books, name="get_books"),
    path('books/add/', views.add_book, name="add_book"),
    path('books/update/<int:id>/', views.update_book, name="update_book"),
    path('books/delete/<int:id>/', views.delete_book, name="delete_book"),


    #################### SCRAPING ############################
    path('scrape_books/', views.scrape_books, name="scrape_books"),

    path('categories/', views.get_categories, name="get_categories"),
]