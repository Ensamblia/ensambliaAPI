from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.chats.models import MensajeAdjunto


class Command(BaseCommand):
    help = (
        'Borra MensajeAdjunto huérfanos (sin mensaje) con más de X horas '
        'de antigüedad, tanto de BD como de MinIO.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--horas',
            type=int,
            default=24,
            help='Antigüedad mínima en horas para borrar (por defecto 24).',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra lo que se borraría sin borrar nada.',
        )

    def handle(self, *args, **options):
        horas = options['horas']
        dry_run = options['dry_run']

        limite = timezone.now() - timedelta(hours=horas)
        qs = MensajeAdjunto.objects.filter(
            mensaje__isnull=True,
            fecha_subida__lt=limite,
        )

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS(
                f'No hay adjuntos huérfanos con más de {horas} h.'
            ))
            return

        self.stdout.write(f'Encontrados {total} adjuntos huérfanos.')

        if dry_run:
            for adj in qs:
                self.stdout.write(f'  [dry-run] {adj.adjunto_id} - {adj.nombre}')
            self.stdout.write(self.style.WARNING('Nada borrado (--dry-run).'))
            return

        borrados = 0
        for adj in qs:
            self.stdout.write(f'  Borrando {adj.adjunto_id} - {adj.nombre}')
            # La señal post_delete se encarga de borrar el archivo en MinIO.
            adj.delete()
            borrados += 1

        self.stdout.write(self.style.SUCCESS(
            f'Borrados {borrados} adjuntos huérfanos.'
        ))