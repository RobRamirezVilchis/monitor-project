from django.db import models, router
from django.conf import settings
from django.utils import timezone

from .deletion import SoftDeletableCollector as Collector
from .managers import SoftDeletableManager
from .signals import pre_restore, post_restore


class BaseModel(models.Model):
    """
    An abstract base class model that provides self-updating `created_at` and `updated_at` fields.
    """
    created_at = models.DateTimeField(db_index=True, default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeletableModel(models.Model):
    """
    An abstract base class model with a `deleted` field that marks entries as deleted instead of \
    actually deleting them. The `deleted` field is set to the current datetime when the entry is \
    deleted and it's considered restored when the field is set to `None`. 

    This class defines two managers: `objects` and `all_objects`. The `objects` manager only returns \
    entries that haven't been deleted, while the `all_objects` manager returns all entries, as a normal \
    manager would. Note that the `objects` manager is not considered by default as the base or default \
    model manager in order to prevent unexpected behavior (see why in https://docs.djangoproject.com/en/3.2/topics/db/managers/#default-managers).
    This is normally not a problem, but you may notice that when you call a reverse relation on a model \
    instance, the `all_objects` manager is used instead of the `objects` manager since reverse relation is \
    resolved using the default manager. To solve this issue, you can either set the `all_objects` manager \
    directly in the Meta class of the reversed model setting `default_manager_name` to `objects` (not recommended), \
    or you  can call the relation with a explicit manager (recommended way) using the `objects` manager, \
    like this: `author.articles(manager="objects")`. A cleaner option for the latter is to define a \
    property on the model that calls the relation with the `objects` manager, like this:
    ```
    @property
    def active_articles(self):
        return self.articles(manager="objects")
    ```

    The `deleted` field name and the kwargs passed to the `DateTimeField` can be customized with the `SOFT_DELETABLE_FIELD` \
    and `SOFT_DELETABLE_FIELD_KWARGS` config.settings.soft_delete settings., respectively. The default values are \
    `deleted` and `{"null": True, "blank": True, "default": None, "editable": False}`.
    """
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
