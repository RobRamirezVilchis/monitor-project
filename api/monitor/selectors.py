from .services import EncryptionService
from .models import *
from django_filters import rest_framework as rf_filters
from django.db.models import Q, F, Count, Max, Min
from datetime import datetime, timedelta
from django.db.models import Subquery


def get_deployments():
    return Deployment.objects.all()


def get_unit(unit_id):
    return Unit.objects.get(id=unit_id)


def active_unitstatus_list():
    return UnitStatus.objects.filter(active=True)


def get_inactive_units():
    date_now = datetime.now()

    return UnitStatus.objects.filter(active=True, last_update__lte=(date_now-timedelta(minutes=30)))


def devicestatus_list():
    return DeviceStatus.objects.filter(device__client__active=True).order_by("-status__severity")


def camerastatus_list():
    return CameraStatus.objects.all()


def get_clients(deployment_name=None):
    deployment_query = Q()
    if deployment_name:
        deployment_query = Q(deployment__name=deployment_name)
    return Client.objects.filter(deployment_query)


class CameraDisconnectionsFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    camera = rf_filters.CharFilter(
        field_name='camera__name', lookup_expr="icontains")
    sort = rf_filters.OrderingFilter(
        fields=(
            'register_datetime',
            'camera',
            'disconnection_time',
        )
    )

    class Meta:
        model = CameraHistory
        fields = ['register_datetime',
                  'camera__name',
                  'disconnection_time',
                  ]


def get_cameradisconnections(args, filters=None):
    logs = CameraHistory.objects.filter(
        camera__gx_id=args['device_id'], disconnection_time__gt=timedelta(0)).order_by('register_datetime')

    return CameraDisconnectionsFilter(filters, logs).qs


def get_unithistory(args, filters=None):

    # print(start_date, end_date)
    logs = UnitHistory.objects.filter(
        unit_id=args['unit_id'],
    )

    return UnitHistoryFilter(filters, logs).qs


def get_unitstatus(unit_id):
    try:
        unit_status = UnitStatus.objects.get(
            unit_id=unit_id
        )
    except:
        unit_status = None
    return unit_status


def get_devicestatus(device_id):
    return DeviceStatus.objects.get(
        device_id=device_id,
    )


def get_or_create_deployment(name):
    deployment, created = Deployment.objects.get_or_create(
        name=name,
    )
    return deployment


def get_deployment_clients(deployment):
    return Client.objects.filter(deployment=deployment, active=True)


def get_client(args):
    client = Client.objects.get(
        name=args['name'],
        deployment=args['deployment']
    )
    return client


def get_or_create_gxstatus(args):

    status_obj, created = GxStatus.objects.get_or_create(**args)

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


def get_device_by_id(device_id):
    return Device.objects.get(id=device_id)


def get_or_create_device(args):
    device, created = Device.objects.get_or_create(
        client_id=args["client"].id,
        name=args["name"]
    )
    return device


class UnitHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    description = rf_filters.CharFilter(
        field_name='status__description', lookup_expr="icontains")
    on_trip = rf_filters.BooleanFilter(field_name='on_trip')
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
                  'on_trip']


def get_unithistory(args, filters=None):

    logs = UnitHistory.objects.filter(
        unit_id=args['unit_id'],
    )

    return UnitHistoryFilter(filters, logs).qs


class DeviceHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    description = rf_filters.CharFilter(
        field_name='status__description', lookup_expr="icontains")
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


def get_or_create_alerttype(args):
    alert_type, created = AlertType.objects.get_or_create(
        description=args["description"]
    )

    return alert_type


def get_unit_last_active_status(unit_id):
    last_status = UnitHistory.objects.filter(unit_id=unit_id).exclude(
        Q(status__description="Inactivo") |
        Q(status__description="Sin comunicación reciente") |
        Q(status__description="Sin comunicación reciente (< 1 día)") |
        Q(status__description="Sin comunicación (>2 viajes)") |
        Q(status__description="Logs pendientes (>100)") |
        Q(status__description="Logs pendientes (>20)")).order_by('-register_datetime').first()

    return last_status


def get_sd_critical_last_day():
    import datetime
    import pytz

    date_now = datetime.datetime.now()
    end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
        tzinfo=pytz.utc) + datetime.timedelta(hours=6)
    start_date = end_date - timedelta(hours=24)
    all_critical_registers = UnitHistory.objects.filter(
        status__severity=5, register_datetime__range=(start_date, end_date))

    return all_critical_registers


class SDScatterplotDataFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateFromToRangeFilter()

    class Meta:
        model = UnitHistory
        fields = ['register_datetime']


def get_sd_scatterplot_data(args, filters=None):

    logs = UnitHistory.objects.filter(
        unit_id=args['unit_id'],
    )

    return SDScatterplotDataFilter(filters, logs).qs


class IndustryScatterplotDataFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateFromToRangeFilter()

    class Meta:
        model = DeviceHistory
        fields = ['register_datetime']


def get_ind_scatterplot_data(args, filters=None):

    logs = DeviceHistory.objects.filter(
        device_id=args['device_id'],
    )

    return IndustryScatterplotDataFilter(filters, logs).qs


def get_units_severity_counts(client=None):
    client_query = Q()
    if client:
        client_query = Q(unit__client=client)
    counts = UnitStatus.objects.filter(client_query, active=True).filter(active=True).values('status__severity') \
        .annotate(severity=F('status__severity')) \
        .values('severity') \
        .annotate(count=Count('id')) \
        .order_by('-severity')

    return counts


def get_units_problem_counts(client=None):
    client_query = Q()
    if client:
        client_query = Q(unit__client=client)
    counts = UnitStatus.objects.filter(client_query).filter(active=True).values('status__description') \
        .annotate(severity=F('status__severity')) \
        .annotate(description=F('status__description')) \
        .values('description', 'severity') \
        .annotate(count=Count('description')) \
        .order_by('-severity')

    return counts


def get_devices_severity_counts(client):
    client_query = Q()
    if client:
        client_query = Q(device__client=client)
    counts = DeviceStatus.objects.filter(client_query).values('status__severity') \
        .annotate(severity=F('status__severity')) \
        .values('severity') \
        .annotate(count=Count('id')) \
        .order_by('-severity')

    return counts


class AreaPlotDataFilter(rf_filters.FilterSet):
    timestamp = rf_filters.DateFromToRangeFilter()

    class Meta:
        model = SeverityCount
        fields = ['timestamp']


def get_area_plot_data(deployment_name, client_name=None, filters=None):
    client_query = Q()
    if client_name:
        client_query = Q(client__name=client_name)
    logs = SeverityCount.objects.filter(
        client_query,
        deployment__name=deployment_name).order_by("timestamp")

    return AreaPlotDataFilter(filters, logs).qs


def register_sd_area_plot_historicals():

    safe_driving = Deployment.objects.get(name="Safe Driving")
    clients = get_clients(deployment_name="Safe Driving")

    for client in clients:
        current_hour = datetime.now().replace(
            minute=0, second=0, microsecond=0)
        hour_to_search = current_hour
        no_data = 0

        all_severity_counts = []
        while no_data < 100:
            limit = hour_to_search + timedelta(minutes=1)
            logs_in_interval = UnitHistory.objects.filter(
                unit__client=client,
                register_datetime__range=(hour_to_search, limit))

            severity_count_in_hour = logs_in_interval.values('status__severity') \
                .annotate(severity=F('status__severity')) \
                .values('severity') \
                .annotate(count=Count('id')) \
                .order_by('-severity')

            if severity_count_in_hour:
                count_dict = {str(x["severity"]): x["count"]
                              for x in severity_count_in_hour}

                for n in range(6):
                    if str(n) not in count_dict:
                        count_dict[str(n)] = 0

                sd_count_args = {
                    "deployment": safe_driving,
                    "client": client,
                    "timestamp": hour_to_search,
                    "date": hour_to_search.date(),
                    "severity_counts": count_dict
                }
                all_severity_counts.append(SeverityCount(**sd_count_args))

            hour_to_search -= timedelta(hours=1)
            if not logs_in_interval:
                no_data += 1
            else:
                no_data = 0

        SeverityCount.objects.bulk_create(all_severity_counts)


def register_ind_area_plot_historicals():

    industry = Deployment.objects.get(name="Industry")
    clients = get_clients("Industry")

    for client in clients:
        current_hour = datetime.now().replace(
            minute=0, second=0, microsecond=0)
        hour_to_search = current_hour
        no_data = 0

        all_severity_counts = []
        while no_data < 100:
            limit = hour_to_search + timedelta(minutes=1)
            logs_in_interval = DeviceHistory.objects.filter(
                device__client=client,
                register_datetime__range=(hour_to_search, limit))

            severity_count_in_hour = logs_in_interval.values('status__severity') \
                .annotate(severity=F('status__severity')) \
                .values('severity') \
                .annotate(count=Count('id')) \
                .order_by('-severity')

            if severity_count_in_hour:
                count_dict = {str(x["severity"]): x["count"]
                              for x in severity_count_in_hour}

                for n in range(6):
                    if str(n) not in count_dict:
                        count_dict[str(n)] = 0

                severity_count_args = {
                    "deployment": industry,
                    "client": client,
                    "timestamp": hour_to_search,
                    "date": hour_to_search.date(),
                    "severity_counts": count_dict
                }
                all_severity_counts.append(
                    SeverityCount(**severity_count_args))
                print(severity_count_args)

            hour_to_search -= timedelta(hours=1)
            if not logs_in_interval:
                no_data += 1
            else:
                no_data = 0

        SeverityCount.objects.bulk_create(all_severity_counts)


