from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from assignment.models import Assignment, AssignmentSubmission
from certificate.models import Certificate
from courses.models import Course, Lesson, Section
from enrollment.models import CourseProgress, Enrollment
from notifications.models import Notification
from orders.models import Order
from quiz.models import Quiz, QuizAttempt


class NotificationTests(APITestCase):
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
        self.course = Course.objects.create(
            instructor=self.instructor,
            category="Programming",
            title="Django Basics",
            status=Course.Status.PUBLISHED,
        )

    def enroll(self, student=None):
        student = student or self.student
        order = Order.objects.create(student=student, status=Order.Status.PAID)
        return Enrollment.objects.create(student=student, course=self.course, order=order)

    def test_list_returns_authenticated_users_notifications_only(self):
        mine = Notification.objects.create(recipient=self.student, verb=Notification.Type.GENERIC)
        Notification.objects.create(recipient=self.other_student, verb=Notification.Type.GENERIC)
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse("notifications:notifications-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [mine.id])

    def test_user_cannot_access_another_users_notification_detail(self):
        notification = Notification.objects.create(recipient=self.other_student, verb=Notification.Type.GENERIC)
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse("notifications:notifications-detail", kwargs={"pk": notification.pk}))
        mark_response = self.client.post(reverse("notifications:notifications-mark-read", kwargs={"pk": notification.pk}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(mark_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_read_and_mark_all_read_work(self):
        first = Notification.objects.create(recipient=self.student, verb=Notification.Type.GENERIC)
        second = Notification.objects.create(recipient=self.student, verb=Notification.Type.GENERIC)
        Notification.objects.create(recipient=self.other_student, verb=Notification.Type.GENERIC)
        self.client.force_authenticate(self.student)

        mark_one = self.client.post(reverse("notifications:notifications-mark-read", kwargs={"pk": first.pk}))
        mark_all = self.client.post(reverse("notifications:notifications-mark-all-read"))

        self.assertEqual(mark_one.status_code, status.HTTP_200_OK)
        self.assertEqual(mark_all.status_code, status.HTTP_200_OK)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertTrue(first.read)
        self.assertTrue(second.read)
        self.assertEqual(Notification.objects.filter(recipient=self.other_student, read=False).count(), 1)

    def test_enrollment_creates_notification(self):
        self.enroll()

        notification = Notification.objects.get(recipient=self.student, verb=Notification.Type.ENROLLMENT)
        self.assertEqual(notification.target, self.course)
        self.assertEqual(notification.data["course_title"], self.course.title)

    def test_course_completion_creates_one_notification(self):
        enrollment = self.enroll()
        section = Section.objects.create(course=self.course, title="Start")
        lesson = Lesson.objects.create(section=section, title="Intro")

        progress = CourseProgress.objects.create(enrollment=enrollment, lesson=lesson, completed=True)
        progress.save()

        self.assertEqual(
            Notification.objects.filter(
                recipient=self.student,
                verb=Notification.Type.COURSE_COMPLETION,
            ).count(),
            1,
        )

    def test_certificate_creation_creates_notification(self):
        enrollment = self.enroll()

        Certificate.objects.create(
            student=self.student,
            course=self.course,
            enrollment=enrollment,
            progress_percentage="100.00",
        )

        notification = Notification.objects.get(recipient=self.student, verb=Notification.Type.CERTIFICATE)
        self.assertEqual(notification.data["course_id"], self.course.id)

    def test_assignment_creation_notifies_enrolled_students_once(self):
        self.enroll()

        assignment = Assignment.objects.create(
            course=self.course,
            title="Essay",
            due_date=timezone.now(),
            status=Assignment.Status.PUBLISHED,
        )
        assignment.save()

        self.assertEqual(
            Notification.objects.filter(
                recipient=self.student,
                verb=Notification.Type.ASSIGNMENT_DUE,
                target_object_id=assignment.id,
            ).count(),
            1,
        )

    def test_assignment_grading_notifies_student_once(self):
        self.enroll()
        assignment = Assignment.objects.create(course=self.course, title="Essay")
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            status=AssignmentSubmission.Status.SUBMITTED,
        )

        submission.score = 80
        submission.status = AssignmentSubmission.Status.GRADED
        submission.save()
        submission.feedback = "Nice work"
        submission.save()

        self.assertEqual(
            Notification.objects.filter(
                recipient=self.student,
                verb=Notification.Type.ASSIGNMENT_GRADED,
                target_object_id=assignment.id,
            ).count(),
            1,
        )

    def test_quiz_result_notification_is_created_once_for_submitted_attempt(self):
        quiz = Quiz.objects.create(course=self.course, title="Quiz")
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=self.student,
            status=QuizAttempt.Status.SUBMITTED,
            score="75.00",
        )
        attempt.score = "90.00"
        attempt.save()

        self.assertEqual(
            Notification.objects.filter(
                recipient=self.student,
                verb=Notification.Type.QUIZ_RESULT,
                target_object_id=attempt.id,
            ).count(),
            1,
        )
