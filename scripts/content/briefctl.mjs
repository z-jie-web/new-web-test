#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';

const STATE_ROOT = path.join(os.homedir(), '.claude', 'state', 'toolporto-writer');
const MODES = new Set(['discover', 'draft', 'enhance', 'publish', 'refresh']);
const ARTICLE_TYPES = new Set(['review', 'compare', 'blog']);

function die(message, code = 1) {
  console.error(`ERROR: ${message}`);
  process.exit(code);
}

function resolveStateDir(articleId) {
  if (!articleId) die('missing article-id');
  return path.join(STATE_ROOT, articleId);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resolveContentInput(target) {
  if (!target) die('missing target file');
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  for (const dir of ['reviews', 'blog', 'compare']) {
    const candidate = path.join(process.cwd(), 'content', dir, `${target}.mdx`);
    if (fs.existsSync(candidate)) return candidate;
  }
  die(`content file not found: ${target}`);
}

function wrapYaml(raw) {
  return `---\n${raw}\n---\n`;
}

function unwrapYaml(frontmatterDoc) {
  return frontmatterDoc.replace(/^---\n/, '').replace(/\n---\n?$/, '\n');
}

function parseYamlFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return matter(wrapYaml(raw)).data;
}

function stringifyYaml(data) {
  return unwrapYaml(matter.stringify('', data));
}

