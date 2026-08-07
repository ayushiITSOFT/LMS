from django.db.models import Q
from rest_framework.filters import BaseFilterBackend


class CourseSearchFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        params = request.query_params
        keyword = (params.get("search") or params.get("keyword") or "").strip()
        category = (params.get("category") or "").strip()
        instructor = (params.get("instructor") or "").strip()
        level = (params.get("level") or "").strip()
        price_min = params.get("price_min")
        price_max = params.get("price_max")
        rating_min = params.get("rating_min") or params.get("min_rating")

        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword)
                | Q(subtitle__icontains=keyword)
                | Q(description__icontains=keyword)
                | Q(category__icontains=keyword)
                | Q(language__icontains=keyword)
                | Q(instructor__username__icontains=keyword)
            )
        if category:
            queryset = queryset.filter(category__icontains=category)
        if instructor:
            queryset = queryset.filter(
                Q(instructor__username__icontains=instructor)
                | Q(instructor__first_name__icontains=instructor)
                | Q(instructor__last_name__icontains=instructor)
            )
        if level:
            queryset = queryset.filter(level=level)
        if price_min not in (None, ""):
            queryset = queryset.filter(price__gte=price_min)
        if price_max not in (None, ""):
            queryset = queryset.filter(price__lte=price_max)
        if rating_min not in (None, ""):
            queryset = queryset.filter(average_rating__gte=rating_min)

        return queryset
