"""Run verify.py from a reviewed source export in a bounded Linux container.

No Git checkout, credentials, host desktop, network, writable source, or exports.
Requires an already-pulled image. The trusted host launcher is not an agent tool.
"""

import argparse
from dataclasses import dataclass
import hashlib
from pathlib import Path
import stat
import subprocess
import tempfile
import threading
import time
import uuid

IMAGE = 'python:3.14.7-slim-trixie@sha256:51dafde81dbdb6ebde285137a295cf18a47ca95234fe388a343719cb97305b3d'
ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 1024 * 1024
MAX_FILES = 100
OUTPUT_BYTES = 64 * 1024


@dataclass(frozen=True)
class Result:
    passed: bool
    reason: str
    exit_code: int
    snapshot: str


def snapshot(source, destination):
    source = Path(source).absolute()
    if any(p.is_symlink() for p in (source, *source.parents)) or not source.is_dir():
        raise ValueError('source must be a real directory without symlink parents')
    paths = []
    total = 0
    for index, path in enumerate(source.rglob('*')):
        if index >= 200:
            raise ValueError('source export exceeds 200 filesystem entries')
        relative = path.relative_to(source)
        if path.is_symlink():
            raise ValueError('source contains a symlink')
        if path.name in {'.git', '.ssh', '.aws', '.docker', '.env'} or path.name.startswith('.env.'):
            raise ValueError('export contains forbidden metadata or credential path')
        mode = path.stat().st_mode
        if stat.S_ISDIR(mode):
            continue
        if not stat.S_ISREG(mode):
            raise ValueError('export contains a non-regular file')
        total += path.stat().st_size
        paths.append((path, relative))
        if total > MAX_BYTES or len(paths) > MAX_FILES:
            raise ValueError('source export exceeds 1 MiB or 100 files')
    if not (source / 'verify.py').is_file():
        raise ValueError('source export must contain verify.py')
    digest = hashlib.sha256()
    copied = 0
    for path, relative in sorted(paths, key=lambda pair: pair[1].as_posix()):
        # Recheck the cap while reading; source must remain quiescent during export.
        with path.open('rb') as stream:
            content = stream.read(MAX_BYTES + 1)
        copied += len(content)
        if copied > MAX_BYTES:
            raise ValueError('source changed or exceeded size limit during snapshot')
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        target.chmod(0o644)
        digest.update(relative.as_posix().encode() + b'\0' + hashlib.sha256(content).digest())
    return digest.hexdigest()


def run(source, timeout=30):
    if not 1 <= timeout <= 60:
        raise ValueError('timeout must be between 1 and 60 seconds')
    name = 'foundation-verify-' + uuid.uuid4().hex
    with tempfile.TemporaryDirectory(prefix='foundation-verify-') as directory:
        candidate = Path(directory) / 'candidate'
        candidate.mkdir(mode=0o755)
        identity = snapshot(source, candidate)
        command = [
            'docker', 'create', '--name', name, '--pull', 'never',
            '--network', 'none', '--read-only', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '--user', '65534:65534',
            '--pids-limit', '64', '--memory', '128m', '--memory-swap', '128m', '--cpus', '1',
            '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777', '--shm-size', '1m',
            '--log-driver', 'none', '--workdir', '/candidate',
            '--mount', f'type=bind,src={candidate},dst=/candidate,readonly',
            '--mount', f'type=bind,src={ROOT / "scripts/isolation_probe.py"},dst=/guard.py,readonly',
            '--entrypoint', 'python3', IMAGE, '-I', '-B', '/guard.py',
        ]
        try:
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
            process = subprocess.Popen(['docker', 'start', '--attach', name], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        except (OSError, subprocess.SubprocessError):
            subprocess.run(['docker', 'rm', '-f', name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
            raise
        exceeded = threading.Event()
        probe_passed = threading.Event()
        def drain():
            count = 0
            first = b''
            while chunk := process.stdout.read(4096):
                if len(first) < 64:
                    first = (first + chunk)[:64]
                    if first.startswith(b'foundation:probe-passed\n'):
                        probe_passed.set()
                count += len(chunk)
                if count > OUTPUT_BYTES:
                    exceeded.set()
        reader = threading.Thread(target=drain, daemon=True)
        reader.start()
        deadline = time.monotonic() + timeout
        reason = 'completed'
        try:
            while process.poll() is None:
                if exceeded.is_set() or time.monotonic() >= deadline:
                    reason = 'output-limit' if exceeded.is_set() else 'timeout'
                    break
                time.sleep(0.05)
        finally:
            # Remove only this invocation's container; never prune the engine.
            try:
                removed = subprocess.run(['docker', 'rm', '-f', name], stdout=subprocess.DEVNULL,
                                         stderr=subprocess.DEVNULL, timeout=10)
                if removed.returncode:
                    raise RuntimeError('container cleanup could not be confirmed')
            finally:
                if process.poll() is None:
                    process.kill()
                process.wait(timeout=5)
                reader.join(timeout=5)
                process.stdout.close()
        if exceeded.is_set():
            reason = 'output-limit'
        if reason == 'completed':
            if not probe_passed.is_set():
                reason = 'probe-failed'
            else:
                reason = 'passed' if process.returncode == 0 else 'candidate-failed'
        success = reason == 'passed'
        # Raw candidate output is discarded: it is untrusted and may contain private text.
        profile = hashlib.sha256(Path(__file__).read_bytes() + (ROOT / 'scripts/isolation_probe.py').read_bytes()).hexdigest()
        print(f'Isolated verification: {"passed" if success else "failed"}; reason={reason}; snapshot={identity}; profile={profile}')
        return Result(success, reason, process.returncode, identity)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='reviewed public/synthetic export, not a Git checkout')
    parser.add_argument('--timeout', type=int, default=30, help='wall seconds, 1..60; default 30')
    args = parser.parse_args()
    try:
        return 0 if run(args.source, args.timeout).passed else 1
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError):
        print('Isolated verification blocked: invalid export, unavailable Docker/image, or unconfirmed cleanup.')
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
