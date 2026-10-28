from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Local(models.Model):
    """
    Datos propios de un perfil de tipo local (1:1 con Perfil).
    La comarca del local sale de su ciudad y se copia al perfil al guardar,
    para que el filtro por comarca de /api/perfiles/ también lo encuentre.
    """
    class TipoLocal(models.TextChoices):
        ENSAYO = 'ensayo', 'Ensayo'
        SALA = 'sala', 'Sala de conciertos'
        BAR = 'bar', 'Bar'
        TEATRO = 'teatro', 'Teatro / auditorio'
        OTRO = 'otro', 'Otro'

    perfil = models.OneToOneField(
        'perfiles.Perfil',
        primary_key=True,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='local',
    )
    ciudad = models.ForeignKey(
        'catalogo.Ciudad',
        on_delete=models.PROTECT,
        db_column='ciudad_id',
        related_name='locales',
    )
    direccion = models.CharField(max_length=150, db_column='direccion')
    aforo = models.PositiveIntegerField(
        null=True, blank=True,
        db_column='aforo',
        validators=[
            MinValueValidator(1, message='El aforo mínimo es 1'),
            MaxValueValidator(100000, message='El aforo máximo es 100000'),
        ],
    )
    tipos = ArrayField(
        models.CharField(max_length=20, choices=TipoLocal.choices),
        db_column='tipos',
    )

    class Meta:
        db_table = 'local'
        managed = True
        verbose_name = 'Local'
        verbose_name_plural = 'Locales'
        ordering = ['perfil_id']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        comarca_id = self.ciudad.comarca_id
        if self.perfil.comarca_id != comarca_id:
            self.perfil.comarca_id = comarca_id
            self.perfil.save(update_fields=['comarca'])

    def __str__(self):
        return f'{self.perfil_id} - {self.ciudad_id}'
