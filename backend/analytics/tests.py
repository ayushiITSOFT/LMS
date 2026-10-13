from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from assignment.models import Assignment, AssignmentSubmission
from courses.models import Course
from enrollment.models import Enrollment
from orders.models import Order, OrderItem
from quiz.models import Quiz, QuizAttempt


class PerformanceAnalyticsTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="test-password",
            role=User.Role.ADMIN,
        )
        self.instructor = User.objects.create_user(
            username="instructor",
            email="instructor@example.com",
            password="test-password",
            role=User.Role.INSTRUCTOR,
        )
        self.student = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="test-password",
            role=User.Role.STUDENT,
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            category="Programming",
            title="Analytics Test Course",
        )
        self.client.force_authenticate(self.admin)

    def test_quiz_performance_returns_submitted_attempt_aggregates(self):
        quiz = Quiz.objects.create(course=self.course, title="Test Quiz")
        QuizAttempt.objects.create(
            quiz=quiz,
            student=self.student,
            status=QuizAttempt.Status.SUBMITTED,
            score=82,
        )
        QuizAttempt.objects.create(
            quiz=quiz,
            student=self.student,
            status=QuizAttempt.Status.IN_PROGRESS,
            score=20,
        )

        response = self.client.get(reverse("analytics:quiz-performance"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_attempts"], 1)
        self.assertEqual(response.data["average_score"], 82)
        self.assertEqual(
            response.data["quizzes"][0],
            {
                "id": quiz.id,
                "title": quiz.title,
                "course_id": self.course.id,
                "attempts": 1,
                "average_score": 82,
            },
        )

    def test_assignment_performance_returns_submission_aggregates(self):
        assignment = Assignment.objects.create(course=self.course, title="Test Assignment")
        AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            status=AssignmentSubmission.Status.GRADED,
            score=90,
        )
        AssignmentSubmission.objects.create(
            assignment=assignment,
            student=User.objects.create_user(
                username="second-student",
                email="second-student@example.com",
                password="test-password",
                role=User.Role.STUDENT,
            ),
            status=AssignmentSubmission.Status.SUBMITTED,
        )
        AssignmentSubmission.objects.create(
            assignment=assignment,
            student=User.objects.create_user(
                username="third-student",
                email="third-student@example.com",
                password="test-password",
                role=User.Role.STUDENT,
            ),
            status=AssignmentSubmission.Status.DRAFT,
        )

        response = self.client.get(reverse("analytics:assignment-performance"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_submissions"], 2)
        self.assertEqual(response.data["graded_submissions"], 1)
        self.assertEqual(response.data["average_score"], 90)
        self.assertEqual(
            response.data["assignments"][0],
            {
                "id": assignment.id,
                "title": assignment.title,
                "course_id": self.course.id,
                "submissions": 2,
                "graded_submissions": 1,
                "average_score": 90,
            },
        )

    def test_instructor_can_view_analytics_for_own_courses_only(self):
        other_instructor = User.objects.create_user(
            username="other-instructor",
            email="other-instructor@example.com",
            password="test-password",
            role=User.Role.INSTRUCTOR,
        )
        other_course = Course.objects.create(
            instructor=other_instructor,
            category="Design",
            title="Other Instructor Course",
        )
        other_student = User.objects.create_user(
            username="other-student",
            email="other-student@example.com",
            password="test-password",
            role=User.Role.STUDENT,
        )
        Enrollment.objects.create(student=self.student, course=self.course)
        Enrollment.objects.create(student=other_student, course=other_course)

        order = Order.objects.create(
            student=self.student,
            status=Order.Status.PAID,
            total_amount="100.00",
        )
        OrderItem.objects.create(order=order, course=self.course, price="100.00")

        quiz = Quiz.objects.create(course=self.course, title="Instructor Quiz")
        other_quiz = Quiz.objects.create(course=other_course, title="Other Quiz")
        QuizAttempt.objects.create(
            quiz=quiz,
            student=self.student,
            status=QuizAttempt.Status.SUBMITTED,
            score=80,
        )
        QuizAttempt.objects.create(
            quiz=other_quiz,
            student=other_student,
            status=QuizAttempt.Status.SUBMITTED,
            score=60,
        )

        assignment = Assignment.objects.create(course=self.course, title="Instructor Assignment")
        other_assignment = Assignment.objects.create(course=other_course, title="Other Assignment")
        AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            status=AssignmentSubmission.Status.GRADED,
            score=90,
        )
        AssignmentSubmission.objects.create(
            assignment=other_assignment,
            student=other_student,
            status=AssignmentSubmission.Status.GRADED,
            score=70,
        )

        self.client.force_authenticate(self.instructor)
        paths = (
            "analytics:course-completion-rate",
            "analytics:enrollment-trends",
            "analytics:revenue-trends",
            "analytics:quiz-performance",
            "analytics:assignment-performance",
            "analytics:student-activity",
        )
        responses = {name: self.client.get(reverse(name)) for name in paths}

        for response in responses.values():
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            [row["course_id"] for row in responses["analytics:course-completion-rate"].data["courses"]],
            [self.course.id],
        )
        self.assertEqual(
            sum(row["enrollments"] for row in responses["analytics:enrollment-trends"].data["trends"]),
            1,
        )
        revenue_trends = responses["analytics:revenue-trends"].data["trends"]
        self.assertEqual(sum(float(row["revenue"]) for row in revenue_trends), 100.0)
        self.assertEqual(responses["analytics:quiz-performance"].data["total_attempts"], 1)
        self.assertEqual(
            [row["title"] for row in responses["analytics:quiz-performance"].data["quizzes"]],
            [quiz.title],
        )
        self.assertEqual(responses["analytics:assignment-performance"].data["total_submissions"], 1)
        self.assertEqual(
            [row["title"] for row in responses["analytics:assignment-performance"].data["assignments"]],
            [assignment.title],
        )
        activity = responses["analytics:student-activity"].data
        self.assertEqual(activity["total_enrollments"], 1)
        self.assertEqual(activity["quiz_attempts"], 1)
        self.assertEqual(activity["assignment_submissions"], 1)
        self.assertEqual(
            [row["course_id"] for row in activity["recent_enrollments"]],
            [self.course.id],
        )

    def test_student_cannot_view_analytics(self):
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse("analytics:student-activity"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
