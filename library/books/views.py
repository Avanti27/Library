import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
logger = logging.getLogger('books')
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

################################## LOGIN API ############################################

@api_view(['POST'])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=400
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=401
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": user.role,
        "username": user.username,
        "user_id": user.id
    })

####################################### USERS APIS #################################################################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    try:
        if request.user.role != 'superadmin':
            return Response(
                {"error": "Only Super Admin can create users"},
                status=403
            )

        role = request.data.get("role")

        # Prevent creating another superadmin
        if role == "superadmin":
            return Response(
                {"error": "Cannot create another Super Admin"},
                status=400
            )

        if role not in ['admin', 'user']:
            return Response(
                {"error": "Role must be admin or user"},
                status=400
            )

        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "User creation failed"}, status=500)  



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    try:
        if request.user.role != 'superadmin':
            return Response({"error": "Permission denied"}, status=403)

        users = User.objects.all().order_by('-id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Something went wrong"}, status=500)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, id):
    try:
        if request.user.role != 'superadmin':
            return Response({"error": "Permission denied"}, status=403)

        user = User.objects.get(id=id)

        # Prevent changing role to superadmin
        if request.data.get("role") == "superadmin":
            return Response(
                {"error": "Cannot assign Super Admin role"},
                status=400
            )

        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Update failed"}, status=500)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, id):
    try:
        if request.user.role != 'superadmin':
            return Response(
                {"error": "Only Super Admin can delete users"},
                status=403
            )

        user = User.objects.get(id=id)

        # Prevent deleting self
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot delete yourself"},
                status=400
            )

        user.delete()

        return Response({"message": "User deleted successfully"})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Delete failed"}, status=500)
    


####################################### BOOKS APIS #################################################################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_books(request):
    try:
        category = request.GET.get('category')
        search = request.GET.get('search')

        books = Book.objects.all()

        if category:
            books = books.filter(genre=category)

        if search:
            books = books.filter(title__icontains=search)

        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Something went wrong"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_book(request):
    try:
        if request.user.role not in ['admin', 'superadmin']:
            return Response({"error": "Permission denied"}, status=403)

        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Failed to add book"}, status=500)
    



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_book(request, id):
    try:
        if request.user.role not in ['admin', 'superadmin']:
            return Response({"error": "Permission denied"}, status=403)

        book = Book.objects.get(id=id)
        serializer = BookSerializer(book, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=404)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Update failed"}, status=500)
    

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_book(request, id):
    try:
        if request.user.role != 'superadmin':
            return Response({"error": "Only Super Admin can delete"}, status=403)

        book = Book.objects.get(id=id)
        book.delete()

        return Response({"message": "Deleted successfully"})

    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=404)

    except Exception as e:
        logger.error(str(e))
        return Response({"error": "Delete failed"}, status=500)
    



##################### SCRAPING API ####################################################


CATEGORY_MAP = {
    "travel": "travel_2",
    "mystery": "mystery_3",
    "historical-fiction": "historical-fiction_4",
    "sequential-art": "sequential-art_5",
    "classics": "classics_6",
    "philosophy": "philosophy_7",
    "romance": "romance_8",
    "womens-fiction": "womens-fiction_9",
    "fiction": "fiction_10",
    "childrens": "childrens_11",
    "religion": "religion_12",
    "nonfiction": "nonfiction_13",
    "music": "music_14",
    "default": "default_15",
    "science": "science_22",
    "poetry": "poetry_23",
    "paranormal": "paranormal_24",
    "art": "art_25",
    "psychology": "psychology_26",
    "self-help": "self-help_41",
}

def convert_rating(rating_text):
    rating_map = {
        "One": 1,
        "Two": 2,
        "Three": 3,
        "Four": 4,
        "Five": 5,
    }
    return rating_map.get(rating_text, 0)


import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scrape_books(request):
    try:
        if request.user.role not in ['admin', 'superadmin']:
            return Response({"error": "Permission denied"}, status=403)

        category = request.data.get("category")

        if not category or category not in CATEGORY_MAP:
            return Response({"error": "Invalid category"}, status=400)

        category_slug = CATEGORY_MAP[category]
        base_url = f"http://books.toscrape.com/catalogue/category/books/{category_slug}/index.html"

        headers = {"User-Agent": "Mozilla/5.0"}
        page_url = base_url
        books_added = 0

        while page_url:
            response = requests.get(page_url, headers=headers)
            if response.status_code != 200:
                break

            soup = BeautifulSoup(response.text, "html.parser")
            books = soup.find_all("article", class_="product_pod")

            for book in books:
                try:
                    title = book.h3.a["title"]

                    price_text = book.find("p", class_="price_color").text
                    price = float(re.sub(r"[^\d.]", "", price_text))

                    rating_class = book.find("p", class_="star-rating")["class"]
                    rating = convert_rating(rating_class[1]) if len(rating_class) > 1 else 0

                    detail_url = urljoin(page_url, book.h3.a["href"])
                    detail_response = requests.get(detail_url, headers=headers)
                    detail_soup = BeautifulSoup(detail_response.text, "html.parser")

                    description = ""
                    description_tag = detail_soup.find("meta", attrs={"name": "description"})
                    if description_tag:
                        description = description_tag["content"].strip()

                    if not Book.objects.filter(title=title).exists():
                        Book.objects.create(
                            title=title,
                            genre=category,
                            price=price,
                            description=description,
                            rating=rating
                        )
                        books_added += 1

                except Exception as inner_error:
                    logger.error(f"Book scrape error: {inner_error}")
                    continue

            next_button = soup.find("li", class_="next")
            page_url = urljoin(page_url, next_button.a["href"]) if next_button else None

        return Response({
            "message": f"{category} scraping completed",
            "books_added": books_added
        })

    except Exception as e:
        logger.error(f"Scraper failed: {e}")
        return Response({"error": "Scraping failed"}, status=500) 
    


    
@api_view(['GET'])
def get_categories(request):
    return Response(list(CATEGORY_MAP.keys()))