from django.conf.urls import include, url
from django.contrib.auth import views as auth_views
from django.core.urlresolvers import reverse

from . import views, rest_views

urlpatterns = [
    url(r'^tokenlogin/$', rest_views.token_login, name='token-login'),
    url(r'^userme/$', rest_views.UserMe_R.as_view(), name='user-me'),
    url(r'^users/$', rest_views.UsersList.as_view(), name='users'),
    url(r'^user/(?P<username>[a-zA-Z0-9_.+-]+)/$', rest_views.UserOther_R.as_view(), name='user-name'),
    url(r'^user/(?P<uid>\d+)/$', rest_views.UserOther_R.as_view(), name='user-username'),
    url(r'^updateposition/$', rest_views.UpdatePosition.as_view(), name='update-position'),
]