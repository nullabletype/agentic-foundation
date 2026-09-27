import tempfile
from pathlib import Path
import unittest
from check_docs import REQUIRED, check


class DocumentationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        for name in REQUIRED:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('# Document\n', encoding='utf-8')

    def test_valid_links(self):
        (self.root / 'README.md').write_text('[local](docs/workflow.md) [web](https://example.com)\n')
        self.assertEqual([], check(self.root)[1])

    def test_missing_required(self):
        (self.root / 'AGENTS.md').unlink()
        self.assertIn('missing required file: AGENTS.md', check(self.root)[1])

    def test_missing_link(self):
        (self.root / 'README.md').write_text('[bad](absent.md)\n')
        self.assertIn('README.md:1: missing link target: absent.md', check(self.root)[1])

    def test_escape(self):
        for link in ('../outside.md', '%2e%2e/outside.md'):
            with self.subTest(link=link):
                (self.root / 'README.md').write_text(f'[bad]({link})\n')
                self.assertIn(f'README.md:1: link escapes repository: {link}', check(self.root)[1])

    def test_whitespace(self):
        (self.root / 'README.md').write_text('# Bad \n')
        self.assertIn('README.md:1: trailing whitespace', check(self.root)[1])

    def test_final_newline(self):
        (self.root / 'README.md').write_text('# Bad')
        self.assertIn('README.md: missing final newline', check(self.root)[1])
