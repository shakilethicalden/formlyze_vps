from rest_framework.authtoken.models import Token
from django.conf import settings
from django.contrib.auth import logout
from django.contrib.auth.models import User
from  users.models import UserProfile
from django.shortcuts import render
from django.views import View
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests
from django.http import JsonResponse
from django.http import HttpResponseRedirect


# class GoogleLogin(SocialLoginView):
#     adapter_class = GoogleOAuth2Adapter
#     callback_url = settings.GOOGLE_OAUTH_CALLBACK_URL
#     client_class = OAuth2Client

class GoogleLoginCallback(APIView):
    def get(self, request, *args, **kwargs):
        code = request.GET.get("code")
        if not code:
            return Response({"error": "No authorization code provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_OAUTH_CALLBACK_URL,
            "grant_type": "authorization_code",
        }
        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            return Response({"error": "Failed to exchange token", "details": response.json()}, status=status.HTTP_400_BAD_REQUEST)

        tokens = response.json()
        id_token = tokens.get("id_token")

        # Extract user info from id_token (without decoding)
        user_info_url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + id_token
        user_info_response = requests.get(user_info_url)
        if user_info_response.status_code != 200:
            return Response({"error": "Failed to get user info from Google"}, status=status.HTTP_400_BAD_REQUEST)
        
        user_info = user_info_response.json()
        email = user_info.get("email")
        first_name = user_info.get("given_name", "")
        last_name = user_info.get("family_name", "")
        
        if not email:
            return Response({"error": "No email found in ID token"}, status=status.HTTP_400_BAD_REQUEST)

        user, _ = User.objects.get_or_create(username=email, defaults={"email": email, "first_name": first_name, "last_name": last_name})
        
        # Create or get UserProfile
        user_profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"username": email, "email": email, "first_name": first_name, "last_name": last_name})
        # Create Token for user
        token, created = Token.objects.get_or_create(user=user)

        # return Response(
        #     {
        #         "success": True,
        #         "user_id": user_profile.id,  # returning UserProfile's ID
        #         "message": "Login successful",
        #         "token": token.key
        #     }
        # )
        
        #here we make redirect url
        redirect_url = f"{settings.FRONTEND_URL}/sign-in/?token={token.key}&user_id={user_profile.id}"
        # print(redirect_url)
        
        # #we return response the redirect url to frontend but now for testing we return response for checking

        return HttpResponseRedirect(redirect_url)
        
        
        
        
#this function we use for return response to frontend credentials       
def google_oauth_config(request):
    return JsonResponse({
        'google_client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
        'google_callback_uri': settings.GOOGLE_OAUTH_CALLBACK_URL
    })




#we testing google login for use with template
class LoginPage(View):
    def get(self, request, *args, **kwargs):
        return render(request, "login.html", {"google_callback_uri": settings.GOOGLE_OAUTH_CALLBACK_URL, "google_client_id": settings.GOOGLE_OAUTH_CLIENT_ID})

