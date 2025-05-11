from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import FormView, FormResponseView, form_details, ToggleFavoriteView, ToggleArchiveView, ToggleTrashView


router = DefaultRouter()
router.register('list',FormView, basename='form-list')
router.register('response',FormResponseView, basename='form-response')


urlpatterns = [
    path('', include(router.urls)),
    path('<uuid:unique_token>/', form_details, name='form_details'),
    path('toggle-favorite/<int:pk>', ToggleFavoriteView.as_view(), name='toggle_favorite'),
     path('toggle-archive/<int:pk>', ToggleArchiveView.as_view(), name='toggle_archive'),
     path('toggle-trash/<int:pk>', ToggleTrashView.as_view(), name='toggle_trash'),
    

     
]
