import copy
import unittest
from publication_check import publication_errors

COMMIT = 'a' * 40
OTHER = 'b' * 40


def evidence():
    return {'version': 1, 'candidate': COMMIT, 'contract_accepted': True,
            'implementer': 'builder', 'ui_ux': False,
            'local_validation': {'candidate': COMMIT, 'result': 'passed',
                                 'command': 'python3 -B verify.py', 'environment': 'Synthetic Linux fixture',
                                 'evidence_ref': 'local/check-record.md'},
            'independent_review': {'candidate': COMMIT, 'result': 'passed', 'reviewer': 'verifier',
                                   'evidence_ref': 'local/review-record.md'}}


class PublicationTests(unittest.TestCase):
    def test_non_ui_accepted(self):
        self.assertEqual([], publication_errors(evidence(), COMMIT))

    def test_missing_or_malformed_evidence_details_denied(self):
        for field, keys in [('local_validation', ('command', 'environment', 'evidence_ref')),
                            ('independent_review', ('evidence_ref',))]:
            for key in keys:
                for value in (None, '', '  ', [], True):
                    with self.subTest(field=field, key=key, value=value):
                        record = evidence()
                        if value is None:
                            del record[field][key]
                        else:
                            record[field][key] = value
                        self.assertIn(f'{field}.{key} is missing or invalid',
                                      publication_errors(record, COMMIT))

    def test_ui_missing_approval_denied(self):
        record = evidence()
        record['ui_ux'] = True
        self.assertIn('human UI/UX approval is missing', publication_errors(record, COMMIT))

    def test_ui_current_approval_accepted(self):
        record = evidence()
        record.update(ui_ux=True, human_approval={'candidate': COMMIT, 'decision': 'approved',
                                                 'reviewer': 'owner', 'flows': 'create and edit'})
        self.assertEqual([], publication_errors(record, COMMIT))

    def test_stale_approval_denied(self):
        record = evidence()
        record.update(ui_ux=True, human_approval={'candidate': OTHER, 'decision': 'approved',
                                                 'reviewer': 'owner', 'flows': 'create'})
        self.assertIn('human UI/UX approval is incomplete or stale', publication_errors(record, COMMIT))

    def test_changed_candidate_denied(self):
        self.assertIn('candidate evidence is stale', publication_errors(evidence(), OTHER))

    def test_review_missing_or_self_review_denied(self):
        record = evidence()
        del record['independent_review']
        self.assertIn('independent_review is missing', publication_errors(record, COMMIT))
        record = evidence()
        record['independent_review']['reviewer'] = 'builder'
        self.assertIn('independent reviewer must differ from implementer', publication_errors(record, COMMIT))

    def test_self_review_with_surrounding_whitespace_denied(self):
        for implementer, reviewer in [('builder', 'builder '), (' builder', 'builder'),
                                      ('\t builder \n', '\nbuilder\t')]:
            with self.subTest(implementer=implementer, reviewer=reviewer):
                record = evidence()
                record['implementer'] = implementer
                record['independent_review']['reviewer'] = reviewer
                self.assertIn('independent reviewer must differ from implementer',
                              publication_errors(record, COMMIT))

    def test_distinct_reviewers_with_whitespace_accepted(self):
        record = evidence()
        record['implementer'] = ' builder '
        record['independent_review']['reviewer'] = '\tverifier\n'
        self.assertEqual([], publication_errors(record, COMMIT))

    def test_failed_and_stale_checks_denied(self):
        for field in ('local_validation', 'independent_review'):
            for change in ({'result': 'failed'}, {'candidate': OTHER}):
                with self.subTest(field=field, change=change):
                    record = evidence()
                    record[field].update(change)
                    self.assertIn(f'{field} is failed, missing or stale', publication_errors(record, COMMIT))

    def test_malformed_fields_denied(self):
        for field, value in [('version', True), ('ui_ux', 'false'), ('contract_accepted', 'yes'),
                             ('implementer', ''), ('independent_review', [])]:
            with self.subTest(field=field):
                record = copy.deepcopy(evidence())
                record[field] = value
                self.assertTrue(publication_errors(record, COMMIT))
        self.assertEqual(['invalid record or candidate SHA'], publication_errors([], COMMIT))

    def test_cli_rejects_dirty_tree(self):
        import json
        import os
        from pathlib import Path
        import subprocess
        import sys
        import tempfile
        from publication_check import __file__ as checker_path
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repository = root / 'repository'
            repository.mkdir()
            env = dict(os.environ, GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_NOSYSTEM='1')
            def git(*args):
                return subprocess.check_output(['git', '-C', str(repository), *args], env=env, text=True).strip()
            git('init', '-q')
            (repository / 'source.txt').write_text('synthetic\n')
            git('add', 'source.txt')
            git('-c', 'user.name=Synthetic', '-c', 'user.email=synthetic@example.invalid',
                '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Synthetic fixture')
            commit = git('rev-parse', 'HEAD')
            record = evidence()
            record['candidate'] = commit
            record['local_validation']['candidate'] = commit
            record['independent_review']['candidate'] = commit
            receipt = root / 'evidence.json'
            receipt.write_text(json.dumps(record))
            command = [sys.executable, '-B', checker_path, str(receipt), '--repository', str(repository)]
            clean = subprocess.run(command, env=env, text=True, capture_output=True)
            self.assertEqual(0, clean.returncode, clean.stdout + clean.stderr)
            git('config', 'status.showUntrackedFiles', 'no')
            extra = repository / 'untracked.py'
            extra.write_text('# Synthetic source absent from the candidate commit\n')
            self.assertEqual('', git('status', '--porcelain'))
            hidden = subprocess.run(command, env=env, text=True, capture_output=True)
            self.assertEqual(1, hidden.returncode, hidden.stdout + hidden.stderr)
            self.assertIn('candidate worktree is not clean', hidden.stdout)
            extra.unlink()
            clean_again = subprocess.run(command, env=env, text=True, capture_output=True)
            self.assertEqual(0, clean_again.returncode, clean_again.stdout + clean_again.stderr)
            (repository / 'source.txt').write_text('changed\n')
            dirty = subprocess.run(command, env=env, text=True, capture_output=True)
            self.assertEqual(1, dirty.returncode)
            self.assertIn('candidate worktree is not clean', dirty.stdout)
            receipt.write_text('{invalid json')
            malformed = subprocess.run(command, env=env, text=True, capture_output=True)
            self.assertEqual(1, malformed.returncode)
            self.assertIn('unreadable record or Git state', malformed.stderr)