function loadBriefOrDie(file) {
  if (!fs.existsSync(file)) die(`brief not found: ${file}`);
  try {
    return parseYamlFile(file);
  } catch (error) {
    die(`failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function saveBrief(file, data) {
  fs.writeFileSync(file, stringifyYaml(data), 'utf8');
}

function makeInitialBrief(articleId, articleType) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    brief_version: 2,
    run_id: `${articleId}-${today}`,
    article_id: articleId,
    parent_brief_id: null,
    current_mode: 'discover',
    status: 'in_progress',
    intent: {
      article_type: articleType,
      category: '',
      primary_keyword: '',
      search_intent: 'commercial investigation',
      audience: '',
    },
    artifacts: {
      target_files: [],
    },
    decisions: {
      angle: '',
      render_contract: {
        auto_rendered: [],
        mdx_must_not_duplicate: [],
      },
    },
    mode_outputs: {
      discover: {},
      draft: {},
      enhance: {},
      publish: {},
      refresh: {},
    },
    validation: {
      discover: { attempts: 0, last_exit_code: null },
      draft: { attempts: 0, last_exit_code: null },
      enhance: { attempts: 0, last_exit_code: null },
      publish: { attempts: 0, last_exit_code: null },
      refresh: { attempts: 0, last_exit_code: null },
    },
    history: [],
  };
}

function detectArticleTypeFromFile(file) {
  if (file.includes(`${path.sep}content${path.sep}reviews${path.sep}`) || file.includes('content/reviews/')) return 'review';
  if (file.includes(`${path.sep}content${path.sep}compare${path.sep}`) || file.includes('content/compare/')) return 'compare';
  return 'blog';
}

function defaultSearchIntent(articleType) {
  return articleType === 'blog' ? 'informational' : 'commercial investigation';
}

function inferPrimaryKeyword(frontmatter, articleType, articleId, fallbackSlug = '') {
  if (frontmatter.title) return String(frontmatter.title).toLowerCase();
  if (frontmatter.name) return `${String(frontmatter.name).toLowerCase()} ${articleType}`;
  if (fallbackSlug) return fallbackSlug.replace(/-/g, ' ');
  return articleId.replace(/-/g, ' ');
}

function inferAudience(frontmatter, articleType) {
  if (articleType === 'review') return `buyers evaluating ${frontmatter.name || 'this tool'} for real use`;
  if (articleType === 'compare') return 'buyers choosing between two tools for a real workflow';
  return 'readers researching tools in this category';
}

function inferAngle(frontmatter, articleType, articleId) {
  if (articleType === 'review') return `${frontmatter.name || articleId} review and buying decision`;
  if (articleType === 'compare') return frontmatter.verdict || `${articleId.replace(/-/g, ' ')} comparison`;
  return frontmatter.title || articleId.replace(/-/g, ' ');
}

function defaultRenderContract(articleType) {
  if (articleType === 'review') {
    return {
      auto_rendered: [
        { name: 'review_tldr' },
        { name: 'review_pros_cons_cards' },
        { name: 'review_primary_cta' },
      ],
      mdx_must_not_duplicate: ['review auto TLDR', 'manual CTA placeholders'],
    };
  }
  if (articleType === 'compare') {
    return {
      auto_rendered: [
        { name: 'compare_quick_table' },
        { name: 'compare_review_links' },
        { name: 'compare_cta_buttons' },
      ],
      mdx_must_not_duplicate: ['compare top summary table', 'manual CTA placeholders'],
    };
  }
  return {
    auto_rendered: [{ name: 'blog_related_review_cards' }],
    mdx_must_not_duplicate: ['related review card grid'],
  };
}

function inferCategory(frontmatter, articleType, repoRoot) {
  if (frontmatter.category) return String(frontmatter.category);
  if (articleType === 'compare' && frontmatter.toolA) {
    const reviewPath = path.join(repoRoot, 'content', 'reviews', `${frontmatter.toolA}.mdx`);
    if (fs.existsSync(reviewPath)) {
      const review = matter(fs.readFileSync(reviewPath, 'utf8')).data;
      return String(review.category || '');
    }
  }
  return '';
}

function loadExistingCanonical(dir) {
  const canonical = path.join(dir, 'brief.yaml');
  if (!fs.existsSync(canonical)) return null;
  try {
    return normalizeBrief(parseYamlFile(canonical));
  } catch {
    return null;
  }
}

function ensureObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : { ...fallback };
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeBrief(data) {
  const out = ensureObject(data);
  out.intent = ensureObject(out.intent);
  out.artifacts = ensureObject(out.artifacts);
  out.decisions = ensureObject(out.decisions);
  out.decisions.render_contract = ensureObject(out.decisions.render_contract);
  out.decisions.render_contract.auto_rendered = ensureArray(out.decisions.render_contract.auto_rendered);
  out.decisions.render_contract.mdx_must_not_duplicate = ensureArray(out.decisions.render_contract.mdx_must_not_duplicate);
  out.artifacts.target_files = ensureArray(out.artifacts.target_files);
  out.mode_outputs = ensureObject(out.mode_outputs);
  for (const mode of MODES) {
    out.mode_outputs[mode] = ensureObject(out.mode_outputs[mode]);
  }
  out.validation = ensureObject(out.validation);
  for (const mode of MODES) {
    out.validation[mode] = ensureObject(out.validation[mode], { attempts: 0, last_exit_code: null });
    if (!('attempts' in out.validation[mode])) out.validation[mode].attempts = 0;
    if (!('last_exit_code' in out.validation[mode])) out.validation[mode].last_exit_code = null;
  }
  out.history = ensureArray(out.history);
  return out;
}

function resolvePathSpec(keyPath) {
  const parts = keyPath.split('.');
  const [head, ...rest] = parts;
  if (MODES.has(head)) {
    return { path: ['mode_outputs', head, ...rest], kind: 'auto' };
  }
  if (head === 'intent') return { path: ['intent', ...rest], kind: 'scalar' };
  if (head === 'decisions') return { path: ['decisions', ...rest], kind: 'auto' };
  if (head === 'artifacts' && rest[0] === 'target_file') {
    return { path: ['artifacts', 'target_files'], kind: 'list' };
  }
  if (head === 'artifacts') return { path: ['artifacts', ...rest], kind: 'auto' };
  if (head === 'history') return { path: ['history'], kind: 'list' };
  if (head === 'validation') return { path: ['validation', ...rest], kind: 'auto' };
  if (head === 'backlink_targets_applied') return { path: ['backlink_targets_applied'], kind: 'list' };
  if (head === 'publish' && rest[0] === 'backlink_targets_applied') {
    return { path: ['mode_outputs', 'publish', 'backlink_targets_applied'], kind: 'list' };
  }
  if (head === 'status') return { path: ['status'], kind: 'scalar' };
  die(`unknown key path: ${keyPath}`);
}

function setNested(root, pathSpec, value) {
  let cursor = root;
  for (let i = 0; i < pathSpec.length - 1; i += 1) {
    const key = pathSpec[i];
    const next = cursor[key];
    if (!next || typeof next !== 'object' || Array.isArray(next)) cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[pathSpec[pathSpec.length - 1]] = value;
}

function appendNested(root, pathSpec, value) {
  let cursor = root;
  for (let i = 0; i < pathSpec.length - 1; i += 1) {
    const key = pathSpec[i];
    const next = cursor[key];
    if (!next || typeof next !== 'object' || Array.isArray(next)) cursor[key] = {};
    cursor = cursor[key];
  }
  const leaf = pathSpec[pathSpec.length - 1];
  if (!Array.isArray(cursor[leaf])) cursor[leaf] = [];
  cursor[leaf].push(value);
}

function briefValidationIssues(data) {
  const issues = [];
  if (data.brief_version !== 2) issues.push('brief_version must be 2');
  if (!data.run_id || typeof data.run_id !== 'string') issues.push('run_id missing or invalid');
  if (!data.article_id || typeof data.article_id !== 'string') issues.push('article_id missing or invalid');
  if (!MODES.has(data.current_mode)) issues.push('current_mode missing or invalid');
  if (!data.status || typeof data.status !== 'string') issues.push('status missing or invalid');
  if (!data.intent || typeof data.intent !== 'object' || Array.isArray(data.intent)) {
    issues.push('intent must be an object');
  } else {
    if (!ARTICLE_TYPES.has(data.intent.article_type)) issues.push('intent.article_type missing or invalid');
    for (const key of ['category', 'primary_keyword', 'search_intent', 'audience']) {
      if (!(key in data.intent)) issues.push(`intent.${key} missing`);
    }
  }
  if (!data.artifacts || typeof data.artifacts !== 'object' || Array.isArray(data.artifacts)) {
    issues.push('artifacts must be an object');
  } else if (!Array.isArray(data.artifacts.target_files)) {
    issues.push('artifacts.target_files must be an array');
  }
  if (!data.decisions || typeof data.decisions !== 'object' || Array.isArray(data.decisions)) {
    issues.push('decisions must be an object');
  } else {
    if (!('angle' in data.decisions)) issues.push('decisions.angle missing');
    if (!data.decisions.render_contract || typeof data.decisions.render_contract !== 'object' || Array.isArray(data.decisions.render_contract)) {
      issues.push('decisions.render_contract must be an object');
    } else {
      if (!Array.isArray(data.decisions.render_contract.auto_rendered)) issues.push('decisions.render_contract.auto_rendered must be an array');
      if (!Array.isArray(data.decisions.render_contract.mdx_must_not_duplicate)) issues.push('decisions.render_contract.mdx_must_not_duplicate must be an array');
    }
  }
  if (!data.mode_outputs || typeof data.mode_outputs !== 'object' || Array.isArray(data.mode_outputs)) {
    issues.push('mode_outputs must be an object');
  } else {
    for (const mode of MODES) {
      if (!(mode in data.mode_outputs)) issues.push(`mode_outputs.${mode} missing`);
      else if (!data.mode_outputs[mode] || typeof data.mode_outputs[mode] !== 'object' || Array.isArray(data.mode_outputs[mode])) {
        issues.push(`mode_outputs.${mode} must be an object`);
      }
    }
  }
  if (!data.validation || typeof data.validation !== 'object' || Array.isArray(data.validation)) {
    issues.push('validation must be an object');
  } else {
    for (const mode of MODES) {
      const record = data.validation[mode];
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        issues.push(`validation.${mode} missing or invalid`);
        continue;
      }
      if (typeof record.attempts !== 'number') issues.push(`validation.${mode}.attempts must be a number`);
      if (!('last_exit_code' in record)) issues.push(`validation.${mode}.last_exit_code missing`);
    }
  }
  if (!Array.isArray(data.history)) issues.push('history must be an array');
  if (data.current_mode === 'refresh' && (!data.parent_brief_id || data.parent_brief_id === 'null')) {
    issues.push('parent_brief_id required for refresh mode');
  }
  return issues;
}

function printValidationResult(label, file, issues) {
  if (issues.length === 0) {
    console.log(`✅ ${label}: ${file}`);
    return true;
  }
  console.log(`❌ ${label}: ${file}`);
  for (const issue of issues) {
    console.log(`   - ${issue}`);
  }
  return false;
}

function cmdInit(articleId, articleType) {
  if (!articleType) die('usage: briefctl init <article-id> <review|compare|blog>');
  if (!ARTICLE_TYPES.has(articleType)) die('type must be review, compare, or blog');
  const dir = resolveStateDir(articleId);
  ensureDir(dir);
  const brief = path.join(dir, 'brief.candidate.yaml');
  saveBrief(brief, makeInitialBrief(articleId, articleType));
  console.log(`✅ Created ${brief}`);
}

function cmdMode(articleId, mode) {
  if (!MODES.has(mode)) die(`invalid mode: ${mode}`);
  const dir = resolveStateDir(articleId);
  const brief = path.join(dir, 'brief.candidate.yaml');
  const data = normalizeBrief(loadBriefOrDie(brief));
  data.current_mode = mode;
  data.status = 'in_progress';
  if (mode === 'refresh' && (data.parent_brief_id == null || data.parent_brief_id === 'null')) {
    data.parent_brief_id = articleId;
  }
  saveBrief(brief, data);
  console.log(`✅ ${articleId}: current_mode → ${mode}`);
}

function cmdSet(articleId, keyPath, value) {
  if (!keyPath) die('usage: briefctl set <article-id> <key.path> <value>');
  const dir = resolveStateDir(articleId);
  const brief = path.join(dir, 'brief.candidate.yaml');
  const data = normalizeBrief(loadBriefOrDie(brief));
  const spec = resolvePathSpec(keyPath);
  if (spec.kind === 'list') {
    appendNested(data, spec.path, value);
  } else {
    setNested(data, spec.path, value);
  }
  saveBrief(brief, data);
  console.log(`✅ ${articleId}: ${keyPath} → ${value}`);
}

function cmdList(articleId, keyPath, value) {
  if (!value) die('usage: briefctl list <article-id> <key.path> <value>');
  const dir = resolveStateDir(articleId);
  const brief = path.join(dir, 'brief.candidate.yaml');
  const data = normalizeBrief(loadBriefOrDie(brief));
  const spec = resolvePathSpec(keyPath);
  appendNested(data, spec.path, value);
  saveBrief(brief, data);
  console.log(`✅ ${articleId}: appended '${value}' to ${keyPath}`);
}

function cmdCommit(articleId) {
  const dir = resolveStateDir(articleId);
  const candidate = path.join(dir, 'brief.candidate.yaml');
  const canonical = path.join(dir, 'brief.yaml');
  const data = normalizeBrief(loadBriefOrDie(candidate));
  const issues = briefValidationIssues(data);
  if (issues.length > 0) {
    console.error(`❌ Cannot commit invalid brief: ${candidate}`);
    for (const issue of issues) console.error(`   - ${issue}`);
    process.exit(1);
  }
  saveBrief(canonical, data);
  console.log(`✅ ${articleId}: brief.candidate.yaml → brief.yaml (committed)`);
}

function cmdShow(articleId) {
  const dir = resolveStateDir(articleId);
  const canonical = path.join(dir, 'brief.yaml');
  const candidate = path.join(dir, 'brief.candidate.yaml');
  const file = fs.existsSync(canonical) ? canonical : candidate;
  if (!fs.existsSync(file)) die(`no brief found for ${articleId}`);
  process.stdout.write(fs.readFileSync(file, 'utf8'));
}

function cmdInitFromFile(articleId, targetFile, requestedMode = 'draft') {
  const mode = requestedMode || 'draft';
  if (!MODES.has(mode)) die(`invalid mode: ${mode}`);
  const file = resolveContentInput(targetFile);
  const repoRoot = process.cwd();
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const articleType = detectArticleTypeFromFile(file);
  const relTarget = path.relative(repoRoot, file).replace(/\\/g, '/');
  const fallbackSlug = path.basename(file, '.mdx');
  const dir = resolveStateDir(articleId);
  ensureDir(dir);
  const existing = loadExistingCanonical(dir);
  const parentBriefId =
    mode === 'refresh'
      ? (existing?.run_id || existing?.article_id || `recovered-from-file:${articleId}`)
      : null;
  const brief = makeInitialBrief(articleId, articleType);
  brief.parent_brief_id = parentBriefId;
  brief.current_mode = mode;
  brief.intent.category = inferCategory(parsed.data, articleType, repoRoot);
  brief.intent.primary_keyword = inferPrimaryKeyword(parsed.data, articleType, articleId, fallbackSlug);
  brief.intent.search_intent = defaultSearchIntent(articleType);
  brief.intent.audience = inferAudience(parsed.data, articleType);
  brief.artifacts.target_files = [relTarget];
  brief.decisions.angle = inferAngle(parsed.data, articleType, articleId);
  brief.decisions.render_contract = defaultRenderContract(articleType);

  if (mode === 'refresh') {
    brief.mode_outputs.refresh = {
      refresh_reason: ['state_recovery'],
      changed_sections: [],
      stale_claims_removed: [],
      files_touched: [relTarget],
    };
  } else if (mode === 'draft') {
    brief.mode_outputs.draft = {
      target_file: relTarget,
      frontmatter_complete: true,
      structure_complete: true,
      known_gaps: [],
    };
  }

  const out = path.join(dir, 'brief.candidate.yaml');
  saveBrief(out, brief);
  console.log(`✅ Recovered ${out} from ${relTarget} (mode=${mode})`);
}

function cmdValidate(target) {
  const dirs = [];
  if (!target || target === '--all') {
    if (fs.existsSync(STATE_ROOT)) {
      for (const entry of fs.readdirSync(STATE_ROOT, { withFileTypes: true })) {
        if (entry.isDirectory()) dirs.push(path.join(STATE_ROOT, entry.name));
      }
    }
  } else {
    dirs.push(resolveStateDir(target));
  }

  if (dirs.length === 0) {
    console.log('ℹ️ No brief state directories found.');
    return;
  }

  let allValid = true;
  for (const dir of dirs) {
    console.log(`=== ${dir} ===`);
    let dirValid = true;
    for (const name of ['brief.candidate.yaml', 'brief.yaml']) {
      const file = path.join(dir, name);
      if (!fs.existsSync(file)) continue;
      try {
        const data = normalizeBrief(parseYamlFile(file));
        const issues = briefValidationIssues(data);
        dirValid = printValidationResult(name, file, issues) && dirValid;
      } catch (error) {
        dirValid = false;
        console.log(`❌ ${name}: ${file}`);
        console.log(`   - parse error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (!dirValid) allValid = false;
    if (dirValid) console.log('✅ directory valid\n');
    else console.log('⚠️ directory has invalid briefs\n');
  }

  if (!allValid) process.exit(1);
}

function usage() {
  console.log('Usage: briefctl <command> <article-id> [args...]');
  console.log('');
  console.log('Commands:');
  console.log('  init      <id> <review|compare|blog>   Create new brief.candidate.yaml');
  console.log('  mode      <id> <mode>                  Switch current_mode');
  console.log('  set       <id> <key.path> <value>      Set a scalar field');
  console.log('  list      <id> <key.path> <value>      Append to a list field');
  console.log('  commit    <id>                         Candidate → canonical (after validation)');
  console.log('  show      <id>                         Print brief to stdout');
  console.log('  validate  <id|--all>                  Validate existing brief files');
  console.log('  init-from-file <id> <target-file> [mode]  Seed brief from existing content');
  console.log('  recover   <id> <target-file>          Recover refresh brief from existing content');
  console.log('');
  console.log('Key paths:');
  console.log('  intent.<field>              article_type, category, primary_keyword, etc.');
  console.log('  decisions.angle             Editorial angle');
  console.log('  artifacts.target_file       Target MDX path (appends to target_files)');
  console.log('  discover.<field>            duplicate_check_status, serp_decision, hub_spoke_role');
  console.log('  draft.<field>               target_file, word_count, known_gaps');
  console.log('  enhance.<field>             ai_pattern_score, images_present, internal_links_count');
  console.log('  publish.<field>             article_check_status, build_status, delivery_ready, backlink_targets_applied (list)');
  console.log('  status                      in_progress, complete');
  console.log('  refresh.<field>             refresh_reason, files_touched (use list for arrays)');
  process.exit(1);
}

const command = process.argv[2];
const articleId = process.argv[3];
const arg3 = process.argv[4];
const arg4 = process.argv[5];
const arg5 = process.argv[6];

switch (command) {
  case 'init':
    cmdInit(articleId, arg3);
    break;
  case 'mode':
    cmdMode(articleId, arg3);
    break;
  case 'set':
    cmdSet(articleId, arg3, arg4 ?? '');
    break;
  case 'list':
    cmdList(articleId, arg3, arg4 ?? '');
    break;
  case 'commit':
    cmdCommit(articleId);
    break;
  case 'show':
    cmdShow(articleId);
    break;
  case 'validate':
    cmdValidate(articleId);
    break;
  case 'init-from-file':
    cmdInitFromFile(articleId, arg3, arg4 || 'draft');
    break;
  case 'recover':
    cmdInitFromFile(articleId, arg3, arg4 || 'refresh');
    break;
  default:
    usage();
}
