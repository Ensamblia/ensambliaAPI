from apps.usuarios.pagination import StandardLimitOffsetPagination


class PaginationMixin:
    """
    Mixin para añadir paginación a ViewSets que NO heredan de GenericViewSet.
    Aporta los métodos `paginate_queryset` y `get_paginated_response`
    que DRF solo incluye en GenericViewSet y ModelViewSet.
    """
    pagination_class = StandardLimitOffsetPagination

    @property
    def paginator(self):
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator

    def paginate_queryset(self, queryset):
        if self.paginator is None:
            return None
        return self.paginator.paginate_queryset(queryset, self.request, view=self)

    def get_paginated_response(self, data):
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data)