def visible_items(items, limit):
    if limit < 0:
        raise ValueError('limit must be non-negative')
    return items[:limit]
