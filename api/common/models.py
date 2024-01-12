from django.db import models, router
from django.conf import settings
from django.utils import timezone

from .deletion import SoftDeletableCollector as Collector
from .managers import SoftDeletableManager
from .signals import pre_restore, post_restore


class BaseModel(models.Model):
    created_at = models.DateTimeField(db_index=True, default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeletableModel(models.Model):
    all_objects = models.Manager()
    objects = SoftDeletableManager()

    class Meta:
        abstract = True

    def delete(self, force: bool = False, using=None, keep_parents=False):
        """Delete the current instance."""
        if self.pk is None:
            raise ValueError(
                "%s object can't be deleted because its %s attribute is set "
                "to None." % (self._meta.object_name, self._meta.pk.attname)
            )
        using = using or router.db_for_write(self.__class__, instance=self)
        collector = Collector(using=using, origin=self)
        collector.collect([self], keep_parents=keep_parents)
        return collector.delete(force)
    
    def restore(self, using=None):
        """Restore the current instance."""
        if getattr(self, settings.SOFT_DELETABLE_FIELD) is None:
            return
        using = using or router.db_for_write(self.__class__, instance=self)
        pre_restore.send(sender=self.__class__, instance=self, using=using)
        setattr(self, settings.SOFT_DELETABLE_FIELD, None)
        self.save(update_fields=[settings.SOFT_DELETABLE_FIELD], using=using)
        post_restore.send(sender=self.__class__, instance=self, using=using)


soft_deletable_field = settings.SOFT_DELETABLE_FIELD
SoftDeletableModel.add_to_class(
    soft_deletable_field,
    models.DateTimeField(**settings.SOFT_DELETABLE_FIELD_KWARGS)
)
