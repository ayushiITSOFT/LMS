from django.conf import settings
from django.db import models
from django.utils import timezone

from courses.models import Course, Lesson
from orders.models import Order


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="enrollments",
        on_delete=models.CASCADE,
    )
    course = models.ForeignKey(Course, related_name="enrollments", on_delete=models.CASCADE)
    order = models.ForeignKey(Order, related_name="enrollments", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "course"], name="unique_student_course_enrollment")
        ]
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.student} -> {self.course}"

    def get_total_lessons(self):
        sections = getattr(self.course, "_prefetched_objects_cache", {}).get("sections")
        if sections is not None:
            return sum(len(getattr(section, "_prefetched_objects_cache", {}).get("lessons", [])) for section in sections)
        return Lesson.objects.filter(section__course=self.course).count()

    def get_completed_lessons(self):
        progress = getattr(self, "_prefetched_objects_cache", {}).get("progress")
        if progress is not None:
            return sum(1 for item in progress if item.completed)
        return CourseProgress.objects.filter(enrollment=self, completed=True).count()

    def get_progress_percentage(self):
        total_lessons = self.get_total_lessons()
        if total_lessons == 0:
            return 0
        return round((self.get_completed_lessons() / total_lessons) * 100, 2)

    def is_course_completed(self):
        total_lessons = self.get_total_lessons()
        if total_lessons == 0:
            return False
        return self.get_completed_lessons() == total_lessons

    def get_section_progress(self, section):
        prefetched_lessons = getattr(section, "_prefetched_objects_cache", {}).get("lessons")
        total_lessons = len(prefetched_lessons) if prefetched_lessons is not None else section.lessons.count()
        if total_lessons == 0:
            return {"completed": False, "progress_percentage": 0, "completed_lessons": 0, "total_lessons": 0}

        progress = getattr(self, "_prefetched_objects_cache", {}).get("progress")
        if progress is not None:
            completed_lessons = sum(1 for item in progress if item.completed and item.lesson.section_id == section.id)
        else:
            completed_lessons = CourseProgress.objects.filter(enrollment=self, lesson__section=section, completed=True).count()
        progress_percentage = round((completed_lessons / total_lessons) * 100, 2) if total_lessons else 0
        return {
            "completed": completed_lessons == total_lessons,
            "progress_percentage": progress_percentage,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
        }

    def get_next_lesson(self):
        sections = getattr(self.course, "_prefetched_objects_cache", {}).get("sections")
        if sections is not None:
            lessons = [
                lesson
                for section in sorted(sections, key=lambda item: item.order)
                for lesson in sorted(getattr(section, "_prefetched_objects_cache", {}).get("lessons", []), key=lambda item: item.order)
            ]
        else:
            lessons = Lesson.objects.filter(section__course=self.course).select_related("section").order_by("section__order", "order")

        progress = getattr(self, "_prefetched_objects_cache", {}).get("progress")
        completed_lesson_ids = {item.lesson_id for item in progress if item.completed} if progress is not None else None
        for lesson in lessons:
            completed = lesson.id in completed_lesson_ids if completed_lesson_ids is not None else CourseProgress.objects.filter(enrollment=self, lesson=lesson, completed=True).exists()
            if not completed:
                return lesson
        return None


class CourseProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, related_name="progress", on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name="course_progress", on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["enrollment", "lesson"], name="unique_enrollment_lesson_progress")
        ]
        ordering = ("created_at",)

    def __str__(self):
        return f"{self.enrollment} -> {self.lesson}"

    def mark_completed(self):
        self.completed = True
        self.completed_at = timezone.now()
        self.save(update_fields=("completed", "completed_at", "updated_at"))
