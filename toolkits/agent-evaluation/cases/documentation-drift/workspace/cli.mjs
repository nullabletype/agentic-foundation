export function help() {
  return `Usage: evaluation-report [--output <path>]

Options:
  --output <path>  Write the report (default: ./evaluation-report.json)`;
}

if (process.argv.includes("--help")) console.log(help());
