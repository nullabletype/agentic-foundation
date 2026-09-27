"""Fail-closed local publication preflight; never pushes or authenticates approvals."""

import argparse
import json
from pathlib import Path
import re
import subprocess

SHA = re.compile(r'[0-9a-f]{40}')


def publication_errors(record, commit):
    if not isinstance(record, dict) or not SHA.fullmatch(commit):
        return ['invalid record or candidate SHA']
    errors = []
    if record.get('version') != 1 or type(record.get('version')) is not int:
        errors.append('unsupported record version')
    if record.get('candidate') != commit:
        errors.append('candidate evidence is stale')
    if record.get('contract_accepted') is not True:
        errors.append('contract acceptance is missing')
    implementer = record.get('implementer')
    if not isinstance(implementer, str) or not implementer.strip():
        errors.append('implementer identity is missing')
    for field in ('local_validation', 'independent_review'):
        evidence = record.get(field)
        if not isinstance(evidence, dict):
            errors.append(f'{field} is missing')
            continue
        if evidence.get('candidate') != commit or evidence.get('result') != 'passed':
            errors.append(f'{field} is failed, missing or stale')
        required = ('command', 'environment', 'evidence_ref') if field == 'local_validation' else ('evidence_ref',)
        for key in required:
            if not isinstance(evidence.get(key), str) or not evidence[key].strip():
                errors.append(f'{field}.{key} is missing or invalid')
        if field == 'independent_review':
            reviewer = evidence.get('reviewer')
            if not isinstance(reviewer, str) or not reviewer.strip() or reviewer == implementer:
                errors.append('independent reviewer must differ from implementer')
    impact = record.get('ui_ux')
    if type(impact) is not bool:
        errors.append('UI/UX impact must be explicitly classified')
    elif impact:
        approval = record.get('human_approval')
        if not isinstance(approval, dict):
            errors.append('human UI/UX approval is missing')
        elif (approval.get('candidate') != commit or approval.get('decision') != 'approved'
              or not isinstance(approval.get('reviewer'), str) or not approval['reviewer'].strip()
              or not isinstance(approval.get('flows'), str) or not approval['flows'].strip()):
            errors.append('human UI/UX approval is incomplete or stale')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('record', type=Path, help='sanitised operator-attested JSON, outside the candidate tree')
    parser.add_argument('--repository', type=Path, default=Path.cwd())
    args = parser.parse_args()
    try:
        if args.record.stat().st_size > 16384:
            raise ValueError('record exceeds 16 KiB')
        record = json.loads(args.record.read_text(encoding='utf-8'))
        def git(*arguments):
            return subprocess.check_output(['git', '-C', str(args.repository), *arguments], text=True).strip()
        commit = git('rev-parse', 'HEAD')
        errors = publication_errors(record, commit)
        if git('status', '--porcelain'):
            errors.append('candidate worktree is not clean')
    except (OSError, ValueError, subprocess.CalledProcessError):
        parser.exit(1, 'publication blocked: unreadable record or Git state\n')
    for error in errors:
        print(f'publication blocked: {error}')
    if errors:
        return 1
    print('Preflight passed. Attestations require trusted review; no publication was performed.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
