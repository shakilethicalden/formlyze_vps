from django.urls import path,include
from .views import RegisterView, LoginView, LogoutView, UserView,ForgotPasswordView,ResetPasswordView
from rest_framework import routers
router= routers.DefaultRouter()
router.register('list',UserView)



urlpatterns = [
    path("", include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/',LogoutView.as_view(), name='logout'), 
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='password_reset_confirm'),

    
]
