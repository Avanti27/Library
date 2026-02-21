from django.db import models
from django.contrib.auth.models import AbstractUser


# -----------------------------
# Custom User Model
# -----------------------------
class User(AbstractUser):

    ROLE_CHOICES = (
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# -----------------------------
# Book Model
# -----------------------------
class Book(models.Model):

    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    rating = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title