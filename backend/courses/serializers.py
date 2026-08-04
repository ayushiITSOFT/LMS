from decimal import Decimal

from rest_framework import serializers

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
            "pdf",
            "notes",
            "preview",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "section", "created_at", "updated_at")


class LessonPreviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = (
            "id",
            "title",
            "kind",
            "video_url",
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
        preview_lessons = section.lessons.filter(preview=True).order_by("order")
        return LessonPreviewSerializer(preview_lessons, many=True).data


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
