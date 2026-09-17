from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, nickname, password=None, **extra_fields):
        if not nickname:
            raise ValueError('El nickname es obligatorio')
        user = self.model(nickname=nickname, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, nickname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True')
        return self.create_user(nickname, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    usuario_id = models.BigAutoField(primary_key=True, db_column='usuario_id')
    nickname = models.CharField(max_length=50, unique=True, db_column='nickname')
    # Sobrescribimos el campo `password` heredado para apuntar a password_hash
    password = models.CharField(max_length=128, db_column='password_hash')
    creado_en = models.DateTimeField(default=timezone.now, db_column='creado_en')
    is_staff = models.BooleanField(default=False, db_column='is_staff')
    is_superuser = models.BooleanField(default=False, db_column='is_superuser')
    is_active = models.BooleanField(default=True, db_column='is_active')
    last_login = models.DateTimeField(null=True, blank=True, db_column='last_login')

    objects = UsuarioManager()

    USERNAME_FIELD = 'nickname'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'usuario'
        managed = True
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.nickname