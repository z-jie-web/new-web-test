# Content Workflow Audit - 2026-06-17

Audit scope: `content/reviews/*.mdx`, `content/compare/*.mdx`, and `content/blog/*.mdx`.

Strict completed workflow definition:

- `~/.claude/state/toolporto-writer/<article-id>/brief.yaml` exists and parses.
- `current_mode: publish`
- `status: complete`
- `mode_outputs.publish.delivery_ready: true`

Summary:

| Status | Count |
| --- | ---: |
| Complete publish-ready | 25 |
| Has canonical brief, but not complete publish-ready | 29 |
| Invalid canonical brief | 1 |
| Missing canonical brief | 13 |
| Missing state directory | 147 |
| Total content articles | 215 |

By article type:

| Status | Blog | Compare | Review |
| --- | ---: | ---: | ---: |
| Complete publish-ready | 1 | 9 | 15 |
| Has canonical brief, but not complete publish-ready | 6 | 11 | 12 |
| Invalid canonical brief | 1 | 0 | 0 |
| Missing canonical brief | 11 | 0 | 2 |
| Missing state directory | 6 | 79 | 62 |

## Missing State Directory

These articles have content files but no matching state directory under `~/.claude/state/toolporto-writer/<article-id>/`.

### Blog

- `content/blog/ai-tools-cost-comparison.mdx`
- `content/blog/ai-video-generation-models.mdx`
- `content/blog/ai-video-vs-traditional-editing.mdx`
- `content/blog/elevenlabs-vs-microsoft-ai-voice.mdx`
- `content/blog/midjourney-alternatives.mdx`
- `content/blog/what-is-ai-face-swap.mdx`

### Compare

