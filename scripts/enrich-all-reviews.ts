import fs from 'fs';
import path from 'path';

const enrich: Record<string, { pros: string[]; cons: string[]; bestFor: string[] }> = {
  'pika-2-0': {
    pros: ['Fast generation speed for short clips', 'User-friendly prompt interface', 'Good for social media content'],
    cons: ['Limited to shorter video lengths', 'Less control over fine details', 'Free tier has watermarks'],
    bestFor: ['Social media creators', 'Casual AI video experimentation', 'Quick concept prototyping'],
  },
  'luma-dream-machine': {
    pros: ['Fluid motion and vivid visuals', 'Fast concept iteration', 'Good for creative testing'],
    cons: ['Still in early access phases', 'Output can be unpredictable', 'Limited export options'],
    bestFor: ['Creative directors testing concepts', 'Storyboarding and pre-vis', 'Rapid ad prototype generation'],
  },
  haiper: {
    pros: ['Accessible pricing for beginners', 'Fast rendering speed', 'Stylized output for creative projects'],
    cons: ['Fewer advanced controls', 'Limited integration options', 'Output quality varies by prompt type'],
    bestFor: ['Social media teams', 'Indie creators', 'Marketers testing fast campaigns'],
  },
  invideo: {
    pros: ['Complete script-to-video workflow', 'Built-in stock media library', 'Good for marketing and publishing'],
    cons: ['Templates can feel generic', 'Advanced customization limited', 'Subscription required for HD export'],
    bestFor: ['Marketers producing ad content', 'Publishers needing quick video', 'Business users without editing skills'],
  },
  'deepbrain-ai': {
    pros: ['Professional avatar presenters', 'Strong enterprise security', 'Multilingual training content support'],
    cons: ['Higher price point', 'Limited avatar customization', 'Requires more setup than competitors'],
    bestFor: ['Enterprise training departments', 'Internal communications', 'Multilingual corporate content'],
  },
  'hour-one': {
    pros: ['Virtual presenters for corporate use', 'Streamlined learning content creation', 'Sales enablement features'],
    cons: ['Limited avatar styles', 'Niche use case focus', 'Smaller template library'],
    bestFor: ['Corporate learning teams', 'Sales enablement', 'Professional training videos'],
  },
  'elai': {
    pros: ['Easy avatar-led explainer creation', 'Good for product demos', 'Multilingual presentation support'],
    cons: ['Limited free tier', 'Smaller avatar selection', 'Export quality varies'],
    bestFor: ['Product marketing teams', 'Educational content creators', 'SaaS product demos'],
  },
  colossyan: {
    pros: ['Strong workplace learning focus', 'Good internal comms features', 'Faster training content turnaround'],
    cons: ['Niche enterprise focus', 'Less suitable for creative content', 'Learning curve for new users'],
    bestFor: ['L&D departments', 'Internal communications', 'Compliance training teams'],
  },
  'd-id': {
    pros: ['Unique talking avatar from still images', 'Personalized outreach at scale', 'Lightweight digital presenters'],
    cons: ['Avatar realism varies', 'Limited to talking-head format', 'Premium features cost more'],
    bestFor: ['Personalized marketing campaigns', 'Experimental brand content', 'Lightweight digital presenters'],
  },
  'capcut-international': {
    pros: ['All-in-one editor with AI features', 'Strong auto captions and subtitle styling', 'Massive template library'],
    cons: ['Privacy concerns in some regions', 'Watermark on free exports', 'Mobile experience better than desktop'],
    bestFor: ['Short-form video creators', 'Social media growth hackers', 'Template-driven content teams'],
  },
  'autosubtitle-io': {
    pros: ['Quick subtitle generation', 'Lightweight workflow', 'Good for accessibility compliance'],
    cons: ['Limited editing features', 'Fewer export format options', 'No advanced video editing'],
    bestFor: ['Accessibility-focused creators', 'Quick caption needs', 'Multilingual subtitle translation'],
  },
  subtitlebee: {
    pros: ['Social-ready caption styling', 'Translation support built in', 'Improves video accessibility'],
    cons: ['Limited to caption use case', 'Fewer editing features', 'Pricing adds up for heavy users'],
    bestFor: ['Social media caption styling', 'Multilingual content teams', 'Accessibility compliance'],
  },
  kapwing: {
    pros: ['Full browser-based editor', 'Good team collaboration tools', 'AI subtitle and resizing features'],
    cons: ['Free tier has watermarks', 'Performance depends on internet', 'Pro features need subscription'],
    bestFor: ['Distributed content teams', 'Collaborative video editing', 'Multi-format content repurposing'],
  },
  'happy-scribe': {
    pros: ['Trusted transcription accuracy', 'Translation support across markets', 'Good for media teams'],
    cons: ['Higher per-minute pricing', 'Focused on transcription, not editing', 'Turnaround time varies'],
    bestFor: ['Media and journalism teams', 'Educators captioning lectures', 'Multilingual content distribution'],
  },
  wisecut: {
    pros: ['Auto silence removal saves time', 'Good talking-head editing', 'Streamlined subtitle creation'],
    cons: ['Limited to talking-head format', 'Fewer creative editing tools', 'Not suitable for all video types'],
    bestFor: ['Talking-head creators', 'Educational video editors', 'Podcast video production'],
  },
  'remini-video': {
    pros: ['Restores facial detail well', 'Mobile-friendly workflow', 'Fast enhancement for social clips'],
    cons: ['Less control than desktop tools', 'Quality depends on source footage', 'Subscription for full features'],
    bestFor: ['Mobile content creators', 'Quick social media enhancement', 'Archival clip restoration'],
  },
  'hitpaw-video-enhancer': {
    pros: ['Good upscaling for low-res clips', 'User-friendly interface', 'Fast processing for short clips'],
    cons: ['Limited advanced controls', 'Results vary by source quality', 'Subscription pricing model'],
    bestFor: ['E-commerce product videos', 'Casual video editors', 'Quick quality improvements'],
  },
  'avclabs-video-enhancer-ai': {
    pros: ['Strong face refinement features', 'Good denoising and color improvement', 'Resolution upscaling works well'],
    cons: ['Processing can be slow', 'Higher system requirements', 'UI could be more intuitive'],
    bestFor: ['Video restoration projects', 'Content teams upgrading archives', 'Editors needing fine detail work'],
  },
  'vmake-ai-video-enhancer': {
    pros: ['Designed for e-commerce workflows', 'Good product video sharpening', 'Lightweight and easy to use'],
    cons: ['Limited to product/ecommerce use case', 'Fewer creative features', 'Newer tool with smaller community'],
    bestFor: ['E-commerce sellers', 'Product marketing teams', 'Social commerce content'],
  },
  'airbrush-video-enhancer': {
    pros: ['Quick visual cleanup for social clips', 'Easy clarity improvement', 'Casual-creator friendly'],
    cons: ['Limited advanced enhancement', 'Less suitable for pro workflows', 'Fewer export format options'],
    bestFor: ['Casual social media creators', 'Quick content polish', 'Fast-moving social teams'],
  },
};

const dir = path.join(__dirname, '../content/reviews');

for (const [slug, data] of Object.entries(enrich)) {
  const fp = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(fp)) {
    console.log(`SKIP: ${slug}.mdx (not found)`);
    continue;
  }
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
