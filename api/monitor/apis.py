from django.shortcuts import render
from django.db.models import Count, F, Window, Q
from django.db.models.functions import Lead
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status, filters

from .selectors import *
from .services import device_create_or_update
from api.pagination import get_paginated_response, LimitOffsetPagination
from .models import UnitStatus

import operator


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
        devices = unitstatus_list()
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

    class SeverityCountSerializer(serializers.Serializer):
        severity = serializers.IntegerField()
        count = serializers.IntegerField()

    def get(self, request, *args, **kwargs):

        counts = UnitStatus.objects.values('status__severity') \
            .annotate(severity=F('status__severity')) \
            .values('severity') \
            .annotate(count=Count('id')) \
            .order_by('-severity')

        # Serialize the result
        serializer = self.SeverityCountSerializer(counts, many=True)
        return Response(serializer.data)


class DeviceSeverityCount(APIView):

    class SeverityCountSerializer(serializers.Serializer):
        severity = serializers.IntegerField()
        count = serializers.IntegerField()

    def get(self, request, *args, **kwargs):

        counts = DeviceStatus.objects.values('status__severity') \
            .annotate(severity=F('status__severity')) \
            .values('severity') \
            .annotate(count=Count('id')) \
            .order_by('-severity')

        # Serialize the result
        serializer = self.SeverityCountSerializer(counts, many=True)
        return Response(serializer.data)


# Device history


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

        print("val data")
        print(filters_serializer.validated_data)
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
        print("val data")
        print(filters_serializer.validated_data)
        logs = get_devicehistory(
            data, filters=filters_serializer.validated_data)[::-1]

        return get_paginated_response(
            serializer_class=self.OutputSerializer,
            queryset=logs,
            request=request,
        )


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
        print("device status time")
        print(device_histories_with_next_severity)

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
        last_status = get_unit_last_active_status({"unit_id": unit_id})

        data = self.OutputSerializer(last_status).data

        return Response(data)


class UnitStatusAPI(APIView):
    class OutputSerializer(serializers.Serializer):
        unit_id = serializers.IntegerField()
        unit = serializers.CharField()
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

        data = self.OutputSerializer(clients, many=True).data
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
    class OutputSerializer(serializers.Serializer):
        hour = serializers.DateTimeField()
        severity = serializers.IntegerField()

    def get(self, request, unit_id, *args, **kwargs):
        import datetime
        import math
        import pytz

        date_now = datetime.datetime.now()
        end_date = (date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(
            tzinfo=pytz.utc) + datetime.timedelta(hours=6))
        start_date = (end_date - timedelta(hours=24))

        filter_args = {"register_datetime_after": start_date,
                       "register_datetime_before": end_date}

        registers = get_unithistory({"unit_id": unit_id}, filters=filter_args)

        grouped_by_hour = {}

        for register in registers:
            hour = (register.register_datetime -
                    timedelta(hours=6)).replace(tzinfo=None).isoformat(timespec="hours", sep=' ') + "h"
            severity = register.status.severity

            if hour not in grouped_by_hour:
                grouped_by_hour[hour] = [severity]
            else:
                grouped_by_hour[hour].append(severity)

        output = [{"hour": date, "severity": max(set(severities), key=severities.count)}
                  for date, severities in grouped_by_hour.items()]

        data = self.OutputSerializer(output, many=True).data

        return Response(data)
