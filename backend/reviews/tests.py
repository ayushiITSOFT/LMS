from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Course
from enrollment.models import Enrollment
from orders.models import Order
from reviews.models import CourseReview


class CourseReviewAPITests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username="teacher",
            email="teacher@example.com",
            password="pass",
            role=User.Role.INSTRUCTOR,
        )
        self.student = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="pass",
            role=User.Role.STUDENT,
        )
        self.other_student = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="pass",
            role=User.Role.STUDENT,
        )
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="pass",
            role=User.Role.ADMIN,
            is_staff=True,
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            category="Programming",
            title="Django Basics",
            status=Course.Status.PUBLISHED,
        )
        self.enrollment = self.enroll(self.student)

    def enroll(self, user):
        order = Order.objects.create(student=user, status=Order.Status.PAID)
        return Enrollment.objects.create(student=user, course=self.course, order=order)

    def review_list_url(self):
        return reverse("reviews:course-review-list-create", kwargs={"course_pk": self.course.pk})

    def review_detail_url(self, review):
        return reverse("reviews:course-review-detail", kwargs={"course_pk": self.course.pk, "pk": review.pk})

    def test_enrolled_student_can_create_review(self):
        self.client.force_authenticate(self.student)

        response = self.client.post(
            self.review_list_url(),
            {"rating": 5, "title": " Great ", "comment": " Helpful "},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        review = CourseReview.objects.get()
        self.assertEqual(review.student, self.student)
        self.assertEqual(review.course, self.course)
        self.assertEqual(review.enrollment, self.enrollment)
        self.assertEqual(review.title, "Great")
        self.assertEqual(review.comment, "Helpful")

    def test_duplicate_review_is_rejected(self):
        CourseReview.objects.create(
            course=self.course,
            enrollment=self.enrollment,
            student=self.student,
            rating=4,
        )
        self.client.force_authenticate(self.student)

        response = self.client.post(self.review_list_url(), {"rating": 5}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CourseReview.objects.count(), 1)

    def test_unenrolled_student_cannot_create_review(self):
        self.client.force_authenticate(self.other_student)

        response = self.client.post(self.review_list_url(), {"rating": 5}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(CourseReview.objects.exists())

    def test_rating_must_be_between_one_and_five(self):
        self.client.force_authenticate(self.student)

        low_response = self.client.post(self.review_list_url(), {"rating": 0}, format="json")
        high_response = self.client.post(self.review_list_url(), {"rating": 6}, format="json")

        self.assertEqual(low_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(high_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(CourseReview.objects.exists())

    def test_list_and_detail_reviews(self):
        review = CourseReview.objects.create(
            course=self.course,
            enrollment=self.enrollment,
            student=self.student,
            rating=4,
            title="Solid",
        )
        self.client.force_authenticate(self.student)

        list_response = self.client.get(self.review_list_url())
        detail_response = self.client.get(self.review_detail_url(review))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data[0]["id"], review.id)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["id"], review.id)

    def test_instructor_and_admin_cannot_create_student_reviews(self):
        self.enroll(self.instructor)
        self.enroll(self.admin)

        self.client.force_authenticate(self.instructor)
        instructor_response = self.client.post(self.review_list_url(), {"rating": 5}, format="json")

        self.client.force_authenticate(self.admin)
        admin_response = self.client.post(self.review_list_url(), {"rating": 5}, format="json")

        self.assertEqual(instructor_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(admin_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(CourseReview.objects.exists())

    def test_course_discovery_average_rating_and_count(self):
        second_student = User.objects.create_user(
            username="second",
            email="second@example.com",
            password="pass",
            role=User.Role.STUDENT,
        )
        second_enrollment = self.enroll(second_student)
        CourseReview.objects.create(
            course=self.course,
            enrollment=self.enrollment,
            student=self.student,
            rating=5,
        )
        CourseReview.objects.create(
            course=self.course,
            enrollment=second_enrollment,
            student=second_student,
            rating=3,
        )

        response = self.client.get(reverse("courses:discover"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["average_rating"], 4.0)
        self.assertEqual(response.data["results"][0]["review_count"], 2)
