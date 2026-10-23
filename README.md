# Design Sprint Intelligence

**Connect Figma design handoffs to Git implementation changes.**

Design Sprint Intelligence is an open-source tool that compares design changes across Figma versions with code changes across Git commits, then generates an interactive report with visual evidence and engineering notes.

It was created to address a growing gap in software development: as AI accelerates design and code generation, teams need better ways to understand what changed, connect design intent to implementation evidence, and review work across sprint handoffs.

The tool brings design and engineering evidence into one place to support more informed product, design, and engineering reviews.

## The problem it addresses

Figma captures design intent. Git captures code changes. Sprint tickets capture requirements and decisions.

But these artifacts often live in separate places, leaving teams to manually reconstruct what changed between handoffs.

Design Sprint Intelligence helps bring those signals together so teams can investigate:

- What changed between two Figma design versions?
- What changed in the code between two Git references?
- What visual evidence is available to review?
- Where is additional human validation needed to assess design and implementation alignment?

## What it does

- **Figma comparison:** Retrieves version-specific design data and exports before-and-after screenshots of selected frames.
- **Git comparison:** Collects changed-file metadata and commit history between a baseline and a current Git reference.
- **GitHub evidence:** Optionally retrieves comparison and pull request metadata.
- **Interactive reporting:** Generates a local browser-based report combining design evidence and engineering changes.
- **Claude Code skill:** Includes a `/sprint-handoff` skill to guide the workflow.

## Project status

**Early release (V1).**

The local Git comparison and report-generation workflow has been tested. The Figma and GitHub API integrations require configuration with your own credentials and should be validated against your files and repositories before being relied on in production workflows.

V1 is a local, read-only tool. It does not deploy applications, push commits, merge branches, automatically verify production release status, calculate pixel-level image differences, or prove that the implementation matches the design.

The report organizes evidence for human review. It does not replace design QA, engineering review, or release verification.

## Requirements

Before getting started, you will need:

- Node.js 20 or newer
- Git
- A local clone of the product repository you want to analyze
- Access to the relevant Figma file and its version history
- A Figma personal access token with the required read permissions
- Claude Code for the guided slash-command workflow

The collection and reporting scripts can also run without Claude Code.

## Installation

The tool installs into an existing product repository. You will work with two folders:

1. The **Design Sprint Intelligence repository**, which contains the tool.
2. Your **product repository**, which contains the application you want to analyze.

Do not run the installer from an unrelated directory. The installer should be run from the root of your target product repository.

### Step 1: Download the tool

Clone this repository:

```bash
git clone https://github.com/nikkiwolfe/Design-Sprint-Intelligence.git
```

Alternatively, open the repository on GitHub, select **Code → Download ZIP**, and extract the downloaded archive.

### Step 2: Install into your product repository

Open a terminal in your existing product repository's root directory.

Run the installer using the actual path to the downloaded or cloned tool:

```bash
node /absolute/path/to/Design-Sprint-Intelligence/scripts/install.mjs
```

Replace `/absolute/path/to/Design-Sprint-Intelligence` with the actual location of the tool on your computer.

For example, if both folders are located next to each other, you might run:

```bash
node ../Design-Sprint-Intelligence/scripts/install.mjs
```

The installer copies the namespaced scripts, Claude Code skill, configuration template, and report viewer into your product repository. It also adds the tool's npm commands and updates `.gitignore` to exclude generated evidence and secrets.

Existing project files and configuration are intended to be preserved. If your project already has `sprint.config.json`, merge the required settings instead of replacing your existing configuration.

### Step 3: Run setup

From your product repository's root directory, run:

```bash
npm run sprint-intelligence:setup
```

This initializes the local tool setup and creates `.env` from `.env.example` if `.env` does not already exist.

**Important:** If you already have a `.env` file, the setup process preserves it. Add the required variables to your existing file instead of replacing it.

### Step 4: Configure your sprint

Open `sprint.config.json` in your product repository.

Set the sprint information:

- `sprint.name`
- `sprint.startDate`
- `sprint.endDate`

Configure the Git comparison:

- `git.baseRef`: the commit SHA or tag representing the previously accepted handoff.
- `git.headRef`: the current handoff commit SHA or `HEAD`.
- `git.repositoryUrl`: optional GitHub repository URL used to construct evidence links.

Whenever possible, use immutable commit SHAs for repeatable comparisons.

Configure the Figma connection:

- `figma.fileUrl` or `figma.fileKey`: identifies the Figma file.
- `figma.baselineVersionId`: the previously accepted design version.
- `figma.currentVersionId`: the design version you want to review.
- `figma.frameNodeIds`: optional list of specific Figma node IDs to track.

If no frame IDs are provided, the collector selects up to the configured maximum number of top-level frames from the current Figma version.

Use the configuration structure supplied with the tool. Do not remove existing project-specific configuration fields.

### Step 5: Connect your Figma account

Open the `.env` file in your product repository.

Add your Figma personal access token:

```dotenv
FIGMA_ACCESS_TOKEN=your_personal_access_token
```

Create the token in your Figma account settings and grant only the minimum read permissions required by the endpoints and your organization's access policies.

Never commit `.env`, publish your token, or paste credentials into a public issue or chat.

### Step 6: Select your Figma versions

List the available Figma versions:

```bash
npm run sprint-intelligence:versions
```

Copy the exact version IDs for the baseline and current design handoff into `sprint.config.json`.

The baseline should represent the previously accepted design handoff, not simply the most recent autosave. The current version should represent the design state you want to review.

For the most useful comparison, select versions that correspond as closely as possible to the Git references used for the engineering comparison.

### Step 7: Validate and generate the report

Check your configuration:

```bash
npm run sprint-intelligence:check
```

Collect evidence and generate the report:

```bash
npm run sprint-intelligence:build
```

Start the local preview server:

```bash
npm run sprint-intelligence:preview
```

Open the local URL printed in your terminal.

Use the preview server rather than opening `report/index.html` directly as a `file://` URL. The report loads its data separately and needs the local server to serve the files correctly.

### Step 8: Use the Claude Code skill

If you use Claude Code, open your product repository and run:

```text
/sprint-handoff
```

The included skill guides the sprint handoff workflow.

You can also run the collectors and report-generation commands directly without Claude Code.

## Optional: GitHub pull request metadata

GitHub integration is optional. The local Git collector does not require a GitHub token to compare commits in your local repository.

To include GitHub comparison and pull request metadata, configure the following fields in `sprint.config.json`:

- `github.owner`
- `github.repo`
- `github.baseRef`
- `github.headRef`

Add a token to `.env` when required for private repositories or higher API rate limits:

```dotenv
GITHUB_TOKEN=your_read_only_github_token
```

Use a token with the minimum repository read permissions needed for the configured endpoints.

The GitHub integration adds context to the report; it does not replace the local Git comparison.

Official API reference: [GitHub compare two commits](https://docs.github.com/en/rest/commits/commits#compare-two-commits).

## Understanding the report

### Design changes

The report includes selected Figma node-property differences and before-and-after screenshots rendered from Figma versions.

### Engineering changes

The report includes Git change metadata, changed files, and commit history between the selected references.

### Visual evidence

Before-and-after images are displayed side by side. V1 does not calculate pixel-level image differences or automatically determine whether two screens are visually equivalent.

### Design-to-code alignment

Alignment is deliberately marked as `not-verified` unless supported by additional direct evidence.

AI-assisted interpretation may help reviewers investigate potential relationships between design and code changes, but an interpretation is not proof that the implementation matches the design.

### Release status

Release status is not inferred from a Git
