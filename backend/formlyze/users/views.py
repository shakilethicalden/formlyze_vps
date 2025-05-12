from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status,viewsets
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer,UserSerializer,ForgotPasswordSerializer,ResetpasswordSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.urls import reverse


#user list get view
class UserView(viewsets.ModelViewSet):
    serializer_class=UserSerializer
    queryset=UserProfile.objects.all()


# user register view 
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                try:
                    subject = 'Registration Confirmation'
                    recipient_email = user.email
                    
                    sender_email = settings.EMAIL_HOST_USER
                    
                    html_content = render_to_string("register.html", {
                        'user': user,
                    })
                    
                    email = EmailMultiAlternatives(
                        subject, 
                        "", 
                        sender_email, 
                        [recipient_email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                    
                    return Response({
                        'success': True,
                        "message": "User registered successfully"
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as e:
                    return Response({
                        'success': True,
                        "message": "User registered but confirmation email failed",
                        "error": str(e)
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    'success': False,
                    "message": "User registration failed",
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response({
            'success': False,
            "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


# user login view
class LoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get('username')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response({
                'success': False,
                'error': 'Both username/email and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

 
        if '@' in username_or_email:
    
            try:
                profile = UserProfile.objects.get(email=username_or_email)
            except UserProfile.DoesNotExist:
                return Response({
                    'success': False,'message': 'Invalid email', },
                                status=status.HTTP_401_UNAUTHORIZED)
        else:
   
            try:
                profile = UserProfile.objects.get(username=username_or_email)
            except UserProfile.DoesNotExist:
                return Response({'success': False,'message': 'Invalid username', },
                                status=status.HTTP_401_UNAUTHORIZED)

 
        user = profile.user
        authenticated_user = authenticate(username=user.username, password=password)

        if authenticated_user:
            token, _ = Token.objects.get_or_create(user=authenticated_user)
            return Response({
                'success': True,
                'user_id': profile.id,
                'message': 'Login successful',
                'token': token.key
            })

        return Response({'success': False,
                         'message': 'Invalid credentials', },
                        status=status.HTTP_401_UNAUTHORIZED)


#user logout view
class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]  
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        try:
            # Delete the token
            token = Token.objects.get(user=request.user)
            token.delete()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            return Response({"error": "Token not found"}, status=status.HTTP_400_BAD_REQUEST)


def send_reset_password_email(user, reset_link):
    subject = "Reset Your Password - Formlyze"
    recipient_email = user.email
    sender_email = settings.EMAIL_HOST_USER

    html_content = render_to_string("reset_password_request.html", {
                    'username': user.username,
                    'reset_link': reset_link
                 })
    email = EmailMultiAlternatives(
        subject, 
        "", 
        sender_email, 
        [recipient_email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


#forgot password view
class ForgotPasswordView(APIView):
    def post(self, request):
        serializer= ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email= serializer.validated_data.get('email')
            try:
                user= UserProfile.objects.get(email=email) # user profile instance
                
                uid = urlsafe_base64_encode(str(user.id).encode()) 
                token=default_token_generator.make_token(user.user)
                
                #when user click render to frontend and fill pass and submit
                reset_link = f"http://app.formlyze.io/reset-password/{uid}/{token}/"  

                send_reset_password_email(user,reset_link)
                
                return Response({
                    'success':True,
                    "message":"Password reset mail sent"
                },status=status.HTTP_200_OK)
                 
                
            except UserProfile.DoesNotExist:
                return Response({
                    'success':False,
                    "message":"User not found"
                }, status=status.HTTP_400_BAD_REQUEST)
                


#send success email for password reset
def send_reset_password_success_email(user):
    subject = "Your Password Reset Successfully- Formlyze"
    recipient_email = user.email
    sender_email = settings.EMAIL_HOST_USER

    html_content = render_to_string("reset_password_success.html", {
                    'username': user.username,
                 })
    email = EmailMultiAlternatives(
        subject, 
        "", 
        sender_email, 
        [recipient_email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()     
               
                
#reset password viw
class ResetPasswordView(APIView):
    def post(self,request,uidb64,token):
        serializer=ResetpasswordSerializer(data=request.data)
        if serializer.is_valid():
            password=serializer.validated_data['password']
            # print("password:", password)
            try:
                uid= urlsafe_base64_decode(uidb64).decode()
                user= UserProfile.objects.get(id=uid)
                
                if default_token_generator.check_token(user.user,token):
                    user.user.set_password(password) #reset password
                    user.user.save()
                    
                    
                    send_reset_password_success_email(user)
                    return Response({
                        'success':True,
                        'message': "password Reset successfully"
                    }, status=status.HTTP_200_OK)
                else:
                    return  Response({
                        'success':False,
                        'message':"Invalid or expired token"
                    },status=status.HTTP_400_BAD_REQUEST)
                
                
            except:
                    return  Response({
                        'success':False,
                        'message':"Invalid or expired token"
                    },status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "success":False,
            'message':serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)