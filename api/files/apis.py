from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from files.models import File
from files.services import (
    FileDirectUploadService,
    FileStandardUploadService,
)


class FileStandardUploadApi(APIView):

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES["file"]
        service = FileStandardUploadService(user=request.user, file_obj=file_obj)
        file = service.create()

        return Response({
            "id": file.id
        }, status=status.HTTP_201_CREATED)
    
    def put(self, request, file_id, *args, **kwargs):
        file = get_object_or_404(File, id=file_id)
        file_obj = request.FILES["file"]

        service = FileStandardUploadService(user=request.user, file_obj=file_obj)
        file = service.update(file=file)

        return Response({
            "id": file.id
        })


class FileDirectUploadStartApi(APIView):

    class InputSerializer(serializers.Serializer):
        file_name = serializers.CharField()
        file_type = serializers.CharField()

    def post(self, request, *args, **kwargs):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = FileDirectUploadService(request.user)
        presigned_data = service.start(
            **serializer.validated_data, 
            api_version=request.version
        )

        return Response(presigned_data)


class FileDirectUploadFinishApi(APIView):

    class InputSerializer(serializers.Serializer):
        file_id = serializers.CharField()

    def post(self, request, *args, **kwargs):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file_id = serializer.validated_data["file_id"]

        file = get_object_or_404(File, id=file_id)

        service = FileDirectUploadService(request.user)
        service.finish(file=file)

        return Response({"id": file.id})


class FileDirectUploadLocalApi(APIView):
    
    def post(self, request, file_id, *args, **kwargs):
        file = get_object_or_404(File, id=file_id)

        file_obj = request.FILES["file"]

        service = FileDirectUploadService(request.user)
        file = service.upload_local(file=file, file_obj=file_obj)

        return Response({"id": file.id})
