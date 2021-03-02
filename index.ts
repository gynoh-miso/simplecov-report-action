import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import path from 'path';

async function main() {
  const {repo, owner} = github.context.repo;
  const octokit = github.getOctokit(core.getInput('github-token'));
  console.log(github.context);
  const result = await octokit.repos.listPullRequestsAssociatedWithCommit({
    repo, owner, commit_sha: github.context.payload.after
  });
  const issue_number = result.data[0].number;
  const file = fs.readFileSync(path.join('.', core.getInput('simplecov-json-path')));
  const {covered_percent, total_lines} = JSON.parse(file.toString()).metrics;
  const body = `<p>Covered ${covered_percent.toFixed(2)}% in total ${total_lines} lines.</p>`;
  await octokit.issues.createComment({repo, owner, body, issue_number});
}
main().catch(e => core.setFailed(e.message));

export default main;