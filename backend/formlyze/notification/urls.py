from rest_framework.routers import DefaultRouter
from django.urls import include,path
from .views import NotificationView,mark_notification_read

router= DefaultRouter()
router.register('notification/list',NotificationView)

urlpatterns = [
    
    path('',include(router.urls)),
    path('notification/read/<int:id>', mark_notification_read,name="notification-read")
]
