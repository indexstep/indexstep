/**
 * Profanity and content filter for stephud.
 * Blocks: profanity, slurs, sexual content, hate speech, self-harm, dangerous instructions, and spam.
 */

const BLOCKED_PATTERNS: RegExp[] = [
  // Blocked words — each entry handles common leetspeak variants inline
  /\ba{1,3}ss\b/i,
  /\ba{2,4}hole\b/i,
  /\bb{1,3}tch\b/i,
  /\bb{1,3}lls{1,2}i{1,3}t\b/i,
  /\bc{1,3}ck\b/i,
  /\bc{1,3}nt\b/i,
  /\bd{1,3}ck\b/i,
  /\bd{1,3}umb\b/i,
  /\bf{1,3}ck\b/i,
  /\bf{1,3}gg{1,3}t\b/i,
  /\bg{1,3}y\b/i,
  /\bh{1,2}omo\b/i,
  /\bj{1,3}ew\b/i,
  /\bk{1,3}ike\b/i,
  /\bn{1,3}gg{1,3}r\b/i,
  /\bn{1,3}i{1,3}g{1,3}r\b/i,
  /\bp{1,2}ussy\b/i,
  /\br{1,3}et{1,3}rd\b/i,
  /\bs{1,3}hit\b/i,
  /\bs{1,3}l{1,3}t\b/i,
  /\bs{1,3}x\b/i,
  /\bt{1,2}urd\b/i,
  /\bt{1,2}wat\b/i,
  /\bv{1,3}g{1,3}na\b/i,
  /\bw{1,3}ank\b/i,
  /\bw{1,3}hore\b/i,
  /\bx{1,3}xx?\b/i,
  /\bx{1,3} rated?\b/i,
  /\b(anal|ass|balls|bastard|bathroom|bdsm|bestial|big ass|big cock|big dick|big tit|black cock|blumpkin|bone|boob|bottom|bukkake|buttplug|camgirl|camsex|chick|clitoris|cock|condom|cum|cunt|dick|dildo|erect|erotic|escort|fap|fetish|finger|fisting|foot|foreplay|fuck|gag|gay|glory hole|goatse|goddamn|handjob|hardcore|hetero|homo|hustler|incest|interracial|jailbait|jerk|jerkoff|kink|kinky|lesbian|lick|lipstick|loan|lust|masturbat|meatspin|milf|naked|nasty|nude|nudity|orgasm|orgy|outcall|panty|pedo|pee|penis|piss|porn|pussy|queer|rape|rectal|rimming|sadist|same sex|semen|sex|s-extreme|shemale|shit|shitty|siss|slag|slant|slut|smut|snatch|softcore|spank|sperm|strapon|strip|submiss|suck|swinger|teen|threesome|tits|titty|topless|tortur|towelhead|trib|trojan|undress|vagina|viagra|vibrator|vodka|voyeur|weed|whore|xxx)/i,
  // Common slurs and hate speech
  /\bk{1,3}ke\b/i,
  /\bn{1,3}g{1,3}r\b/i,
  /\bw{1,3}p\b/i,
  /\bs{1,3}po{1,3}k\b/i,
  /\bt{1,3}wn{1,3}g\b/i,
  /\bc{1,3}op{1,3}e\b/i,
  /\bm{1,3}x{1,3}d\b/i,
  /\br{1,3}t{1,3}rd\b/i,
  // Obfuscated patterns
  /\b(prostitu|escort|hooker|pimp)\b/i,
  /\b(scam|fake identity)\b/i,
  // Repeated chars (e.g. "fuuuuck")
  /(.)\1{4,}/i,
  // Self-harm content
  /cut yourself/i,
  /self harm/i,
  /self-harm/i,
  /slit wrists/i,
  /want to die/i,
  /want to stop existing/i,
  /hate yourself/i,
  /no longer want to live/i,
  /life is worthless/i,
  /not worth living/i,
  /better off dead/i,
  /kill me please/i,
  /end my life/i,
  /commit suicide/i,
  /take your own life/i,
  /how to suicide/i,
  /how to kill yourself/i,
  /ways to end it/i,
  /method to end your life/i,
  /suicidal ideation/i,
  /suicidal thoughts/i,
  /suicide note/i,
  /suicide method/i,
  /suicide pact/i,
  /suicide guide/i,
  // Dangerous activity
  /how to make a bomb/i,
  /how to make bomb/i,
  /how to make explosive/i,
  /how to make grenade/i,
  /how to make poison/i,
  /how to make toxin/i,
  /how to make anthrax/i,
  /how to make meth/i,
  /how to make cocaine/i,
  /how to make heroin/i,
  /how to synthesize/i,
  /how to hack into/i,
  /how to gain unauthorized/i,
  /how to steal identity/i,
  /how to doxx/i,
  /how to swat/i,
  /terrorist attack/i,
  /mass shooter/i,
  /school shooter/i,
  /shoot up school/i,
  /how to strangle/i,
  /how to murder/i,
  /how to hurt someone/i,
  /assassination/i,
  /hitman/i,
  /contract killer/i,
  /hiring a killer/i,
  // HTML / XSS vectors — blocked outright (no legitimate tutorial use)
  /<img[^>]*src\s*=\s*["']?[^"']*onerror/i,
  /<img[^>]*onerror\s*=/i,
  /<svg[^>]*onload\s*=/i,
  /<svg[^>]*onerror\s*=/i,
  /<body[^>]*onload\s*=/i,
  /<iframe[^>]*src\s*=\s*["']?javascript:/i,
  /<script[^>]*>/i,
  /<script>/i,
  /javascript:\s*on(click|mouse|error|load|focus|blur)/i,
  /onerror\s*=\s*["']?\s*javascript:/i,
  /onload\s*=\s*["']?\s*javascript:/i,
  /onclick\s*=\s*["']?\s*javascript:/i,
  /data:\s*text\/html/i,
];

// Patterns that flag content for review (soft violations)
const FLAGGED_PATTERNS: RegExp[] = [
  /diy bomb/i,
  /diy explosive/i,
  /diy weapon/i,
  /homemade drug/i,
  /homemade explosive/i,
  /dangerous experiment/i,
  /dangerous chemical/i,
  /electrical shock/i,
  /hate group/i,
  /extreme sport/i,
  /extreme stunt/i,
  /medical advice/i,
  /legal advice/i,
  /self injury/i,
  /self cutting/i,
  /cutting behavior/i,
];

export interface FilterResult {
  clean: boolean;
  violations: string[];
  flagged: boolean;
  flaggedReasons: string[];
}

/**
 * Check text for profanity, slurs, sexual content, hate speech, self-harm, dangerous instructions, and spam.
 * Returns clean=true if nothing problematic found.
 * Flagged=true means it needs human review (contained flagged patterns but not hard violations).
 */
export function filterContent(text: string): FilterResult {
  const violations: string[] = [];
  const flaggedReasons: string[] = [];
  const normalized = text.toLowerCase();

  // Check blocked patterns (hard violations — auto-reject)
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      const match = normalized.match(pattern);
      if (match) {
        violations.push("Blocked: " + match[0]);
      } else {
        violations.push("Matched blocked pattern");
      }
      // Reset regex lastIndex since test() advances it
      pattern.lastIndex = -1;
    }
  }

  // Check flagged patterns (soft violations — needs review)
  for (const pattern of FLAGGED_PATTERNS) {
    if (pattern.test(normalized)) {
      const match = normalized.match(pattern);
      if (match) {
        flaggedReasons.push("Flagged: " + match[0]);
      } else {
        flaggedReasons.push("Flagged by pattern");
      }
      pattern.lastIndex = -1;
    }
  }

  // Check for excessive caps (shouting) — more than 50% uppercase in 10+ char text
  const alphaOnly = text.replace(/[^a-zA-Z]/g, "");
  if (alphaOnly.length >= 10) {
    const upperCount = alphaOnly.replace(/[^A-Z]/g, "").length;
    if (upperCount / alphaOnly.length > 0.6) {
      violations.push("Excessive use of capital letters");
    }
  }

  // Check for repeated punctuation spam
  if (/[!?.]{5,}/.test(text)) {
    violations.push("Excessive punctuation");
  }

  return {
    clean: violations.length === 0,
    violations,
    flagged: flaggedReasons.length > 0,
    flaggedReasons,
  };
}

/**
 * Strip blocked words from text, replacing with asterisks.
 */
export function sanitizeContent(text: string): string {
  let result = text;
  for (const pattern of BLOCKED_PATTERNS) {
    result = result.replace(pattern, (match) => "*".repeat(match.length));
    pattern.lastIndex = -1;
  }
  // Normalize repeated chars (4+ same char in a row -> 2)
  result = result.replace(/(.)\1{3,}/gi, "$1$1");
  return result;
}
