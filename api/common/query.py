from typing import Any, Dict, Optional, Tuple
from django.db.models.query import QuerySet
from django.conf import settings

from .deletion import SoftDeletableCollector as Collector


class SoftDeletableQuerySet(QuerySet):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._unpatched = False

    def delete(self, force: bool = False) -> Tuple[int, Dict[str, int]]:
        """Delete the records in the current QuerySet."""
        self._not_support_combined_queries("delete")
        if self.query.is_sliced:
            raise TypeError("Cannot use 'limit' or 'offset' with delete().")
        if self.query.distinct or self.query.distinct_fields:
            raise TypeError("Cannot call delete() after .distinct().")
        if self._fields is not None:
            raise TypeError("Cannot call delete() after .values() or .values_list()")

        del_query = self._chain()

        # The delete is actually 2 queries - one to find related objects,
        # and one to delete. Make sure that the discovery of related
        # objects is performed on the same database as the deletion.
        del_query._for_write = True

        # Disable non-supported fields.
        del_query.query.select_for_update = False
        del_query.query.select_related = False
        del_query.query.clear_ordering(force=True)

        collector = Collector(using=del_query.db, origin=self)
        collector.collect(del_query)
        deleted, _rows_count = collector.delete(force)

        # Clear the result cache, in case this QuerySet gets reused.
        self._result_cache = None
        return deleted, _rows_count
    
    def restore(self) -> Tuple[int, Dict[str, int]]:
        """Restore the records in the current QuerySet."""
        return self.unpatched().filter(
            **{f"{settings.SOFT_DELETABLE_FIELD}__isnull": False}
        ).update(**{settings.SOFT_DELETABLE_FIELD: None})
    
    def get_or_restore_or_create(self, defaults = None, **kwargs) -> Tuple[Any, bool]:
        """Restore the records in the current QuerySet or create them."""
        obj, created = self.unpatched().get_or_create(defaults=defaults, **kwargs)
        if not created:
            obj.restore()
        return obj, created

    def _unpatch(self):
        """Unpatch the current QuerySet."""
        self._unpatched = True
        if not self.query.where.children:
            return
        child = self.query.where.children[0]
        if child.lhs.target.name == settings.SOFT_DELETABLE_FIELD:
            self.query.where.children.pop(0)

    def unpatched(self):
        """Return the unpatched QuerySet."""
        if self._unpatched:
            return self
        clone = self._chain()
        clone._unpatch()
        return clone
