import tempfile
from pathlib import Path
import unittest
from adopt import ROOT, adopt
from check_docs import check


class AdoptionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve() / 'project'

    def test_preview_writes_nothing(self):
        self.assertIn('PROJECT.md', adopt(self.root))
        self.assertFalse(self.root.exists())

    def test_adoption_is_self_contained(self):
        self.root.mkdir()
        (self.root / 'LICENSE').write_text('Existing application licence\n')
        adopt(self.root, apply=True)
        self.assertEqual('Existing application licence\n', (self.root / 'LICENSE').read_text())
        self.assertEqual((ROOT / 'LICENSE').read_text(),
                         (self.root / 'LICENSES/agentic-foundation.txt').read_text())
        self.assertIn((ROOT / 'VERSION').read_text().strip(), (self.root / 'CREDITS.md').read_text())
        agent = (self.root / 'AGENTS.md').read_text()
        self.assertIn('[PROJECT.md](PROJECT.md)', agent)
        self.assertNotIn('scripts/check_docs.py', agent)
        self.assertIn('draft', (self.root / 'PROJECT.md').read_text())
        # Foundation-only required files do not apply to the adopted project.
        errors = [e for e in check(self.root)[1] if not e.startswith('missing required file:')]
        self.assertEqual([], errors)
        self.assertFalse((self.root / '.github/workflows').exists())

    def test_collision_writes_nothing(self):
        self.root.mkdir()
        existing = self.root / 'CREDITS.md'
        existing.write_text('user content\n')
        with self.assertRaisesRegex(ValueError, 'refusing to overwrite'):
            adopt(self.root, apply=True)
        self.assertEqual('user content\n', existing.read_text())
        self.assertEqual(['CREDITS.md'], [p.name for p in self.root.iterdir()])

    def test_reject_symlink(self):
        self.root.mkdir()
        (self.root / 'docs').symlink_to(Path(self.temporary.name).resolve(), target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'unsafe destination parent'):
            adopt(self.root, apply=True)
        self.assertFalse((self.root / 'AGENTS.md').exists())
