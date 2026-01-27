"""
Django REST Framework Views
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, EntryType, Entry, Media, Timeline, TimelineEvent
from .serializers import (
    CategorySerializer, EntryTypeSerializer, EntryListSerializer,
    EntryDetailSerializer, MediaSerializer, TimelineSerializer,
    TimelineEventSerializer, EntryHistorySerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """分類管理 ViewSet"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order', 'created_at']
    lookup_field = 'slug'

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """獲取完整分類樹"""
        root_categories = Category.objects.filter(parent=None)
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)


class EntryTypeViewSet(viewsets.ModelViewSet):
    """條目類型管理 ViewSet"""
    queryset = EntryType.objects.all()
    serializer_class = EntryTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    lookup_field = 'slug'


class EntryViewSet(viewsets.ModelViewSet):
    """條目管理 ViewSet"""
    queryset = Entry.objects.select_related(
        'category', 'entry_type', 'author'
    ).prefetch_related('tags', 'related_entries')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'entry_type', 'category', 'is_featured', 'author']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['title', 'created_at', 'updated_at', 'view_count']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return EntryListSerializer
        return EntryDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """獲取單個條目並增加瀏覽次數"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def history(self, request, slug=None):
        """獲取條目歷史版本"""
        entry = self.get_object()
        history = entry.history.all()

        history_data = []
        for record in history:
            history_data.append({
                'history_id': record.history_id,
                'history_date': record.history_date,
                'history_user': record.history_user.username if record.history_user else 'Unknown',
                'history_type': record.history_type,
                'title': record.title,
                'content': record.content,
            })

        serializer = EntryHistorySerializer(history_data, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, slug=None):
        """恢復到指定歷史版本"""
        entry = self.get_object()
        history_id = request.data.get('history_id')

        try:
            historical_record = entry.history.get(history_id=history_id)
            historical_record.instance.save()
            return Response({'status': 'restored'})
        except entry.history.model.DoesNotExist:
            return Response(
                {'error': 'History record not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def search(self, request):
        """全文搜索"""
        query = request.query_params.get('q', '')

        if not query:
            return Response([])

        entries = Entry.objects.filter(
            Q(title__icontains=query) |
            Q(summary__icontains=query) |
            Q(content__icontains=query) |
            Q(tags__name__icontains=query)
        ).distinct()

        serializer = EntryListSerializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """獲取精選條目"""
        entries = Entry.objects.filter(is_featured=True, status='published')
        serializer = EntryListSerializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """獲取最近更新的條目"""
        limit = int(request.query_params.get('limit', 10))
        entries = Entry.objects.filter(status='published').order_by('-updated_at')[:limit]
        serializer = EntryListSerializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """獲取熱門條目"""
        limit = int(request.query_params.get('limit', 10))
        entries = Entry.objects.filter(status='published').order_by('-view_count')[:limit]
        serializer = EntryListSerializer(entries, many=True)
        return Response(serializer.data)


class MediaViewSet(viewsets.ModelViewSet):
    """媒體管理 ViewSet"""
    queryset = Media.objects.select_related('uploader').prefetch_related('entries', 'tags')
    serializer_class = MediaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['media_type', 'uploader']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'file_size']

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """按類型獲取媒體"""
        media_type = request.query_params.get('type', 'image')
        media_files = Media.objects.filter(media_type=media_type)
        serializer = self.get_serializer(media_files, many=True)
        return Response(serializer.data)


class TimelineViewSet(viewsets.ModelViewSet):
    """時間線管理 ViewSet"""
    queryset = Timeline.objects.prefetch_related('events')
    serializer_class = TimelineSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class TimelineEventViewSet(viewsets.ModelViewSet):
    """時間線事件管理 ViewSet"""
    queryset = TimelineEvent.objects.select_related('timeline', 'entry')
    serializer_class = TimelineEventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['timeline']
    ordering_fields = ['order', 'date']
