from django.shortcuts import render,redirect,get_object_or_404
from django.http import JsonResponse, HttpResponse
from rest_framework.views import APIView
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import FormSerializer,FormResponseSerializer
from rest_framework import viewsets,generics,status
from .models import Form, FormResponse
from django.contrib import messages
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework.response import Response
from django.http import FileResponse
from .utils.export_excel import generate_excel
from notification.models import NotificationModel
from django.contrib.sites.shortcuts import get_current_site
def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


# Create your views here.

class FormView(viewsets.ModelViewSet):
    serializer_class=FormSerializer
  
    queryset = Form.objects.all().order_by('-created_at')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title', 'created_by', 'is_favorite', 'is_archive', 'is_trash']
    # permission_classes=[IsAuthenticated]
    
    
    
    def create(self, request, *args, **kwargs):
        serializer= self.get_serializer(data=request.data)
        if serializer.is_valid():
            form=serializer.save()
            
            try:
                subject= "Form Creation Confirmation"
                recipient_email=form.created_by.email
                sender_email=settings.EMAIL_HOST_USER

                html_content= render_to_string("form_creation.html",{
                    'form':form,
                    'username':form.created_by.username

                })

                email= EmailMultiAlternatives(subject, "" , sender_email, [recipient_email])
                email.attach_alternative(html_content, "text/html")
                email.send()
            except Exception as e:
                return Response({
                'success': True,
                'form_link': form.get_form_link(),
                'message': 'Email not send But Form created successfully', }, status=status.HTTP_201_CREATED)        

            return Response({
                'success': True,
                'form_link': form.get_form_link(),
                'message': 'Form created successfully', }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
           

class ToggleFavoriteView(APIView):
    def post(self,request,pk):
        try:
            form=Form.objects.get(pk=pk)
            form.is_favorite = not form.is_favorite
            form.save()
            return Response({
                'success': True,
                'message': 'Form favorite successfully' if form.is_favorite else 'Form unfavorite successfully',
            }, status=status.HTTP_200_OK)
        except Form.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Form not found',
            }, status=status.HTTP_404_NOT_FOUND) 
            
            
class ToggleArchiveView(APIView):
    def post(self,request,pk):
        try:
            
            form= Form.objects.get(pk=pk)
            form.is_archive=not form.is_archive
            form.save()
            return Response({
                'success':True,
                'message':"Form Archive successfully" if form.is_archive else 'Form unarchive Successfully'
            })
            
        except Form.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Form not found',
            }, status=status.HTTP_404_NOT_FOUND) 
         
            
            
class ToggleTrashView(APIView):
    def post(self,request,pk):
        try:
            form= Form.objects.get(pk=pk)
            form.is_trash=not form.is_trash
            form.save()
            
            return Response({
                'success':True,
                'message':"Form Trashed successfully" if form.is_trash else 'Form untrashed Successfully'
            })
        except Form.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Form not found',
            }, status=status.HTTP_404_NOT_FOUND)


    
class FormResponseView(viewsets.ModelViewSet):
    serializer_class=FormResponseSerializer
    queryset=FormResponse.objects.all()
    http_method_names=['get','post']
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['form', 'responder_email']
    
    
    #inboke create function for sending mail 
    def create(self,request, *args, **kwargs):
        serializer= self.get_serializer(data=request.data)
        if serializer.is_valid():
            data=serializer.save()
            
            #make notification and save to database
            notification_msg=f'The form "{data.form.title}" is submitted by {data.responder_email} '
            notification= NotificationModel.objects.create(
                user=data.form.created_by,
                user_email=data.responder_email,
                message=notification_msg
            )
            response_url=f"{settings.FRONTEND_URL}/view-single-response/{data.id}"
            subject= "From Submission Confirmation"
            creator_email=data.form.created_by.email
            responder_email=data.responder_email
            sender_email=settings.EMAIL_HOST_USER
            #send mail to creator
            if is_valid_email(creator_email):
                try:
                    html_content= render_to_string("form_response_creator.html",{
                        'username':data.form.created_by.username,
                        'form_title':data.form.title, 
                        'response_url':response_url
                    })

                    email= EmailMultiAlternatives(subject, "" , sender_email, [creator_email])
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                except Exception as e:
                    return Response({"error": "Failed to send email to creator"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST)
            
            #send mail to responder
            if is_valid_email(responder_email):
                try:
                    html_content= render_to_string("form_response.html",{
                        'responder_email':responder_email, 
                        'response_url':response_url
                    })

                    email= EmailMultiAlternatives(subject, "" , sender_email, [responder_email])
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                except Exception as e:
                    return Response({"error": "Failed to send email to responder"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST)
            
            
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)   
    
    @action(detail=True, methods=['get'], url_path='export')
    def export_responses(self, request, pk=None):
        form = get_object_or_404(Form, pk=pk)
        print('form', form)
        responses = self.get_queryset().filter(form=form)
        
        excel_file = generate_excel(form, responses)
        
        response = HttpResponse(
            excel_file,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{form.title}_responses.xlsx"'
        return response
        
        
        
        
def form_details(request, unique_token):
    form = get_object_or_404(Form, unique_token=unique_token)
    fields = form.fields  

    return JsonResponse({
        'id': form.id,
        'logo': form.logo.url if form.logo else None,
        'url': form.website_url,
        'favorite': form.is_favorite,
        'archive': form.is_archive,
        'trash': form.is_trash,
        'form_name': form.title,
        'description': form.description,
        'fields': fields,
    })