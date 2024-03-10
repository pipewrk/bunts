import { test, expect, afterEach } from "bun:test";
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import createUtils from './package-json-utils.mjs';

const projectDir = path.resolve('./tests/fixtures/testProject');
const utils = createUtils(projectDir);
const packagePath = path.join(projectDir, 'package.json');
const packageDefaultsPath = path.join(projectDir, 'package-defaults.json');
const binariesDir = path.join(os.homedir(), 'bin');

afterEach(async () => {
  // Restore package.json to its default state
  fs.copyFileSync(packageDefaultsPath, packagePath);
  const binaryPath = path.join(binariesDir, 'bunts');
  if (fs.existsSync(binaryPath)) {
    fs.unlinkSync(binaryPath);
  }
})

test("readPackageJson reads data correctly", async () => {
  const packageData = await utils.readPackageJson();
  expect(packageData).toBeDefined();
  // Add more specific expectations here based on your default fixture's package.json content
});

test("formatName transforms names correctly", () => {
  expect(utils.formatName('myRepoName')).toBe('my-repo-name');
  expect(utils.formatName('Another_Test_Example')).toBe('another-test-example');
  expect(utils.formatName('HTTPServerExample')).toBe('http-server-example');
});

test("getRepoName extracts repository name from Git URL", async () => {
  const repoName = await utils.getRepoName();
  expect(repoName).toBe('bunts');
});

test("setRepo updates the repository URL in package.json", async () => {
  await utils.setRepo('git@github.com:user/repoName.git');

  // Directly read the package.json file to verify changes
  const updatedPackageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  expect(updatedPackageData.repository.url).toBe('git@github.com:user/repoName.git')
});

test("setName updates the package name in package.json", async () => {
  await utils.setName('new-repo-name');

  // Directly read the package.json file to verify changes
  const updatedPackageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  expect(updatedPackageData.name).toBe('new-repo-name');
});


test("setBin creates a symlink for the binary", async () => {
  await utils.setBin();

  // Assuming you know the name of the binary from the package.json bin field
  const binName = "bunts"; // Example binary name
  const symlinkPath = path.join(os.homedir(), 'bin', binName);

  // Check if the symlink exists
  expect(fs.existsSync(symlinkPath)).toBe(true);

  // Optionally, verify that the symlink points to the correct target if needed
});

