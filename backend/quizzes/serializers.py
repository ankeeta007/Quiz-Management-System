from rest_framework import serializers
from .models import Quiz
from questions.models import Question, Option


# =========================================================
# QUIZ SERIALIZER
# =========================================================

class QuizSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Quiz

        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_name",
            "difficulty",
            "duration",
            "passing_percentage",
            "max_attempts",
            "status",
            "thumbnail",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# =========================================================
# OPTION SERIALIZER
# =========================================================

class OptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Option

        fields = [
            "id",
            "question",
            "option_text",
            "is_correct",
        ]

        # question is automatically assigned
        # inside QuestionSerializer.create()
        read_only_fields = [
            "id",
            "question",
        ]


# =========================================================
# QUESTION SERIALIZER
# =========================================================

class QuestionSerializer(serializers.ModelSerializer):

    options = OptionSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = Question

        fields = [
            "id",
            "quiz",
            "question_text",
            "marks",
            "explanation",
            "options",
        ]

        read_only_fields = [
            "id",
        ]

    # =====================================================
    # CREATE QUESTION + OPTIONS
    # =====================================================

    def create(self, validated_data):

        options_data = validated_data.pop(
            "options",
            []
        )

        question = Question.objects.create(
            **validated_data
        )

        for option_data in options_data:

            Option.objects.create(
                question=question,
                **option_data
            )

        return question

    # =====================================================
    # UPDATE QUESTION + OPTIONS
    # =====================================================

    def update(self, instance, validated_data):

        options_data = validated_data.pop(
            "options",
            None
        )

        # Update question
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Update options if provided
        if options_data is not None:

            instance.options.all().delete()

            for option_data in options_data:

                Option.objects.create(
                    question=instance,
                    **option_data
                )

        return instance