"""Exercise real container boundaries using synthetic fixtures; never captures a screen."""

import os
from pathlib import Path
import tempfile
from isolated_verify import ROOT, run

os.environ['FOUNDATION_TEST_SECRET'] = 'synthetic-marker-must-not-cross-boundary'
failures = []
if not run(ROOT / 'examples/isolated-candidate').passed:
    raise SystemExit('Valid candidate or isolation probe failed; negative controls not evaluated.')
fixtures = {
    'behavioural defect': ('assert [1, 2, 3][:1] == [1, 2]\n', 'candidate-failed', 1),
    'scratch overflow': ("import errno,sys\ntry:\n open('/tmp/oversize', 'wb').write(b'x' * (17 * 1024 * 1024))\nexcept OSError as e:\n sys.exit(73 if e.errno == errno.ENOSPC else 1)\n", 'candidate-failed', 73),
    'candidate write': ("import errno,sys\ntry:\n open('/candidate/changed', 'w').write('x')\nexcept OSError as e:\n sys.exit(74 if e.errno in (errno.EROFS, errno.EACCES) else 1)\n", 'candidate-failed', 74),
    'timeout': ('while True: pass\n', 'timeout', None),
    'output overflow': ("print('x' * (70 * 1024), flush=True)\n", 'output-limit', None),
}
for label, (code, expected_reason, expected_exit) in fixtures.items():
    with tempfile.TemporaryDirectory(prefix='foundation-pilot-') as directory:
        source = Path(directory).resolve()
        (source / 'verify.py').write_text(code, encoding='utf-8')
        result = run(source, timeout=2 if label == 'timeout' else 30)
        if result.passed or result.reason != expected_reason or (expected_exit is not None and result.exit_code != expected_exit):
            failures.append(label + ' did not fail at the intended boundary')
        else:
            print(f'Negative control rejected at expected boundary: {label}')
if failures:
    raise SystemExit('; '.join(failures))
print('Isolation pilot passed: valid candidate plus five negative controls.')
