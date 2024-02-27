from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status, filters

from .selectors import *
from .services import device_create_or_update

# Create your views here.
class UnitList(APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.IntegerField()
        client = serializers.IntegerField()

    def get(self, request):
        devices = unitstatus_list()

        data = self.OutputSerializer(devices, many =True).data

        return Response(data)
    

class UnitStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        unit = serializers.CharField()
        on_trip = serializers.BooleanField()
        status = serializers.CharField()
        description = serializers.CharField(source='status.description')
        last_connection = serializers.DateTimeField()
        pending_events = serializers.IntegerField()
        pending_status = serializers.IntegerField()


    def get(self, request, *args, **kwargs):
        devices = unitstatus_list()

        sorted_devices = sorted(devices, key= lambda x: x.status.severity, reverse=True)
        data = self.OutputSerializer(sorted_devices, many =True).data

        return Response(data)


class DeviceStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        device = serializers.CharField()
        last_connection = serializers.DateTimeField()
        status = serializers.CharField()
        description = serializers.CharField(source='status.description')
        delayed = serializers.BooleanField()
        delay_time = serializers.DurationField()
    

    def get(self, request, *args, **kwargs):
        devices = devicestatus_list()

        data = self.OutputSerializer(devices, many =True).data

        return Response(data)


class UnitStatus(APIView):
    class OutputSerializer(serializers.Serializer):
        unit = serializers.CharField()
        last_update = serializers.DateTimeField()
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
        status = serializers.CharField()

    def get(self, request, unit):
       
        #unit = self.kwargs['unit']
        device = unitstatus(unit=unit)
       
        data = self.OutputSerializer(device).data

        return Response(data)
    


class CameraStatusList(APIView):
    class OutputSerializer(serializers.Serializer):
        camera = serializers.CharField()
        last_update = serializers.DateTimeField()
        connected = serializers.BooleanField()
        disconnection_time = serializers.DurationField()
    

    def get(self, request):
        devices = camerastatus_list()

        data = self.OutputSerializer(devices, many =True).data

        return Response(data)




class CreateDevice(APIView):
    class InputSerializer(serializers.Serializer):
        unit = serializers.IntegerField()
        total = serializers.IntegerField()
        restarts = serializers.IntegerField()
        reboots = serializers.IntegerField()
        validations = serializers.IntegerField()
        source_id = serializers.IntegerField()
        connection = serializers.IntegerField()
        memory = serializers.IntegerField()
        forced = serializers.IntegerField()
        read_only = serializers.IntegerField()
        others = serializers.IntegerField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        device_create_or_update(**serializer.validated_data)

        return Response(status=status.HTTP_201_CREATED)
    



