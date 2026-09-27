"""Synthetic candidate: verify deterministic selection at a boundary."""


from selection import visible_items


assert visible_items(['one', 'two', 'three'], 2) == ['one', 'two']
assert visible_items(['one'], 0) == []
assert visible_items([], 3) == []
try:
    visible_items(['one'], -1)
except ValueError:
    pass
else:
    raise AssertionError('negative limit accepted')
