import { describe, expect, it } from 'vitest';
import { normalizeWorkoutHtml } from './htmlNormalizer';

describe('normalizeWorkoutHtml exercise bullet consistency', () => {
  it('absorbs multiple exercise paragraphs after a list into the same bullet list', () => {
    const input = '<p class="tiptap-paragraph">⚡ <strong><u>Finisher (AMRAP)</u></strong></p><p class="tiptap-paragraph">Complete as many rounds as possible in 10 minutes.</p><ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">40 sec {{exercise:0630:mountain climber}}</p></li></ul><p class="tiptap-paragraph">20 reps {{exercise:0677:lunge with jump}}</p><p class="tiptap-paragraph">10 reps {{exercise:1160:burpee}}</p>';

    const output = normalizeWorkoutHtml(input);

    expect(output).toContain('<li class="tiptap-list-item"><p class="tiptap-paragraph">20 reps {{exercise:0677:lunge with jump}}</p></li>');
    expect(output).toContain('<li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps {{exercise:1160:burpee}}</p></li>');
    expect(output).not.toContain('</ul><p class="tiptap-paragraph">20 reps {{exercise:0677:lunge with jump}}</p>');
  });

  it('wraps loose exercise paragraphs into a bullet list when no list exists yet', () => {
    const input = '<p class="tiptap-paragraph">🔥 <strong><u>Activation 5\'</u></strong></p><p class="tiptap-paragraph">15 reps {{exercise:1001:bird dog}}</p><p class="tiptap-paragraph">10 reps {{exercise:1002:world greatest stretch}}</p>';

    const output = normalizeWorkoutHtml(input);

    expect(output).toContain('<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">15 reps {{exercise:1001:bird dog}}</p></li><li class="tiptap-list-item"><p class="tiptap-paragraph">10 reps {{exercise:1002:world greatest stretch}}</p></li></ul>');
  });

  it('bullets loose prescription lines even when exercise markup is missing', () => {
    const input = '<p class="tiptap-paragraph">💪 <strong><u>Main Workout (CIRCUIT)</u></strong></p><p class="tiptap-paragraph">Perform 4 rounds. Rest 90 seconds between rounds.</p><ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">15 reps {{exercise:1160:burpee}}</p></li><li class="tiptap-list-item"><p class="tiptap-paragraph">20 reps {{exercise:1003:skater hops}}</p></li><li class="tiptap-list-item"><p class="tiptap-paragraph">15 reps {{exercise:1004:jackknife sit-up}}</p></li></ul><p class="tiptap-paragraph">20 reps jump squat — tempo 2-sec lower, explosive lift; rest 0 sec</p><p class="tiptap-paragraph">12 reps plyo push up — hands must leave the floor; rest 0 sec</p>';

    const output = normalizeWorkoutHtml(input);

    expect(output).toContain('<li class="tiptap-list-item"><p class="tiptap-paragraph">20 reps jump squat — tempo 2-sec lower, explosive lift; rest 0 sec</p></li>');
    expect(output).toContain('<li class="tiptap-list-item"><p class="tiptap-paragraph">12 reps plyo push up — hands must leave the floor; rest 0 sec</p></li>');
    expect(output).toContain('<p class="tiptap-paragraph">Perform 4 rounds. Rest 90 seconds between rounds.</p>');
    expect(output).not.toContain('</ul><p class="tiptap-paragraph">20 reps jump squat');
  });
});