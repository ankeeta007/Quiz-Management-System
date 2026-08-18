from django.urls import path

from .views import (
    QuizListCreateView,
    QuizDetailView,
    QuestionListCreateView,
    QuestionDetailView,
)

urlpatterns = [
    # Quiz URLs
    path(
        "",
        QuizListCreateView.as_view(),
        name="quiz-list-create",
    ),

    path(
        "<int:pk>/",
        QuizDetailView.as_view(),
        name="quiz-detail",
    ),

    # Question URLs
    path(
        "<int:quiz_id>/questions/",
        QuestionListCreateView.as_view(),
        name="question-list-create",
    ),

    path(
        "<int:quiz_id>/questions/<int:pk>/",
        QuestionDetailView.as_view(),
        name="question-detail",
    ),
]