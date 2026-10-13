from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course
from quiz.models import Quiz, QuizAttempt, QuizOption, QuizQuestion

User = get_user_model()


class QuizAPITests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username="instructor",
            email="instructor@example.com",
            password="password123",
            role="instructor",
        )
        self.student = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="password123",
            role="student",
        )
        self.course = Course.objects.create(
            instructor=self.instructor,
            title="Test Python Course",
            description="Course description",
            price=0,
            status="published",
        )
        self.quiz = Quiz.objects.create(
            course=self.course,
            title="Python Basics Quiz",
            status="published",
        )
        self.question1 = QuizQuestion.objects.create(
            quiz=self.quiz,
            text="What is Python?",
            question_type="single_choice",
            order=1,
        )
        self.opt1_correct = QuizOption.objects.create(
            question=self.question1,
            text="A programming language",
            is_correct=True,
            order=1,
        )
        self.opt1_wrong = QuizOption.objects.create(
            question=self.question1,
            text="A snake only",
            is_correct=False,
            order=2,
        )

    def test_student_start_attempt_and_submit_quiz(self):
        self.client.force_authenticate(user=self.student)

        # 1. Start quiz attempt with empty POST body {}
        start_url = reverse(
            "quiz:quiz-attempt-list-create",
            kwargs={"course_pk": self.course.pk, "quiz_pk": self.quiz.pk},
        )
        response = self.client.post(start_url, {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        attempt_id = response.data["id"]
        self.assertEqual(response.data["status"], "in_progress")

        # 2. Submit answer to question 1 with selected_option
        answer_url = reverse(
            "quiz:quiz-answer-create",
            kwargs={
                "course_pk": self.course.pk,
                "quiz_pk": self.quiz.pk,
                "attempt_pk": attempt_id,
                "question_pk": self.question1.pk,
            },
        )
        answer_resp = self.client.post(
            answer_url,
            {"selected_option": self.opt1_correct.pk},
        )
        self.assertEqual(answer_resp.status_code, status.HTTP_201_CREATED)

        # Update answer (should not raise IntegrityError)
        answer_resp_2 = self.client.post(
            answer_url,
            {"selected_option": self.opt1_correct.pk},
        )
        self.assertEqual(answer_resp_2.status_code, status.HTTP_200_OK)

        # 3. Submit quiz attempt via HTTP POST
        submit_url = reverse(
            "quiz:quiz-attempt-submit",
            kwargs={
                "course_pk": self.course.pk,
                "quiz_pk": self.quiz.pk,
                "pk": attempt_id,
            },
        )
        submit_resp = self.client.post(submit_url, {})
        self.assertEqual(submit_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(submit_resp.data["status"], "submitted")
        self.assertEqual(float(submit_resp.data["score"]), 100.0)
