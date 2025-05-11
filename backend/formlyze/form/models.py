from django.db import models
import uuid
from django.conf import settings
from users.models import UserProfile
# Create your models here.

    

class Form(models.Model):
    created_by=models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    title=models.CharField(max_length=100)
    description=models.TextField(null=True, blank=True)
    logo=models.ImageField(upload_to='images/',blank=True,null=True)
    website_url=models.URLField(null=True,blank=True)
    fields=models.JSONField() # it will be store data dynamically 
    is_active=models.BooleanField(default=True)
    
    is_favorite=models.BooleanField(default=False, null=True, blank=True)
    is_archive=models.BooleanField(default=False, null=True, blank=True)
    is_trash=models.BooleanField(default=False, null=True, blank=True)
    
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    """ generate unique token for form we will use it to make unique link"""
    unique_token=models.UUIDField(default=uuid.uuid4, unique=True, editable=False) 
    
    def get_form_link(self):
        return f"{settings.BACKEND_URL}/api/form/{self.unique_token}"
    
    def __str__(self):
        return self.title
    

class FormResponse(models.Model):
    form=models.ForeignKey(Form, on_delete=models.CASCADE)
    responder_email=models.EmailField(blank=True,null=True)
    response_data=models.JSONField() #dynamically store data of submission
    
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f" Response for {self.form.title}"
    