import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const root = process.cwd();
const config = JSON.parse(readFileSync(resolve(root, 'sprint.config.json'), 'utf8'));
const base = config.git?.baseRef; const head = config.git?.headRef || 'HEAD';
if (!base) { console.error('Missing git.baseRef. Set it to the previous accepted handoff commit SHA or tag.'); process.exit(2); }
function git(args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024, stdio: ['ignore','pipe','pipe'] }).trim(); }
function run(args) { try { return git(args); } catch (e) { throw new Error(`Git failed: git ${args.join(' ')}\n${e.stderr?.toString?.() || e.message}`); } }
const baseSha = run(['rev-parse','--verify',`${base}^{commit}`]); const headSha = run(['rev-parse','--verify',`${head}^{commit}`]);
const rawStatus = run(['diff','--name-status','--find-renames',baseSha,headSha]);
const rawNumstat = run(['diff','--numstat',baseSha,headSha]);
const rawLog = run(['log','--format=%H%x09%an%x09%aI%x09%s',`${baseSha}..${headSha}`]);
const stat = run(['diff','--stat',baseSha,headSha]);
const statuses = rawStatus ? rawStatus.split('\n').map(line=>{const [status,...paths]=line.split('\t');return {status,path:paths.at(-1),previousPath:paths.length>1?paths[0]:null};}) : [];
const numstats = new Map((rawNumstat?rawNumstat.split('\n'):[]).map(line=>{const [a,d,...path]=line.split('\t');return [path.join('\t'),{additions:a==='-'?null:Number(a),deletions:d==='-'?null:Number(d)}];}));
const files = statuses.map(row=>({...row,...(numstats.get(row.path)||{})}));
const commits = rawLog ? rawLog.split('\n').map(line=>{const [sha,author,date,...subject]=line.split('\t');return {sha,author,date,subject:subject.join('\t'),url:config.git?.repositoryUrl?`${config.git.repositoryUrl.replace(/\/$/,'')}/commit/${sha}`:''};}) : [];
const result={collectedAt:new Date().toISOString(),sprint:config.sprint,comparison:{baseRef:base,baseSha,headRef:head,headSha},summary:{commits:commits.length,filesChanged:files.length,added:files.filter(f=>f.status==='A').length,modified:files.filter(f=>f.status.startsWith('M')||f.status.startsWith('R')).length,removed:files.filter(f=>f.status==='D').length},commits,files,diffStat:stat,note:'Git evidence only. Commits do not prove deployment or release.'};
const out=resolve(root,config.git.outputFile||'data/sprint-intelligence/git-changes.json');mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(`Wrote ${out}`);console.log(`${commits.length} commits; ${files.length} changed files; ${baseSha.slice(0,7)}..${headSha.slice(0,7)}`);
