from decimal import Decimal

from rest_framework import serializers

from enrollment.models import Enrollment
from file_management.validation import validate_upload
from .models import Course, Section, Lesson


class LessonSerializer(serializers.ModelSerializer):
    section = serializers.ReadOnlyField(source="section.id")

    class Meta:
        model = Lesson
        fields = (
            "id",
            "section",
            "title",
            "kind",
            "video_url",
            "video_file",
            "pdf",
            "notes",
            "preview",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "section", "created_at", "updated_at")

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_pdf(self, value):
        return validate_upload(value, "pdf") if value else value

    def validate_video_file(self, value):
        return validate_upload(value, "video") if value else value


class LessonPreviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = (
            "id",
            "title",
            "kind",
            "video_url",
            "video_file",
            "pdf",
            "notes",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class SectionSerializer(serializers.ModelSerializer):
    course = serializers.ReadOnlyField(source="course.id")
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = (
            "id",
            "course",
            "title",
            "description",
            "order",
            "lessons",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "course", "created_at", "updated_at")

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value


class SectionPreviewSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = (
            "id",
            "title",
            "description",
            "order",
            "lessons",
        )

    def get_lessons(self, section):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        course = section.course
        if user and user.is_authenticated and (user.is_staff or user.id == course.instructor_id):
            preview_lessons = section.lessons.all().order_by("order")
        else:
            preview_lessons = section.lessons.filter(preview=True).order_by("order")
            if not preview_lessons.exists():
                preview_lessons = section.lessons.all().order_by("order")
        return LessonPreviewSerializer(preview_lessons, many=True, context=self.context).data


class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.ReadOnlyField(source="instructor.id")
    status = serializers.ChoiceField(choices=Course.Status.choices, default=Course.Status.DRAFT)
    sections = SectionSerializer(many=True, read_only=True)

    # Pricing helper field: instructor can set pricing to 'free' or 'paid'. Write-only.
    PRICING_CHOICES = (("free", "Free"), ("paid", "Paid"))
    pricing = serializers.ChoiceField(choices=PRICING_CHOICES, write_only=True, required=False)

    # Read-only convenience fields
    is_paid = serializers.SerializerMethodField(read_only=True)
    is_publishable = serializers.SerializerMethodField(read_only=True)
    publish_errors = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "category",
            "title",
            "subtitle",
            "description",
            "thumbnail",
            "level",
            "language",
            "price",
            "pricing",
            "is_paid",
            "is_publishable",
            "publish_errors",
            "status",
            "instructor",
            "sections",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "instructor",
            "created_at",
            "updated_at",
            "is_paid",
            "is_publishable",
            "publish_errors",
        )

    def get_is_paid(self, obj):
        try:
            return bool(obj.price and obj.price > 0)
        except Exception:
            return False

    def get_is_publishable(self, obj):
        return obj.is_publishable()

    def get_publish_errors(self, obj):
        return obj.get_publish_validation_errors()

    def validate_price(self, value):
        # Enforce non-negative price
        if value is None:
            return value
        if value < Decimal("0"):
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_thumbnail(self, value):
        return validate_upload(value, "image") if value else value

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_category(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Category is required.")
        return value

    def validate(self, attrs):
        pricing = attrs.get("pricing")
        price = attrs.get("price")

        if pricing == "free":
            # Force price to zero for free courses
            attrs["price"] = Decimal("0.00")
        elif pricing == "paid":
            # Paid courses must have a positive price
            if price is None or price <= Decimal("0"):
                raise serializers.ValidationError({
                    "price": "Paid courses must have a price greater than 0."
                })

        # Also validate price non-negative if provided without pricing
        if pricing is None and price is not None and price < Decimal("0"):
            raise serializers.ValidationError({"price": "Price cannot be negative."})

        return attrs

    def create(self, validated_data):
        # Remove write-only helper field before creating model
        validated_data.pop("pricing", None)
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["instructor"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent changing instructor via update
        validated_data.pop("instructor", None)
        # Remove write-only helper field before updating model
        validated_data.pop("pricing", None)
        return super().update(instance, validated_data)


class CourseDiscoverySerializer(serializers.ModelSerializer):
    instructor = serializers.ReadOnlyField(source="instructor.username")
    is_paid = serializers.SerializerMethodField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "category",
            "title",
            "subtitle",
            "description",
            "thumbnail",
            "level",
            "language",
            "price",
            "is_paid",
            "average_rating",
            "review_count",
            "status",
            "instructor",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_is_paid(self, obj):
        try:
            return bool(obj.price and obj.price > 0)
        except Exception:
            return False


class CoursePreviewSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "category",
            "title",
            "subtitle",
            "description",
            "thumbnail",
            "level",
            "language",
            "price",
            "status",
            "sections",
        )

    def get_sections(self, course):
        preview_sections = course.sections.filter(lessons__preview=True).distinct().order_by("order")
        return SectionPreviewSerializer(preview_sections, many=True).data


class RecentEnrollmentSerializer(serializers.ModelSerializer):
    student_id = serializers.ReadOnlyField(source="student.id")
    student_name = serializers.ReadOnlyField(source="student.username")
    course_id = serializers.ReadOnlyField(source="course.id")
    course_title = serializers.ReadOnlyField(source="course.title")

    class Meta:
        model = Enrollment
        fields = ("id", "student_id", "student_name", "course_id", "course_title", "created_at")
        read_only_fields = fields


class InstructorDashboardSerializer(serializers.Serializer):
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    recent_enrollments = RecentEnrollmentSerializer(many=True)
