"""Trusted Linux boundary checks; executes candidate only after they pass."""

import errno
import os
from pathlib import Path
import runpy
import socket
import sys

assert os.geteuid() == 65534, 'unexpected user'
status = dict(line.split(':', 1) for line in Path('/proc/self/status').read_text().splitlines() if ':' in line)
assert int(status['CapEff'].strip(), 16) == 0, 'capabilities present'
assert status['NoNewPrivs'].strip() == '1', 'privilege escalation permitted'
# Some kernels expose dormant tunnel devices even with Docker network=none.
for _, name in socket.if_nameindex():
    flags = int(Path(f'/sys/class/net/{name}/flags').read_text().strip(), 16)
    assert name == 'lo' or not (flags & 1), 'active external network interface present'
assert len(Path('/proc/net/route').read_text().splitlines()) == 1, 'IPv4 route present'
for key in ('DISPLAY', 'WAYLAND_DISPLAY', 'SSH_AUTH_SOCK', 'GH_TOKEN', 'GITHUB_TOKEN', 'FOUNDATION_TEST_SECRET'):
    assert key not in os.environ, 'unexpected inherited environment'
for name in ('/var/run/docker.sock', '/tmp/.X11-unix', '/Users', '/host', '/run/user'):
    assert not Path(name).exists(), 'host integration present'
for name in ('/candidate/.write-probe', '/.write-probe'):
    try:
        Path(name).write_text('synthetic probe')
    except OSError as error:
        assert error.errno in (errno.EROFS, errno.EACCES), 'unexpected write failure'
    else:
        raise AssertionError('protected path is writable')
storage = os.statvfs('/tmp')
assert storage.f_blocks * storage.f_frsize <= 16 * 1024 * 1024, 'scratch exceeds bound'
Path('/tmp/synthetic-probe').write_text('temporary')
Path('/tmp/synthetic-probe').unlink()
print('foundation:probe-passed', flush=True)
# Permit sibling modules only after the trusted boundary checks have completed.
sys.path.insert(0, '/candidate')
runpy.run_path('/candidate/verify.py', run_name='__main__')
