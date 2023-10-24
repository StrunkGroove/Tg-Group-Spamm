from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from tg_accounts.models import RequiredUserModel, UsernameModel, SpammUsersModel
from tg_accounts.forms import RequiredUserForm, UsernameForm

@login_required(login_url='block')
def index(request):
    users = UsernameModel.objects.all()
    usersTakeSpamm = SpammUsersModel.objects.all()
    form = UsernameForm()
    return render(request, 'main/index.html', 
                    {'users':users, 'usersTakeSpamm': len(usersTakeSpamm), 'form': form})

@login_required(login_url='block')
def username(request):
    phones = RequiredUserModel.objects.all()
    form = RequiredUserForm()
    return render(request, 'main/users.html', 
                  {'phones': phones, 'form': form})
    
@login_required(login_url='block')
def instructions(request):
    return render(request, 'main/instructions.html')

def block(request):
    return render(request, 'main/block.html')
