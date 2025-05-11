from django.urls import path
from .views import  GoogleLoginCallback, LoginPage,google_oauth_config

urlpatterns = [
    path("google/login/", LoginPage.as_view(), name="login"),
    path("v1/auth/google/callback/", GoogleLoginCallback.as_view(), name="google_login_callback"),
    path('google/oauth/config/', google_oauth_config, name='google_oauth_config'), 
 

]
