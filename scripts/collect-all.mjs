import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
const root=process.cwd();const scriptDir=dirname(fileURLToPath(import.meta.url));const c=JSON.parse(readFileSync(resolve(root,'sprint.config.json'),'utf8'));
function run(file){const r=spawnSync(process.execPath,[resolve(scriptDir,file)],{cwd:root,stdio:'inherit'});return r.status??1;}
let status=0;
if(c.git?.baseRef){if(run('collect-git.mjs')!==0)status=1;}else console.warn('Skipping Git collector: configure git.baseRef.');
if(c.figma?.baselineVersionId&&c.figma?.currentVersionId){if(run('collect-figma.mjs')!==0)status=1;}else console.warn('Skipping Figma collector: configure both Figma version IDs. Run npm run versions to find them.');
if(c.github?.owner&&c.github?.repo&&c.github?.baseRef&&c.github?.headRef){if(run('collect-github.mjs')!==0)status=1;}else console.warn('Skipping GitHub API collector: configure github.owner, repo, baseRef, and headRef to collect PR metadata. Local Git collection still works.');
if(existsSync(resolve(root,c.git?.outputFile||'data/sprint-intelligence/git-changes.json'))||existsSync(resolve(root,'data/sprint-intelligence/figma-changes.json'))||existsSync(resolve(root,'data/sprint-intelligence/github-changes.json'))){if(run('build-report.mjs')!==0)status=1;}else{console.error('No source evidence was collected. Configure Git and/or Figma first.');status=1;}
process.exitCode=status;
