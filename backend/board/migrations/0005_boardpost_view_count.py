# Generated by Django 5.2 on 2025-05-25 05:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0004_alter_boardcategory_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='boardpost',
            name='view_count',
            field=models.PositiveIntegerField(default=0, verbose_name='조회수'),
        ),
    ]
