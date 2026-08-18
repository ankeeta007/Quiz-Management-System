from django.db import models
from categories.models import Category


# =========================
# QUIZ
# =========================

class Quiz(models.Model):

    DIFFICULTY_CHOICES = [
        ("Easy", "Easy"),
        ("Medium", "Medium"),
        ("Hard", "Hard"),
    ]

    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Published", "Published"),
        ("Unpublished", "Unpublished"),
    ]

    title = models.CharField(max_length=200)

    description = models.TextField()

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default="Easy"
    )

    duration = models.PositiveIntegerField(
        help_text="Duration in minutes"
    )

    passing_percentage = models.PositiveIntegerField(
        default=60
    )

    max_attempts = models.PositiveIntegerField(
        default=1
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Draft"
    )

    thumbnail = models.ImageField(
        upload_to="quiz_thumbnails/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


# =========================
# QUESTION
# =========================

class Question(models.Model):

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="quiz_questions"
    )

    question_text = models.TextField()

    marks = models.PositiveIntegerField(
        default=1
    )

    explanation = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return self.question_text


# =========================
# OPTION
# =========================

class Option(models.Model):

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="options"
    )

    option_text = models.CharField(
        max_length=500
    )

    is_correct = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.option_text