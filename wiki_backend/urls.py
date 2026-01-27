"""
URL routing for wiki_backend app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, EntryTypeViewSet, EntryViewSet,
    MediaViewSet, TimelineViewSet, TimelineEventViewSet
)

# 創建路由器
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'entry-types', EntryTypeViewSet, basename='entrytype')
router.register(r'entries', EntryViewSet, basename='entry')
router.register(r'media', MediaViewSet, basename='media')
router.register(r'timelines', TimelineViewSet, basename='timeline')
router.register(r'timeline-events', TimelineEventViewSet, basename='timelineevent')

urlpatterns = [
    path('', include(router.urls)),
]
