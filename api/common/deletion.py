from collections import Counter
from django.conf import settings
from django.db import models, transaction
from django.db.models import signals, sql
from django.db.models.deletion import Collector
from django.utils import timezone
from functools import reduce
from operator import attrgetter, or_
from typing import Dict, Tuple

from .signals import pre_soft_delete, post_soft_delete


class SoftDeletableCollector(Collector):

    def delete(self, force: bool = False) -> Tuple[int, Dict[str, int]]:
        deletion_time = timezone.now()

        # sort instance collections
        for model, instances in self.data.items():
            self.data[model] = sorted(instances, key=attrgetter("pk"))

        # if possible, bring the models in an order suitable for databases that
        # don't support transactions or cannot defer constraint checks until the
        # end of a transaction.
        self.sort()
        # number of objects deleted for each model label
        deleted_counter = Counter()

        # Optimize for the case with a single obj and no dependencies
        if len(self.data) == 1 and len(instances) == 1:
            instance = list(instances)[0]
            if self.can_fast_delete(instance):
                with transaction.mark_for_rollback_on_error(self.using):
                    if force:
                        count = sql.DeleteQuery(model).delete_batch(
                            [instance.pk], self.using
                        )
                        setattr(instance, model._meta.pk.attname, None)
                    else:
                        sql.UpdateQuery(model).update_batch(
                            [instance.pk], {settings.SOFT_DELETABLE_FIELD: deletion_time}, self.using
                        )
                        count = 1
                return count, {model._meta.label: count}

        with transaction.atomic(using=self.using, savepoint=False):
            # send pre_delete signals
            for model, obj in self.instances_with_model():
                if not model._meta.auto_created:
                    if force:
                        signals.pre_delete.send(
                            sender=model,
                            instance=obj,
                            using=self.using,
                            origin=self.origin,
                        )
                    else:
                        pre_soft_delete.send(
                            sender=model,
                            instance=obj,
                            using=self.using,
                            origin=self.origin,
                        )
                    

            # fast deletes
            for qs in self.fast_deletes:
                if force:
                    count = qs._raw_delete(using=self.using)
                else:
                    count = qs.update(**{settings.SOFT_DELETABLE_FIELD: deletion_time})
                if count:
                    deleted_counter[qs.model._meta.label] += count

            # update fields
            for (field, value), instances_list in self.field_updates.items():
                updates = []
                objs = []
                for instances in instances_list:
                    if (
                        isinstance(instances, models.QuerySet)
                        and instances._result_cache is None
                    ):
                        updates.append(instances)
                    else:
                        objs.extend(instances)
                if updates:
                    combined_updates = reduce(or_, updates)
                    combined_updates.update(**{field.name: value})
                if objs:
                    model = objs[0].__class__
                    query = sql.UpdateQuery(model)
                    query.update_batch(
                        list({obj.pk for obj in objs}), {field.name: value}, self.using
                    )

            # reverse instance collections
            for instances in self.data.values():
                instances.reverse()

            # delete instances
            for model, instances in self.data.items():
                pk_list = [obj.pk for obj in instances]
                if force:
                    query = sql.DeleteQuery(model)
                    count = query.delete_batch(pk_list, self.using)
                    if count:
                        deleted_counter[model._meta.label] += count
                else:
                    query = sql.UpdateQuery(model)
                    query.update_batch(
                        pk_list, {settings.SOFT_DELETABLE_FIELD: deletion_time}, self.using
                    )
                    deleted_counter[model._meta.label] += len(pk_list)

                if not model._meta.auto_created:
                    for obj in instances:
                        if force:
                            signals.post_delete.send(
                                sender=model,
                                instance=obj,
                                using=self.using,
                                origin=self.origin,
                            )
                        else:
                            post_soft_delete.send(
                                sender=model,
                                instance=obj,
                                using=self.using,
                                origin=self.origin,
                            )

        if force:
            for model, instances in self.data.items():
                for instance in instances:
                    setattr(instance, model._meta.pk.attname, None)
        return sum(deleted_counter.values()), dict(deleted_counter)
