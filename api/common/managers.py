from typing import Any, Dict, Tuple
from django.db import models
from django.conf import settings

from .query import SoftDeletableQuerySet


class SoftDeletableManager(models.Manager):
    def get_queryset(self):
        return SoftDeletableQuerySet(self.model, using=self._db).filter(**{settings.SOFT_DELETABLE_FIELD: None})
    
    def restore(self) -> Tuple[int, Dict[str, int]]:
        """Restore the records in the current QuerySet."""
        return self.get_queryset().restore()

    def get_or_restore_or_create(self, defaults = None, **kwargs) -> Tuple[Any, bool]:
        """Restore the records in the current QuerySet or create them."""
        return self.get_queryset().restore_or_create(defaults=defaults, **kwargs)
    
    def unpatched(self):
        """Return an unpatched version of the current QuerySet."""
        return self.get_queryset().unpatched()

    def deleted(self):
        """Return a QuerySet of all deleted records."""
        return self.get_queryset().unpatched().filter(**{f"{settings.SOFT_DELETABLE_FIELD}__isnull": False})