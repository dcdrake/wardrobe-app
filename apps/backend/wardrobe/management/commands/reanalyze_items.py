from django.core.management.base import BaseCommand

from ai.providers import get_ai_provider
from wardrobe.models import ClothingItem


class Command(BaseCommand):
    help = 'Re-run AI analysis on clothing items with empty descriptions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Re-analyze all items, not just those missing descriptions',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show which items would be re-analyzed without making changes',
        )

    def handle(self, *args, **options):
        if options['all']:
            items = ClothingItem.objects.filter(image__isnull=False).exclude(image='')
        else:
            items = ClothingItem.objects.filter(
                image__isnull=False, description='',
            ).exclude(image='')

        count = items.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No items need re-analysis.'))
            return

        self.stdout.write(f'Found {count} item(s) to re-analyze.')

        if options['dry_run']:
            for item in items:
                self.stdout.write(f'  [{item.id}] {item.item_type or "unknown"} - "{item.description or "(empty)"}"')
            self.stdout.write(self.style.WARNING('Dry run — no changes made.'))
            return

        provider = get_ai_provider()
        success = 0
        failed = 0

        for item in items:
            self.stdout.write(f'  Analyzing item {item.id} ({item.item_type or "unknown"})...')
            try:
                analysis = provider.analyze_clothing(item.image.path)

                item.description = analysis.get('description', '')
                if not item.item_type:
                    item.item_type = analysis.get('item_type', ClothingItem.ItemType.OTHER)
                if not item.colors:
                    item.colors = analysis.get('colors', [])
                if not item.material:
                    item.material = analysis.get('material', '')
                if item.pattern == ClothingItem.Pattern.SOLID:
                    item.pattern = analysis.get('pattern', ClothingItem.Pattern.SOLID)
                if item.formality == ClothingItem.Formality.CASUAL:
                    item.formality = analysis.get('formality', ClothingItem.Formality.CASUAL)

                ai_category = analysis.get('category', '')
                valid_categories = {c.value for c in ClothingItem.Category}
                if ai_category in valid_categories:
                    item.category = ai_category
                else:
                    item.category = ClothingItem.ITEM_TYPE_TO_CATEGORY.get(item.item_type, '')

                item.ai_analysis = analysis
                item.save()
                self.stdout.write(self.style.SUCCESS(f'    -> "{item.description}"'))
                success += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    Failed: {e}'))
                failed += 1

        self.stdout.write(self.style.SUCCESS(f'\nDone. {success} succeeded, {failed} failed.'))
