import main from './index';

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('fs');

const getInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const getOctokit = github.getOctokit as jest.MockedFunction<typeof github.getOctokit>;
const readFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe("simplecov-report-action", () => {
  it("leaves comment for PR", async () => {    
    getInput.mockReturnValueOnce('TOKEN');
    getInput.mockReturnValueOnce('coverage/coverage.json');
    readFileSync.mockReturnValue(Buffer.from(JSON.stringify({metrics: {covered_percent: 99.9, total_lines: 999}})));
    const createComment = jest.fn() as any;
    getOctokit.mockReturnValue({
      issues: {createComment}
    } as any);
    Object.assign(github, {context: {
      eventName: 'pull_request',
      repo: {repo: 'repo', owner: 'owner'},
      payload: {pull_request: {number: 123}},
    }});
    
    await main();

    const {body, issue_number} = Array.from(createComment.mock.calls[0])[0] as any;
    expect(body).toMatch(/Covered 99.9% in total 999 lines/);
    expect(issue_number).toEqual(123);
  });

  it("returns right away if event is not pull_request", async () => {
    Object.assign(github, {context: {eventName: 'anything'}});

    expect(await main()).toBeUndefined();
  });

  it("returns right away if issue_number is not present", async () => {
    Object.assign(github, {context: {
      eventName: 'anything',
      repo: {repo: 'repo', owner: 'owner'},
    }});

    expect(await main()).toBeUndefined();
  });
});