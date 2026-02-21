from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *


# Register Custom User properly
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )


admin.site.register(Book)