def get_last_sd_update():
    try:
        status = UnitStatus.objects.filter(
            active=True).order_by('-last_update')[0]
    except IndexError:
        status = None

    return status


def get_last_ind_update():
    status = DeviceStatus.objects.order_by('-last_update')[0]

    return status


def check_wifi_alerts(device_id):
    import datetime
    import pytz

    date_now = datetime.date.today()
    limit = date_now - datetime.timedelta(weeks=1)

    alerts = Alert.objects.filter(gx_id=device_id,  register_date__gt=limit,
                                  alert_type__description="Problemas de conexión (mensajes atrasados)")

    return alerts


def get_api_credentials(deployment_name, keyname):
    try:
        client = Client.objects.get(
            deployment__name=deployment_name, keyname=keyname)
    except:
        return None
    encrypt = EncryptionService()

    username = client.api_username
    password = encrypt.decrypt(bytes(client.api_password)).decode('utf-16')

    return {"username": username, "password": password}


def get_or_create_server(aws_id: str, defaults: dict):
    server, created = Server.objects.get_or_create(
        aws_id=aws_id,
        defaults=defaults
    )
    return server


def get_all_servers():
    return Server.objects.filter(serverstatus__active=True)


def get_projects():
    return Project.objects.all()


def set_servers_as_inactive():
    from datetime import datetime, timedelta

    to_inactivate = ServerStatus.objects.filter(
        active=True, last_activity__lt=datetime.now()-timedelta(days=3))

    for server_status in to_inactivate:
        server_status.active = False
        server_status.save()


def get_serverstatus_by_awsid(aws_id: str):
    try:
        server_status = ServerStatus.objects.get(
            server__aws_id=aws_id,
        )
    except ServerStatus.DoesNotExist:
        return None

    return server_status


def get_serverstatus(server_id: int):
    try:
        server_status = ServerStatus.objects.get(
            server_id=server_id,
        )
    except ServerStatus.DoesNotExist:
        return None

    return server_status


class ServerStatusFilter(rf_filters.FilterSet):
    server_type = rf_filters.CharFilter(field_name="server__server_type")
    region = rf_filters.CharFilter(field_name="server__region__name")

    class Meta:
        model = ServerStatus
        fields = ['server__server_type', 'server__region']


def get_serverstatus_list(filters=None):
    all_server_status = ServerStatus.objects.filter(active=True)
    return ServerStatusFilter(filters, all_server_status).qs


def update_or_create_serverstatus(aws_id: str, defaults: dict):
    server_status, created = ServerStatus.objects.update_or_create(
        server__aws_id=aws_id,
        defaults=defaults
    )
    return server_status


def create_serverhistory(args):
    server_history = ServerHistory.objects.create(
        **args
    )
    return server_history


def get_servermetrics(service: str):
    return ServerMetric.objects.filter(service=service)


class ServerHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    metric_type = rf_filters.CharFilter(
        field_name='metric_type__key', lookup_expr="icontains")
    sort = rf_filters.OrderingFilter(
        fields=(
            'register_datetime',
            'metric_type',
            'metric_value'
        )
    )

    class Meta:
        model = ServerHistory
        fields = ['register_datetime',
                  'server',
                  'metric_type',
                  'metric_value'
                  ]


def get_serverhistory(args, filters=None):
    logs = ServerHistory.objects.filter(
        server_id=args["server_id"]).order_by('register_datetime')

    return ServerHistoryFilter(filters, logs).qs


def get_serverregions():
    return ServerRegion.objects.all()


def get_servertypes():
    types = Server.objects.order_by(
        "server_type").values("server_type").distinct()
    return types


def get_all_rds():
    return RDS.objects.all()


def get_or_create_rds(name: str, defaults: dict):
    server, created = RDS.objects.get_or_create(
        name=name,
        defaults=defaults
    )
    return server


