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
        return Lesson.objects.filter(section__course=self.course).count()

    def get_completed_lessons(self):
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
        total_lessons = section.lessons.count()
        if total_lessons == 0:
            return {"completed": False, "progress_percentage": 0, "completed_lessons": 0, "total_lessons": 0}

        completed_lessons = CourseProgress.objects.filter(enrollment=self, lesson__section=section, completed=True).count()
        progress_percentage = round((completed_lessons / total_lessons) * 100, 2) if total_lessons else 0
        return {
            "completed": completed_lessons == total_lessons,
            "progress_percentage": progress_percentage,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
        }

    def get_next_lesson(self):
        lessons = Lesson.objects.filter(section__course=self.course).select_related("section").order_by("section__order", "order")
        for lesson in lessons:
            if not CourseProgress.objects.filter(enrollment=self, lesson=lesson, completed=True).exists():
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
