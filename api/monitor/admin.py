from django.contrib import admin
from .models import *


class UnitAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'client',
    )


class UnitStatusAdmin(admin.ModelAdmin):
    list_display = (
        'unit',
        'last_update',
        # 'get_client',
        'total',
        'restart',
        'start',
        'reboot',
        'data_validation',
        'source_missing',
        'camera_connection',
        'storage_devices',
        'forced_reboot',
        'read_only_ssd',
        'others',
        'ignition',
        'aux',
        'status',
        'restarting_loop',
        'last_connection'
    )

    search_fields = ('unit__name',)

    def get_client(self, obj):
        return obj.unit.client.name

    get_client.short_description = 'Client'
    get_client.admin_order_field = 'unit__client__name'


class UnitHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'unit',
        'register_datetime',
        'last_connection',
        # 'get_client',
        'total',
        'restart',
        'start',
        'reboot',
        'data_validation',
        'source_missing',
        'camera_connection',
        'storage_devices',
        'forced_reboot',
        'read_only_ssd',
        'others',
        'status',
        'restarting_loop',

    )

    search_fields = ('unit__name',)

    def get_client(self, obj):
        return obj.unit.client.name

    get_client.short_description = 'Client'
    get_client.admin_order_field = 'unit__client__name'


class DeviceAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'client',
        'license_days'
    )


class DeviceStatusAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'device',
        'last_update',
        'last_connection',
        'delayed',
        'delay_time',
        'batch_dropping',
        'camera_connection',
        'restart',
        'license',
        'shift_change',
        'others',

    )

    search_fields = ('device__name',)


class DevicesHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'device',
        'register_datetime',
        'last_connection',
        'status',
        'delayed',
        'delay_time',
        'batch_dropping',
        'camera_connection',
        'restart',
        'license',
        'shift_change',
        'others',
    )

    search_fields = ('device__name',)


class ClientAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'deployment',
    )


class CameraStatusAdmin(admin.ModelAdmin):
    list_display = (
        'get_camera',
        'get_client',
        'last_update',
        'connected',
        'disconnection_time',
    )

    def get_client(self, obj):
        return obj.camera.gx.client.name

    get_client.short_description = 'Cliente'
    get_client.admin_order_field = 'camera__gx__client__name'

    def get_camera(self, obj):
        return obj.camera.name

    get_camera.short_description = 'Camera'
    get_camera.admin_order_field = 'camera__name'

    search_fields = ('camera__name',)


class CameraHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'get_camera',
        'get_client',
        'register_datetime',
        'connected',
        'disconnection_time',
    )

    search_fields = ('camera__gx__client__name',)

    def get_client(self, obj):
        return obj.camera.gx.client.name

    get_client.short_description = 'Cliente'
    get_client.admin_order_field = 'camera__gx__client__name'

    def get_camera(self, obj):
        return obj.camera.name

    get_camera.short_description = 'Camera'
    get_camera.admin_order_field = 'camera__name'


class GxStatusAdmin(admin.ModelAdmin):
    list_display = (
        'severity',
        'reason',
        'description',
        'deployment'
    )


admin.site.register(UnitStatus, UnitStatusAdmin)
admin.site.register(UnitHistory, UnitHistoryAdmin)
admin.site.register(Unit, UnitAdmin)
admin.site.register(Deployment)
admin.site.register(Client, ClientAdmin)
admin.site.register(DeviceStatus, DeviceStatusAdmin)
admin.site.register(DeviceHistory, DevicesHistoryAdmin)
admin.site.register(Device, DeviceAdmin)

admin.site.register(Camera)
admin.site.register(CameraStatus, CameraStatusAdmin)
admin.site.register(CameraHistory, CameraHistoryAdmin)
admin.site.register(GxStatus, GxStatusAdmin)
admin.site.register(Alert)
