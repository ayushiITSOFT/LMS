from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from assignment.models import Assignment, AssignmentSubmission
from courses.models import Course
from enrollment.models import Enrollment
from notifications.models import Notification
from orders.models import Order


class AssignmentAPITests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username="teacher",
            email="teacher@example.com",
            password="pass",
            role=User.Role.INSTRUCTOR,
        )
        self.other_instructor = User.objects.create_user(
            username="otherteacher",
            email="otherteacher@example.com",
            password="pass",
            role=User.Role.INSTRUCTOR,
        )
        self.student = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="pass",
            role=User.Role.STUDENT,
        )
        self.unenrolled = User.objects.create_user(
            username="unenrolled",
            email="unenrolled@example.com",
            password="pass",
            role=User.Role.STUDENT,
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            category="Programming",
            title="Django Basics",
            status=Course.Status.PUBLISHED,
        )
        self.enroll(self.student)

    def enroll(self, student):
        order = Order.objects.create(student=student, status=Order.Status.PAID)
        return Enrollment.objects.create(student=student, course=self.course, order=order)

    def assignment_list_url(self):
        return reverse("assignment:assignment-list-create", kwargs={"course_pk": self.course.pk})

    def assignment_detail_url(self, assignment):
        return reverse("assignment:assignment-detail", kwargs={"course_pk": self.course.pk, "pk": assignment.pk})

    def submission_list_url(self, assignment):
        return reverse(
            "assignment:submission-list-create",
            kwargs={"course_pk": self.course.pk, "assignment_pk": assignment.pk},
        )

    def submission_detail_url(self, submission):
        return reverse(
            "assignment:submission-detail",
            kwargs={
                "course_pk": self.course.pk,
                "assignment_pk": submission.assignment_id,
                "pk": submission.pk,
            },
        )

    def create_assignment(self, status_value=Assignment.Status.PUBLISHED):
        return Assignment.objects.create(
            course=self.course,
            title="Essay",
            due_date=timezone.now(),
            status=status_value,
            max_score=100,
        )

    def test_instructor_can_create_view_update_and_publish_assignment(self):
        self.client.force_authenticate(self.instructor)

        create_response = self.client.post(
            self.assignment_list_url(),
            {"title": " Draft Essay ", "max_score": 50, "status": Assignment.Status.DRAFT},
            format="json",
        )
        assignment = Assignment.objects.get(pk=create_response.data["id"])
        list_response = self.client.get(self.assignment_list_url())
        detail_response = self.client.get(self.assignment_detail_url(assignment))
        update_response = self.client.patch(
            self.assignment_detail_url(assignment),
            {"title": "Published Essay", "status": Assignment.Status.PUBLISHED},
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        assignment.refresh_from_db()
        self.assertEqual(assignment.title, "Published Essay")
        self.assertEqual(assignment.status, Assignment.Status.PUBLISHED)

    def test_student_sees_only_published_assignments_for_enrolled_course(self):
        published = self.create_assignment(Assignment.Status.PUBLISHED)
        self.create_assignment(Assignment.Status.DRAFT)
        self.client.force_authenticate(self.student)

        response = self.client.get(self.assignment_list_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [published.id])

    def test_unenrolled_student_cannot_access_assignment(self):
        assignment = self.create_assignment()
        self.client.force_authenticate(self.unenrolled)

        list_response = self.client.get(self.assignment_list_url())
        detail_response = self.client.get(self.assignment_detail_url(assignment))
        submissions_response = self.client.get(self.submission_list_url(assignment))
        submit_response = self.client.post(self.submission_list_url(assignment), {"content": "Nope"}, format="json")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data, [])
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(submissions_response.status_code, status.HTTP_200_OK)
        self.assertEqual(submissions_response.data, [])
        self.assertEqual(submit_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_can_submit_and_view_own_submission(self):
        assignment = self.create_assignment()
        self.client.force_authenticate(self.student)

        create_response = self.client.post(self.submission_list_url(assignment), {"content": " My work "}, format="json")
        submission = AssignmentSubmission.objects.get()
        detail_response = self.client.get(self.submission_detail_url(submission))

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(submission.content, "My work")
        self.assertEqual(submission.status, AssignmentSubmission.Status.SUBMITTED)

    def test_duplicate_blank_and_draft_submissions_are_rejected(self):
        assignment = self.create_assignment()
        draft_assignment = self.create_assignment(Assignment.Status.DRAFT)
        AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            content="Done",
            status=AssignmentSubmission.Status.SUBMITTED,
        )
        self.client.force_authenticate(self.student)

        duplicate_response = self.client.post(self.submission_list_url(assignment), {"content": "Again"}, format="json")
        blank_response = self.client.post(self.submission_list_url(draft_assignment), {"content": "   "}, format="json")
        draft_response = self.client.post(self.submission_list_url(draft_assignment), {"content": "Ready"}, format="json")

        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(blank_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(draft_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_instructor_can_view_and_grade_submissions(self):
        assignment = self.create_assignment()
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            content="Done",
            status=AssignmentSubmission.Status.SUBMITTED,
        )
        self.client.force_authenticate(self.instructor)

        list_response = self.client.get(self.submission_list_url(assignment))
        grade_response = self.client.patch(
            self.submission_detail_url(submission),
            {"score": 88, "feedback": "Good"},
            format="json",
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data[0]["id"], submission.id)
        self.assertEqual(grade_response.status_code, status.HTTP_200_OK)
        submission.refresh_from_db()
        self.assertEqual(submission.score, 88)
        self.assertEqual(submission.feedback, "Good")
        self.assertEqual(submission.status, AssignmentSubmission.Status.GRADED)

    def test_students_cannot_grade_and_instructors_cannot_submit(self):
        assignment = self.create_assignment()
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            content="Done",
            status=AssignmentSubmission.Status.SUBMITTED,
        )

        self.client.force_authenticate(self.student)
        grade_response = self.client.patch(self.submission_detail_url(submission), {"score": 90}, format="json")

        self.client.force_authenticate(self.instructor)
        submit_response = self.client.post(self.submission_list_url(assignment), {"content": "Instructor work"}, format="json")

        self.assertEqual(grade_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(submit_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_instructor_cannot_manage_course_assignments(self):
        assignment = self.create_assignment()
        self.client.force_authenticate(self.other_instructor)

        list_response = self.client.get(self.assignment_list_url())
        update_response = self.client.patch(self.assignment_detail_url(assignment), {"title": "Nope"}, format="json")

        self.assertEqual(list_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assignment_notifications_work_without_duplicates(self):
        self.client.force_authenticate(self.instructor)

        create_response = self.client.post(
            self.assignment_list_url(),
            {"title": "Notify Me", "status": Assignment.Status.DRAFT},
            format="json",
        )
        assignment = Assignment.objects.get(pk=create_response.data["id"])
        self.assertFalse(
            Notification.objects.filter(
                recipient=self.student,
                verb=Notification.Type.ASSIGNMENT_DUE,
                target_object_id=assignment.id,
            ).exists()
        )
        self.client.patch(self.assignment_detail_url(assignment), {"status": Assignment.Status.PUBLISHED}, format="json")
        assignment.save()
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            content="Done",
            status=AssignmentSubmission.Status.SUBMITTED,
        )
        self.client.patch(self.submission_detail_url(submission), {"score": 70}, format="json")
        self.client.patch(self.submission_detail_url(submission), {"score": 75}, format="json")

        self.assertEqual(
            Notification.objects.filter(recipient=self.student, verb=Notification.Type.ASSIGNMENT_DUE).count(),
            1,
        )
        self.assertEqual(
            Notification.objects.filter(recipient=self.student, verb=Notification.Type.ASSIGNMENT_GRADED).count(),
            1,
        )
