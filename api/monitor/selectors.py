from .models import *
from django_filters import rest_framework as rf_filters


def unitstatus_list():
    return UnitStatus.objects.all()


def devicestatus_list():
    return DeviceStatus.objects.all().order_by("-status__severity")


def camerastatus_list():
    return CameraStatus.objects.all()


def get_unitstatus(unit_id):
    return UnitStatus.objects.get(
        unit_id=unit_id
    )


def get_devicestatus(device_id):
    return DeviceStatus.objects.get(
        device_id=device_id
    )


def get_deployment(name):
    deployment = Deployment.objects.get(
        name=name,
    )
    return deployment


def get_or_create_client(args):
    client, created = Client.objects.get_or_create(
        name=args['name'],
        deployment=args['deployment']
    )
    return client


def get_or_create_gxstatus(args):
    status_obj, created = GxStatus.objects.get_or_create(
        reason=args['reason'],
        severity=args['severity'],
        deployment=args['deployment']
    )
    return status_obj


def get_or_create_unit(args):
    unit_obj, created = Unit.objects.get_or_create(
        name=args['name'],
        client=args['client']
    )
    return unit_obj


def get_or_create_camera(args):
    camera_obj, created = Camera.objects.get_or_create(
        name=args['name'],
        gx=args['gx']
    )
    return camera_obj


def get_or_create_device(args):
    device, created = Device.objects.get_or_create(
        client_id=args["client"].id,
        name=args["name"]
    )
    return device


class UnitHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    sort = rf_filters.OrderingFilter(
        fields=(
            'register_datetime',
            'total',
            'restart',
            'reboot',
            'start',
            'data_validation',
            'source_missing',
            'camera_connection',
            'storage_devices',
            'forced_reboot',
            'read_only_ssd',
            'ignition',
            'aux',
            'others',
            'last_connection',
            'pending_events',
            'pending_status',
            'restarting_loop',
            'on_trip',
            ('status__severity', 'severity'),
            ('status__description', 'description')
        )
    )

    class Meta:
        model = UnitHistory
        fields = ['register_datetime',
                  'status',

                  'total',
                  'restart',
                  'reboot',
                  'start',
                  'data_validation',
                  'source_missing',
                  'camera_connection',
                  'storage_devices',
                  'forced_reboot',
                  'read_only_ssd',
                  'ignition',
                  'aux',
                  'others',
                  'last_connection',
                  'pending_events',
                  'pending_status',
                  'restarting_loop',
                  'on_trip',
                  'status']


def get_unithistory(args, filters=None):

    # print(start_date, end_date)
    logs = UnitHistory.objects.filter(
        unit_id=args['unit_id'],
    )

    return UnitHistoryFilter(filters, logs).qs


class DeviceHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    sort = rf_filters.OrderingFilter(
        fields=(
            'register_datetime',
            ('status__severity', 'severity'),
            'last_connection',
            'delayed',
            'delay_time',
            'batch_dropping',
            'camera_connection',
            'restart',
            'license',
            'shift_change',
            'others',
            'status',
        )
    )

    class Meta:
        model = DeviceHistory
        fields = ['register_datetime', 'status']


def get_devicehistory(args, filters=None):

    logs = DeviceHistory.objects.filter(
        device__id=args['device_id'],
    )
    return DeviceHistoryFilter(filters, logs).qs


def get_sd_clients():
    clients = Client.objects.filter(
        deployment=Deployment.objects.get(name="Safe Driving"))

    return clients


def get_industry_clients():
    clients = Client.objects.filter(
        deployment=Deployment.objects.get(name="Industry"))

    return clients
