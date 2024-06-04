from datetime import datetime
from django.shortcuts import render
from django.db.models import Count, F, Window, Q, Sum
from django.db.models.functions import Lead, Cast
from django.db.models.fields.json import KT
from django.utils.timezone import make_aware
from django_filters.rest_framework import DjangoFilterBackend

import pytz
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status, filters

import humanize.locale

from .selectors import *
from .services import assign_project_to_server, create_project, get_or_create_client
from api.pagination import get_paginated_response, LimitOffsetPagination
from .models import UnitStatus
from .cron import api_login, make_request


class DeploymentList(APIView):
    class OutputSerializer(serializers.Serializer):
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        deployments = get_deployments()

        output = self.OutputSerializer(deployments, many=True).data

        return Response(output)


# All gx status list


class UnitStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        unit_id = serializers.IntegerField()
        unit = serializers.CharField()
        on_trip = serializers.BooleanField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        priority = serializers.BooleanField(source='status.priority')
        last_connection = serializers.DateTimeField()
        pending_events = serializers.IntegerField()
        pending_status = serializers.IntegerField()
        client = serializers.CharField(source='unit.client.name')

    class reversor:
        def __init__(self, obj):
            self.obj = obj

        def __eq__(self, other):
            return other.obj == self.obj

        def __lt__(self, other):
            return other.obj < self.obj

    def get(self, request, *args, **kwargs):
        devices = active_unitstatus_list()
        sorted_units = sorted(
            devices, key=lambda x: (x.status.priority, x.status.severity), reverse=True)

        data = self.OutputSerializer(sorted_units, many=True).data

        return Response(data)


class DeviceStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        device_id = serializers.IntegerField()
        device = serializers.CharField()
        last_connection = serializers.DateTimeField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()

    def get(self, request, *args, **kwargs):
        devices = devicestatus_list()

        data = self.OutputSerializer(devices, many=True).data

        return Response(data)


# Severity count

class UnitSeverityCount(APIView):

    class OutputSerializer(serializers.Serializer):
        severity = serializers.IntegerField()
        count = serializers.IntegerField()
        breakdown = serializers.JSONField()

    def get(self, request, *args, **kwargs):

        counts = get_units_severity_counts()
        problem_counts = get_units_problem_counts()

        output = counts.values("severity", "count")

        for level in output:
            level["breakdown"] = problem_counts.filter(
                severity=level["severity"]).order_by("-count").values('description', 'count')

        # Serialize the result
        serializer = self.OutputSerializer(output, many=True)
        return Response(serializer.data)


class DeviceSeverityCount(APIView):

    class OutputSerializer(serializers.Serializer):
        severity = serializers.IntegerField()
        count = serializers.IntegerField()

    def get(self, request, *args, **kwargs):

        counts = DeviceStatus.objects.values('status__severity') \
            .annotate(severity=F('status__severity')) \
            .values('severity') \
            .annotate(count=Count('id')) \
            .order_by('-severity')

        # Serialize the result
        serializer = self.OutputSerializer(counts, many=True)
        return Response(serializer.data)


# Device history
class UnitFailedTripsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        trips = serializers.IntegerField()

    def get(self, request, unit_id, *args, **kwargs):
        unit = get_unit(unit_id)
        failed_trips = get_unit_failed_trips(unit)

        output = self.OutputSerializer({"trips": len(failed_trips)}).data

        return Response(output)


