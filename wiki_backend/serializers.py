"""
Django REST Framework Serializers
"""
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Category, EntryType, Entry, Media, Timeline, TimelineEvent


class CategorySerializer(serializers.ModelSerializer):
    """分類序列化器"""
    children_count = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'parent', 'description', 'icon',
            'order', 'children_count', 'entry_count', 'full_path',
            'created_at', 'updated_at'
        ]

    def get_children_count(self, obj):
        return obj.get_children().count()

    def get_entry_count(self, obj):
        return obj.entries.count()

    def get_full_path(self, obj):
        return obj.get_full_path()


class EntryTypeSerializer(serializers.ModelSerializer):
    """條目類型序列化器"""
    entry_count = serializers.SerializerMethodField()

    class Meta:
        model = EntryType
        fields = [
            'id', 'name', 'slug', 'icon', 'color', 'description',
            'template', 'entry_count', 'created_at'
        ]

    def get_entry_count(self, obj):
        return obj.entries.count()


class EntryListSerializer(TaggitSerializer, serializers.ModelSerializer):
    """條目列表序列化器 (精簡版)"""
    tags = TagListSerializerField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    entry_type_name = serializers.CharField(source='entry_type.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Entry
        fields = [
            'id', 'title', 'slug', 'summary', 'status', 'is_featured',
            'category', 'category_name', 'entry_type', 'entry_type_name',
            'tags', 'featured_image', 'author_name', 'view_count',
            'created_at', 'updated_at', 'published_at'
        ]


class EntryDetailSerializer(TaggitSerializer, serializers.ModelSerializer):
    """條目詳細序列化器"""
    tags = TagListSerializerField()
    category_detail = CategorySerializer(source='category', read_only=True)
    entry_type_detail = EntryTypeSerializer(source='entry_type', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    related_entries_list = EntryListSerializer(source='related_entries', many=True, read_only=True)
    internal_links = serializers.SerializerMethodField()
    rendered_content = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = [
            'id', 'title', 'slug', 'entry_type', 'entry_type_detail',
            'summary', 'content', 'rendered_content', 'category',
            'category_detail', 'tags', 'related_entries', 'related_entries_list',
            'featured_image', 'status', 'is_featured', 'view_count',
            'author', 'author_name', 'created_at', 'updated_at',
            'published_at', 'custom_fields', 'internal_links'
        ]

    def get_internal_links(self, obj):
        return obj.get_internal_links()

    def get_rendered_content(self, obj):
        return obj.render_content()


class MediaSerializer(TaggitSerializer, serializers.ModelSerializer):
    """媒體序列化器"""
    tags = TagListSerializerField()
    uploader_name = serializers.CharField(source='uploader.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'media_type',
            'entries', 'tags', 'file_size', 'mime_type', 'width', 'height',
            'uploader', 'uploader_name', 'created_at', 'updated_at'
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class TimelineEventSerializer(serializers.ModelSerializer):
    """時間線事件序列化器"""
    entry_title = serializers.CharField(source='entry.title', read_only=True)
    entry_slug = serializers.CharField(source='entry.slug', read_only=True)

    class Meta:
        model = TimelineEvent
        fields = [
            'id', 'timeline', 'entry', 'entry_title', 'entry_slug',
            'title', 'date', 'order', 'description'
        ]


class TimelineSerializer(serializers.ModelSerializer):
    """時間線序列化器"""
    events = TimelineEventSerializer(many=True, read_only=True)
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = Timeline
        fields = [
            'id', 'name', 'description', 'events', 'event_count',
            'created_at', 'updated_at'
        ]

    def get_event_count(self, obj):
        return obj.events.count()


class EntryHistorySerializer(serializers.Serializer):
    """條目歷史記錄序列化器"""
    history_id = serializers.IntegerField()
    history_date = serializers.DateTimeField()
    history_user = serializers.CharField()
    history_type = serializers.CharField()
    title = serializers.CharField()
    content = serializers.CharField()
