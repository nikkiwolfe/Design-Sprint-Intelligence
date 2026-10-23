import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const sourceRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const targetRoot=process.cwd();
if(sourceRoot===targetRoot){console.error('Run this installer from the target product repository, not from the Sprint Intelligence source repository.');process.exit(2);}
function copyIfMissing(srcRel,destRel){const src=resolve(sourceRoot,srcRel),dest=resolve(targetRoot,destRel);if(!existsSync(src))return;if(existsSync(dest)){console.log(`Kept existing ${destRel}`);return;}mkdirSync(dirname(dest),{recursive:true});copyFileSync(src,dest);console.log(`Installed ${destRel}`);}
copyIfMissing('.claude/skills/sprint-handoff/SKILL.md','.claude/skills/sprint-handoff/SKILL.md');
for(const file of ['lib.mjs','collect-git.mjs','collect-figma.mjs','collect-github.mjs','collect-all.mjs','build-report.mjs','sprint-intelligence.mjs','preview.mjs'])copyIfMissing(`scripts/${file}`,`scripts/sprint-intelligence/${file}`);
copyIfMissing('sprint.config.json','sprint.config.json');
copyIfMissing('.env.example','.env.example');
copyIfMissing('data/sprint-intelligence/report.json','data/sprint-intelligence/report.json');
copyIfMissing('report/index.html','sprint-intelligence-report/index.html');
const packagePath=resolve(targetRoot,'package.json');
if(existsSync(packagePath)){
 try{
  const pkg=JSON.parse(readFileSync(packagePath,'utf8'));pkg.scripts=pkg.scripts||{};
  const scripts={
   'sprint-intelligence:setup':'node scripts/sprint-intelligence/sprint-intelligence.mjs setup',
   'sprint-intelligence:check':'node scripts/sprint-intelligence/sprint-intelligence.mjs check',
   'sprint-intelligence:versions':'node scripts/sprint-intelligence/sprint-intelligence.mjs versions',
   'sprint-intelligence:collect':'node scripts/sprint-intelligence/sprint-intelligence.mjs collect',
   'sprint-intelligence:report':'node scripts/sprint-intelligence/sprint-intelligence.mjs report',
   'sprint-intelligence:build':'node scripts/sprint-intelligence/sprint-intelligence.mjs build',
   'sprint-intelligence:preview':'node scripts/sprint-intelligence/sprint-intelligence.mjs preview'
  };
  for(const [key,value] of Object.entries(scripts)){if(!pkg.scripts[key])pkg.scripts[key]=value;else console.log(`Kept existing npm script ${key}`);}
  writeFileSync(packagePath,JSON.stringify(pkg,null,2)+'\n');console.log('Added Sprint Intelligence npm scripts to package.json.');
 }catch(e){console.warn(`Could not update package.json: ${e.message}. Add the documented npm scripts manually.`);}
}else console.warn('No package.json found. The tool can still be run with node scripts/sprint-intelligence/sprint-intelligence.mjs <command>.');
const ignorePath=resolve(targetRoot,'.gitignore');const ignores=['.env','.env.local','data/sprint-intelligence/','evidence/sprint-intelligence/'];
if(!existsSync(ignorePath))writeFileSync(ignorePath,'');let existing=readFileSync(ignorePath,'utf8');for(const line of ignores){if(!existing.split(/\r?\n/).includes(line)){appendFileSync(ignorePath,`${existing.endsWith('\n')||existing.length===0?'':'\n'}${line}\n`);existing+=`\n${line}`;}}
console.log('\nInstall step complete. Edit sprint.config.json and .env, then run npm run sprint-intelligence:check.');
console.log('If sprint.config.json already existed, merge the required git, figma, github, and report settings instead of overwriting your project configuration.');
