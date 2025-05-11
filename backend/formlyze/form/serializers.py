from rest_framework import serializers
from .models import Form, FormResponse



class FormSerializer(serializers.ModelSerializer):
    creator_name=serializers.SerializerMethodField() #we can retrieve username
    form_link = serializers.SerializerMethodField()
    logo=serializers.ImageField(use_url=True,required=False)
    is_favorite=serializers.BooleanField(required=False)
    is_archive=serializers.BooleanField(required=False)
    is_trash=serializers.BooleanField(required=False)
    class Meta:
        model = Form
        fields = '__all__'

        
    def get_form_link(self,obj):
        return obj.get_form_link()
    
    def get_creator_name(self,obj):
        return f"{obj.created_by.username}"
        
class FormResponseSerializer(serializers.ModelSerializer):
    form_title=serializers.SerializerMethodField()
    form_description=serializers.SerializerMethodField()
    class Meta:
        model = FormResponse
        fields = '__all__'
        
    def get_form_title(self,obj):
        return f"{obj.form.title}"
        
    def get_form_description(self,obj):
        return f"{obj.form.description}"

        



