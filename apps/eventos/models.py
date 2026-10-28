from django.contrib.postgres.fields import ArrayField
from django.db import models


class Evento(models.Model):
    """
    Algo que ocurre un día concreto en un sitio (concierto, jam...).
    Lo publica cualquier perfil; puede celebrarse en un local de Ensamblia
    (`local`) o en otro sitio (`lugar`, texto libre).
    """
    evento_id = models.BigAutoField(primary_key=True, db_column='evento_id')
    perfil = models.ForeignKey(
        'perfiles.Perfil',
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='eventos',
    )
    titulo = models.CharField(max_length=120, db_column='titulo')
    descripcion = models.CharField(max_length=1000, blank=True, default='', db_column='descripcion')
    fecha_inicio = models.DateTimeField(db_column='fecha_inicio')
    ciudad = models.ForeignKey(
        'catalogo.Ciudad',
        on_delete=models.PROTECT,
        db_column='ciudad_id',
        related_name='eventos',
    )
    local = models.ForeignKey(
        'perfiles.Perfil',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='local_id',
        related_name='eventos_en_local',
    )
    lugar = models.CharField(max_length=150, blank=True, default='', db_column='lugar')
    # Ids de catalogo.GeneroMusical
    generos = ArrayField(models.BigIntegerField(), default=list, blank=True, db_column='generos')
    precio = models.CharField(max_length=50, blank=True, default='', db_column='precio')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')

    class Meta:
        db_table = 'evento'
        managed = True
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'
        ordering = ['fecha_inicio', 'evento_id']

    def __str__(self):
        return self.titulo