- `content/compare/adobe-firefly-vs-dall-e-3.mdx`
- `content/compare/adobe-firefly-vs-leonardo-ai.mdx`
- `content/compare/adobe-firefly-vs-midjourney.mdx`
- `content/compare/adobe-firefly-vs-stable-diffusion.mdx`
- `content/compare/capcut-international-vs-captions.mdx`
- `content/compare/capcut-international-vs-descript.mdx`
- `content/compare/capcut-international-vs-happy-scribe.mdx`
- `content/compare/capcut-international-vs-kapwing.mdx`
- `content/compare/capcut-international-vs-veed.mdx`
- `content/compare/captions-vs-descript.mdx`
- `content/compare/captions-vs-happy-scribe.mdx`
- `content/compare/captions-vs-kapwing.mdx`
- `content/compare/captions-vs-veed.mdx`
- `content/compare/copy-ai-vs-writesonic.mdx`
- `content/compare/d-id-vs-heygen.mdx`
- `content/compare/d-id-vs-synthesia.mdx`
- `content/compare/dall-e-3-vs-leonardo-ai.mdx`
- `content/compare/dall-e-3-vs-stable-diffusion.mdx`
- `content/compare/deepswapper-vs-facefusion.mdx`
- `content/compare/deepswapper-vs-facemagic.mdx`
- `content/compare/deepswapper-vs-reface.mdx`
- `content/compare/deepswapper-vs-remaker-face-swap.mdx`
- `content/compare/deepswapper-vs-swapface.mdx`
- `content/compare/descript-vs-happy-scribe.mdx`
- `content/compare/descript-vs-kapwing.mdx`
- `content/compare/descript-vs-veed.mdx`
- `content/compare/elevenlabs-vs-fish-audio.mdx`
- `content/compare/elevenlabs-vs-murf-ai.mdx`
- `content/compare/elevenlabs-vs-speechify.mdx`
- `content/compare/facefusion-vs-reface.mdx`
- `content/compare/facemagic-vs-facefusion.mdx`
- `content/compare/facemagic-vs-reface.mdx`
- `content/compare/fish-audio-vs-murf-ai.mdx`
- `content/compare/fish-audio-vs-speechify.mdx`
- `content/compare/happy-scribe-vs-kapwing.mdx`
- `content/compare/heygen-vs-synthesia.mdx`
- `content/compare/invideo-ai-vs-kling-ai.mdx`
- `content/compare/invideo-ai-vs-luma-dream-machine.mdx`
- `content/compare/invideo-ai-vs-pika-2-0.mdx`
- `content/compare/invideo-ai-vs-pixverse.mdx`
- `content/compare/invideo-ai-vs-runway-gen-3.mdx`
- `content/compare/invideo-ai-vs-topaz-video-ai.mdx`
- `content/compare/jasper-vs-copy-ai.mdx`
- `content/compare/jasper-vs-notion-ai.mdx`
- `content/compare/jasper-vs-writesonic.mdx`
- `content/compare/kling-ai-vs-luma-dream-machine.mdx`
- `content/compare/kling-ai-vs-pika-2-0.mdx`
- `content/compare/kling-ai-vs-pixverse.mdx`
- `content/compare/kling-ai-vs-runway-gen-3.mdx`
- `content/compare/kling-ai-vs-topaz-video-ai.mdx`
- `content/compare/leonardo-ai-vs-midjourney.mdx`
- `content/compare/leonardo-ai-vs-stable-diffusion.mdx`
- `content/compare/luma-dream-machine-vs-pika-2-0.mdx`
- `content/compare/luma-dream-machine-vs-pixverse.mdx`
- `content/compare/luma-dream-machine-vs-runway-gen-3.mdx`
- `content/compare/luma-dream-machine-vs-topaz-video-ai.mdx`
- `content/compare/midjourney-vs-dall-e-3.mdx`
- `content/compare/midjourney-vs-stable-diffusion.mdx`
- `content/compare/murf-ai-vs-play-ht.mdx`
- `content/compare/pika-2-0-vs-pixverse.mdx`
- `content/compare/pika-2-0-vs-topaz-video-ai.mdx`
- `content/compare/pixverse-vs-runway-gen-3.mdx`
- `content/compare/pixverse-vs-topaz-video-ai.mdx`
- `content/compare/remaker-face-swap-vs-facefusion.mdx`
- `content/compare/remaker-face-swap-vs-facemagic.mdx`
- `content/compare/remaker-face-swap-vs-reface.mdx`
- `content/compare/remaker-face-swap-vs-swapface.mdx`
- `content/compare/runway-gen-3-vs-pika-2-0.mdx`
- `content/compare/runway-gen-3-vs-topaz-video-ai.mdx`
- `content/compare/stable-audio-vs-aiva.mdx`
- `content/compare/suno-vs-stable-audio.mdx`
- `content/compare/suno-vs-udio.mdx`
- `content/compare/swapface-vs-facefusion.mdx`
- `content/compare/swapface-vs-facemagic.mdx`
- `content/compare/swapface-vs-reface.mdx`
- `content/compare/synthesia-vs-heygen.mdx`
- `content/compare/veed-vs-happy-scribe.mdx`
- `content/compare/veed-vs-kapwing.mdx`
- `content/compare/writesonic-vs-notion-ai.mdx`

### Review

- `content/reviews/adobe-firefly.mdx`
- `content/reviews/aiva.mdx`
- `content/reviews/capcut-international.mdx`
- `content/reviews/captions.mdx`
- `content/reviews/cartesia.mdx`
- `content/reviews/claude.mdx`
- `content/reviews/cliploft.mdx`
- `content/reviews/colossyan.mdx`
- `content/reviews/copy-ai.mdx`
- `content/reviews/cursor.mdx`
- `content/reviews/d-id.mdx`
- `content/reviews/dall-e-3.mdx`
- `content/reviews/deepswapper.mdx`
- `content/reviews/descript.mdx`
- `content/reviews/elevenlabs.mdx`
- `content/reviews/facefusion.mdx`
- `content/reviews/facemagic.mdx`
- `content/reviews/fathom.mdx`
- `content/reviews/fireflies-ai.mdx`
- `content/reviews/fish-audio.mdx`
- `content/reviews/flux.mdx`
- `content/reviews/github-copilot.mdx`
- `content/reviews/google-gemini-avatar.mdx`
- `content/reviews/google-gemini-omni.mdx`
- `content/reviews/happy-scribe.mdx`
- `content/reviews/heygen.mdx`
- `content/reviews/ideogram.mdx`
- `content/reviews/invideo-ai.mdx`
- `content/reviews/jasper.mdx`
- `content/reviews/kapwing.mdx`
- `content/reviews/kling-ai.mdx`
- `content/reviews/leonardo-ai.mdx`
- `content/reviews/luma-dream-machine.mdx`
- `content/reviews/microsoft-mai-voice-2.mdx`
- `content/reviews/midjourney.mdx`
- `content/reviews/murf-ai.mdx`
- `content/reviews/notion-ai.mdx`
- `content/reviews/otter-ai.mdx`
- `content/reviews/perplexity.mdx`
- `content/reviews/pika-2-0.mdx`
- `content/reviews/pixverse.mdx`
- `content/reviews/play-ht.mdx`
- `content/reviews/reface.mdx`
- `content/reviews/remaker-face-swap.mdx`
- `content/reviews/resemble-ai.mdx`
- `content/reviews/runway-gen-3.mdx`
- `content/reviews/rytr.mdx`
- `content/reviews/soundraw.mdx`
- `content/reviews/speechify.mdx`
- `content/reviews/stable-audio.mdx`
- `content/reviews/stable-diffusion.mdx`
- `content/reviews/suno.mdx`
- `content/reviews/swapface.mdx`
- `content/reviews/synthesia.mdx`
- `content/reviews/tavus.mdx`
- `content/reviews/topaz-video-ai.mdx`
- `content/reviews/udio.mdx`
- `content/reviews/veed.mdx`
- `content/reviews/veo-3-1.mdx`
- `content/reviews/wellsaid-labs.mdx`
- `content/reviews/whisperx.mdx`
- `content/reviews/writesonic.mdx`

