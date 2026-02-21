from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Book


class ScraperTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()

        self.admin = self.User.objects.create_user(
            username="admin_test",
            password="admin123",
            role="admin"
        )

    def test_scrape_travel_category(self):
        self.client.force_authenticate(user=self.admin)

        initial_count = Book.objects.count()

        response = self.client.post(
            "/api/scrape_books/",
            {"category": "travel"},
            format="json"
        )

        # Status check
        self.assertEqual(response.status_code, 200)

        # Response structure
        self.assertIn("books_added", response.data)

        # Ensure at least 1 book added
        self.assertGreater(
            Book.objects.count(),
            initial_count
        )