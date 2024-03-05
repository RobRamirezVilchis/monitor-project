from django.shortcuts import render
from django.db.models import Count, F, Window
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

# Create your views here.


class UnitList(APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.IntegerField()
        client = serializers.IntegerField()

    def get(self, request):
        devices = unitstatus_list()

        data = self.OutputSerializer(devices, many=True).data

        return Response(data)

# All devices status list
    
class UnitStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        unit_id = serializers.IntegerField()
        unit = serializers.CharField()
        on_trip = serializers.BooleanField()
        severity = serializers.IntegerField(source='status.severity')
        description = serializers.CharField(source='status.description')
        last_connection = serializers.DateTimeField()
        pending_events = serializers.IntegerField()
        pending_status = serializers.IntegerField()

    def get(self, request, *args, **kwargs):
        devices = unitstatus_list()

        sorted_devices = sorted(
            devices, key=lambda x: x.status.severity, reverse=True)
        data = self.OutputSerializer(sorted_devices, many=True).data

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

        data = {'unit_id': unit_id}
        logs = get_unithistory(data)[::-1]
  
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
    
        print(filters_serializer.validated_data)

        data = {'device_id': device_id}
        logs = get_devicehistory(data)[::-1]

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
            unit_id = unit_id,
        ).annotate(
            next_severity=Window(
                expression=Lead('status__severity'),
                partition_by=[F('unit_id')],
                order_by=F('register_datetime').desc()
            )
        )
        
        severity_changes = unit_histories_with_next_severity.filter(
            next_severity__isnull=False,  # Excludes the last record for each unit, as it has no "next" record
            status__severity__isnull=False  # Optional: Exclude records with no severity to avoid comparing None values
        ).exclude(
            status__severity=F('next_severity')
        )

        if not severity_changes:
            first_register = unit_histories_with_next_severity[len(unit_histories_with_next_severity)-1]
            output = self.OutputSerializer(first_register).data
            return Response(output)
        else:
            last_change = severity_changes[0]
            output = self.OutputSerializer(last_change).data
            return Response(output)


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


