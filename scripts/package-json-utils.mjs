import { $, fs, os, path } from "zx";
import { ok, err, info } from "./log.mjs";

const utils = {
  async readPackageJson(projectDir) {
    const packageJsonPath = path.join(projectDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      err("package.json not found");
    }
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  },
  async writePackageJson(projectDir, content) {
    const packageJsonPath = path.join(projectDir, "package.json");
    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2), "utf8");
  },
  async setRepo(projectDir, repoUrl) {
    const packageJson = await utils.readPackageJson(projectDir);
    packageJson.repository = { type: "git", url: repoUrl };
    await utils.writePackageJson(projectDir, packageJson);
    return ok("Successfully updated repo url {0} to package.json", [repoUrl]);
  },
  async setBin(projectDir) {
    const packageJson = await utils.readPackageJson(projectDir);
    if (!packageJson.bin) {
      return info("No bin property found in package.json");
    }
  
    const binName = Object.keys(packageJson.bin)[0];
    const binPath = path.join(projectDir, packageJson.bin[binName]);
    const globalBinPath = path.join(os.homedir(), 'bin', binName);;
  
    // Create a symlink to the global scope
    await $`ln -sf ${binPath} ${globalBinPath}`;
    return ok("Symlink created for {0} at {1}", [binPath, globalBinPath])
  
  },

  async getRepoName(projectDir) {
    try {
      const { stdout: url } = await $`git -C ${projectDir} config --get remote.origin.url`;
      console.log(`Fetched URL: '${url}'`);
      const match = url.match(/:(.+?)\.git\s*$/);
      console.log(`Match result:`, match); // Log the match result to debug
      
      if (!match)
        throw new Error(
          "Repository name could not be determined from the URL: " + url
        );
      return match[1].split("/").pop(); // Extract the repo name
    } catch (error) {
      console.error("Error fetching repo name from git config:", error);
      return "";
    }
  },

  // Function to set the package name in package.json
  async setName(projectDir, name) {
    const packageJson = await utils.readPackageJson(projectDir);
    packageJson.name = name;
    await utils.writePackageJson(projectDir, packageJson);
    return ok("Successfully updated name: {0} to package.json", [name]);
  },

  // Function to handle the bin property in package.json
  async setBin(projectDir) {
    const packageJson = await utils.readPackageJson(projectDir);
    if (!packageJson.bin) {
      return info("No bin property found in package.json");
    }

    const binName = Object.keys(packageJson.bin)[0];
    const binPath = path.join(projectDir, packageJson.bin[binName]);
    const globalBinPath = path.join(os.homedir(), 'bin', binName);

    // Create a symlink to the global scope
    await $`ln -sf ${binPath} ${globalBinPath}`;
    return ok("Symlink created for {0} at {1}", [binPath, globalBinPath]);
  },
};

export default function createUtils(projectDir) {
  return Object.entries(utils).reduce(
    (acc, [key, fn]) => {
      if (typeof fn === "function") {
        // Assuming all utility functions are async, adjust if not the case
        acc[key] = async (...args) => await fn(projectDir, ...args);
      }
      return acc;
    },
    {
      formatName(name) {
        // Handle snake_case by replacing underscores with hyphens
        const snakeToKebab = name.replace(/_/g, "-");

        // Convert camelCase or PascalCase to kebab-case
        return snakeToKebab
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // Insert hyphen between lower-to-upper case transitions
          .replace(/([A-Z]+)([A-Z][a-z0-9])/g, "$1-$2") // Handle all-caps followed by cap (e.g., "HTTPServer")
          .toLowerCase(); // Convert all to lowercase
      },
    }
  );
}
