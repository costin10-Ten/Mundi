"""
自訂 Django Admin 管理介面
"""
from django.contrib import admin
from django.utils.html import format_html
from mptt.admin import MPTTModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import (
    Category, EntryType, Entry, Media,
    Timeline, TimelineEvent
)


@admin.register(Category)
class CategoryAdmin(MPTTModelAdmin):
    """分類管理"""
    list_display = ['name', 'parent', 'icon', 'order', 'entry_count', 'created_at']
    list_filter = ['parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    mptt_level_indent = 20

    def entry_count(self, obj):
        return obj.entries.count()
    entry_count.short_description = '條目數量'


@admin.register(EntryType)
class EntryTypeAdmin(admin.ModelAdmin):
    """條目類型管理"""
    list_display = ['name', 'icon', 'color_preview', 'entry_count', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

    def color_preview(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px 15px; color: white; border-radius: 3px;">{}</span>',
            obj.color,
            obj.color
        )
    color_preview.short_description = '顏色預覽'

    def entry_count(self, obj):
        return obj.entries.count()
    entry_count.short_description = '條目數量'


class TimelineEventInline(admin.TabularInline):
    """時間線事件內聯編輯"""
    model = TimelineEvent
    extra = 1
    fields = ['title', 'entry', 'date', 'order', 'description']


@admin.register(Entry)
class EntryAdmin(SimpleHistoryAdmin):
    """條目管理 - 支援版本控制"""
    list_display = [
        'title', 'entry_type', 'category', 'status',
        'is_featured', 'view_count', 'author', 'updated_at'
    ]
    list_filter = ['status', 'entry_type', 'category', 'is_featured', 'created_at']
    search_fields = ['title', 'summary', 'content']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['related_entries']
    readonly_fields = ['view_count', 'created_at', 'updated_at', 'internal_links_display']

    fieldsets = (
        ('基本資訊', {
            'fields': ('title', 'slug', 'entry_type', 'status', 'is_featured')
        }),
        ('內容', {
            'fields': ('summary', 'content', 'featured_image')
        }),
        ('分類與標籤', {
            'fields': ('category', 'tags')
        }),
        ('關聯', {
            'fields': ('related_entries', 'internal_links_display'),
            'classes': ('collapse',)
        }),
        ('自訂欄位', {
            'fields': ('custom_fields',),
            'classes': ('collapse',)
        }),
        ('元數據', {
            'fields': ('author', 'view_count', 'published_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)

    def internal_links_display(self, obj):
        """顯示內部連結"""
        if obj.pk:
            links = obj.get_internal_links()
            if links:
                return format_html('<br>'.join([f'• [[{link}]]' for link in links]))
        return '無內部連結'
    internal_links_display.short_description = '內部連結'


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    """媒體管理"""
    list_display = [
        'title', 'media_type', 'file_preview', 'file_size_display',
        'uploader', 'created_at'
    ]
    list_filter = ['media_type', 'created_at']
    search_fields = ['title', 'description']
    filter_horizontal = ['entries']
    readonly_fields = ['file_size', 'mime_type', 'width', 'height', 'created_at', 'updated_at']

    fieldsets = (
        ('基本資訊', {
            'fields': ('title', 'description', 'file', 'media_type')
        }),
        ('關聯', {
            'fields': ('entries', 'tags')
        }),
        ('元數據', {
            'fields': ('file_size', 'mime_type', 'width', 'height', 'uploader', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.uploader:
            obj.uploader = request.user
        super().save_model(request, obj, form, change)

    def file_preview(self, obj):
        """文件預覽"""
        if obj.media_type == 'image' and obj.file:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px;" />',
                obj.file.url
            )
        return '無預覽'
    file_preview.short_description = '預覽'

    def file_size_display(self, obj):
        """文件大小顯示"""
        size = obj.file_size
        if size < 1024:
            return f'{size} B'
        elif size < 1024 * 1024:
            return f'{size / 1024:.2f} KB'
        else:
            return f'{size / (1024 * 1024):.2f} MB'
    file_size_display.short_description = '文件大小'


@admin.register(Timeline)
class TimelineAdmin(admin.ModelAdmin):
    """時間線管理"""
    list_display = ['name', 'event_count', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    inlines = [TimelineEventInline]

    def event_count(self, obj):
        return obj.events.count()
    event_count.short_description = '事件數量'


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    """時間線事件管理"""
    list_display = ['title', 'timeline', 'entry', 'date', 'order']
    list_filter = ['timeline']
    search_fields = ['title', 'description']
    list_editable = ['order']
