from django.urls import path

from .views import (
    QuizAnswerCreateView,
    QuizAttemptDetailView,
    QuizAttemptListCreateView,
    QuizAttemptSubmitView,
    QuizDetailView,
    QuizListCreateView,
)

app_name = "quiz"

urlpatterns = [
    path("courses/<int:course_pk>/quizzes/", QuizListCreateView.as_view(), name="quiz-list-create"),
    path("courses/<int:course_pk>/quizzes/<int:pk>/", QuizDetailView.as_view(), name="quiz-detail"),
    path("courses/<int:course_pk>/quizzes/<int:quiz_pk>/attempts/", QuizAttemptListCreateView.as_view(), name="quiz-attempt-list-create"),
    path("courses/<int:course_pk>/quizzes/<int:quiz_pk>/attempts/<int:pk>/", QuizAttemptDetailView.as_view(), name="quiz-attempt-detail"),
    path("courses/<int:course_pk>/quizzes/<int:quiz_pk>/attempts/<int:attempt_pk>/questions/<int:question_pk>/answer/",QuizAnswerCreateView.as_view(),name="quiz-answer-create",),
    path("courses/<int:course_pk>/quizzes/<int:quiz_pk>/attempts/<int:pk>/submit/",QuizAttemptSubmitView.as_view(),name="quiz-attempt-submit",),

]
