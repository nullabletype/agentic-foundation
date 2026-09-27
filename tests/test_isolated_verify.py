from pathlib import Path
import tempfile
import unittest
from isolated_verify import MAX_BYTES, snapshot


class SnapshotTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        self.source = self.root / 'source'
        self.target = self.root / 'target'
        self.source.mkdir()
        self.target.mkdir()
        (self.source / 'verify.py').write_text('assert 1 == 1\n')

    def test_snapshot_binds_bytes_and_preserves_source(self):
        first = snapshot(self.source, self.target)
        self.assertEqual('assert 1 == 1\n', (self.target / 'verify.py').read_text())
        (self.source / 'verify.py').write_text('assert 2 == 2\n')
        self.assertNotEqual(first, snapshot(self.source, self.target))

    def test_rejects_symlinks_before_copying(self):
        (self.source / 'linked').symlink_to(self.root)
        with self.assertRaisesRegex(ValueError, 'symlink'):
            snapshot(self.source, self.target)
        self.assertEqual([], list(self.target.iterdir()))

    def test_rejects_git_and_credentials(self):
        for name in ('.git', '.env', '.env.local', '.ssh'):
            with self.subTest(name=name):
                path = self.source / name
                path.mkdir()
                with self.assertRaisesRegex(ValueError, 'forbidden'):
                    snapshot(self.source, self.target)
                path.rmdir()

    def test_rejects_oversize_export(self):
        (self.source / 'large').write_bytes(b'x' * MAX_BYTES)
        with self.assertRaisesRegex(ValueError, 'exceeds'):
            snapshot(self.source, self.target)

    def test_requires_entrypoint(self):
        (self.source / 'verify.py').unlink()
        with self.assertRaisesRegex(ValueError, 'verify.py'):
            snapshot(self.source, self.target)

    def test_accepts_exact_size_limit(self):
        used = (self.source / 'verify.py').stat().st_size
        (self.source / 'data').write_bytes(b'x' * (MAX_BYTES - used))
        snapshot(self.source, self.target)
        self.assertEqual(MAX_BYTES - used, (self.target / 'data').stat().st_size)

    def test_enforces_file_count(self):
        for index in range(99):
            (self.source / f'file-{index}').write_text('')
        snapshot(self.source, self.target)
        self.assertEqual(100, len(list(self.target.iterdir())))
        (self.source / 'one-too-many').write_text('')
        with self.assertRaisesRegex(ValueError, '100 files'):
            snapshot(self.source, self.target)

    def test_rejects_excessive_directory_entries(self):
        for index in range(200):
            (self.source / f'directory-{index}').mkdir()
        with self.assertRaisesRegex(ValueError, '200 filesystem entries'):
            snapshot(self.source, self.target)

    def test_cleanup_failure_still_reaps_attach(self):
        import io
        import subprocess
        from unittest.mock import Mock, patch
        from isolated_verify import run
        process = Mock()
        process.stdout = io.BytesIO(b'')
        process.poll.return_value = None
        process.wait.return_value = 0
        cleanup_error = subprocess.TimeoutExpired('docker rm', 10)
        with patch('isolated_verify.subprocess.Popen', return_value=process), \
             patch('isolated_verify.subprocess.run', side_effect=[subprocess.CompletedProcess([], 0), cleanup_error]), \
             patch('isolated_verify.time.monotonic', side_effect=[0, 2]):
            with self.assertRaises(subprocess.TimeoutExpired):
                run(self.source, timeout=1)
        process.kill.assert_called_once()
        process.wait.assert_called_once_with(timeout=5)
        self.assertTrue(process.stdout.closed)
