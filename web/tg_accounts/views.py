import csv

from datetime import datetime
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View

from .models import RequiredUserModel, UsernameModel, SpammUsersModel
from .forms import RequiredUserForm, UsernameForm


class RequireUserView(View):
    def post(self, request):
        form = RequiredUserForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Create success!'})
        return JsonResponse({'message': 'Invalid action'}, status=400)

class RequireUserDeleteView(View):
    def post(self, request):
        id = request.POST.get('id')
        user_obj = get_object_or_404(RequiredUserModel, id=id)
        user_obj.delete()
        return JsonResponse({'message': 'Delete success!'})

class UsernameUpdateView(View):
    def post(self, request):
        id = request.POST.get('id')
        new_text = request.POST.get('text')
        user_obj = get_object_or_404(UsernameModel, id=id)
        if new_text:
            user_obj.text = new_text
            user_obj.status = False
            user_obj.save()
            SpammUsersModel.objects.all().delete()
            return JsonResponse({'message': 'Text updated successfully'})
        return JsonResponse({'message': 'Text is undefind!'}, status=400)

class UsernameUpdateServerView(View):
    def post(self, request):
        id = request.POST.get('id')
        new_server = request.POST.get('text')
        user_obj = get_object_or_404(UsernameModel, id=id)
        if new_server:
            user_obj.server = new_server
            user_obj.status = False
            user_obj.save()
            SpammUsersModel.objects.all().delete()
            return JsonResponse({'message': 'Server updated successfully'})
        return JsonResponse({'message': 'Text is undefind!'}, status=400)
    
class UsernameCreateView(View):
    def post(self, request):
        form = UsernameForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Create success!'})
        return JsonResponse({'message': 'Invalid form data'}, status=400)

class UsernameDeleteView(View):
    def post(self, request):
        id = request.POST.get('id')
        user_obj = get_object_or_404(UsernameModel, id=id)
        user_obj.delete()
        return JsonResponse({'message': 'Delete success!'})
    
class UsernameStartView(View):
    def post(self, request):
        id = request.POST.get('id')
        user_obj = get_object_or_404(UsernameModel, id=id)
        if user_obj.server:
            user_obj.status = True
            user_obj.start = datetime.now()
            user_obj.save()
            return JsonResponse({'message': 'Text updated successfully'})
        return JsonResponse({'message': 'Specify the server name'}, status=400)
    
class DownloadView(View):
    def post(self, request):
        phone = request.POST.get('phone')
        users = SpammUsersModel.objects.all()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{phone}.csv"'
        writer = csv.writer(response)
        for user in users:
            writer.writerow([user.username])

        return response