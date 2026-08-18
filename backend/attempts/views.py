from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Attempt, Answer
from .serializers import AttemptSerializer

from quizzes.models import Quiz
from questions.models import Question, Option


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
                    "error": "This quiz is not available."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check maximum attempts
        previous_attempts = Attempt.objects.filter(
            student=request.user,
            quiz=quiz
        ).exclude(
            status="IN_PROGRESS"
        ).count()

        if previous_attempts >= quiz.max_attempts:
            return Response(
                {
                    "error": "Maximum attempts reached."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for an existing active attempt
        active_attempt = Attempt.objects.filter(
            student=request.user,
            quiz=quiz,
            status="IN_PROGRESS"
        ).first()

        if active_attempt:

            return Response(
                AttemptSerializer(active_attempt).data,
                status=status.HTTP_200_OK
            )

        # Create new attempt
        attempt = Attempt.objects.create(
            student=request.user,
            quiz=quiz
        )

        return Response(
            AttemptSerializer(attempt).data,
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
                    "error": (
                        "This attempt has already been "
                        "completed."
                    )
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

        time_expired=timezone.now() >= expiry_time

        # -------------------------------------------------
        # GET ANSWERS FROM FRONTEND
        # -------------------------------------------------

        submitted_answers = request.data.get(
            "answers",
            []
        )

        print("RAW ANSWERS:", submitted_answers)

        # -------------------------------------------------
        # ACCEPT DIFFERENT ANSWER FORMATS
        # -------------------------------------------------

        if isinstance(submitted_answers, dict):

            # Example:
            #
            # {
            #   "2": 9,
            #   "3": 13
            # }
            #
            # Convert into:
            #
            # [
            #   {"question_id": 2, "option_id": 9},
            #   {"question_id": 3, "option_id": 13}
            # ]

            converted_answers = []

            for question_id, option_id in (
                submitted_answers.items()
            ):

                converted_answers.append(
                    {
                        "question_id": question_id,
                        "option_id": option_id
                    }
                )

            submitted_answers = converted_answers

        if not isinstance(
            submitted_answers,
            list
        ):

            return Response(
                {
                    "error": (
                        "Invalid answers format."
                    )
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

            if not isinstance(answer, dict):
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

            answer_map[question_id] = option_id

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
            Question.objects.filter(
                quiz=attempt.quiz
            ).order_by("id")
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

            # Remove old answers for this attempt
            Answer.objects.filter(
                attempt=attempt
            ).delete()

            for question in questions:

                total_marks += question.marks

                selected_option_id = answer_map.get(
                    question.id
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

                option = Option.objects.filter(
                    id=selected_option_id,
                    question=question
                ).first()

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
                    "error": (
                        "Quiz attempt is not "
                        "completed yet."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "attempt_id": attempt.id,
                "quiz_id": attempt.quiz.id,
                "quiz_title": attempt.quiz.title,
                "score": attempt.score,
                "percentage": attempt.percentage,
                "correct_answers": (
                    attempt.correct_answers
                ),
                "incorrect_answers": (
                    attempt.incorrect_answers
                ),
                "unanswered": attempt.unanswered,
                "time_taken": attempt.time_taken,
                "status": attempt.status,
                "started_at": attempt.started_at,
                "completed_at": attempt.completed_at,
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
                    "attempt_id": attempt.id,
                    "quiz_id": attempt.quiz.id,
                    "quiz_title": attempt.quiz.title,
                    "score": attempt.score,
                    "percentage": attempt.percentage,
                    "correct_answers": (
                        attempt.correct_answers
                    ),
                    "incorrect_answers": (
                        attempt.incorrect_answers
                    ),
                    "unanswered": (
                        attempt.unanswered
                    ),
                    "time_taken": (
                        attempt.time_taken
                    ),
                    "status": attempt.status,
                    "completed_at": (
                        attempt.completed_at
                    ),
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

    def get(self, request, attempt_id):

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        if attempt.status == "IN_PROGRESS":
            return Response(
                {
                    "error": (
                        "Quiz attempt is not "
                        "completed yet."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get ALL questions from this quiz
        questions = (
            Question.objects
            .filter(
                quiz=attempt.quiz
            )
            .order_by("id")
        )

        # Get submitted answers
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

            # If student answered
            if answer:

                selected_option = (
                    answer.selected_option.option_text
                    if answer.selected_option
                    else None
                )

                is_correct = answer.is_correct

            # If student did not answer
            else:

                selected_option = None
                is_correct = False

            review.append(
                {
                    "question_id": question.id,

                    "question": (
                        question.question_text
                    ),

                    "selected_option": (
                        selected_option
                    ),

                    "correct_option": (
                        correct_option.option_text
                        if correct_option
                        else None
                    ),

                    "is_correct": is_correct,

                    "explanation": (
                        question.explanation
                    ),

                    "marks": question.marks,
                }
            )

        return Response(
            {
                "attempt_id": attempt.id,

                "quiz_id": attempt.quiz.id,

                "quiz_title": (
                    attempt.quiz.title
                ),

                "review": review,
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
                    "error": (
                        "Admin access required."
                    )
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
                    "attempt_id": attempt.id,

                    "student_id": (
                        attempt.student.id
                    ),

                    "student_username": (
                        attempt.student.username
                    ),

                    "quiz_id": (
                        attempt.quiz.id
                    ),

                    "quiz_title": (
                        attempt.quiz.title
                    ),

                    "score": attempt.score,

                    "percentage": (
                        attempt.percentage
                    ),

                    "correct_answers": (
                        attempt.correct_answers
                    ),

                    "incorrect_answers": (
                        attempt.incorrect_answers
                    ),

                    "unanswered": (
                        attempt.unanswered
                    ),

                    "time_taken": (
                        attempt.time_taken
                    ),

                    "status": attempt.status,

                    "started_at": (
                        attempt.started_at
                    ),

                    "completed_at": (
                        attempt.completed_at
                    ),
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
                    "error": (
                        "Admin access required."
                    )
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
                "attempt_id": attempt.id,

                "student_id": (
                    attempt.student.id
                ),

                "student_username": (
                    attempt.student.username
                ),

                "student_email": (
                    attempt.student.email
                ),

                "quiz_id": (
                    attempt.quiz.id
                ),

                "quiz_title": (
                    attempt.quiz.title
                ),

                "score": attempt.score,

                "percentage": (
                    attempt.percentage
                ),

                "correct_answers": (
                    attempt.correct_answers
                ),

                "incorrect_answers": (
                    attempt.incorrect_answers
                ),

                "unanswered": (
                    attempt.unanswered
                ),

                "time_taken": (
                    attempt.time_taken
                ),

                "status": attempt.status,

                "started_at": (
                    attempt.started_at
                ),

                "completed_at": (
                    attempt.completed_at
                ),
            },
            status=status.HTTP_200_OK
        )