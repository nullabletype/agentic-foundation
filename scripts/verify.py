"""Run the foundation's local, dependency-free checks. Does not run Docker."""

from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from check_docs import check

count, errors = check(ROOT)
for error in errors:
    print(error)
print(f'Documentation: {count} files, {len(errors)} errors.')
suite = unittest.defaultTestLoader.discover(str(ROOT / 'tests'))
if suite.countTestCases() == 0:
    raise SystemExit('No regression tests discovered; verification failed.')
result = unittest.TextTestRunner(verbosity=2).run(suite)
raise SystemExit(0 if not errors and result.wasSuccessful() else 1)
