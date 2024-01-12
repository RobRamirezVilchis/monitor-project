from django.dispatch import Signal

pre_soft_delete = Signal(use_caching=True)
post_soft_delete = Signal(use_caching=True)

pre_restore = Signal(use_caching=True)
post_restore = Signal(use_caching=True)
