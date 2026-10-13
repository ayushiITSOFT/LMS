from rest_framework import serializers

from courses.models import Course, Section, Lesson
from assignment.models import Assignment, AssignmentSubmission
from certificate.models import Certificate
from .models import Enrollment, CourseProgress


class EnrollmentSerializer(serializers.ModelSerializer):
    student_id = serializers.ReadOnlyField(source="student.id")
    student_name = serializers.ReadOnlyField(source="student.username")
    student_email = serializers.ReadOnlyField(source="student.email")
    student_full_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.ReadOnlyField(source="course.title")
    progress_percentage = serializers.SerializerMethodField(read_only=True)
    completed = serializers.SerializerMethodField(read_only=True)
    has_certificate = serializers.SerializerMethodField(read_only=True)
    certificate_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            "id",
            "student",
            "student_id",
            "student_name",
            "student_email",
            "student_full_name",
            "course",
            "course_title",
            "order",
            "progress_percentage",
            "completed",
            "has_certificate",
            "certificate_id",
            "created_at",
        )
        read_only_fields = fields

    def get_student_full_name(self, obj):
        name = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return name or obj.student.username

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def get_completed(self, obj):
        return obj.is_course_completed()

    def get_has_certificate(self, obj):
        return hasattr(obj, "certificate") and obj.certificate is not None

    def get_certificate_id(self, obj):
        if hasattr(obj, "certificate") and obj.certificate:
            return obj.certificate.certificate_id
        return None


class CourseSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ("id", "title", "subtitle", "thumbnail", "level", "language", "price", "status")
        read_only_fields = fields


class LessonProgressSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        fields = ("id", "title", "kind", "video_url", "video_file", "pdf", "notes", "preview", "order", "completed")

    def get_completed(self, obj):
        enrollment = self.context.get("enrollment")
        if not enrollment:
            return False
        progress = getattr(enrollment, "_prefetched_objects_cache", {}).get("progress")
        if progress is not None:
            return any(item.lesson_id == obj.id and item.completed for item in progress)
        return CourseProgress.objects.filter(enrollment=enrollment, lesson=obj, completed=True).exists()


class SectionProgressSerializer(serializers.ModelSerializer):
    lessons = LessonProgressSerializer(many=True, read_only=True)
    section_completed = serializers.SerializerMethodField(read_only=True)
    progress_percentage = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Section
        fields = ("id", "title", "description", "order", "lessons", "section_completed", "progress_percentage")

    def get_lessons(self, obj):
        return LessonProgressSerializer(
            obj.lessons.all(),
            many=True,
            context={"enrollment": self.context.get("enrollment")},
        ).data

    def get_section_completed(self, obj):
        enrollment = self.context.get("enrollment")
        if not enrollment:
            return False
        return enrollment.get_section_progress(obj)["completed"]

    def get_progress_percentage(self, obj):
        enrollment = self.context.get("enrollment")
        if not enrollment:
            return 0
        return enrollment.get_section_progress(obj)["progress_percentage"]


class MyCourseSummarySerializer(serializers.ModelSerializer):
    course = CourseSummarySerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField(read_only=True)
    course_completed = serializers.SerializerMethodField(read_only=True)
    resume_lesson = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Enrollment
        fields = ("id", "course", "progress_percentage", "course_completed", "resume_lesson", "created_at")
        read_only_fields = fields

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def get_course_completed(self, obj):
        return obj.is_course_completed()

    def get_resume_lesson(self, obj):
        lesson = obj.get_next_lesson()
        if not lesson:
            return None
        return {
            "id": lesson.id,
            "title": lesson.title,
            "kind": lesson.kind,
            "section_title": lesson.section.title,
        }


class MyCourseDetailSerializer(serializers.ModelSerializer):
    course = CourseSummarySerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField(read_only=True)
    course_completed = serializers.SerializerMethodField(read_only=True)
    resume_lesson = serializers.SerializerMethodField(read_only=True)
    sections = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Enrollment
        fields = ("id", "course", "progress_percentage", "course_completed", "resume_lesson", "sections", "created_at")
        read_only_fields = fields

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def get_course_completed(self, obj):
        return obj.is_course_completed()

    def get_resume_lesson(self, obj):
        lesson = obj.get_next_lesson()
        if not lesson:
            return None
        return {
            "id": lesson.id,
            "title": lesson.title,
            "kind": lesson.kind,
            "section_title": lesson.section.title,
        }

    def get_sections(self, obj):
        sections = obj.course.sections.all()
        return SectionProgressSerializer(
            sections,
            many=True,
            context={"enrollment": obj},
        ).data


class UpcomingDeadlineSerializer(serializers.Serializer):
    assignment_id = serializers.IntegerField()
    title = serializers.CharField()
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    due_date = serializers.DateTimeField()
    status = serializers.CharField()


class RecentActivitySerializer(serializers.Serializer):
    type = serializers.CharField()
    message = serializers.CharField()
    timestamp = serializers.DateTimeField()
    details = serializers.DictField(required=False)


class StudentDashboardSerializer(serializers.Serializer):
    total_enrolled_courses = serializers.IntegerField()
    courses_in_progress = serializers.IntegerField()
    completed_courses = serializers.IntegerField()
    certificates_earned = serializers.IntegerField()
    pending_assignments = serializers.IntegerField()
    upcoming_deadlines = UpcomingDeadlineSerializer(many=True)
    recent_activity = RecentActivitySerializer(many=True)
