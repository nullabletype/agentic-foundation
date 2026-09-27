"""Check this foundation's required files, whitespace and inline Markdown file links.

External URLs and heading fragments are deliberately not fetched or validated.
Uses only the Python standard library; never produces retained output files.
"""

from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    "README.md", "AGENTS.md", "CREDITS.md", "LICENSE", "VERSION", "CHANGELOG.md",
    "docs/workflow.md", "docs/controls.md", "docs/adoption.md",
    "docs/project-review.md", "docs/research.md",
    "docs/architecture.md", "docs/support-policy.md", "templates/adr.md",
    "templates/brief.md", "templates/project-contract.md",
    "templates/independent-review.md", "templates/handoff.md",
    ".github/ISSUE_TEMPLATE/task.md", ".github/pull_request_template.md",
    "docs/automation.md", "docs/adopter-guide.md", "templates/adopter-AGENTS.md.in",
    "examples/project-contract.md", "examples/pilot.md",
    "examples/calibration/candidates.md", "examples/calibration/answer-key.md",
)
IGNORED = {".git", ".agent-runs", "artifacts", "__pycache__", "node_modules"}
LINK = re.compile(r"\[[^\]\n]+\]\(([^)\n]+)\)")


def check(root):
    errors = []
    for name in REQUIRED:
        if not (root / name).is_file():
            errors.append(f"missing required file: {name}")
    documents = sorted(
        path for path in root.rglob("*.md")
        if not IGNORED.intersection(path.relative_to(root).parts)
    )
    for path in documents:
        name = path.relative_to(root)
        text = path.read_text(encoding="utf-8")
        if not text.endswith("\n"):
            errors.append(f"{name}: missing final newline")
        in_fence = False
        for number, line in enumerate(text.splitlines(), 1):
            if line.rstrip() != line:
                errors.append(f"{name}:{number}: trailing whitespace")
            if line.lstrip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            for destination in LINK.findall(line):
                destination = destination.strip().strip("<>")
                url = urlsplit(destination)
                if url.scheme or url.netloc or not url.path:
                    continue
                target = (path.parent / unquote(url.path)).resolve()
                try:
                    target.relative_to(root.resolve())
                except ValueError:
                    errors.append(f"{name}:{number}: link escapes repository: {destination}")
                    continue
                if not target.exists():
                    errors.append(f"{name}:{number}: missing link target: {destination}")
    return len(documents), errors


if __name__ == "__main__":
    count, failures = check(ROOT)
    for failure in failures:
        print(failure, file=sys.stderr)
    print(f"Checked {count} Markdown files; {len(failures)} error(s).")
    sys.exit(bool(failures))
