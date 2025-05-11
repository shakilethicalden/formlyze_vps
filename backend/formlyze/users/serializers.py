from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = ['id',  'username', 'email', 'first_name', 'last_name', 'healthCareName', 'address', 'phone']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password', 'healthCareName', 'address', 'phone']
        
    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')


        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'This username is already taken.'})

        if UserProfile.objects.filter(user__username=username).exists():
            raise serializers.ValidationError({'username': 'This username is already used in a profile.'})

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'This email is already registered.'})

        if UserProfile.objects.filter(user__email=email).exists():
            raise serializers.ValidationError({'email': 'This email is already used in a profile.'})

        return attrs

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        
        #create user
        user = User.objects.create_user(username=username, email=email, password=password)
        user_profile = UserProfile.objects.create(user=user, username=username, email=email, **validated_data)
        return user_profile


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetpasswordSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        
        if data['password']!=data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
        
