#!/usr/bin/env node
// CLI runner — run with: npx tsx qa/run-qa.ts
// Writes results to qa/report.txt

import { runAllTests } from './test-all';
import fs from 'fs';
import path from 'path';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function pad(s: string, n: number): string {
  return s + ' '.repeat(Math.max(0, n - s.length));
}

async function main() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║          Ringo QA Test Suite                     ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}\n`);
  console.log(`${DIM}Running tests against http://localhost:5000 and http://localhost:3000${RESET}`);
  console.log(`${DIM}Started at ${new Date().toLocaleString()}${RESET}\n`);

  const suites = await runAllTests();

  let totalPass = 0;
  let totalFail = 0;
  const failedLines: string[] = [];
  const reportLines: string[] = [
    `Ringo QA Report — ${new Date().toISOString()}`,
    '='.repeat(60),
    '',
  ];

  for (const suite of suites) {
    const suitePass = suite.tests.filter(t => t.passed).length;
    const suiteFail = suite.tests.filter(t => !t.passed).length;
    totalPass += suitePass;
    totalFail += suiteFail;

    const icon = suiteFail === 0 ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    console.log(`${BOLD}${icon}  ${suite.category}${RESET}  ${DIM}(${suitePass}/${suite.tests.length})${RESET}`);
    reportLines.push(`## ${suite.category} (${suitePass}/${suite.tests.length})`);

    for (const t of suite.tests) {
      const mark = t.passed ? `${GREEN}  ✓${RESET}` : `${RED}  ✗${RESET}`;
      const time = `${DIM}${t.ms}ms${RESET}`;
      console.log(`${mark}  ${pad(t.name, 52)} ${time}`);

      const reportMark = t.passed ? '  PASS' : '  FAIL';
      reportLines.push(`${reportMark}  ${t.name} (${t.ms}ms)`);

      if (!t.passed) {
        const reason = t.reason ?? 'unknown';
        console.log(`     ${YELLOW}→ ${reason}${RESET}`);
        reportLines.push(`        → ${reason}`);
        failedLines.push(`  ${suite.category} / ${t.name}: ${reason}`);
      }
    }

    console.log('');
    reportLines.push('');
  }

  const total = totalPass + totalFail;
  const pct = total > 0 ? Math.round((totalPass / total) * 100) : 0;
  const scoreColor = pct >= 90 ? GREEN : pct >= 70 ? YELLOW : RED;

  console.log(`${BOLD}${'─'.repeat(60)}${RESET}`);
  console.log(`${BOLD}Score: ${scoreColor}${totalPass}/${total} (${pct}%)${RESET}`);

  if (failedLines.length > 0) {
    console.log(`\n${BOLD}${RED}Failed tests:${RESET}`);
    failedLines.forEach(l => console.log(`${RED}${l}${RESET}`));
  } else {
    console.log(`\n${GREEN}${BOLD}All tests passed!${RESET}`);
  }

  reportLines.push('='.repeat(60));
  reportLines.push(`SCORE: ${totalPass}/${total} (${pct}%)`);
  if (failedLines.length > 0) {
    reportLines.push('\nFailed tests:');
    failedLines.forEach(l => reportLines.push(l));
  }

  const reportPath = path.join(process.cwd(), 'qa', 'report.txt');
  fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
  console.log(`\n${DIM}Report saved to qa/report.txt${RESET}\n`);

  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`\n${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});
