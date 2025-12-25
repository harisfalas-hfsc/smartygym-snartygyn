// Portability & Self-Hosting Documentation Content

export interface DocSection {
  type: 'heading' | 'paragraph' | 'bullet' | 'code';
  level?: number;
  content: string;
}

export const portabilityDocContent: DocSection[] = [
  { type: 'heading', level: 1, content: 'SmartyGym Portability & Self-Hosting Guide' },
  { type: 'paragraph', content: 'This document explains how to export, migrate, and self-host your SmartyGym application if you decide to move away from Lovable.' },
  
  // Section 1: Source Code Export
  { type: 'heading', level: 2, content: '1. Source Code Export' },
  { type: 'paragraph', content: 'You own 100% of your source code. It can be exported at any time.' },
  { type: 'heading', level: 3, content: 'Option A: GitHub Sync (Recommended)' },
  { type: 'bullet', content: 'Go to Lovable → Project Settings → GitHub' },
  { type: 'bullet', content: 'Connect your GitHub account and create/select a repository' },
  { type: 'bullet', content: 'All changes are automatically synced to your repo' },
  { type: 'bullet', content: 'Clone locally: git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git' },
  { type: 'heading', level: 3, content: 'Option B: Manual Download' },
  { type: 'bullet', content: 'Use the Lovable export/download feature in project settings' },
  { type: 'bullet', content: 'Download as ZIP and extract locally' },
  { type: 'heading', level: 3, content: 'What\'s Included' },
  { type: 'bullet', content: 'Complete React + TypeScript + Vite frontend' },
  { type: 'bullet', content: 'All Supabase Edge Functions (in supabase/functions/)' },
  { type: 'bullet', content: 'Database migration files (in supabase/migrations/)' },
  { type: 'bullet', content: 'All configuration files (tailwind, vite, tsconfig, etc.)' },

  // Section 2: Self-Host Frontend
  { type: 'heading', level: 2, content: '2. Self-Hosting the Frontend' },
  { type: 'paragraph', content: 'The frontend is a standard Vite React app that can be deployed anywhere.' },
  { type: 'heading', level: 3, content: 'Build Commands' },
  { type: 'code', content: '# Install dependencies\nnpm install\n\n# Build for production\nnpm run build\n\n# Output folder: dist/' },
  { type: 'heading', level: 3, content: 'Deployment Options' },
  { type: 'bullet', content: 'Vercel: Connect GitHub repo, auto-deploys on push' },
  { type: 'bullet', content: 'Netlify: Drag & drop dist/ folder or connect GitHub' },
  { type: 'bullet', content: 'AWS S3 + CloudFront: Upload dist/ to S3, serve via CloudFront' },
  { type: 'bullet', content: 'GoDaddy/cPanel: Upload dist/ contents to public_html folder' },
  { type: 'bullet', content: 'Self-hosted (nginx/Apache): Serve dist/ folder with SPA fallback config' },
  { type: 'heading', level: 3, content: 'Environment Variables Needed' },
  { type: 'code', content: 'VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key\nVITE_SUPABASE_PROJECT_ID=your_project_id' },

  // Section 3: Database & Auth Migration
  { type: 'heading', level: 2, content: '3. Database & Authentication Migration' },
  { type: 'paragraph', content: 'SmartyGym uses Supabase (open-source, PostgreSQL-based). You have full control of your data.' },
  { type: 'heading', level: 3, content: 'Option A: Keep Using Supabase (Easiest)' },
  { type: 'bullet', content: 'Create your own Supabase account at supabase.com' },
  { type: 'bullet', content: 'Create a new project' },
  { type: 'bullet', content: 'Run migration files from supabase/migrations/ in order' },
  { type: 'bullet', content: 'Export data from current project, import to new one' },
  { type: 'bullet', content: 'Update environment variables to point to new project' },
  { type: 'heading', level: 3, content: 'Option B: Self-Host Supabase' },
  { type: 'bullet', content: 'Supabase can be self-hosted using Docker' },
  { type: 'bullet', content: 'See: https://supabase.com/docs/guides/self-hosting' },
  { type: 'bullet', content: 'Run the same migrations on your self-hosted instance' },
  { type: 'heading', level: 3, content: 'Data Export Checklist' },
  { type: 'bullet', content: 'Tables: Export all tables from Database → Tables' },
  { type: 'bullet', content: 'Storage: Download files from Storage buckets (avatars, blog-images, etc.)' },
  { type: 'bullet', content: 'Users: User accounts are in auth.users (requires admin access to export)' },
  { type: 'bullet', content: 'RLS Policies: Included in migration files' },
  { type: 'bullet', content: 'Edge Functions: Already in your codebase (supabase/functions/)' },

  // Section 4: AI Features Migration
  { type: 'heading', level: 2, content: '4. AI Features Migration' },
  { type: 'paragraph', content: 'SmartyGym uses AI for workout generation, training programs, blog articles, and WOD auto-generation. Here\'s what you need to know:' },
  { type: 'heading', level: 3, content: 'Current Setup' },
  { type: 'bullet', content: 'AI calls go through Lovable\'s AI Gateway (no API key needed while on Lovable)' },
  { type: 'bullet', content: 'Uses Google Gemini models for generation' },
  { type: 'bullet', content: 'All prompts and logic are in your edge functions' },
  { type: 'heading', level: 3, content: 'Migration Steps' },
  { type: 'bullet', content: '1. Get your own Google AI API key from ai.google.dev (or OpenAI key)' },
  { type: 'bullet', content: '2. Add the API key to your Supabase secrets' },
  { type: 'bullet', content: '3. Update edge functions to call the AI provider directly instead of Lovable gateway' },
  { type: 'heading', level: 3, content: 'Edge Functions to Update' },
  { type: 'bullet', content: 'generate-workout-of-day (WOD auto-generation)' },
  { type: 'bullet', content: 'generate-training-program (AI program creation)' },
  { type: 'bullet', content: 'smarty-coach (AI chatbot)' },
  { type: 'bullet', content: 'generate-blog-image, generate-workout-image, generate-program-image' },
  { type: 'bullet', content: 'generate-daily-ritual (Smarty Rituals)' },
  { type: 'heading', level: 3, content: 'Example: Direct Google AI Call' },
  { type: 'code', content: '// Before (Lovable Gateway)\nconst response = await fetch("https://api.lovable.dev/ai/...", {...});\n\n// After (Direct Google AI)\nimport { GoogleGenerativeAI } from "@google/generative-ai";\nconst genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_API_KEY"));\nconst model = genAI.getGenerativeModel({ model: "gemini-pro" });\nconst result = await model.generateContent(prompt);' },
  { type: 'paragraph', content: 'The prompts, logic, and formatting remain exactly the same. Only the API call method changes.' },

  // Section 5: Cron Jobs Migration
  { type: 'heading', level: 2, content: '5. Cron Jobs / Scheduled Tasks' },
  { type: 'paragraph', content: 'SmartyGym uses Supabase pg_cron for scheduled tasks.' },
  { type: 'heading', level: 3, content: 'Current Scheduled Jobs' },
  { type: 'bullet', content: 'WOD Generation: Runs daily to create Workout of the Day' },
  { type: 'bullet', content: 'Scheduled Notifications: Runs every 10 minutes' },
  { type: 'bullet', content: 'Renewal Reminders: Runs daily at 9 AM' },
  { type: 'bullet', content: 'Checkin Reminders: Runs on schedule' },
  { type: 'heading', level: 3, content: 'Migration Options' },
  { type: 'bullet', content: 'Keep pg_cron: If using Supabase, pg_cron works the same way' },
  { type: 'bullet', content: 'External scheduler: Use AWS CloudWatch Events, GitHub Actions, or cron on your server' },
  { type: 'bullet', content: 'Each job just calls an edge function endpoint via HTTP POST' },

  // Section 6: What Happens on Cancellation
  { type: 'heading', level: 2, content: '6. What Happens If You Cancel Lovable Subscription' },
  { type: 'heading', level: 3, content: 'What You Keep' },
  { type: 'bullet', content: '✓ Full source code (if synced to GitHub)' },
  { type: 'bullet', content: '✓ All database data and schema' },
  { type: 'bullet', content: '✓ All uploaded files/images' },
  { type: 'bullet', content: '✓ Complete edge function code' },
  { type: 'heading', level: 3, content: 'What Stops' },
  { type: 'bullet', content: '✗ Lovable-hosted deployment (your .lovable.app URL)' },
  { type: 'bullet', content: '✗ Lovable AI Gateway access (need your own API keys)' },
  { type: 'bullet', content: '✗ Lovable Cloud features' },
  { type: 'heading', level: 3, content: 'Before Canceling Checklist' },
  { type: 'bullet', content: '□ Sync code to GitHub' },
  { type: 'bullet', content: '□ Export all database tables' },
  { type: 'bullet', content: '□ Download storage bucket files' },
  { type: 'bullet', content: '□ Set up your own Supabase project' },
  { type: 'bullet', content: '□ Obtain AI API keys (Google AI or OpenAI)' },
  { type: 'bullet', content: '□ Deploy frontend to your chosen host' },
  { type: 'bullet', content: '□ Update DNS/domain to point to new deployment' },
  { type: 'bullet', content: '□ Test all features work with new setup' },

  // Section 7: Tech Stack Summary
  { type: 'heading', level: 2, content: '7. Technology Stack Summary' },
  { type: 'paragraph', content: 'Everything uses open-source, industry-standard technologies:' },
  { type: 'bullet', content: 'Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui' },
  { type: 'bullet', content: 'Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)' },
  { type: 'bullet', content: 'AI: Google Gemini (can substitute with OpenAI GPT)' },
  { type: 'bullet', content: 'Payments: Stripe (API keys in your Supabase secrets)' },
  { type: 'bullet', content: 'Emails: Resend (API key in your Supabase secrets)' },
  { type: 'paragraph', content: 'You are NOT locked into any proprietary platform. The entire stack is portable and self-hostable.' },

  // Section 8: Support & Resources
  { type: 'heading', level: 2, content: '8. Resources & Documentation' },
  { type: 'bullet', content: 'Lovable Self-Hosting Guide: https://docs.lovable.dev/tips-tricks/self-hosting' },
  { type: 'bullet', content: 'Supabase Self-Hosting: https://supabase.com/docs/guides/self-hosting' },
  { type: 'bullet', content: 'Supabase Migration Guide: https://supabase.com/docs/guides/migrations' },
  { type: 'bullet', content: 'Google AI Platform: https://ai.google.dev/' },
  { type: 'bullet', content: 'Vite Deployment: https://vitejs.dev/guide/static-deploy.html' },
];

// Plain text version for download
export const getPortabilityDocText = (): string => {
  const lines: string[] = [];
  
  for (const section of portabilityDocContent) {
    if (section.type === 'heading') {
      if (section.level === 1) {
        lines.push('═'.repeat(70));
        lines.push(section.content.toUpperCase());
        lines.push('═'.repeat(70));
        lines.push('');
      } else if (section.level === 2) {
        lines.push('');
        lines.push('─'.repeat(50));
        lines.push(section.content);
        lines.push('─'.repeat(50));
      } else {
        lines.push('');
        lines.push(`### ${section.content}`);
      }
    } else if (section.type === 'paragraph') {
      lines.push(section.content);
      lines.push('');
    } else if (section.type === 'bullet') {
      lines.push(`  • ${section.content}`);
    } else if (section.type === 'code') {
      lines.push('');
      lines.push('```');
      lines.push(section.content);
      lines.push('```');
      lines.push('');
    }
  }
  
  lines.push('');
  lines.push('─'.repeat(70));
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('SmartyGym - You Own Your Code');
  lines.push('─'.repeat(70));
  
  return lines.join('\n');
};
