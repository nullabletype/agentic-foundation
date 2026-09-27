"""Preview or copy the playbook into a project without overwriting its files."""

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ('templates/adopter-AGENTS.md.in', 'AGENTS.md'),
    ('templates/project-contract.md', 'PROJECT.md'),
    ('CREDITS.md', 'CREDITS.md'),
    ('LICENSE', 'LICENSES/agentic-foundation.txt'),
    ('.github/ISSUE_TEMPLATE/task.md', '.github/ISSUE_TEMPLATE/task.md'),
    ('.github/pull_request_template.md', '.github/pull_request_template.md'),
]
for name in ('workflow', 'controls', 'research', 'project-review', 'architecture', 'support-policy'):
    FILES.append((f'docs/{name}.md', f'docs/{name}.md'))
FILES.append(('docs/adopter-guide.md', 'docs/adoption.md'))
for name in ('brief', 'project-contract', 'independent-review', 'handoff', 'adr'):
    FILES.append((f'templates/{name}.md', f'templates/{name}.md'))


def adopt(destination, apply=False):
    destination = Path(destination).absolute()
    if any(p.is_symlink() for p in (destination, *destination.parents)):
        raise ValueError('destination must not use symlinks')
    # Preflight every path before writing any file. Existing directories are fine.
    for _, relative in FILES:
        target = destination / relative
        if target.exists() or target.is_symlink():
            raise ValueError(f'refusing to overwrite: {relative}')
        for parent in target.parents:
            if parent == destination.parent:
                break
            if parent.is_symlink() or (parent.exists() and not parent.is_dir()):
                raise ValueError(f'unsafe destination parent for: {relative}')
    content = {}
    for source, relative in FILES:
        text = (ROOT / source).read_text(encoding='utf-8')
        if relative == 'CREDITS.md':
            text = text.replace('](LICENSE)', '](LICENSES/agentic-foundation.txt)')
            text += '\nAdopted foundation version: ' + (ROOT / 'VERSION').read_text().strip() + '.\n'
        if relative == 'PROJECT.md':
            text = text.replace('](../docs/', '](docs/')
        content[relative] = text
    if apply:
        created = []
        try:
            for relative, text in content.items():
                target = destination / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open('x', encoding='utf-8', newline='\n') as output:
                    created.append(target)
                    output.write(text)
        except OSError:
            for target in reversed(created):
                target.unlink()
            raise
    return sorted(content)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--apply', action='store_true', help='write after collision checks; default is preview')
    args = parser.parse_args()
    try:
        paths = adopt(args.destination, args.apply)
    except (OSError, ValueError) as error:
        parser.exit(1, f'adoption blocked: {error}\n')
    print(('Created' if args.apply else 'Would create') + f' {len(paths)} files:')
    print('\n'.join(paths))
    print('PROJECT.md remains draft. The copy includes the foundation licence notice; application licensing, tools, permissions, workflows and Git state are unchanged.')


if __name__ == '__main__':
    main()
