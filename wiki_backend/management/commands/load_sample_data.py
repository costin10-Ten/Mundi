"""
載入示例數據的管理命令
使用方法: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from wiki_backend.models import Category, EntryType, Entry, Timeline, TimelineEvent


class Command(BaseCommand):
    help = '載入示例數據到數據庫'

    def handle(self, *args, **options):
        self.stdout.write('開始載入示例數據...\n')

        # 創建示例用戶
        user, created = User.objects.get_or_create(
            username='author',
            defaults={
                'email': 'author@mundi.com',
                'is_staff': True,
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(self.style.SUCCESS('✓ 創建示例用戶: author'))

        # 創建條目類型
        entry_types_data = [
            {'name': '角色', 'icon': 'fa-user', 'color': '#e74c3c'},
            {'name': '地點', 'icon': 'fa-map-marker', 'color': '#3498db'},
            {'name': '事件', 'icon': 'fa-calendar', 'color': '#f39c12'},
            {'name': '物品', 'icon': 'fa-cube', 'color': '#9b59b6'},
            {'name': '組織', 'icon': 'fa-users', 'color': '#1abc9c'},
        ]

        entry_types = {}
        for data in entry_types_data:
            et, created = EntryType.objects.get_or_create(
                name=data['name'],
                defaults={'icon': data['icon'], 'color': data['color']}
            )
            entry_types[data['name']] = et
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ 創建條目類型: {data["name"]}'))

        # 創建分類
        categories_data = [
            {'name': '世界設定', 'parent': None, 'icon': 'fa-globe'},
            {'name': '地理', 'parent': '世界設定', 'icon': 'fa-mountain'},
            {'name': '歷史', 'parent': '世界設定', 'icon': 'fa-history'},
            {'name': '人物', 'parent': None, 'icon': 'fa-users'},
            {'name': '主要角色', 'parent': '人物', 'icon': 'fa-star'},
            {'name': '次要角色', 'parent': '人物', 'icon': 'fa-user'},
        ]

        categories = {}
        for data in categories_data:
            parent = categories.get(data['parent']) if data['parent'] else None
            cat, created = Category.objects.get_or_create(
                name=data['name'],
                defaults={'parent': parent, 'icon': data['icon']}
            )
            categories[data['name']] = cat
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ 創建分類: {data["name"]}'))

        # 創建示例條目
        entries_data = [
            {
                'title': '艾莉亞',
                'entry_type': '角色',
                'category': '主要角色',
                'summary': '故事的女主角,擁有時間魔法的天賦',
                'content': '''
                <h2>基本資訊</h2>
                <p>艾莉亞是本故事的主角之一,她出生於 [[銀月城]],是一位天賦異稟的時間魔法師。</p>

                <h2>背景</h2>
                <p>在 [[大崩塌]] 事件之後,艾莉亞開始了她的冒險之旅。她的目標是找到傳說中的 [[時間之石]]。</p>

                <h2>能力</h2>
                <ul>
                    <li>時間暫停</li>
                    <li>時間加速</li>
                    <li>預知未來片段</li>
                </ul>
                ''',
                'custom_fields': {
                    'age': 18,
                    'height': '165cm',
                    'weapon': '時間法杖',
                }
            },
            {
                'title': '銀月城',
                'entry_type': '地點',
                'category': '地理',
                'summary': '位於北方的魔法之都,以銀色月光塔聞名',
                'content': '''
                <h2>概述</h2>
                <p>銀月城是北方大陸最重要的魔法城市,這裡聚集了來自世界各地的魔法師。</p>

                <h2>著名地標</h2>
                <ul>
                    <li>銀色月光塔 - 城市的標誌性建築</li>
                    <li>魔法學院 - [[艾莉亞]] 曾在這裡學習</li>
                    <li>時光廣場 - 發生 [[大崩塌]] 的地點</li>
                </ul>
                ''',
                'custom_fields': {
                    'population': 50000,
                    'founded': '魔法紀元 1250 年',
                }
            },
            {
                'title': '大崩塌',
                'entry_type': '事件',
                'category': '歷史',
                'summary': '改變世界的重大災難事件',
                'content': '''
                <h2>事件經過</h2>
                <p>魔法紀元 1850 年,一場前所未有的魔法實驗失敗導致了大崩塌。
                [[銀月城]] 的時空結構被撕裂,整個城市陷入混亂。</p>

                <h2>影響</h2>
                <p>這場災難改變了 [[艾莉亞]] 的命運,也讓她覺醒了時間魔法的力量。</p>
                ''',
                'custom_fields': {
                    'date': '魔法紀元 1850 年',
                    'casualties': 'unknown',
                }
            },
            {
                'title': '時間之石',
                'entry_type': '物品',
                'category': '世界設定',
                'summary': '傳說中能夠控制時間的神器',
                'content': '''
                <h2>傳說</h2>
                <p>時間之石是上古時代遺留下來的神器,據說擁有完全控制時間的力量。</p>

                <h2>尋找者</h2>
                <p>[[艾莉亞]] 正在尋找這塊神石,希望能用它來修復 [[大崩塌]] 造成的時空裂痕。</p>
                ''',
            }
        ]

        entries = {}
        for data in entries_data:
            entry, created = Entry.objects.get_or_create(
                title=data['title'],
                defaults={
                    'entry_type': entry_types[data['entry_type']],
                    'category': categories[data['category']],
                    'summary': data['summary'],
                    'content': data['content'],
                    'author': user,
                    'status': 'published',
                    'custom_fields': data.get('custom_fields', {})
                }
            )
            entries[data['title']] = entry
            if created:
                entry.tags.add('示例', '測試')
                self.stdout.write(self.style.SUCCESS(f'✓ 創建條目: {data["title"]}'))

        # 創建時間線
        timeline, created = Timeline.objects.get_or_create(
            name='主要故事線',
            defaults={'description': '故事的主要時間線'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ 創建時間線: 主要故事線'))

        # 創建時間線事件
        timeline_events = [
            {
                'title': '銀月城建立',
                'entry': '銀月城',
                'date': '魔法紀元 1250 年',
                'order': 1,
                'description': '魔法師們建立了銀月城'
            },
            {
                'title': '艾莉亞出生',
                'entry': '艾莉亞',
                'date': '魔法紀元 1832 年',
                'order': 2,
                'description': '主角艾莉亞在銀月城出生'
            },
            {
                'title': '大崩塌事件',
                'entry': '大崩塌',
                'date': '魔法紀元 1850 年',
                'order': 3,
                'description': '災難性的魔法實驗失敗'
            },
        ]

        for data in timeline_events:
            event, created = TimelineEvent.objects.get_or_create(
                timeline=timeline,
                title=data['title'],
                defaults={
                    'entry': entries[data['entry']],
                    'date': data['date'],
                    'order': data['order'],
                    'description': data['description']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ 創建時間線事件: {data["title"]}'))

        self.stdout.write(self.style.SUCCESS('\n✨ 示例數據載入完成!'))
        self.stdout.write('\n現在可以訪問管理後台查看數據:')
        self.stdout.write('http://localhost:8000/admin/')
