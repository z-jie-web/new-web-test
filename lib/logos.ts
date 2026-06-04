import fs from 'fs';
import path from 'path';

const LOGO_DIR = path.join(process.cwd(), 'public', 'logos');
const LOGO_EXTENSIONS = ['png', 'svg'] as const;

export function getLogoPath(slug: string): string | null {
  for (const ext of LOGO_EXTENSIONS) {
    const filePath = path.join(LOGO_DIR, `${slug}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `/logos/${slug}.${ext}`;
    }
  }

  return null;
}
