#!/usr/bin/env zx
import { $ } from 'zx';
import { setRepo, setName, setBin, getRepoName, formatName } from './package-json-utils.mjs';

async function postinstall() {
  const projectDir = process.cwd();

  // Use getRepoName to fetch the repository name from .git config
  const repoName = await getRepoName();

  // If repoName is successfully fetched, update the repository and package name in package.json
  if (repoName) {
    const formattedName = formatName(repoName);

    // Construct the repository URL assuming GitHub and the fetched repo name
    const repoUrl = `git@github.com:${repoName}.git`;

    // Set repository URL and formatted name in package.json
    await setRepo(projectDir, repoUrl);
    await setName(projectDir, formattedName);
  }

  // Handle the bin property by creating a symlink if it exists
  await setBin(projectDir);
}

postinstall().catch(console.error);
