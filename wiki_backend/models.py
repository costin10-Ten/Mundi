"""
核心數據模型 - Mundi 維基系統
包含條目、分類、標籤和媒體管理
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from ckeditor_uploader.fields import RichTextUploadingField
from taggit.managers import TaggableManager
from mptt.models import MPTTModel, TreeForeignKey
from simple_history.models import HistoricalRecords
import re


class Category(MPTTModel):
    """
    多層級分類系統
    使用 MPTT 實現樹狀結構
    """
    name = models.CharField('分類名稱', max_length=100, unique=True)
    slug = models.SlugField('URL Slug', max_length=100, unique=True, blank=True)
    parent = TreeForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name='父分類'
    )
    description = models.TextField('描述', blank=True)
    icon = models.CharField('圖示', max_length=50, blank=True, help_text='FontAwesome 圖示名稱')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('創建時間', auto_now_add=True)
    updated_at = models.DateTimeField('更新時間', auto_now=True)

    class MPTTMeta:
        order_insertion_by = ['order', 'name']

    class Meta:
        verbose_name = '分類'
        verbose_name_plural = '分類'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def get_full_path(self):
        """獲取完整分類路徑"""
        ancestors = self.get_ancestors(include_self=True)
        return ' > '.join([cat.name for cat in ancestors])


class EntryType(models.Model):
    """
    條目類型 (角色、地點、事件、物品等)
    """
    name = models.CharField('類型名稱', max_length=50, unique=True)
    slug = models.SlugField('URL Slug', max_length=50, unique=True, blank=True)
    icon = models.CharField('圖示', max_length=50, blank=True)
    color = models.CharField('顏色', max_length=7, default='#3498db', help_text='十六進位顏色碼')
    description = models.TextField('描述', blank=True)
    template = models.TextField('模板', blank=True, help_text='條目模板 (JSON 格式)')
    created_at = models.DateTimeField('創建時間', auto_now_add=True)

    class Meta:
        verbose_name = '條目類型'
        verbose_name_plural = '條目類型'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Entry(models.Model):
    """
    核心條目模型
    支援版本控制、富文本編輯、內部連結
    """
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已發布'),
        ('archived', '已封存'),
    ]

    title = models.CharField('標題', max_length=200, unique=True)
    slug = models.SlugField('URL Slug', max_length=200, unique=True, blank=True)
    entry_type = models.ForeignKey(
        EntryType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entries',
        verbose_name='條目類型'
    )

    # 內容
    summary = models.TextField('摘要', blank=True, help_text='簡短描述,顯示在列表中')
    content = RichTextUploadingField('內容', config_name='wiki')

    # 分類與標籤
    category = TreeForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entries',
        verbose_name='分類'
    )
    tags = TaggableManager(verbose_name='標籤', blank=True)

    # 關聯
    related_entries = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='referenced_by',
        verbose_name='相關條目'
    )

    # 媒體
    featured_image = models.ImageField(
        '特色圖片',
        upload_to='entries/images/',
        null=True,
        blank=True
    )

    # 狀態
    status = models.CharField('狀態', max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField('精選', default=False)
    view_count = models.IntegerField('瀏覽次數', default=0)

    # 作者與時間
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='entries',
        verbose_name='作者'
    )
    created_at = models.DateTimeField('創建時間', auto_now_add=True)
    updated_at = models.DateTimeField('更新時間', auto_now=True)
    published_at = models.DateTimeField('發布時間', null=True, blank=True)

    # 版本控制
    history = HistoricalRecords()

    # 自訂欄位 (JSON 格式)
    custom_fields = models.JSONField('自訂欄位', default=dict, blank=True)

    class Meta:
        verbose_name = '條目'
        verbose_name_plural = '條目'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status', '-updated_at']),
            models.Index(fields=['-view_count']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)

        # 自動發布時間
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

        # 自動建立內部連結關聯
        self._update_internal_links()

    def _update_internal_links(self):
        """
        解析內容中的內部連結 [[條目名稱]]
        自動建立關聯
        """
        pattern = r'\[\[([^\]]+)\]\]'
        matches = re.findall(pattern, self.content)

        for match in matches:
            try:
                related_entry = Entry.objects.get(title=match.strip())
                if related_entry != self:
                    self.related_entries.add(related_entry)
            except Entry.DoesNotExist:
                pass

    def get_internal_links(self):
        """獲取所有內部連結"""
        pattern = r'\[\[([^\]]+)\]\]'
        return re.findall(pattern, self.content)

    def render_content(self):
        """
        渲染內容,轉換內部連結為 HTML
        """
        content = self.content
        pattern = r'\[\[([^\]]+)\]\]'

        def replace_link(match):
            title = match.group(1).strip()
            try:
                entry = Entry.objects.get(title=title)
                return f'<a href="/wiki/{entry.slug}" class="internal-link">{title}</a>'
            except Entry.DoesNotExist:
                return f'<a href="/wiki/create?title={title}" class="internal-link broken">{title}</a>'

        return re.sub(pattern, replace_link, content)


class Media(models.Model):
    """
    媒體庫 - 圖片、地圖等資源
    """
    MEDIA_TYPE_CHOICES = [
        ('image', '圖片'),
        ('map', '地圖'),
        ('diagram', '圖表'),
        ('document', '文件'),
        ('other', '其他'),
    ]

    title = models.CharField('標題', max_length=200)
    description = models.TextField('描述', blank=True)
    file = models.FileField('文件', upload_to='media/%Y/%m/')
    media_type = models.CharField('媒體類型', max_length=20, choices=MEDIA_TYPE_CHOICES, default='image')

    # 關聯
    entries = models.ManyToManyField(
        Entry,
        blank=True,
        related_name='media_files',
        verbose_name='關聯條目'
    )

    # 標籤
    tags = TaggableManager(verbose_name='標籤', blank=True)

    # 元數據
    file_size = models.IntegerField('文件大小', default=0, help_text='位元組')
    mime_type = models.CharField('MIME 類型', max_length=100, blank=True)
    width = models.IntegerField('寬度', null=True, blank=True)
    height = models.IntegerField('高度', null=True, blank=True)

    # 上傳者與時間
    uploader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_media',
        verbose_name='上傳者'
    )
    created_at = models.DateTimeField('創建時間', auto_now_add=True)
    updated_at = models.DateTimeField('更新時間', auto_now=True)

    class Meta:
        verbose_name = '媒體文件'
        verbose_name_plural = '媒體文件'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size

            # 獲取圖片尺寸
            if self.media_type == 'image' and self.file.name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                try:
                    from PIL import Image
                    image = Image.open(self.file)
                    self.width, self.height = image.size
                except Exception:
                    pass

        super().save(*args, **kwargs)


class Timeline(models.Model):
    """
    時間線 - 管理事件發生順序
    """
    name = models.CharField('時間線名稱', max_length=200)
    description = models.TextField('描述', blank=True)
    created_at = models.DateTimeField('創建時間', auto_now_add=True)
    updated_at = models.DateTimeField('更新時間', auto_now=True)

    class Meta:
        verbose_name = '時間線'
        verbose_name_plural = '時間線'

    def __str__(self):
        return self.name


class TimelineEvent(models.Model):
    """
    時間線事件
    """
    timeline = models.ForeignKey(
        Timeline,
        on_delete=models.CASCADE,
        related_name='events',
        verbose_name='時間線'
    )
    entry = models.ForeignKey(
        Entry,
        on_delete=models.CASCADE,
        related_name='timeline_events',
        verbose_name='關聯條目'
    )
    title = models.CharField('事件標題', max_length=200)
    date = models.CharField('日期', max_length=100, help_text='可使用虛構日期系統')
    order = models.IntegerField('排序', default=0)
    description = models.TextField('描述', blank=True)

    class Meta:
        verbose_name = '時間線事件'
        verbose_name_plural = '時間線事件'
        ordering = ['order', 'date']

    def __str__(self):
        return f"{self.timeline.name} - {self.title}"
