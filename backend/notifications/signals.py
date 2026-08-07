from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver

from enrollment.models import Enrollment, CourseProgress
from certificate.models import Certificate
from assignment.models import Assignment, AssignmentSubmission
from quiz.models import QuizAttempt
from .models import Notification


def _create_notification(recipient, verb, target=None, actor=None, data=None):
    kwargs = {"recipient": recipient, "verb": verb}
    if target is not None:
        kwargs["target_content_type"] = ContentType.objects.get_for_model(target.__class__)
        kwargs["target_object_id"] = getattr(target, "id", None)
    if actor is not None:
        kwargs["actor_content_type"] = ContentType.objects.get_for_model(actor.__class__)
        kwargs["actor_object_id"] = getattr(actor, "id", None)
    if data is not None:
        kwargs["data"] = data
    Notification.objects.create(**kwargs)


@receiver(post_save, sender=Enrollment)
def enrollment_created(sender, instance, created, **kwargs):
    # Notify student that they enrolled (recipient is student)
    if created:
        _create_notification(
            recipient=instance.student,
            verb=Notification.Type.ENROLLMENT,
            target=instance.course,
            actor=instance,
            data={"course_id": instance.course.id, "course_title": instance.course.title},
        )


@receiver(post_save, sender=CourseProgress)
def course_progress_saved(sender, instance, created, **kwargs):
    # When a lesson progress is saved and the enrollment becomes completed => notify the student
    enrollment = instance.enrollment
    if enrollment.is_course_completed():
        # create a completion notification
        # but avoid creating duplicates: check existing notifications for this enrollment/course
        exists = Notification.objects.filter(
            recipient=enrollment.student,
            verb=Notification.Type.COURSE_COMPLETION,
            target_content_type__model="course",
            target_object_id=enrollment.course.id,
        ).exists()
        if not exists:
            _create_notification(
                recipient=enrollment.student,
                verb=Notification.Type.COURSE_COMPLETION,
                target=enrollment.course,
                actor=enrollment,
                data={"course_id": enrollment.course.id, "progress": enrollment.get_progress_percentage()},
            )


@receiver(post_save, sender=Certificate)
def certificate_created(sender, instance, created, **kwargs):
    if created:
        _create_notification(
            recipient=instance.student,
            verb=Notification.Type.CERTIFICATE,
            target=instance,
            actor=instance,
            data={"course_id": instance.course.id, "certificate_code": instance.certificate_code},
        )


@receiver(post_save, sender=Assignment)
def assignment_created(sender, instance, created, **kwargs):
    # On assignment publish/creation, notify enrolled students (recipient=each student)
    if created or instance.status == Assignment.Status.PUBLISHED if hasattr(Assignment, 'Status') else created:
        enrollments = Enrollment.objects.filter(course=instance.course)
        for en in enrollments:
            _create_notification(
                recipient=en.student,
                verb=Notification.Type.ASSIGNMENT_DUE,
                target=instance,
                actor=instance,
                data={"assignment_id": instance.id, "title": instance.title, "due_date": str(instance.due_date)},
            )


@receiver(post_save, sender=AssignmentSubmission)
def assignment_submission_saved(sender, instance, created, **kwargs):
    # If submission is graded, notify the student
    if not created and instance.status == AssignmentSubmission.Status.GRADED if hasattr(AssignmentSubmission, 'Status') else False:
        _create_notification(
            recipient=instance.student,
            verb=Notification.Type.ASSIGNMENT_GRADED,
            target=instance.assignment,
            actor=instance,
            data={"assignment_id": instance.assignment.id, "score": instance.score},
        )


@receiver(post_save, sender=QuizAttempt)
def quiz_attempt_saved(sender, instance, created, **kwargs):
    # When a quiz attempt is submitted (status SUBMITTED), notify the student with result
    if instance.status == QuizAttempt.Status.SUBMITTED if hasattr(QuizAttempt, 'Status') else False:
        _create_notification(
            recipient=instance.student,
            verb=Notification.Type.QUIZ_RESULT,
            target=instance,
            actor=instance,
            data={"quiz_id": instance.quiz.id, "score": float(instance.score)},
        )
