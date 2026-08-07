import json

from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict

from accounts.permissions import is_admin
from .models import AuditLog


def snapshot(obj):
    return json.loads(json.dumps(model_to_dict(obj), cls=DjangoJSONEncoder, default=str))


def object_label(obj):
    return f"{obj._meta.label}:{obj.pk}"


def log_admin_action(user, action, obj, previous_value=None, new_value=None):
    if not is_admin(user):
        return None
    return AuditLog.objects.create(
        user=user,
        action=action,
        object=object_label(obj),
        previous_value=previous_value,
        new_value=new_value,
    )
