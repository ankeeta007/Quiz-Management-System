from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Avg, Count, Max, Sum, Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from quizzes.models import Quiz
from questions.models import Question, Option
from attempts.models import Attempt, Answer

from attempts.serializers import AttemptSerializer


# =========================================================
# STUDENT DASHBOARD
# =========================================================

class StudentDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Get only completed attempts
        attempts = Attempt.objects.filter(
            student=request.user
        ).exclude(
            status="IN_PROGRESS"
        )

        # -------------------------------------------------
        # TOTAL QUIZZES ATTEMPTED
        # -------------------------------------------------

        total_attempts = attempts.count()

        # -------------------------------------------------
        # PASSED ATTEMPTS
        # -------------------------------------------------

        passed_attempts = attempts.filter(
            status="PASSED"
        ).count()

        # -------------------------------------------------
        # FAILED ATTEMPTS
        # -------------------------------------------------

        failed_attempts = attempts.filter(
            status="FAILED"
        ).count()

        # -------------------------------------------------
        # AVERAGE PERCENTAGE
        # -------------------------------------------------

        average_score = attempts.aggregate(
            average=Avg("percentage")
        )["average"] or 0

        # -------------------------------------------------
        # HIGHEST PERCENTAGE
        # -------------------------------------------------

        highest_score = attempts.aggregate(
            highest=Max("percentage")
        )["highest"] or 0

        # -------------------------------------------------
        # TOTAL QUESTIONS ANSWERED
        # -------------------------------------------------

        total_correct = attempts.aggregate(
            total=Sum("correct_answers")
        )["total"] or 0

        total_incorrect = attempts.aggregate(
            total=Sum("incorrect_answers")
        )["total"] or 0

        total_questions_answered = (
            total_correct + total_incorrect
        )

        # -------------------------------------------------
        # RECENT ATTEMPTS
        # Latest 5 attempts
        # -------------------------------------------------

        recent_attempts = (
            attempts
            .select_related("quiz")
            .order_by("-completed_at")[:5]
        )

        recent_data = []

        for attempt in recent_attempts:

            recent_data.append({
                "attempt_id": attempt.id,
                "quiz_id": attempt.quiz.id,
                "quiz_title": attempt.quiz.title,
                "score": attempt.score,
                "percentage": attempt.percentage,
                "status": attempt.status,
                "completed_at": attempt.completed_at,
            })

        # -------------------------------------------------
        # PERFORMANCE CHART DATA
        # Latest 10 attempts
        # -------------------------------------------------

        performance_attempts = list(
            attempts
            .select_related("quiz")
            .order_by("-completed_at")[:10]
        )

        # Reverse them so the chart displays
        # oldest -> newest
        performance_attempts.reverse()

        performance_data = []

        for attempt in performance_attempts:

            performance_data.append({
                "quiz_title": attempt.quiz.title,
                "percentage": float(
                    attempt.percentage
                ),
                "completed_at": attempt.completed_at,
            })

        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        return Response(
            {
                "total_quizzes_attempted": total_attempts,

                "total_quizzes_passed": passed_attempts,

                "total_quizzes_failed": failed_attempts,

                "average_score": round(
                    float(average_score),
                    2
                ),

                "highest_score": round(
                    float(highest_score),
                    2
                ),

                "total_questions_answered":
                    total_questions_answered,

                "recent_attempts": recent_data,

                "performance_data": performance_data,
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN ANALYTICS
# =========================================================

class AdminAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Only admins can access analytics
        if request.user.role != "ADMIN":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # USER STATISTICS
        # -------------------------------------------------

        total_students = User.objects.filter(
            role="STUDENT"
        ).count()

        active_students = User.objects.filter(
            role="STUDENT",
            is_active=True
        ).count()

        # -------------------------------------------------
        # QUIZ STATISTICS
        # -------------------------------------------------

        total_quizzes = Quiz.objects.count()

        published_quizzes = Quiz.objects.filter(
            status="Published"
        ).count()

        draft_quizzes = Quiz.objects.filter(
            status="Draft"
        ).count()

        unpublished_quizzes = Quiz.objects.filter(
            status="Unpublished"
        ).count()

        # -------------------------------------------------
        # QUESTION STATISTICS
        # -------------------------------------------------

        total_questions = Question.objects.count()

        easy_questions = Question.objects.filter(
            difficulty="Easy"
        ).count()

        medium_questions = Question.objects.filter(
            difficulty="Medium"
        ).count()

        hard_questions = Question.objects.filter(
            difficulty="Hard"
        ).count()

        # -------------------------------------------------
        # ATTEMPT STATISTICS
        # -------------------------------------------------

        completed_attempts = Attempt.objects.filter(
            status__in=[
                "PASSED",
                "FAILED"
            ]
        )

        total_attempts = completed_attempts.count()

        passed_attempts = completed_attempts.filter(
            status="PASSED"
        ).count()

        failed_attempts = completed_attempts.filter(
            status="FAILED"
        ).count()

        # -------------------------------------------------
        # SCORE STATISTICS
        # -------------------------------------------------

        average_percentage = completed_attempts.aggregate(
            average=Avg("percentage")
        )["average"] or 0

        highest_percentage = completed_attempts.aggregate(
            highest=Max("percentage")
        )["highest"] or 0

        average_score = completed_attempts.aggregate(
            average=Avg("score")
        )["average"] or 0

        # -------------------------------------------------
        # POPULAR QUIZZES
        # -------------------------------------------------

        popular_quizzes = Quiz.objects.annotate(
            attempt_count=Count(
                "attempts",
                filter=Q(
                    attempts__status__in=[
                        "PASSED",
                        "FAILED"
                    ]
                )
            )
        ).order_by(
            "-attempt_count"
        )[:5]

        popular_quiz_data = []

        for quiz in popular_quizzes:

            popular_quiz_data.append({
                "quiz_id": quiz.id,
                "quiz_title": quiz.title,
                "attempt_count": quiz.attempt_count,
                "category": quiz.category.name,
            })

        # -------------------------------------------------
        # CATEGORY STATISTICS
        # -------------------------------------------------

        category_data = []

        from categories.models import Category

        categories = Category.objects.annotate(
            quiz_count=Count("quizzes"),
            attempt_count=Count(
                "quizzes__attempts"
            )
        ).order_by(
            "-attempt_count"
        )

        for category in categories:

            category_data.append({
                "category_id": category.id,
                "category_name": category.name,
                "quiz_count": category.quiz_count,
                "attempt_count": category.attempt_count,
            })

        # -------------------------------------------------
        # PASS RATE
        # -------------------------------------------------

        if total_attempts > 0:

            pass_rate = (
                passed_attempts
                / total_attempts
            ) * 100

        else:

            pass_rate = 0

        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        return Response(
            {
                "students": {
                    "total_students":
                        total_students,

                    "active_students":
                        active_students,
                },

                "quizzes": {
                    "total_quizzes":
                        total_quizzes,

                    "published_quizzes":
                        published_quizzes,

                    "draft_quizzes":
                        draft_quizzes,

                    "unpublished_quizzes":
                        unpublished_quizzes,
                },

                "questions": {
                    "total_questions":
                        total_questions,

                    "easy_questions":
                        easy_questions,

                    "medium_questions":
                        medium_questions,

                    "hard_questions":
                        hard_questions,
                },

                "attempts": {
                    "total_attempts":
                        total_attempts,

                    "passed_attempts":
                        passed_attempts,

                    "failed_attempts":
                        failed_attempts,

                    "pass_rate": round(
                        pass_rate,
                        2
                    ),
                },

                "performance": {
                    "average_score": round(
                        float(average_score),
                        2
                    ),

                    "average_percentage": round(
                        float(
                            average_percentage
                        ),
                        2
                    ),

                    "highest_percentage": round(
                        float(
                            highest_percentage
                        ),
                        2
                    ),
                },

                "popular_quizzes":
                    popular_quiz_data,

                "categories":
                    category_data,
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# LEADERBOARD
# =========================================================

class LeaderboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        attempts = (
            Attempt.objects
            .filter(
                status="PASSED"
            )
            .select_related(
                "student",
                "quiz"
            )
        )

        leaderboard = []

        students = User.objects.filter(
            role="STUDENT",
            is_active=True
        )

        for student in students:

            student_attempts = attempts.filter(
                student=student
            )

            if not student_attempts.exists():
                continue

            # Best attempt
            best_attempt = (
                student_attempts
                .order_by(
                    "-percentage",
                    "-score"
                )
                .first()
            )

            # Average percentage
            average_percentage = (
                student_attempts
                .aggregate(
                    average=Avg("percentage")
                )["average"] or 0
            )

            leaderboard.append({
                "student_id": student.id,

                "username": student.username,

                "best_score": best_attempt.score,

                "best_percentage":
                    best_attempt.percentage,

                "average_percentage":
                    round(
                        float(
                            average_percentage
                        ),
                        2
                    ),

                "quiz_title":
                    best_attempt.quiz.title,
            })

        # -------------------------------------------------
        # SORT LEADERBOARD
        # -------------------------------------------------

        leaderboard.sort(
            key=lambda item: (
                float(
                    item["best_percentage"]
                ),
                float(
                    item["best_score"]
                )
            ),
            reverse=True
        )

        # -------------------------------------------------
        # ADD RANKINGS
        # -------------------------------------------------

        for index, student in enumerate(
            leaderboard,
            start=1
        ):

            student["rank"] = index

        return Response(
            leaderboard,
            status=status.HTTP_200_OK
        )


# =========================================================
# START QUIZ
# =========================================================

class StartQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):

        quiz = get_object_or_404(
            Quiz,
            id=quiz_id
        )

        # Only published quizzes can be attempted
        if quiz.status != "Published":

            return Response(
                {
                    "error":
                        "This quiz is not available."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # CHECK MAXIMUM ATTEMPTS
        # -------------------------------------------------

        previous_attempts = (
            Attempt.objects
            .filter(
                student=request.user,
                quiz=quiz
            )
            .exclude(
                status="IN_PROGRESS"
            )
            .count()
        )

        if previous_attempts >= quiz.max_attempts:

            return Response(
                {
                    "error":
                        "Maximum attempts reached."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # CHECK ACTIVE ATTEMPT
        # -------------------------------------------------

        active_attempt = (
            Attempt.objects
            .filter(
                student=request.user,
                quiz=quiz,
                status="IN_PROGRESS"
            )
            .first()
        )

        if active_attempt:

            return Response(
                AttemptSerializer(
                    active_attempt
                ).data,
                status=status.HTTP_200_OK
            )

        # -------------------------------------------------
        # CREATE NEW ATTEMPT
        # -------------------------------------------------

        attempt = Attempt.objects.create(
            student=request.user,
            quiz=quiz
        )

        return Response(
            AttemptSerializer(
                attempt
            ).data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# SUBMIT QUIZ
# =========================================================

class SubmitQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):

        print("\n")
        print("==========================================")
        print("🔥 SUBMIT QUIZ VIEW RUNNING")
        print("ATTEMPT ID:", attempt_id)
        print("REQUEST DATA:", request.data)
        print("==========================================")

        # -------------------------------------------------
        # GET ATTEMPT
        # -------------------------------------------------

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        # -------------------------------------------------
        # CHECK ATTEMPT STATUS
        # -------------------------------------------------

        if attempt.status != "IN_PROGRESS":

            return Response(
                {
                    "error":
                        "This attempt has already been completed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # CHECK TIME
        # -------------------------------------------------

        expiry_time = (
            attempt.started_at
            + timedelta(
                minutes=attempt.quiz.duration
            )
        )

        time_expired = (
            timezone.now() >= expiry_time
        )

        # -------------------------------------------------
        # GET ANSWERS FROM FRONTEND
        # -------------------------------------------------

        submitted_answers = request.data.get(
            "answers",
            []
        )

        print(
            "RAW ANSWERS:",
            submitted_answers
        )

        # -------------------------------------------------
        # ACCEPT DIFFERENT ANSWER FORMATS
        # -------------------------------------------------

        if isinstance(
            submitted_answers,
            dict
        ):

            converted_answers = []

            for question_id, option_id in (
                submitted_answers.items()
            ):

                converted_answers.append(
                    {
                        "question_id":
                            question_id,

                        "option_id":
                            option_id
                    }
                )

            submitted_answers = (
                converted_answers
            )

        if not isinstance(
            submitted_answers,
            list
        ):

            return Response(
                {
                    "error":
                        "Invalid answers format."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        print(
            "NORMALIZED SUBMITTED ANSWERS:",
            submitted_answers
        )

        # -------------------------------------------------
        # CREATE ANSWER MAP
        # -------------------------------------------------

        answer_map = {}

        for answer in submitted_answers:

            if not isinstance(
                answer,
                dict
            ):
                continue

            question_id = answer.get(
                "question_id"
            )

            option_id = answer.get(
                "option_id"
            )

            try:

                question_id = int(
                    question_id
                )

                option_id = int(
                    option_id
                )

            except (
                TypeError,
                ValueError
            ):

                continue

            answer_map[
                question_id
            ] = option_id

        print(
            "=========================================="
        )

        print(
            "ANSWER MAP:",
            answer_map
        )

        print(
            "=========================================="
        )

        # -------------------------------------------------
        # GET QUIZ QUESTIONS
        # -------------------------------------------------

        questions = list(
            Question.objects
            .filter(
                quiz=attempt.quiz
            )
            .order_by("id")
        )

        print(
            "QUESTION IDS:",
            [
                question.id
                for question in questions
            ]
        )

        # -------------------------------------------------
        # CALCULATE RESULT
        # -------------------------------------------------

        correct = 0
        incorrect = 0
        unanswered = 0

        obtained_marks = 0
        total_marks = 0

        # -------------------------------------------------
        # SAVE ANSWERS + CALCULATE
        # -------------------------------------------------

        with transaction.atomic():

            # Remove old answers
            Answer.objects.filter(
                attempt=attempt
            ).delete()

            for question in questions:

                total_marks += question.marks

                selected_option_id = (
                    answer_map.get(
                        question.id
                    )
                )

                print(
                    "Question:",
                    question.id,
                    "| Selected option:",
                    selected_option_id
                )

                # -----------------------------------------
                # UNANSWERED
                # -----------------------------------------

                if selected_option_id is None:

                    unanswered += 1

                    continue

                # -----------------------------------------
                # GET SELECTED OPTION
                # -----------------------------------------

                option = (
                    Option.objects
                    .filter(
                        id=selected_option_id,
                        question=question
                    )
                    .first()
                )

                # -----------------------------------------
                # INVALID OPTION
                # -----------------------------------------

                if option is None:

                    print(
                        "INVALID OPTION:",
                        selected_option_id,
                        "FOR QUESTION:",
                        question.id
                    )

                    incorrect += 1

                    continue

                # -----------------------------------------
                # CHECK CORRECT ANSWER
                # -----------------------------------------

                is_correct = bool(
                    option.is_correct
                )

                print(
                    "Selected:",
                    option.option_text,
                    "| Correct:",
                    is_correct
                )

                # -----------------------------------------
                # SAVE ANSWER
                # -----------------------------------------

                Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_option=option,
                    is_correct=is_correct
                )

                # -----------------------------------------
                # CALCULATE SCORE
                # -----------------------------------------

                if is_correct:

                    correct += 1

                    obtained_marks += (
                        question.marks
                    )

                else:

                    incorrect += 1

        # -------------------------------------------------
        # CALCULATE PERCENTAGE
        # -------------------------------------------------

        if total_marks > 0:

            percentage = (
                obtained_marks
                / total_marks
            ) * 100

        else:

            percentage = 0

        # -------------------------------------------------
        # PASS / FAIL
        # -------------------------------------------------

        if (
            percentage
            >= attempt.quiz.passing_percentage
        ):

            result_status = "PASSED"

        else:

            result_status = "FAILED"

        # -------------------------------------------------
        # TIME TAKEN
        # -------------------------------------------------

        end_time = timezone.now()

        time_taken = int(
            (
                end_time
                - attempt.started_at
            ).total_seconds()
        )

        # -------------------------------------------------
        # UPDATE ATTEMPT
        # -------------------------------------------------

        attempt.score = obtained_marks

        attempt.percentage = percentage

        attempt.correct_answers = correct

        attempt.incorrect_answers = incorrect

        attempt.unanswered = unanswered

        attempt.time_taken = time_taken

        attempt.status = result_status

        attempt.completed_at = end_time

        attempt.save()

        # -------------------------------------------------
        # FINAL DEBUG
        # -------------------------------------------------

        print("\n")
        print("==========================================")
        print("🔥 FINAL QUIZ RESULT")
        print("Score:", obtained_marks)
        print("Total Marks:", total_marks)
        print("Correct:", correct)
        print("Incorrect:", incorrect)
        print("Unanswered:", unanswered)
        print("Percentage:", percentage)
        print("Status:", result_status)
        print("Time Expired:", time_expired)
        print("==========================================")
        print("\n")

        # -------------------------------------------------
        # RETURN RESULT
        # -------------------------------------------------

        return Response(
            AttemptSerializer(
                attempt
            ).data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ATTEMPT RESULT
# =========================================================

class AttemptResultView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        attempt_id
    ):

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        if attempt.status == "IN_PROGRESS":

            return Response(
                {
                    "error":
                        "Quiz attempt is not completed yet."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "attempt_id": attempt.id,

                "quiz_id":
                    attempt.quiz.id,

                "quiz_title":
                    attempt.quiz.title,

                "score":
                    attempt.score,

                "percentage":
                    attempt.percentage,

                "correct_answers":
                    attempt.correct_answers,

                "incorrect_answers":
                    attempt.incorrect_answers,

                "unanswered":
                    attempt.unanswered,

                "time_taken":
                    attempt.time_taken,

                "status":
                    attempt.status,

                "started_at":
                    attempt.started_at,

                "completed_at":
                    attempt.completed_at,
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ATTEMPT HISTORY
# =========================================================

class AttemptHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        attempts = (
            Attempt.objects
            .filter(
                student=request.user
            )
            .exclude(
                status="IN_PROGRESS"
            )
            .select_related(
                "quiz"
            )
            .order_by(
                "-completed_at"
            )
        )

        history = []

        for attempt in attempts:

            history.append(
                {
                    "attempt_id":
                        attempt.id,

                    "quiz_id":
                        attempt.quiz.id,

                    "quiz_title":
                        attempt.quiz.title,

                    "score":
                        attempt.score,

                    "percentage":
                        attempt.percentage,

                    "correct_answers":
                        attempt.correct_answers,

                    "incorrect_answers":
                        attempt.incorrect_answers,

                    "unanswered":
                        attempt.unanswered,

                    "time_taken":
                        attempt.time_taken,

                    "status":
                        attempt.status,

                    "completed_at":
                        attempt.completed_at,
                }
            )

        return Response(
            history,
            status=status.HTTP_200_OK
        )


# =========================================================
# ANSWER REVIEW
# =========================================================

class AnswerReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        attempt_id
    ):

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        if attempt.status == "IN_PROGRESS":

            return Response(
                {
                    "error":
                        "Quiz attempt is not completed yet."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # GET ALL QUESTIONS
        # -------------------------------------------------

        questions = (
            Question.objects
            .filter(
                quiz=attempt.quiz
            )
            .order_by("id")
        )

        # -------------------------------------------------
        # GET SUBMITTED ANSWERS
        # -------------------------------------------------

        answers = {
            answer.question_id: answer
            for answer in (
                Answer.objects
                .filter(
                    attempt=attempt
                )
                .select_related(
                    "selected_option"
                )
            )
        }

        review = []

        for question in questions:

            answer = answers.get(
                question.id
            )

            # Find correct option
            correct_option = (
                Option.objects
                .filter(
                    question=question,
                    is_correct=True
                )
                .first()
            )

            # -------------------------------------------------
            # STUDENT ANSWERED
            # -------------------------------------------------

            if answer:

                selected_option = (
                    answer.selected_option.option_text
                    if answer.selected_option
                    else None
                )

                is_correct = (
                    answer.is_correct
                )

            # -------------------------------------------------
            # STUDENT DID NOT ANSWER
            # -------------------------------------------------

            else:

                selected_option = None

                is_correct = False

            review.append(
                {
                    "question_id":
                        question.id,

                    "question":
                        question.question_text,

                    "selected_option":
                        selected_option,

                    "correct_option":
                        (
                            correct_option.option_text
                            if correct_option
                            else None
                        ),

                    "is_correct":
                        is_correct,

                    "explanation":
                        question.explanation,

                    "marks":
                        question.marks,
                }
            )

        return Response(
            {
                "attempt_id":
                    attempt.id,

                "quiz_id":
                    attempt.quiz.id,

                "quiz_title":
                    attempt.quiz.title,

                "review":
                    review,
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN ATTEMPT LIST
# =========================================================

class AdminAttemptListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error":
                        "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        attempts = (
            Attempt.objects
            .filter(
                status__in=[
                    "PASSED",
                    "FAILED"
                ]
            )
            .select_related(
                "student",
                "quiz"
            )
            .order_by(
                "-completed_at"
            )
        )

        data = []

        for attempt in attempts:

            data.append(
                {
                    "attempt_id":
                        attempt.id,

                    "student_id":
                        attempt.student.id,

                    "student_username":
                        attempt.student.username,

                    "quiz_id":
                        attempt.quiz.id,

                    "quiz_title":
                        attempt.quiz.title,

                    "score":
                        attempt.score,

                    "percentage":
                        attempt.percentage,

                    "correct_answers":
                        attempt.correct_answers,

                    "incorrect_answers":
                        attempt.incorrect_answers,

                    "unanswered":
                        attempt.unanswered,

                    "time_taken":
                        attempt.time_taken,

                    "status":
                        attempt.status,

                    "started_at":
                        attempt.started_at,

                    "completed_at":
                        attempt.completed_at,
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN ATTEMPT DETAIL
# =========================================================

class AdminAttemptDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        attempt_id
    ):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error":
                        "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        attempt = get_object_or_404(
            Attempt.objects.select_related(
                "student",
                "quiz"
            ),
            id=attempt_id
        )

        return Response(
            {
                "attempt_id":
                    attempt.id,

                "student_id":
                    attempt.student.id,

                "student_username":
                    attempt.student.username,

                "student_email":
                    attempt.student.email,

                "quiz_id":
                    attempt.quiz.id,

                "quiz_title":
                    attempt.quiz.title,

                "score":
                    attempt.score,

                "percentage":
                    attempt.percentage,

                "correct_answers":
                    attempt.correct_answers,

                "incorrect_answers":
                    attempt.incorrect_answers,

                "unanswered":
                    attempt.unanswered,

                "time_taken":
                    attempt.time_taken,

                "status":
                    attempt.status,

                "started_at":
                    attempt.started_at,

                "completed_at":
                    attempt.completed_at,
            },
            status=status.HTTP_200_OK
        )