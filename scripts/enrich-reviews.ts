import fs from 'fs';
import path from 'path';

const enrich: Record<string, { pros: string[]; cons: string[]; bestFor: string[] }> = {
  sora: {
    pros: ['Highest quality cinematic output', 'Excellent scene continuity and realism', 'Backed by OpenAI research and infrastructure'],
    cons: ['Limited public availability', 'No fine-grained editing controls yet', 'High computational cost per generation'],
    bestFor: ['Filmmakers exploring AI-assisted production', 'Brands wanting premium concept videos', 'Creative agencies prototyping high-end visuals'],
  },
  'runway-gen-3': {
    pros: ['Full creative suite beyond just video gen', 'Strong motion control and stylization', 'Fast iteration for commercial workflows'],
    cons: ['Subscription can get expensive', 'Learning curve for advanced features', 'Output quality varies by prompt complexity'],
    bestFor: ['Marketing teams producing campaign content', 'Creators needing end-to-end video workflow', 'Agencies doing rapid creative experimentation'],
  },
  'kling-ai': {
    pros: ['Realistic motion rendering', 'Strong prompt adherence', 'Rapidly improving model quality'],
    cons: ['Limited to certain regions', 'Queue times during peak usage', 'Fewer integrations than established tools'],
    bestFor: ['Creators exploring next-gen AI video', 'Advertisers wanting realistic motion', 'Content teams comparing video models'],
  },
  synthesia: {
    pros: ['Professional avatar quality', '140+ language support', 'Enterprise-grade security and compliance'],
    cons: ['Higher price point for individuals', 'Limited avatar customization', 'Requires scripted content — not real-time'],
    bestFor: ['Corporate training at scale', 'Multilingual marketing content', 'Internal communications teams'],
  },
  heygen: {
    pros: ['Excellent face-driven localization', 'Quick avatar creation from selfie videos', 'Strong API for programmatic video gen'],
    cons: ['Avatar quality varies with source video', 'Premium features require higher tiers', 'Watermark on free plan'],
    bestFor: ['Global brands localizing content', 'E-commerce product videos', 'Sales outreach personalization'],
  },
  captions: {
    pros: ['Best-in-class auto captions for short-form', 'Built-in video editing tools', 'Excellent for TikTok/Reels/Shorts workflow'],
    cons: ['Primarily focused on short-form content', 'AI dubbing quality varies by language', 'Mobile-first — desktop experience secondary'],
    bestFor: ['Short-form video creators', 'Social media teams', 'Content creators optimizing for retention'],
  },
  veed: {
    pros: ['No download required — fully browser-based', 'Intuitive subtitle and caption editor', 'Good collaboration features for teams'],
    cons: ['Free plan has watermarks', 'Advanced features need Pro subscription', 'Performance depends on internet speed'],
    bestFor: ['Small teams doing remote video work', 'Creators needing quick caption edits', 'Marketers repurposing content for social'],
  },
  descript: {
    pros: ['Revolutionary transcript-based editing', 'All-in-one: edit, record, transcribe, publish', 'Excellent for podcasts and tutorials'],
    cons: ['Overkill for simple clip editing', 'Steep learning curve for new users', 'AI voice cloning raises ethical concerns'],
    bestFor: ['Podcasters and video essayists', 'Tutorial and course creators', 'Teams repurposing long-form content'],
  },
  'topaz-video-ai': {
    pros: ['Industry-leading upscaling quality', 'Powerful denoising and sharpening', 'Frame interpolation for smooth slow-mo'],
    cons: ['Expensive one-time purchase', 'Requires powerful GPU', 'Processing can be slow on large files'],
    bestFor: ['Professional video editors', 'Archival footage restoration', 'Filmmakers upscaling for 4K/8K delivery'],
  },
  pixverse: {
    pros: ['Fast generation speed', 'Strong anime and stylized outputs', 'Active community and frequent updates'],
    cons: ['Less realistic than top-tier models', 'Limited to shorter clip durations', 'Fewer professional export options'],
    bestFor: ['Social media content creators', 'Anime and stylized video fans', 'Casual AI video experimentation'],
  },
};

const dir = path.join(__dirname, '../content/reviews');

for (const [slug, data] of Object.entries(enrich)) {
  const fp = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf-8');

  content = content.replace(
    'pros: []',
    `pros: [${data.pros.map((p) => `"${p}"`).join(', ')}]`
  );
  content = content.replace(
    'cons: []',
    `cons: [${data.cons.map((c) => `"${c}"`).join(', ')}]`
  );
  content = content.replace(
    'bestFor: []',
    `bestFor: [${data.bestFor.map((b) => `"${b}"`).join(', ')}]`
  );

  fs.writeFileSync(fp, content);
  console.log(`Enriched: ${slug}.mdx`);
}
console.log('Done!');
