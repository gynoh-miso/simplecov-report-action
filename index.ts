import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import fs from 'fs';
import path from 'path';

async function main() {
  if (context.eventName != 'pull_request') {
    return;
  }
  const {repo, owner} = context.repo;
  const file = fs.readFileSync(path.join('.', core.getInput('simplecov-json-path')));
  const {covered_percent, total_lines} = JSON.parse(file.toString()).metrics;
  const body = `<p>Covered ${covered_percent.toFixed(1)}% in total ${total_lines} lines.</p>`;
  const octokit = getOctokit(core.getInput('github-token'));
  const issue_number = context.payload.pull_request?.number;
  if (!issue_number) {
    return;
  }
  await octokit.issues.createComment({repo, owner, body, issue_number});
}
main().catch(e => core.getInput('ignore-error') != 'true' && core.setFailed(e.message));

export default main;
