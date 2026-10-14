from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from courses.models import Course
from .models import CartItem


class CartCourseDetailsTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.instructor = user_model.objects.create_user(
            username="cart-instructor",
            email="cart-instructor@example.com",
            password="test-password",
            role="instructor",
        )
        self.student = user_model.objects.create_user(
            username="cart-student",
            email="cart-student@example.com",
            password="test-password",
            role="student",
        )
        self.course = Course.objects.create(
            category="Testing",
            title="Draft course retained in cart",
            price="24.50",
            status=Course.Status.DRAFT,
            instructor=self.instructor,
        )
        CartItem.objects.create(student=self.student, course=self.course)
        self.client = APIClient()
        self.client.force_authenticate(self.student)

    def test_cart_includes_course_details_even_when_course_is_not_published(self):
        response = self.client.get(reverse("cart:list-create"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data[0]["course_details"],
            {
                "id": self.course.id,
                "title": self.course.title,
                "category": self.course.category,
                "price": "24.50",
                "thumbnail": None,
                "status": Course.Status.DRAFT,
            },
        )