def update_or_create_rdsstatus(name: str, defaults: dict):
    rds_status, created = RDSStatus.objects.update_or_create(
        rds__name=name,
        defaults=defaults
    )
    return rds_status


def create_rdshistory(args):
    rds_history = RDSHistory.objects.create(
        **args
    )
    return rds_history


def get_rdsstatus_by_name(name: str):
    try:
        rds_status = RDSStatus.objects.get(
            rds__name=name,
        )
    except RDSStatus.DoesNotExist:
        return None

    return rds_status


def get_rdsstatus(rds_id: str):
    try:
        rds_status = RDSStatus.objects.get(
            rds_id=rds_id,
        )
    except RDSStatus.DoesNotExist:
        return None

    return rds_status


class RDSStatusFilter(rf_filters.FilterSet):
    instance_class = rf_filters.CharFilter(field_name="rds__instance_class")
    region = rf_filters.CharFilter(field_name="rds__region__name")

    class Meta:
        model = RDSStatus
        fields = ['rds__instance_class', 'rds__region']


def get_rdsstatus_list(filters=None):
    all_rds_status = RDSStatus.objects.all()
    return RDSStatusFilter(filters, all_rds_status).qs


def get_servermetrics(service: str):
    return ServerMetric.objects.filter(service=service)


class RDSHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    metric_type = rf_filters.CharFilter(
        field_name='metric_type__key', lookup_expr="icontains")
    sort = rf_filters.OrderingFilter(
        fields=(
            'register_datetime',
            'metric_type',
            'metric_value'
        )
    )

    class Meta:
        model = RDSHistory
        fields = ['register_datetime',
                  'rds',
                  'metric_type',
                  'metric_value'
                  ]


def get_rdshistory(args, filters=None):
    logs = RDSHistory.objects.filter(
        rds_id=args["rds_id"]).order_by('register_datetime')

    return RDSHistoryFilter(filters, logs).qs


def get_rdstypes():
    types = RDS.objects.order_by(
        "instance_class").values("instance_class").distinct()
    return types


# Retail --------------------------------------


def retail_device_status_list():
    return RetailDeviceStatus.objects.filter(active=True)


def get_retail_device_status(device_id):
    return RetailDeviceStatus.objects.get(
        device_id=device_id,
    )


class RetailDeviceHistoryFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateTimeFromToRangeFilter()
    description = rf_filters.CharFilter(
        field_name='status__description', lookup_expr="icontains")
    sort = rf_filters.OrderingFilter(
        fields=(
            'register_datetime',
            ('status__severity', 'severity'),
            'last_connection',
            'delayed',
            'delay_time',
            'status',
        )
    )

    class Meta:
        model = RetailDeviceHistory
        fields = ['register_datetime', 'status']


def get_retail_device_history(args, filters=None):

    logs = RetailDeviceHistory.objects.filter(
        device__id=args['device_id'],
    )
    return RetailDeviceHistoryFilter(filters, logs).qs


class RetailScatterplotDataFilter(rf_filters.FilterSet):
    register_datetime = rf_filters.DateFromToRangeFilter()

    class Meta:
        model = RetailDeviceHistory
        fields = ['register_datetime']


def get_retail_scatterplot_data(args, filters=None):

    logs = RetailDeviceHistory.objects.filter(
        device_id=args['device_id'],
    )

    return RetailScatterplotDataFilter(filters, logs).qs


def get_retail_devices_severity_counts(client):
    client_query = Q()
    if client:
        client_query = Q(device__client=client)
    counts = RetailDeviceStatus.objects.filter(client_query, active=True).values('status__severity') \
        .annotate(severity=F('status__severity')) \
        .values('severity') \
        .annotate(count=Count('id')) \
        .order_by('-severity')

    return counts


def get_retail_clients():
    clients = Client.objects.filter(
        deployment=Deployment.objects.get(name="Smart Retail"))

    return clients


def get_or_create_open_trip(unit: Unit, start_datetime: datetime):

    trip, created = UnitTrip.objects.get_or_create(
        unit=unit, end_datetime__isnull=True, defaults={'start_datetime': start_datetime, 'start_date': start_datetime.date()})
    return trip, created


def get_unit_failed_trips(unit: Unit):
    latest_active_end_datetime_subquery = UnitTrip.objects.filter(
        unit=unit,
        active=True,
    ).order_by('-end_datetime').values('end_datetime')[:1]

    trips = UnitTrip.objects.filter(unit=unit, active=False, start_datetime__gt=Subquery(
        latest_active_end_datetime_subquery))

    return trips
