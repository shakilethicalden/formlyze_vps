from django.shortcuts import render
from rest_framework import viewsets
from .models import NotificationModel
from rest_framework.response import Response
from .serializers import NotificationSerializer
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.

class NotificationView(viewsets.ModelViewSet):
    queryset=NotificationModel.objects.all().order_by("created_at")
    serializer_class=NotificationSerializer
    filter_backends=[DjangoFilterBackend]
    filterset_fields=['user']
    
    
    
    
@api_view(['POST']) 
def mark_notification_read(request, id):
    try:
        notification=NotificationModel.objects.get(id=id)
        notification.read=True
        notification.save()
        return Response({
            'success':True,
            'messages': "Notification read successfully"
        })
    
    except NotificationModel.DoesNotExist:
        return Response({
            'success':False,
            'messages': "Notification Not Found"
        })