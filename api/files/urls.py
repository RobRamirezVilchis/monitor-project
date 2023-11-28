from django.urls import include, path

from files import apis

upload_direct_patterns = [
    path("start/", apis.FileDirectUploadStartApi.as_view(), name="start"),
    path("finish/", apis.FileDirectUploadFinishApi.as_view(), name="finish"),
    path("local/<str:file_id>/", apis.FileDirectUploadLocalApi.as_view(), name="local"),
]

upload_patterns = [
    path("standard/", apis.FileStandardUploadApi.as_view(), name="standard"),
    path("direct/", include((upload_direct_patterns, "direct"))),
]

urlpatterns = [
    path("upload/", include((upload_patterns, "upload"))),
    path("<str:file_id>/download/", apis.FileDownloadApi.as_view(), name="download"),
]