## Missing Or Invalid Canonical Brief

These articles have a state directory, but no usable `brief.yaml`.

- `content/blog/best-ai-avatar-generators.mdx` - missing canonical brief
- `content/blog/best-ai-coding-tools.mdx` - missing canonical brief
- `content/blog/best-ai-image-generators.mdx` - missing canonical brief
- `content/blog/best-ai-meeting-transcription-tools.mdx` - missing canonical brief
- `content/blog/best-ai-music-generators.mdx` - missing canonical brief
- `content/blog/best-ai-photo-editors-for-social-media.mdx` - missing canonical brief
- `content/blog/best-ai-subtitle-tools.mdx` - missing canonical brief
- `content/blog/best-ai-video-generators.mdx` - missing canonical brief
- `content/blog/best-ai-writing-tools.mdx` - missing canonical brief
- `content/blog/best-face-swap-tools-for-creators.mdx` - invalid canonical brief
- `content/blog/best-face-swap-tools.mdx` - missing canonical brief
- `content/blog/google-gemini-omni-ai-video.mdx` - missing canonical brief
- `content/reviews/chatgpt.mdx` - missing canonical brief
- `content/reviews/gamma.mdx` - missing canonical brief

## Has Canonical Brief But Not Complete Publish-Ready

These have a parseable canonical `brief.yaml`, but do not satisfy the strict completed workflow definition.

- `content/blog/add-ai-subtitles-to-tiktok.mdx`
- `content/blog/best-ai-chatbots.mdx`
- `content/blog/best-ai-voice-generators.mdx`
- `content/blog/elevenlabs-for-podcasters.mdx`
- `content/blog/how-to-use-gamma-to-create-a-pitch-deck.mdx`
- `content/blog/how-to-use-heygen-for-product-demo-videos.mdx`
- `content/compare/amazon-q-developer-vs-github-copilot.mdx`
- `content/compare/claude-code-vs-cursor.mdx`
- `content/compare/claude-code-vs-github-copilot.mdx`
- `content/compare/cursor-vs-github-copilot.mdx`
- `content/compare/deepseek-vs-chatgpt.mdx`
- `content/compare/deepseek-vs-claude.mdx`
- `content/compare/elevenlabs-vs-play-ht.mdx`
- `content/compare/gamma-vs-beautiful-ai.mdx`
- `content/compare/grok-vs-chatgpt.mdx`
- `content/compare/perplexity-vs-chatgpt.mdx`
- `content/compare/perplexity-vs-deepseek.mdx`
- `content/reviews/amazon-q-developer.mdx`
- `content/reviews/beautiful-ai.mdx`
- `content/reviews/bolt-new.mdx`
- `content/reviews/claude-code.mdx`
- `content/reviews/deepseek.mdx`
- `content/reviews/elai.mdx`
- `content/reviews/grok.mdx`
- `content/reviews/quillbot.mdx`
- `content/reviews/runwayml.mdx`
- `content/reviews/soundful.mdx`
- `content/reviews/sudowrite.mdx`
- `content/reviews/v0.mdx`
