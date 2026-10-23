# Sprint Intelligence

An installable Claude Code skill and local toolchain for comparing sprint handoffs across Figma and Git, then generating an interactive release report with visual evidence and engineering notes.

**V1 is a local, read-only tool.** It collects Figma version/frame evidence and Git changes, then builds a browser-based report. It does not deploy your application, automatically prove release status, or claim semantic/pixel-perfect visual diffing. Human review is required.

## What works

- Claude Code `/sprint-handoff` skill.
- Local Git comparison between a previous handoff ref and current ref.
- Figma REST API connection using the user's own token.
- Figma version listing, version-specific file retrieval, top-level frame selection, and before/after PNG exports.
- Structured comparison of selected node properties across Figma versions.
- Interactive report populated from collected evidence.
- Local preview server with no additional npm dependencies.
- No credentials are bundled. Tokens remain in the user's local `.env` file.

## Requirements

- Node.js 20 or newer.
- Git and a local clone of the product repository (or this tool copied into it).
- Claude Code for the slash-command workflow. The collectors/report can also run without Claude Code.
- Figma personal access token with read access to the target file and version history.
- Access to the Git repository you want to compare.

## Quick start

1. Download or clone this repository. To install into an existing product repository, keep this tool in its own folder and run the installer from the target product repository:

   ```bash
   node /path/to/sprint-intelligence/scripts/install.mjs
   ```

   Replace `/path/to/sprint-intelligence` with the actual folder where you cloned or extracted this tool. The installer copies the skill and namespaced scripts, preserves existing files, adds namespaced npm scripts, and adds generated artifacts/secrets to `.gitignore`. If your project already has `sprint.config.json`, merge the required configuration rather than replacing your existing file.
2. From the target project root, run:

   ```bash
   npm run sprint-intelligence:setup
   ```

3. Edit `sprint.config.json`:
   - `sprint.name`, `startDate`, and `endDate`.
   - `git.baseRef`: the immutable commit SHA/tag for the previous accepted handoff.
   - `git.headRef`: current handoff SHA or `HEAD`.
   - `git.repositoryUrl`: optional GitHub repository URL for evidence links.
   - `figma.fileUrl` or `figma.fileKey`.
   - `figma.frameNodeIds`: optional list of node IDs. If empty, the collector selects up to `maxFrames` top-level frames from the current Figma version.
4. Open `.env` and add your Figma token:

   ```dotenv
   FIGMA_ACCESS_TOKEN=your_personal_access_token
   GITHUB_TOKEN=your_read_only_github_token
   ```

   Create the token in Figma's account settings. Grant the minimum read scopes required by your organization and the endpoints used. Do not paste the token into Claude chat or commit `.env`.
5. List available versions:

   ```bash
   npm run sprint-intelligence:versions
   ```

6. Copy the exact baseline and current version IDs into `figma.baselineVersionId` and `figma.currentVersionId` in `sprint.config.json`. The baseline should be the previously accepted handoff, not just the last autosave. The current version should represent the handoff being reviewed.
7. Check and build:

   ```bash
   npm run sprint-intelligence:check
   npm run sprint-intelligence:build
   npm run sprint-intelligence:preview
   ```

8. Open the local URL printed by `npm run sprint-intelligence:preview`. Run `/sprint-handoff` in Claude Code for the guided workflow.

## Figma API scopes and endpoints

The collector uses Figma's version-history endpoint, file endpoint at specific versions, and image-rendering endpoint. Figma may require `file_versions:read` and `file_content:read` scopes for the token and plan. If an endpoint returns 403, review the token's scopes and the account's access to the file.

- Version history: https://developers.figma.com/docs/rest-api/version-history-endpoints/
- File and node data / image rendering: https://developers.figma.com/docs/rest-api/file-endpoints/
- Scopes: https://developers.figma.com/docs/rest-api/scopes/

## Git comparison

The local Git collector compares `git.baseRef` to `git.headRef`. Use immutable commit SHAs where possible. `git.repositoryUrl` is used to construct links to files at the current commit. The collector does not need a GitHub token for local Git diffs.

To add PR metadata from GitHub, configure `github.owner`, `github.repo`, `github.baseRef`, and `github.headRef` in `sprint.config.json`, then set `GITHUB_TOKEN` in `.env` for private repositories or higher rate limits. Use a read-only token with minimum repository contents/pull request permissions. The collector uses GitHub's compare endpoint and commit-associated pull requests. `npm run sprint-intelligence:build` includes this step when those fields are configured after installation. GitHub API docs: https://docs.github.com/en/rest/commits/commits#compare-two-commits.

## What the report means

- **Design changes:** detected through selected node properties and frame screenshots at two Figma versions.
- **Engineering changes:** detected from Git diff metadata and commit history.
- **Visual evidence:** before/after images are rendered from Figma; V1 displays them side by side but does not calculate pixel-level image diffs.
- **Design/code alignment:** deliberately left `not-verified` unless supported by additional direct evidence. Claude may help interpret evidence, but its interpretation must be reviewed.
- **Release status:** never inferred from a commit. Add a deployment source in a future version or mark release status manually with evidence.

## Common issues

- **Figma 403:** confirm token scope, file access, and version-history access.
- **No Figma frames:** set `figma.frameNodeIds` using node IDs from the Figma URL or enable access to the file's current version.
- **No Git comparison:** make sure `git.baseRef` resolves to a commit in the local repository.
- **Report won't load:** use `npm run sprint-intelligence:preview`; do not open `report/index.html` as a `file://` URL.
- **Missing screenshot:** Figma may return a null image for unsupported or non-renderable nodes. The report will still record the frame metadata.

## Security and privacy

- Keep `.env` private. Never commit API tokens.
- Figma screenshots are saved locally under `evidence/sprint-intelligence/design/`; treat them as potentially confidential client assets.
- The tool does not upload project data to a public service. Claude Code may process files according to the user's Claude configuration and policies; follow your organization's data rules.
- Do not publish generated reports or screenshots publicly without authorization.
- The tool performs read-only collection and does not push commits, merge branches, or deploy releases.

## License

MIT. See `LICENSE`. If you distribute a modified copy, retain the copyright and license notice.
