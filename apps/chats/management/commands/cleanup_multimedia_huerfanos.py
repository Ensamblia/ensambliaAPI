from django.core.management.base import BaseCommand
from django.conf import settings
from datetime import datetime, timedelta, timezone as tz

import boto3
from botocore.client import Config

from apps.multimedia.models import Multimedia
from apps.chats.models import MensajeAdjunto


class Command(BaseCommand):
    help = (
        'Borra archivos en MinIO (bajo chat/ y multimedia/) que NO tengan '
        'registro en BD. Es una red de seguridad por si algún archivo se '
        'quedó colgado tras un error.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--horas',
            type=int,
            default=24,
            help='Antigüedad mínima en horas para considerar huérfano (por defecto 24).',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra lo que se borraría sin borrar nada.',
        )

    def handle(self, *args, **options):
        horas = options['horas']
        dry_run = options['dry_run']
        limite = datetime.now(tz.utc) - timedelta(hours=horas)

        # 1. Construir set de object_keys referenciados en BD
        keys_bd = set()
        keys_bd.update(
            Multimedia.objects
            .exclude(archivo='')
            .exclude(archivo__isnull=True)
            .values_list('archivo', flat=True)
        )
        keys_bd.update(
            MensajeAdjunto.objects
            .exclude(archivo='')
            .exclude(archivo__isnull=True)
            .values_list('archivo', flat=True)
        )

        # 2. Listar objetos en MinIO
        s3 = boto3.client(
            's3',
            endpoint_url=settings.MINIO_ENDPOINT,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1',
        )
        bucket = settings.MINIO_BUCKET_NAME

        paginator = s3.get_paginator('list_objects_v2')
        huerfanos = []

        for prefix in ('chat/', 'multimedia/'):
            for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
                for obj in page.get('Contents', []):
                    key = obj['Key']
                    last_modified = obj['LastModified']  # datetime con tz

                    if key in keys_bd:
                        continue
                    if last_modified > limite:
                        continue  # demasiado reciente, no lo toques

                    huerfanos.append(key)

        if not huerfanos:
            self.stdout.write(self.style.SUCCESS(
                f'No hay archivos huérfanos con más de {horas} h.'
            ))
            return

        self.stdout.write(f'Encontrados {len(huerfanos)} archivos huérfanos.')

        if dry_run:
            for key in huerfanos:
                self.stdout.write(f'  [dry-run] {key}')
            self.stdout.write(self.style.WARNING('Nada borrado (--dry-run).'))
            return

        # Borrar en lotes de 1000 (límite de la API de S3)
        for i in range(0, len(huerfanos), 1000):
            lote = huerfanos[i:i + 1000]
            s3.delete_objects(
                Bucket=bucket,
                Delete={'Objects': [{'Key': k} for k in lote]},
            )
            for key in lote:
                self.stdout.write(f'  Borrado {key}')

        self.stdout.write(self.style.SUCCESS(
            f'Borrados {len(huerfanos)} archivos huérfanos.'
        ))