"""
測試用例
"""
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Category, EntryType, Entry, Media


class CategoryModelTest(TestCase):
    """分類模型測試"""

    def setUp(self):
        self.category = Category.objects.create(
            name='測試分類',
            description='這是測試分類'
        )

    def test_category_creation(self):
        self.assertEqual(self.category.name, '測試分類')
        self.assertIsNotNone(self.category.slug)

    def test_category_str(self):
        self.assertEqual(str(self.category), '測試分類')


class EntryModelTest(TestCase):
    """條目模型測試"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.entry_type = EntryType.objects.create(
            name='角色',
            color='#e74c3c'
        )
        self.entry = Entry.objects.create(
            title='測試條目',
            summary='測試摘要',
            content='這是測試內容 [[相關條目]]',
            entry_type=self.entry_type,
            author=self.user,
            status='published'
        )

    def test_entry_creation(self):
        self.assertEqual(self.entry.title, '測試條目')
        self.assertIsNotNone(self.entry.slug)

    def test_entry_internal_links(self):
        links = self.entry.get_internal_links()
        self.assertIn('相關條目', links)

    def test_entry_str(self):
        self.assertEqual(str(self.entry), '測試條目')
