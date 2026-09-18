from rest_framework.pagination import LimitOffsetPagination


class StandardLimitOffsetPagination(LimitOffsetPagination):
    """
    Paginación estándar:
    - ?limit=20 (máximo 100)
    - ?offset=0
    - Respuesta: { count, next, previous, results }
    """
    default_limit = 20
    max_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'