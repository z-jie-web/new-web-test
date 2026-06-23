/**
 * Author profiles for EEAT signals.
 *
 * Each author gets a dedicated page at /author/<slug> showing all their articles.
 * Google uses this data (via JSON-LD Person schema) to verify real human authorship.
 */

export interface AuthorProfile {
  slug: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export const AUTHORS: Record<string, AuthorProfile> = {
  jack: {
    slug: "jack",
    name: "Jack",
    title: "Founder & Lead Reviewer, ToolPorto",
    bio: "Jack has spent the last 5 years testing and reviewing software tools — from AI video generators to code assistants. Every review on ToolPorto is based on hands-on testing: he signs up for each tool, runs real tasks, and compares alternatives side-by-side. No press releases, no marketing copy. If a tool is overhyped, he'll tell you.",
    expertise: [
      "AI Video Generation",
      "AI Image Generation",
      "AI Voice & Audio",
      "AI Chatbots & LLMs",
      "AI Coding Tools",
      "AI Avatars & Face Swap",
      "AI Subtitles & Transcription",
      "AI Writing Tools",
      "AI Music Generation",
      "AI Research Assistants",
    ],
  },
};

export function getAuthor(slug: string): AuthorProfile | null {
  return AUTHORS[slug] ?? null;
}

export function getAllAuthors(): AuthorProfile[] {
  return Object.values(AUTHORS);
}

/**
 * All content categories map to jack (solo founder).
 */
export const CATEGORY_AUTHOR_MAP: Record<string, string> = {
  "ai-chatbots": "jack",
  "ai-coding": "jack",
  "ai-writing": "jack",
  "ai-research": "jack",
  "video-generation": "jack",
  "ai-image": "jack",
  "ai-voice": "jack",
  "ai-avatars": "jack",
  "face-swap": "jack",
  "ai-subtitles": "jack",
  "ai-music": "jack",
  "ai-photo": "jack",
  "ai-photo-editing": "jack",
  "ai-meeting": "jack",
  "ai-presentation": "jack",
};
