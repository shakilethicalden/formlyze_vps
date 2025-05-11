from django.db import models
from users.models import UserProfile
# Create your models here.
class NotificationModel(models.Model):
    user=models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    user_email=models.EmailField(null=True, blank=True)
    message=models.TextField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    read=models.BooleanField(default=False)
    
    
    def save(self,*args, **kwargs):
        if self.read:
            self.delete()
        else:
            return super().save(*args,**kwargs)
        
    def __str__(self):
        return f"Notification for {self.user_email}"
        
        
            