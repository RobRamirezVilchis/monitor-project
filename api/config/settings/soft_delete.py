from django.db.models import DateTimeField

SOFT_DELETABLE_FIELD = "deleted"
SOFT_DELETABLE_FIELD_KWARGS = {
    "null": True,
    "blank": True,
    "default": None,
    "editable": False,
}
