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
        'active',
        'on_trip',
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
        'modified',
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


class RetailDeviceStatusAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'device',
        'last_update',
        'status',
        'last_connection',
        'delayed',
        'delay_time',
        'log_counts',
    )

    search_fields = ('device__name',)


class DeviceHistoryAdmin(admin.ModelAdmin):
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


class RetailDeviceHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'get_device_name',
        'register_datetime',
        'last_connection',
        'status',
        'delayed',
        'delay_time',
    )

    def get_device_name(self, obj):
        return obj.device.name

    search_fields = ('device__name',)


class ClientAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'keyname',
        'active',
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

    search_fields = ('camera__name',)

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
        'priority',
        'description',
        'deployment'
    )


class AlertAdmin(admin.ModelAdmin):
    list_display = (
        'gx',
        'alert_type',
        'register_datetime'
    )


class SeverityCountAdmin(admin.ModelAdmin):
    list_display = (
        'deployment',
        'client',
        'timestamp',
        'severity_counts',
    )

    search_fields = ('deployment__name',)


class ServerStatusAdmin(admin.ModelAdmin):
    list_display = (
        'server',
        'last_launch',
        'last_activity',
        'state',
        'activity_data',
    )

    search_fields = ('server__name',)


class ServerHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'server',
        'metric_type',
        'metric_value',
        'register_datetime',
    )


class UnitTripAdmin(admin.ModelAdmin):
    list_display = (
        'unit',
        'start_datetime',
        'end_datetime',
        'active'
    )

    search_fields = ('unit__name',)


class ServerAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'launch_time',
    )


class ELBStatusAdmin(admin.ModelAdmin):
    list_display = (
        'elb',
        'critical',
        'last_activity',
        'state_code',
        'activity_data',
    )


class ELBHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'elb',
        'critical',
        'metric_type',
        'metric_value',
        'register_datetime',
    )


class ServerMetricAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'key',
        'statistic',
        'service',
        'threshold',
        'to_exceed'
    )


class RombergDeviceStatusAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'device',
        'get_device_description',
        'last_activity',
        'last_detection',
        'status',
        'delayed',
        'delay_time',
        'log_counts',
        'records',
    )

    search_fields = ('device__name',)

    def get_device_description(self, obj):
        return obj.device.description

    get_device_description.short_description = 'Descriptión'
    get_device_description.admin_order_field = 'device__description'


class RombergDeviceHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'device',
        'get_device_description',
        'register_datetime',
        'last_activity',
        'status',
        'delayed',
        'delay_time',
        'log_counts',
    )

    search_fields = ('device__name',)

    def get_device_description(self, obj):
        return obj.device.description

    get_device_description.short_description = 'Description'
    get_device_description.admin_order_field = 'device__description'


class GxRecordsAdmin(admin.ModelAdmin):
    list_display = (
        'gx',
        'metric',
        'avg_value',
        'max_value',
        'min_value',
    )


admin.site.register(Unit, UnitAdmin)
admin.site.register(UnitStatus, UnitStatusAdmin)
admin.site.register(UnitTrip, UnitTripAdmin)
admin.site.register(UnitHistory, UnitHistoryAdmin)

admin.site.register(Deployment)
admin.site.register(Client, ClientAdmin)

admin.site.register(Device, DeviceAdmin)
admin.site.register(DeviceStatus, DeviceStatusAdmin)
admin.site.register(DeviceHistory, DeviceHistoryAdmin)

admin.site.register(Camera)
admin.site.register(CameraStatus, CameraStatusAdmin)
admin.site.register(CameraHistory, CameraHistoryAdmin)
admin.site.register(GxStatus, GxStatusAdmin)
admin.site.register(Alert, AlertAdmin)
admin.site.register(SeverityCount, SeverityCountAdmin)

admin.site.register(Project)

admin.site.register(Server)
admin.site.register(ServerMetric, ServerMetricAdmin)
admin.site.register(ServerStatus, ServerStatusAdmin)
admin.site.register(ServerHistory, ServerHistoryAdmin)
admin.site.register(ServerRegion)

admin.site.register(RDS)
admin.site.register(RDSInstanceClass)
admin.site.register(RDSStatus)
admin.site.register(RDSHistory)

admin.site.register(LoadBalancer)
admin.site.register(LoadBalancerStatus, ELBStatusAdmin)
admin.site.register(LoadBalancerHistory, ELBHistoryAdmin)

admin.site.register(RetailDeviceStatus, RetailDeviceStatusAdmin)
admin.site.register(RetailDeviceHistory, RetailDeviceHistoryAdmin)

admin.site.register(RombergDeviceStatus, RombergDeviceStatusAdmin)
admin.site.register(RombergDeviceHistory, RombergDeviceHistoryAdmin)

admin.site.register(GxMetric)
admin.site.register(GxRecord, GxRecordsAdmin)
