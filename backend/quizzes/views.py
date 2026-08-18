from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Quiz
from questions.models import Question, Option

from .serializers import (
    QuizSerializer,
    QuestionSerializer,
    OptionSerializer
)
from accounts.permissions import IsAdminUserRole


# =========================================================
# QUIZ LIST + CREATE
# =========================================================

class QuizListCreateView(generics.ListCreateAPIView):

    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminUserRole()]

        return [AllowAny()]


# =========================================================
# QUIZ DETAIL
# =========================================================

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_permissions(self):

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUserRole()]

        return [AllowAny()]


# =========================================================
# QUESTION LIST + CREATE
# =========================================================

class QuestionListCreateView(generics.ListCreateAPIView):

    serializer_class = QuestionSerializer

    def get_queryset(self):

        quiz_id = self.kwargs.get("quiz_id")

        return Question.objects.filter(
            quiz_id=quiz_id
        )

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminUserRole()]

        return [AllowAny()]


# =========================================================
# QUESTION DETAIL
# =========================================================

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = QuestionSerializer

    def get_queryset(self):

        quiz_id = self.kwargs.get("quiz_id")

        return Question.objects.filter(
            quiz_id=quiz_id
        )

    def get_permissions(self):

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUserRole()]

        return [AllowAny()]