class UnitHistoryList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        description = serializers.CharField(required=False)
        on_trip = serializers.BooleanField(required=False)

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)

            # Check if 'data' is in kwargs and if 'on_trip' key is not present in the incoming data
            if 'data' in kwargs:
                incoming_data = kwargs['data']
                # If incoming_data is a QueryDict (as in a typical request object), convert it to a standard dict
                if hasattr(incoming_data, 'dict'):
                    incoming_data = incoming_data.dict()
                if 'on_trip' not in incoming_data:
                    # If 'on_trip' is not in the incoming data, remove it from the serializer fields
                    self.fields.pop('on_trip')

    class OutputSerializer(serializers.Serializer):
        unit = serializers.CharField()
        register_datetime = serializers.DateTimeField()
        total = serializers.IntegerField()
        restart = serializers.IntegerField()
        reboot = serializers.IntegerField()
        start = serializers.IntegerField()
        data_validation = serializers.IntegerField()
        source_missing = serializers.IntegerField()
        camera_connection = serializers.IntegerField()
        storage_devices = serializers.IntegerField()
        forced_reboot = serializers.IntegerField()
        read_only_ssd = serializers.IntegerField()
        ignition = serializers.IntegerField()
        aux = serializers.IntegerField()
        others = serializers.IntegerField()
        last_connection = serializers.DateTimeField()
        pending_events = serializers.IntegerField()
        pending_status = serializers.IntegerField()
        restarting_loop = serializers.BooleanField()
        on_trip = serializers.BooleanField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')

    def get(self, request, unit_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        data = {'unit_id': unit_id}
        logs = get_unithistory(
            data, filters=filters_serializer.validated_data)[::-1]

        # return Response(output)
        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


class DeviceHistoryList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        description = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        device_id = serializers.IntegerField()
        device = serializers.CharField()
        register_date = serializers.DateField()
        register_datetime = serializers.DateTimeField()
        last_connection = serializers.DateTimeField()
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()
        batch_dropping = serializers.IntegerField()
        camera_connection = serializers.DurationField()
        restart = serializers.IntegerField()
        license = serializers.IntegerField()
        shift_change = serializers.IntegerField()
        others = serializers.IntegerField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')

    def get(self, request, device_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        data = {'device_id': device_id}

        logs = get_devicehistory(
            data, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


# Reports
class UnitReportAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        content = serializers.CharField()

    def get(self, request, unit_id, *args, **kwargs):
        import humanize
        _t = humanize.i18n.activate("es")

        now = datetime.now()

        unit = get_unit(unit_id)
        failed_trips = get_unit_failed_trips(unit)
        unit_status = get_unitstatus(unit_id)

        last_connection = unit_status.last_connection

        text = f"Unidad {unit.name}\n"

        history = get_unithistory({"unit_id": unit_id}, filters={
                                  "register_datetime_after": (now - timedelta(weeks=1)).isoformat()})

        if last_connection:
            text += f"\nÚltima conexión {last_connection.strftime('%d/%m/%Y %H:%M')}\n"
        else:
            text += f"\nÚltima conexión desconocida\n"

        if len(failed_trips) > 0:
            text += f"\nViajes sin conexión: {len(failed_trips)}\n"

        if unit_status.pending_events > 1 or unit_status.pending_status > 1:
            text += "\nLogs pendientes:\n"
            if unit_status.pending_events:
                text += f" - Eventos ({unit_status.pending_events})\n"

            if unit_status.pending_status:
                text += f" - Status ({unit_status.pending_status})\n"

        status_count = GxStatus.objects.filter(severity=5, deployment__name="Safe Driving").annotate(count=Count('unithistory', filter=(
            Q(unithistory__unit_id=unit_id, unithistory__register_datetime__gte=now-timedelta(weeks=1))))).filter(count__gt=0).order_by("-count")

        if status_count:
            text += "\nProblemas en la última semana:\n"
            for count in status_count:
                text += f" - {count.description} ({humanize.naturaldelta(timedelta(minutes=count.count*10))})\n"
        print(text)

        return Response({"content": text}, status=status.HTTP_200_OK)


class UnitStatusTime(APIView):
    class OutputSerializer(serializers.Serializer):
        register_datetime = serializers.DateTimeField()

    def get(self, request, unit_id, *args, **kwargs):
        unit_histories_with_next_severity = UnitHistory.objects.filter(
            unit_id=unit_id,
        ).annotate(
            next_severity=Window(
                expression=Lead('status__severity'),
                partition_by=[F('unit_id')],
                order_by=F('register_datetime').desc()
            )
        )

        severity_changes = unit_histories_with_next_severity.filter(
            # Excludes the last record for each unit, as it has no "next" record
            next_severity__isnull=False,
            # Optional: Exclude records with no severity to avoid comparing None values
            status__severity__isnull=False
        ).exclude(
            status__severity=F('next_severity')
        )

        if not severity_changes:
            first_register = unit_histories_with_next_severity[len(
                unit_histories_with_next_severity)-1]
            output = self.OutputSerializer(first_register).data
            return Response(output)
        else:
            last_change = severity_changes[0]
            output = self.OutputSerializer(last_change).data
            return Response(output)


class DeviceStatusTime(APIView):
    class OutputSerializer(serializers.Serializer):
        register_datetime = serializers.DateTimeField()

    def get(self, request, device_id, *args, **kwargs):
        device_histories_with_next_severity = DeviceHistory.objects.filter(
            device_id=device_id,
        ).annotate(
            next_severity=Window(
                expression=Lead('status__severity'),
                partition_by=[F('device_id')],
                order_by=F('register_datetime').desc()
            )
        )

        severity_changes = device_histories_with_next_severity.filter(
            # Excludes the last record for each unit, as it has no "next" record
            next_severity__isnull=False,
            # Optional: Exclude records with no severity to avoid comparing None values
            status__severity__isnull=False
        ).exclude(
            status__severity=F('next_severity')
        )

        if not severity_changes:
            first_register = device_histories_with_next_severity[len(
                device_histories_with_next_severity)-1]
            output = self.OutputSerializer(first_register).data
            return Response(output)
        else:
            last_change = severity_changes[0]
            output = self.OutputSerializer(last_change).data
            return Response(output)


class UnitLastActiveStatus(APIView):
    class OutputSerializer(serializers.Serializer):
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')

    def get(self, request, unit_id, *args, **kwargs):
        last_status = get_unit_last_active_status(unit_id)

        data = self.OutputSerializer(last_status).data

        return Response(data)


class UnitStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        unit_id = serializers.IntegerField()
        unit = serializers.CharField()
        client = serializers.CharField(source="unit.client.name")
        on_trip = serializers.BooleanField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        last_connection = serializers.DateTimeField()
        pending_events = serializers.IntegerField()
        pending_status = serializers.IntegerField()

    def get(self, request, unit_id, *args, **kwargs):
        unit_status = get_unitstatus(unit_id)

        data = self.OutputSerializer(unit_status).data

        return Response(data)


class DeviceStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        device_id = serializers.IntegerField()
        device = serializers.CharField()
        last_connection = serializers.DateTimeField()
        license_end = serializers.DateTimeField(source='device.license_end')
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()

    def get(self, request, device_id, *args, **kwargs):
        device_status = get_devicestatus(device_id)

        data = self.OutputSerializer(device_status).data

        return Response(data)


class CameraStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        camera = serializers.CharField()
        last_update = serializers.DateTimeField()
        connected = serializers.BooleanField()
        disconnection_time = serializers.DurationField()

    def get(self, request):
        devices = camerastatus_list()

        data = self.OutputSerializer(devices, many=True).data

        return Response(data)


class CameraDisconnectionsList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        camera = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        camera = serializers.CharField()
        register_datetime = serializers.DateTimeField()
        disconnection_time = serializers.DurationField()

    def get(self, request, device_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        data = {'device_id': device_id}
        logs = get_cameradisconnections(
            data, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


class SafeDrivingClientList(APIView):
    class OutputSerializer(serializers.Serializer):
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        clients = get_sd_clients()

        data = self.OutputSerializer(clients, many=True).data
        return Response(data)


class IndustryClientList(APIView):
    class OutputSerializer(serializers.Serializer):
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        clients = get_industry_clients()
        active_clients = clients.exclude(
            name="Ternium").exclude(name="Bekaert")

        data = self.OutputSerializer(active_clients, many=True).data
        return Response(data)


class DrivingDailyReportAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        unit = serializers.CharField()
        register_datetime = serializers.DateTimeField()
        total = serializers.IntegerField()
        restart = serializers.IntegerField()
        forced_reboot = serializers.IntegerField()
        read_only_ssd = serializers.IntegerField()
        on_trip = serializers.BooleanField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')

    def get(self, request, *args, **kwargs):
        clients = get_industry_clients()

        data = self.OutputSerializer(clients, many=True).data
        return Response(data)


class UnitScatterPlotAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)

    class OutputSerializer(serializers.Serializer):
        hora = serializers.DateTimeField()
        severidad = serializers.IntegerField()
        descripcion = serializers.CharField()

    def get(self, request, unit_id, *args, **kwargs):
        import datetime
        import pytz

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        registers = get_sd_scatterplot_data(
            {"unit_id": unit_id}, filters=filters_serializer.validated_data)

        grouped_by_hour = {}

        descriptions = {}
        for register in registers:
            hour = (register.register_datetime -
                    timedelta(hours=6)).replace(tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
            severity = register.status.severity
            description = register.status.description

            if hour not in grouped_by_hour:
                grouped_by_hour[hour] = [severity]
            else:
                grouped_by_hour[hour].append(severity)

            if hour in descriptions:
                if severity in descriptions[hour]:
                    descriptions[hour][severity].append(description)
                else:
                    descriptions[hour][severity] = [description]
            else:
                descriptions[hour] = {severity: [description]}

        output = []
        for date, severities in grouped_by_hour.items():
            most_common_severity = max(set(severities), key=severities.count)
            most_common_description = max(
                set(descriptions[date][most_common_severity]), key=descriptions[date][most_common_severity].count)
            output.append({"hora": date,
                           "severidad": most_common_severity,
                           "descripcion": most_common_description})

        data = self.OutputSerializer(output, many=True).data

        return Response(data)


class DeviceScatterPlotAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)

    class OutputSerializer(serializers.Serializer):
        hora = serializers.DateTimeField()
        severidad = serializers.IntegerField()
        descripcion = serializers.CharField()

    def get(self, request, device_id, *args, **kwargs):
        import datetime
        import pytz

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        registers = get_ind_scatterplot_data(
            {"device_id": device_id}, filters=filters_serializer.validated_data)

        grouped_by_hour = {}

        descriptions = {}
        for register in registers:
            hour = (register.register_datetime -
                    timedelta(hours=6)).replace(tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
            severity = register.status.severity
            description = register.status.description

            if hour not in grouped_by_hour:
                grouped_by_hour[hour] = [severity]
            else:
                grouped_by_hour[hour].append(severity)

            if severity in descriptions:
                descriptions[severity].append(description)
            else:
                descriptions[severity] = [description]

        output = []
        for date, severities in grouped_by_hour.items():
            most_common_severity = max(set(severities), key=severities.count)
            most_common_description = max(
                set(descriptions[most_common_severity]), key=descriptions[most_common_severity].count)
            output.append({"hora": date,
                           "severidad": most_common_severity,
                           "descripcion": most_common_description})

        data = self.OutputSerializer(output, many=True).data

        return Response(data)


class SafeDrivingAreaPlotAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        timestamp_after = serializers.DateTimeField(required=False)
        timestamp_before = serializers.DateTimeField(required=False)

    class OutputSerializer(serializers.Serializer):
        timestamp = serializers.DateTimeField()
        severity_counts = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        import datetime
        import pytz

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        severity_keys = list(range(6))
        timezone = pytz.timezone("America/Mexico_City")

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("timestamp_after") or
                filters_serializer.validated_data.get("timestamp_before")):

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(timezone).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["timestamp_before"] = end_date
            filters_serializer.validated_data["timestamp_after"] = start_date

        client_name = request.query_params.get("client")
        registers = get_area_plot_data(
            "Safe Driving", client_name=client_name, filters=filters_serializer.validated_data)

        hourly_counts = {}

        if not client_name:

            for register in registers:

                # Agrupar registros de diferentes clientes, por hora
                if register.timestamp in hourly_counts:
                    for k, v in register.severity_counts.items():
                        if k in hourly_counts[register.timestamp]:
                            hourly_counts[register.timestamp][k] += v
                        else:
                            hourly_counts[register.timestamp][k] = v

                else:
                    hourly_counts[register.timestamp] = register.severity_counts

            registers = []
            for timestamp, counts in hourly_counts.items():
                registers.append(
                    {"timestamp": timestamp, "severity_counts": counts})

            for register in registers:
                register["timestamp"] = register["timestamp"].astimezone(pytz.timezone("America/Mexico_City")).replace(
                    tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
        else:
            for register in registers:
                register.timestamp = register.timestamp.astimezone(pytz.timezone("America/Mexico_City")).replace(
                    tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"

        data = self.OutputSerializer(registers, many=True).data

        return Response(data)


class IndustryAreaPlotAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        timestamp_after = serializers.DateTimeField(required=False)
        timestamp_before = serializers.DateTimeField(required=False)

    class OutputSerializer(serializers.Serializer):
        timestamp = serializers.DateTimeField()
        severity_counts = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        import datetime
        import pytz

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("timestamp_after") or
                filters_serializer.validated_data.get("timestamp_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["timestamp_before"] = end_date
            filters_serializer.validated_data["timestamp_after"] = start_date

        client_name = request.query_params.get("client")
        registers = get_area_plot_data(
            "Industry", client_name=client_name, filters=filters_serializer.validated_data)

        hourly_counts = {}

        if not client_name:
            for register in registers:
                if register.timestamp in hourly_counts:
                    hourly_counts[register.timestamp] = {
                        k: hourly_counts[register.timestamp][k] + v
                        for k, v in register.severity_counts.items()}
                else:
                    hourly_counts[register.timestamp] = register.severity_counts

            registers = []
            for timestamp, counts in hourly_counts.items():
                registers.append(
                    {"timestamp": timestamp, "severity_counts": counts})

            for register in registers:
                register["timestamp"] = register["timestamp"].astimezone(pytz.timezone("America/Mexico_City")).replace(
                    tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
        else:
            for register in registers:
                register.timestamp = register.timestamp.astimezone(pytz.timezone("America/Mexico_City")).replace(
                    tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"

        data = self.OutputSerializer(registers, many=True).data

        return Response(data)


class SafeDrivingLastUpdateAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        last_update = serializers.DateTimeField()

    def get(self, request, *args, **kwargs):
        last_update_sd = get_last_sd_update()
        output = self.OutputSerializer(last_update_sd).data

        return Response(output)


class IndustryLastUpdateAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        last_update = serializers.DateTimeField()

    def get(self, request, *args, **kwargs):
        last_update_sd = get_last_sd_update()
        output = self.OutputSerializer(last_update_sd).data

        return Response(output)


class SafeDrivingLogsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        unidad = serializers.CharField(max_length=50, source="Unidad")
        fecha_subida = serializers.CharField(
            max_length=50, source="Fecha_subida")
        timestamp = serializers.CharField(max_length=50, source="Timestamp")
        tipo = serializers.CharField(max_length=50, source="Tipo")
        log = serializers.CharField(max_length=50, source="Log")

    def get(self, request, unit_id, *args, **kwargs):
        unit = Unit.objects.get(id=unit_id)
        client_key = unit.client.keyname

        credentials = get_api_credentials("Safe Driving", client_key)

        # Hardcoded
        urls = {
            "tp": {
                "login": 'https://tp.introid.com/login/',
                "logs": 'https://tp.introid.com/range_logs/'
            },
            "cmx": {
                "login": 'https://cmx.safe-d.aivat.io/login/',
                "logs": 'https://cmx.safe-d.aivat.io/cemex/range_logs/'
            },
            "trm": {
                "login": 'https://trm.safe-d.aivat.io/login/',
                "logs": 'https://trm.safe-d.aivat.io/ternium/range_logs/'
            }
        }
        if client_key in urls:
            login_url = urls[client_key]["login"]
            request_url = urls[client_key]["logs"]
        else:
            login_url = f'https://{client_key}.safe-d.aivat.io/login/'
            request_url = f'https://{client_key}.safe-d.aivat.io/range_logs/'

        now = datetime.now(tz=pytz.timezone('UTC'))
        params = {
            "start": (now - timedelta(days=1)).isoformat(timespec="seconds"),
            "end": now.isoformat(timespec='seconds')
        }

        if 'timestamp_after' in request.query_params:
            params["start"] = request.query_params['timestamp_after'][:-5]

        if 'timestamp_before' in request.query_params:
            params["end"] = request.query_params['timestamp_before'][:-5]

        params["unit"] = unit.name

        token = api_login(login_url, credentials=credentials)
        response, status = make_request(
            request_url, data=params, token=token)
        response = response.json()

        if "tipo" in request.query_params:
            query_log_type = request.query_params["tipo"]
            response = list(filter(lambda log: query_log_type.lower()
                                   in log["Tipo"], response))

        response.reverse()

        return get_paginated_response(
            response,
            self.OutputSerializer,
            request
        )


class IndustryLogsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        device = serializers.CharField(max_length=50)
        log_time = serializers.CharField(max_length=50)
        log = serializers.CharField(max_length=50)
        register_time = serializers.CharField(max_length=50)

    def get(self, request, device_id, *args, **kwargs):
        global request_url

        device = Device.objects.get(id=device_id)
        client_key = device.client.keyname

        login_url = f'https://{client_key}.industry.aivat.io/login/'
        request_url = f'https://{client_key}.industry.aivat.io/stats_json/'

        credentials = get_api_credentials("Industry", client_key)
        token = api_login(login_url=login_url, credentials=credentials)

        sent_interval = False

        time_interval = {}
        if 'register_time_after' in request.query_params:
            time_interval["initial_datetime"] = request.query_params['register_time_after'][:-5]
            sent_interval = True

        if 'register_time_before' in request.query_params:
            time_interval["final_datetime"] = request.query_params['register_time_before'][:-5]
            sent_interval = True

        if not sent_interval:
            now = datetime.now(tz=pytz.timezone('UTC')).replace(tzinfo=None)
            time_interval = {
                "initial_datetime": (now - timedelta(days=1)).isoformat(timespec="seconds"),
                "final_datetime": now.isoformat(timespec='seconds')
            }

        response, status = make_request(
            request_url, data=time_interval, token=token)
        response = response.json()

        show_empty = request.query_params["show_empty"]

        output = []
        for device, logs in response.items():
            if "device" in request.query_params:
                if not request.query_params["device"] in device.lower():
                    print(f"Skipped {device}")
                    continue

            for log in logs:
                if show_empty == "false" and log["log"] == "":
                    continue
                output.append({"device": device,
                               "register_time": log["register_time"],
                               "log": log["log"],
                               "log_time": f"{log['log_date']}T{log['log_time']}"})

        if request.query_params.get("sort") == "-register_time":
            output.reverse()

        return get_paginated_response(
            output,
            self.OutputSerializer,
            request
        )


class DeviceWifiProblemsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        connection_problems = serializers.BooleanField()

    def get(self, request, device_id, *args, **kwargs):
        wifi_alerts = check_wifi_alerts(device_id=device_id)

        has_wifi_problems = False
        if wifi_alerts:
            has_wifi_problems = True

        output = self.OutputSerializer(
            {"connection_problems": has_wifi_problems}).data
        return Response(output)


class SDClientCreateAPI(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField()
        keyname = serializers.CharField()
        api_username = serializers.CharField()
        api_password = serializers.CharField()

    def post(self, request, *args, **kwargs):
        import requests

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        keyname = serializer.validated_data["keyname"]

        try:
            response = requests.post(f'https://{keyname}.safe-d.aivat.io/login/',
                                     data={"username": serializer.validated_data["api_username"],
                                           "password": serializer.validated_data["api_password"]})
        except requests.exceptions.ConnectionError:
            return Response({"error": "No existe endpoint para cliente"}, status=status.HTTP_400_BAD_REQUEST)

        if response.status_code != 200:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        password = serializer.validated_data["api_password"]

        encryption = EncryptionService()
        enc_password = encryption.encrypt(bytes(password, "utf-16"))

        client, created = get_or_create_client(
            name=serializer.validated_data["name"],
            keyname=serializer.validated_data["keyname"],
            deployment_name="Safe Driving",
            defaults={
                "api_username": serializer.validated_data["api_username"],
                "api_password": enc_password
            }
        )

        if created:
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Cliente ya existe"}, status=status.HTTP_400_BAD_REQUEST)


class IndClientCreateAPI(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField()
        keyname = serializers.CharField()
        api_username = serializers.CharField()
        api_password = serializers.CharField()

    def post(self, request, *args, **kwargs):
        import requests

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        keyname = serializer.validated_data["keyname"]

        try:
            response = requests.post(f'https://{keyname}.industry.aivat.io/login/',
                                     data={"username": serializer.validated_data["api_username"],
                                           "password": serializer.validated_data["api_password"]})
        except requests.exceptions.ConnectionError:
            return Response({"error": "No existe endpoint para cliente"}, status=status.HTTP_400_BAD_REQUEST)

        if response.status_code != 200:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        password = serializer.validated_data["api_password"]

        encryption = EncryptionService()
        enc_password = encryption.encrypt(bytes(password, "utf-16"))

        client, created = get_or_create_client(
            name=serializer.validated_data["name"],
            keyname=keyname,
            deployment_name="Industry",
            defaults={
                "api_username": serializer.validated_data["api_username"],
                "api_password": enc_password
            }
        )

        if created:
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Cliente ya existe"}, status=status.HTTP_400_BAD_REQUEST)


class SetUnitAsInactiveAPI(APIView):

    def post(self, request, unit_id, *args, **kwargs):
        try:
            unit_status = get_unitstatus(unit_id)
            unit_status.active = False
            unit_status.save()
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class SetDeviceClientAsInactiveAPI(APIView):
    def post(self, request, device_id, *args, **kwargs):
        try:
            device = get_device_by_id(device_id)
            client = device.client
            client.active = False
            client.save()
        except Exception as e:
            return Response(data={"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


# Servers ----------------------------------------------------------------------
class ServerList(APIView):
    class OutputSerializer(serializers.Serializer):
        aws_id = serializers.CharField()
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        servers = get_all_servers()

        output = self.OutputSerializer(servers, many=True).data

        return Response(output)


class AllServersProjectsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        server_id = serializers.IntegerField(source="id")
        projects = serializers.SlugRelatedField(
            slug_field="name", read_only=True, many=True)

    def get(self, request, *args, **kwargs):
        servers = get_all_servers()

        output = self.OutputSerializer(servers, many=True).data

        return Response(output)


class ServerStatusListAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        region = serializers.CharField(required=False)
        server_type = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        server_id = serializers.IntegerField()
        aws_id = serializers.CharField(source="server.aws_id")
        server_name = serializers.CharField(source="server")
        last_launch = serializers.DateTimeField()
        last_activity = serializers.DateTimeField()
        state = serializers.CharField()
        activity_data = serializers.JSONField()
        critical = serializers.BooleanField()

    def get(self, request, *args, **kwargs):
        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        all_server_status = get_serverstatus_list(
            filters=filters_serializer.validated_data)

        all_server_status = all_server_status.annotate(
            cpu_utilization=Cast(
                KT("activity_data__Uso de CPU"), output_field=models.FloatField()))

        all_server_status = sorted(
            all_server_status, key=lambda x: x.activity_data.get("Uso de CPU", 0), reverse=True)

        output = self.OutputSerializer(
            all_server_status, many=True, read_only=True).data

        return Response(output)


class ServerStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        server_id = serializers.IntegerField()
        aws_id = serializers.CharField(source="server.aws_id")
        server_name = serializers.CharField(source="server")
        last_launch = serializers.DateTimeField()
        last_activity = serializers.DateTimeField()
        state = serializers.CharField()
        activity_data = serializers.JSONField()
        critical = serializers.BooleanField()

    def get(self, request, server_id, *args, **kwargs):
        server_status = get_serverstatus(server_id)
        output = self.OutputSerializer(server_status).data

        return Response(output)


class ServerHistoryList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        metric_type = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        server = serializers.CharField()
        last_launch = serializers.DateTimeField()
        register_datetime = serializers.DateTimeField()
        state = serializers.CharField()
        metric_type = serializers.CharField()
        metric_value = serializers.FloatField()
        critical = serializers.BooleanField()

    def get(self, request, server_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=1)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        data = {'server_id': server_id}
        logs = get_serverhistory(
            data, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


class ServerMetricsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        metrics = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        metrics = get_servermetrics("ec2")

        metrics_dict = {metric.name: metric.key for metric in metrics}
        output = {"metrics": metrics_dict}

        return Response(self.OutputSerializer(output).data)


class ServerRegionsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        regions = get_serverregions()
        output = self.OutputSerializer(regions, many=True).data

        return Response(output)


class ServerTypesAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        server_type = serializers.CharField()

    def get(self, request, *args, **kwargs):
        server_types = get_servertypes()

        output = self.OutputSerializer(server_types, many=True).data

        return Response(output)


class AssignProjectToServer(APIView):
    class InputSerializer(serializers.Serializer):
        project_id = serializers.IntegerField()

    def post(self, request, server_id, *args, **kwargs):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project_id = serializer.validated_data["project_id"]

        success = assign_project_to_server(
            project_id=project_id, server_id=server_id)

        if success:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ServerProjectsList(APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()

    def get(self, request, server_id, *args, **kwargs):
        projects = get_server_projects(server_id)

        output = self.OutputSerializer(projects, many=True).data

        return Response(output)


# RDS ---------------------------------------------------------------------------

class RDSList(APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        rds = get_all_rds()

        output = self.OutputSerializer(rds, many=True).data

        return Response(output)


class RDSStatusListAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        region = serializers.CharField(required=False)
        instance_class = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        rds_id = serializers.IntegerField()
        name = serializers.CharField(source="rds.name")
        last_activity = serializers.DateTimeField()
        status = serializers.CharField()
        critical = serializers.BooleanField()
        activity_data = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        all_rds_status = get_rdsstatus_list(
            filters=filters_serializer.validated_data)

        all_rds_status = all_rds_status.annotate(
            cpu_utilization=Cast(
                KT("activity_data__Uso de CPU"), output_field=models.FloatField()))

        all_rds_status = sorted(
            all_rds_status, key=lambda x: x.activity_data.get("Uso de CPU", 0), reverse=True)

        output = self.OutputSerializer(all_rds_status, many=True).data

        return Response(output)


class RDSStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        rds_id = serializers.IntegerField()
        name = serializers.CharField(source="rds.name")
        total_storage = serializers.IntegerField(source="allocated_storage")
        total_ram = serializers.IntegerField(
            source="rds.instance_class.memory")
        last_activity = serializers.DateTimeField()
        status = serializers.CharField()
        critical = serializers.BooleanField()
        activity_data = serializers.JSONField()

    def get(self, request, rds_id, *args, **kwargs):
        server_status = get_rdsstatus(rds_id)
        output = self.OutputSerializer(server_status).data

        return Response(output)


class RDSHistoryList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        metric_type = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        rds = serializers.CharField()
        register_datetime = serializers.DateTimeField()
        status = serializers.CharField()
        critical = serializers.BooleanField()
        metric_type = serializers.CharField()
        metric_value = serializers.FloatField()

    def get(self, request, rds_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=1)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        data = {'rds_id': rds_id}
        logs = get_rdshistory(
            data, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


class RDSMetricsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        metrics = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        metrics = get_servermetrics("rds")

        metrics_dict = {metric.name: metric.key for metric in metrics}
        output = {"metrics": metrics_dict}

        return Response(self.OutputSerializer(output).data)


class RDSTypesAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        instance_class = serializers.CharField(source='instance_class__name')

    def get(self, request, *args, **kwargs):
        rds_types = get_rdstypes()

        output = self.OutputSerializer(rds_types, many=True).data

        return Response(output)

# Load Balancers ---------------------------------------------


class LoadBalancerList(APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        elb = get_all_elb()

        output = self.OutputSerializer(elb, many=True).data

        return Response(output)


class LoadBalancerStatusListAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        region = serializers.CharField(required=False)
        instance_class = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        elb_id = serializers.IntegerField()
        name = serializers.CharField(source="elb.name")
        last_activity = serializers.DateTimeField()
        state_code = serializers.CharField()
        activity_data = serializers.JSONField()
        critical = serializers.BooleanField()

    def get(self, request, *args, **kwargs):
        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        all_elb_status = get_load_balancer_status_list(
            filters=filters_serializer.validated_data)

        output = self.OutputSerializer(all_elb_status, many=True).data

        return Response(output)


class LoadBalancerStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        elb_id = serializers.IntegerField()
        name = serializers.CharField(source="elb.name")
        last_activity = serializers.DateTimeField()
        state_code = serializers.CharField()
        state_reason = serializers.CharField()
        activity_data = serializers.JSONField()
        critical = serializers.BooleanField()

    def get(self, request, elb_id, *args, **kwargs):
        elb_status = get_load_balancer_status(elb_id)
        output = self.OutputSerializer(elb_status).data

        return Response(output)


class LoadBalancerHistoryList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        metric_type = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        elb = serializers.CharField()
        register_datetime = serializers.DateTimeField()
        state_code = serializers.CharField()
        metric_type = serializers.CharField()
        metric_value = serializers.FloatField()
        critical = serializers.BooleanField()

    def get(self, request, elb_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or
                filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=1)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        logs = get_load_balancer_history(
            elb_id, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


class LoadBalancerMetricsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        metrics = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        metrics = get_servermetrics("elb")

        metrics_dict = {metric.name: metric.key for metric in metrics}
        output = {"metrics": metrics_dict}

        return Response(self.OutputSerializer(output).data)


# Retail -----------------------------------------------
class RetailDeviceStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        device_id = serializers.IntegerField()
        name = serializers.CharField(source="device.name")
        client = serializers.CharField(source="device.client.name")
        last_update = serializers.DateTimeField()
        last_connection = serializers.DateTimeField()
        last_alert = serializers.DateTimeField()
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        log_counts = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        devices = retail_device_status_list()

        data = self.OutputSerializer(devices, many=True).data

        return Response(data)


class RetailDeviceSeverityCount(APIView):

    class OutputSerializer(serializers.Serializer):
        severity = serializers.IntegerField()
        count = serializers.IntegerField()

    def get(self, request, *args, **kwargs):

        counts = RetailDeviceStatus.objects.filter(active=True).values('status__severity') \
            .annotate(severity=F('status__severity')) \
            .values('severity') \
            .annotate(count=Count('id')) \
            .order_by('-severity')

        # Serialize the result
        serializer = self.OutputSerializer(counts, many=True)
        return Response(serializer.data)


class RetailDeviceStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        device_id = serializers.IntegerField()
        name = serializers.CharField(source="device.name")
        client = serializers.CharField(source="device.client.name")
        last_update = serializers.DateTimeField()
        last_connection = serializers.DateTimeField()
        last_alert = serializers.DateTimeField()
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        license_end = serializers.DateField(source='device.license_end')

    def get(self, request, device_id, *args, **kwargs):
        device_status = get_retail_device_status(device_id)

        output = self.OutputSerializer(device_status).data
        return Response(output)


class RetailDeviceStatusTime(APIView):
    class OutputSerializer(serializers.Serializer):
        register_datetime = serializers.DateTimeField()

    def get(self, request, device_id, *args, **kwargs):
        device_histories_with_next_severity = RetailDeviceHistory.objects.filter(
            device_id=device_id,
        ).annotate(
            next_severity=Window(
                expression=Lead('status__severity'),
                partition_by=[F('device_id')],
                order_by=F('register_datetime').desc()
            )
        )

        severity_changes = device_histories_with_next_severity.filter(
            # Excludes the last record for each unit, as it has no "next" record
            next_severity__isnull=False,
            # Optional: Exclude records with no severity to avoid comparing None values
            status__severity__isnull=False
        ).exclude(
            status__severity=F('next_severity')
        )

        if not severity_changes:
            first_register = device_histories_with_next_severity[len(
                device_histories_with_next_severity)-1]
            output = self.OutputSerializer(first_register).data
            return Response(output)
        else:
            last_change = severity_changes[0]
            output = self.OutputSerializer(last_change).data
            return Response(output)


class RetailLogsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        device = serializers.CharField(max_length=50)
        log_time = serializers.CharField(max_length=50)
        log = serializers.CharField(max_length=50)
        register_time = serializers.CharField(max_length=50)

    def get(self, request, device_id, *args, **kwargs):
        global request_url
        import json

        device = Device.objects.get(id=device_id)
        client_key = device.client.keyname

        login_url = f'https://{client_key}.retail.aivat.io/login/'
        request_url = f'https://{client_key}.retail.aivat.io/itw_logs/'

        credentials = get_api_credentials("Smart Retail", client_key)
        token = api_login(login_url=login_url, credentials=credentials)

        sent_interval = False

        time_interval = {}
        if 'register_time_after' in request.query_params:
            time_interval["initial_datetime"] = request.query_params['register_time_after'][:-5]
            sent_interval = True

        if 'register_time_before' in request.query_params:
            time_interval["final_datetime"] = request.query_params['register_time_before'][:-5]
            sent_interval = True

        if not sent_interval:
            now = datetime.now(tz=pytz.timezone('UTC')).replace(tzinfo=None)
            time_interval = {
                "initial_datetime": (now - timedelta(hours=5)).isoformat(timespec="seconds"),
                "final_datetime": now.isoformat(timespec='seconds')
            }

        response, status = make_request(
            request_url, data=time_interval, token=token)
        response = json.loads(response.content)

        show_empty = request.query_params["show_empty"]

        output = []

        device_data = response[device.name]

        if "device" not in request.query_params or ("device" in request.query_params and request.query_params["device"] in device.name.lower()):
            device_logs = device_data["logs"]
            for log in device_logs:
                if show_empty == "false" and log["log"] == "":
                    continue
                output.append({"device": device.name,
                               "register_time": log["register_time"],
                               "log": log["log"],
                               "log_time": f"{log['log_date']}T{log['log_time']}"})

        cameras = device_data["cameras"]
        for camera_name, logs in cameras.items():
            if "device" in request.query_params:
                if request.query_params["device"] not in camera_name.lower():
                    break
            for log in logs:
                if show_empty == "false" and log["log"] == "":
                    continue
                output.append({"device": camera_name,
                               "register_time": log["register_time"],
                               "log": log["log"],
                               "log_time": f"{log['log_date']}T{log['log_time']}"})

        if request.query_params.get("sort") == "-register_time":
            output.reverse()

        return get_paginated_response(
            output,
            self.OutputSerializer,
            request
        )


class RetailDeviceHistoryList(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)
        sort = serializers.CharField(required=False)
        description = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        device_id = serializers.IntegerField()
        device = serializers.CharField()
        register_date = serializers.DateField()
        register_datetime = serializers.DateTimeField()
        last_connection = serializers.DateTimeField()
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()
        log_counts = serializers.JSONField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')

    def get(self, request, device_id, *args, **kwargs):

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        data = {'device_id': device_id}

        logs = get_retail_device_history(
            data, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


class RetailClientCreateAPI(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField()
        keyname = serializers.CharField()
        api_username = serializers.CharField()
        api_password = serializers.CharField()

    def post(self, request, *args, **kwargs):
        import requests

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        keyname = serializer.validated_data["keyname"]

        password = serializer.validated_data["api_password"]

        encryption = EncryptionService()
        enc_password = encryption.encrypt(bytes(password, "utf-16"))

        client, created = get_or_create_client(
            name=serializer.validated_data["name"],
            keyname=keyname,
            deployment_name="Smart Retail",
            defaults={
                "api_username": serializer.validated_data["api_username"],
                "api_password": enc_password
            }
        )

        if created:
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Cliente ya existe"}, status=status.HTTP_400_BAD_REQUEST)


class RetailDeviceScatterPlotAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        register_datetime_after = serializers.DateTimeField(required=False)
        register_datetime_before = serializers.DateTimeField(required=False)

    class OutputSerializer(serializers.Serializer):
        hora = serializers.DateTimeField()
        severidad = serializers.IntegerField()
        descripcion = serializers.CharField()

    def get(self, request, device_id, *args, **kwargs):
        import datetime
        import pytz

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("register_datetime_after") or filters_serializer.validated_data.get("register_datetime_before")):
            import datetime
            import pytz

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["register_datetime_before"] = end_date
            filters_serializer.validated_data["register_datetime_after"] = start_date

        registers = get_retail_scatterplot_data(
            {"device_id": device_id}, filters=filters_serializer.validated_data)

        grouped_by_hour = {}

        descriptions = {}
        for register in registers:
            hour = (register.register_datetime -
                    timedelta(hours=6)).replace(tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
            severity = register.status.severity
            description = register.status.description

            if hour not in grouped_by_hour:
                grouped_by_hour[hour] = [severity]
            else:
                grouped_by_hour[hour].append(severity)

            if severity in descriptions:
                descriptions[severity].append(description)
            else:
                descriptions[severity] = [description]

        output = []
        for date, severities in grouped_by_hour.items():
            most_common_severity = max(set(severities), key=severities.count)
            most_common_description = max(
                set(descriptions[most_common_severity]), key=descriptions[most_common_severity].count)
            output.append({"hora": date,
                           "severidad": most_common_severity,
                           "descripcion": most_common_description})

        data = self.OutputSerializer(output, many=True).data

        return Response(data)


class SmartRetailAreaPlotAPI(APIView):
    class FiltersSerializer(serializers.Serializer):
        timestamp_after = serializers.DateTimeField(required=False)
        timestamp_before = serializers.DateTimeField(required=False)

    class OutputSerializer(serializers.Serializer):
        timestamp = serializers.DateTimeField()
        severity_counts = serializers.JSONField()

    def get(self, request, *args, **kwargs):
        import datetime
        import pytz

        filters_serializer = self.FiltersSerializer(data=request.query_params)
        filters_serializer.is_valid(raise_exception=True)

        severity_keys = list(range(6))
        timezone = pytz.timezone("America/Mexico_City")

        # Si no se especificó rango de fechas, regresar registros del último día
        if not (filters_serializer.validated_data.get("timestamp_after") or
                filters_serializer.validated_data.get("timestamp_before")):

            date_now = datetime.datetime.now()
            end_date = date_now.astimezone(timezone).replace(
                tzinfo=pytz.utc) + datetime.timedelta(hours=6)
            start_date = end_date - timedelta(hours=24)

            filters_serializer.validated_data["timestamp_before"] = end_date
            filters_serializer.validated_data["timestamp_after"] = start_date

        client_name = request.query_params.get("client")
        registers = get_area_plot_data(
            "Smart Retail", client_name=client_name, filters=filters_serializer.validated_data)

        hourly_counts = {}

        if not client_name:

            for register in registers:

                # Agrupar registros de diferentes clientes, por hora
                if register.timestamp in hourly_counts:
                    for k, v in register.severity_counts.items():
                        if k in hourly_counts[register.timestamp]:
                            hourly_counts[register.timestamp][k] += v
                        else:
                            hourly_counts[register.timestamp][k] = v

                else:
                    hourly_counts[register.timestamp] = register.severity_counts

            registers = []
            for timestamp, counts in hourly_counts.items():
                registers.append(
                    {"timestamp": timestamp, "severity_counts": counts})

            for register in registers:
                register["timestamp"] = register["timestamp"].astimezone(pytz.timezone("America/Mexico_City")).replace(
                    tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
        else:
            for register in registers:
                register.timestamp = register.timestamp.astimezone(pytz.timezone("America/Mexico_City")).replace(
                    tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"

        data = self.OutputSerializer(registers, many=True).data

        return Response(data)


class SmartRetailClientList(APIView):
    class OutputSerializer(serializers.Serializer):
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        clients = get_retail_clients().filter(active=True)

        data = self.OutputSerializer(clients, many=True).data
        return Response(data)


class SetRetailDeviceAsInactiveAPI(APIView):

    def post(self, request, device_id, *args, **kwargs):
        try:
            device_status = get_retail_device_status(device_id)
            device_status.active = False
            device_status.save()
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


# Projects
class CreateProjectAPI(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField()
        servers = serializers.JSONField()
        database_id = serializers.IntegerField(required=False, allow_null=True)
        deployment = serializers.CharField()

    def post(self, request, *args, **kwargs):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        args = {"name": serializer.validated_data["name"],
                "server_aws_ids": serializer.validated_data["servers"],
                "deployment_name": serializer.validated_data["deployment"]}

        if serializer.validated_data.get("database_id"):
            args["database_id"] = serializer.validated_data["database_id"]
        project = create_project(
            **args
        )

        return Response(status=status.HTTP_200_OK)


class ProjectsAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()

    def get(self, request, *args, **kwargs):
        projects = get_projects()

        output = self.OutputSerializer(projects, many=True).data

        return Response(output)


class ModifyServerProjectsAPI(APIView):
    class InputSerializer(serializers.Serializer):
        projects = serializers.JSONField()

    def post(self, request, server_id, *args, **kwargs):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        projects = serializer.validated_data["projects"]

        set_projects_to_server(server_id, projects)

        return Response(status=status.HTTP_200_OK)
