import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Guidelines | stephud",
  description: "Community content guidelines for stephud — keep tutorials safe, legal, and respectful.",
};

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Content Guidelines</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: June 21, 2026</p>

        <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">1. Purpose of These Guidelines</h2>
            <p>
              stephud is a platform for sharing knowledge and skills through step-by-step tutorials. Our goal is to create a safe, helpful, and welcoming community where people can learn and teach. These Content Guidelines exist to protect all users and ensure the platform remains a positive resource for everyone.
            </p>
            <p className="mt-2">
              By creating an account or posting content on stephud, you agree to follow these guidelines. Violations may result in content removal, account suspension, or permanent termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3 text-[var(--red)]">2. Zero Tolerance — Immediate Violations</h2>
            <p className="mb-3">The following categories of content are strictly prohibited and will result in immediate account termination:</p>
            
            <div className="space-y-4">
              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">🚫 Suicide and Self-Harm Content</h3>
                <p className="text-sm">Content that discusses, encourages, instructs, or glorifies self-harm, suicide, or eating disorders. This includes "how to" guides for self-harm or suicide, content expressing desire to self-harm or end one's life, and content that romanticizes or normalizes suicidal thoughts.</p>
                <p className="text-xs text-[var(--red)] mt-2 font-medium">Examples of prohibited content: Tutorial on "how to cut yourself," post saying "I want to die," guide on "ways to commit suicide."</p>
              </div>

              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">🚫 Dangerous Weapons and Explosives</h3>
                <p className="text-sm">Content that provides instructions for creating weapons, explosives, biological agents, chemical weapons, or any device designed to cause harm to people, animals, or property.</p>
                <p className="text-xs text-[var(--red)] mt-2 font-medium">Examples of prohibited content: "How to make a bomb," "DIY explosives tutorial," instructions for creating poison or toxins.</p>
              </div>

              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">🚫 Illegal Drugs and Controlled Substances</h3>
                <p className="text-sm">Content providing instructions for manufacturing, synthesizing, growing, or distributing illegal drugs or controlled substances.</p>
                <p className="text-xs text-[var(--red)] mt-2 font-medium">Examples of prohibited content: "How to make meth," "DIY cocaine," "Growing marijuana at home" (where illegal), synthesis guides for any controlled substance.</p>
              </div>

              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">🚫 Violence and Harm to Others</h3>
                <p className="text-sm">Content that encourages, instructs, or glorifies violence against individuals or groups. This includes terrorism, murder, assault, kidnapping, and stalking.</p>
                <p className="text-xs text-[var(--red)] mt-2 font-medium">Examples of prohibited content: "How to hurt someone," instructions for poisoning others, content promoting terrorist ideology.</p>
              </div>

              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">🚫 Hacking and Cybercrime</h3>
                <p className="text-sm">Content providing instructions for unauthorized access to computer systems, theft of data or identities, distribution of malware, or any other cybercrime.</p>
                <p className="text-xs text-[var(--red)] mt-2 font-medium">Examples of prohibited content: "How to hack into someone's account," "DIY identity theft," phishing kit tutorials.</p>
              </div>

              <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">🚫 Child Sexual Abuse Material (CSAM)</h3>
                <p className="text-sm">Any content that exploits, abuses, or endangers children. Zero tolerance — all instances are reported to the National Center for Missing &amp; Exploited Children (NCMEC) and law enforcement.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3 text-[var(--orange)]">3. Prohibited Content (Review Required)</h2>
            <p className="mb-3">The following types of content may be allowed but require careful handling and clear context:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Medical advice:</strong> Tutorials offering medical diagnoses, prescriptions, or treatments are not permitted. Always include a disclaimer that your guide is not professional medical advice.</li>
              <li><strong>Legal advice:</strong> Tutorials that could be construed as legal advice are not permitted. Include a disclaimer that users should consult a licensed professional.</li>
              <li><strong>Financial advice:</strong> Investment, tax, or financial scheme tutorials are not permitted without appropriate professional credentials disclosed.</li>
              <li><strong>Dangerous experiments:</strong> Chemistry experiments, electrical work, or other potentially hazardous activities must include prominent safety warnings and appropriate protective measures.</li>
              <li><strong>Extreme sports and stunts:</strong> These must include clear warnings about the risks involved and should never be attempted without proper training and supervision.</li>
              <li><strong>Alcohol and substance use:</strong> Content about alcohol酿造 or mixology is acceptable only for legal age audiences. Instructions for creating illegal substances are strictly prohibited.</li>
              <li><strong>Firearms:</strong> Legal firearms tutorials (assembly, safety, maintenance) are permitted. Content related to manufacturing illegal firearms or weapons is prohibited.</li>
              <li><strong>Hate speech:</strong> Any content that attacks or demeans a group or individual based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">4. Required Disclaimers</h2>
            <p className="mb-3">Depending on your tutorial topic, you may be required to include a disclaimer. Tutorials that should include disclaimers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Medical/health topics:</strong> "This guide is for informational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider before making changes to your health routine."</li>
              <li><strong>Legal topics:</strong> "This guide is for general informational purposes only and does not constitute legal advice."</li>
              <li><strong>Electrical work:</strong> "Working with electricity can be dangerous. Always turn off power at the breaker and follow local electrical codes. If you're unsure, consult a licensed electrician."</li>
              <li><strong>Woodworking/construction:</strong> "Always wear appropriate safety equipment and follow manufacturer instructions. If you're unsure, consult a professional."</li>
              <li><strong>Cooking/allergies:</strong> "Recipe yields may vary. If you have food allergies, carefully check all ingredient labels."</li>
              <li><strong>Automotive repair:</strong> "Always support vehicles securely with jack stands. If you're unsure, take your vehicle to a qualified mechanic."</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">5. Content Quality Standards</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Accuracy:</strong> Tutorials must be factual and correct. Outdated or incorrect information can cause harm or wasted effort.</li>
              <li><strong>Completeness:</strong> Provide all steps necessary to complete the task. Do not omit critical steps to "trick" users.</li>
              <li><strong>Safety first:</strong> Always prioritize safety. Include warnings about potential hazards and how to avoid them.</li>
              <li><strong>Clear language:</strong> Use simple, clear language. Avoid jargon unless necessary and explain it when used.</li>
              <li><strong>Good images:</strong> Use clear, well-lit photos or diagrams. Blurry or confusing images don't help anyone.</li>
              <li><strong>No spam:</strong> Don't use tutorials to advertise products, services, or external websites (unless directly relevant to the tutorial topic).</li>
              <li><strong>Original content:</strong> Don't copy tutorials from other websites. If you're building on someone else's work, give credit and ensure you have permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">6. Respect and Civility</h2>
            <p>stephud is a community. Treat others with respect:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Constructive criticism is welcome. Unhelpful or mean-spirited comments are not.</li>
              <li>Don't harass, bully, or intimidate other users.</li>
              <li>Respect others' privacy — don't post personal information without consent.</li>
              <li>Report content that violates these guidelines rather than engaging with it.</li>
              <li>Different perspectives and skill levels are welcome. Be encouraging to beginners.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">7. Reporting Violations</h2>
            <p>
              If you see content that violates these guidelines, please report it immediately using the "Report" button on the tutorial or comment. Our moderation team reviews all reports promptly.
            </p>
            <p className="mt-2">
              If you believe content poses an immediate threat to someone's safety (such as imminent self-harm or dangerous activity), please contact your local emergency services first, then notify our team.
            </p>
            <p className="mt-2">
              Contact us at{' '}
              <a href="mailto:support@stephud.com" className="text-[var(--accent)] hover:underline">
                support@stephud.com
              </a>
              {' '}for non-urgent concerns or questions about these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">8. Enforcement</h2>
            <p>When violations occur, stephud may take the following actions:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Content removal:</strong> Violating content will be removed from the platform.</li>
              <li><strong>Warning:</strong> First-time minor violations may result in a warning and temporary content restriction.</li>
              <li><strong>Suspension:</strong> Repeated violations or moderate violations result in temporary account suspension.</li>
              <li><strong>Termination:</strong> Serious violations or patterns of violations result in permanent account termination.</li>
              <li><strong>Legal action:</strong> We cooperate fully with law enforcement and may take legal action when required.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">9. Your Responsibility</h2>
            <p>
              As a tutorial creator, you are responsible for the accuracy and safety of your content. Before posting:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Test your tutorial thoroughly to ensure it works as described.</li>
              <li>Include all necessary safety information and warnings.</li>
              <li>Clearly state any prerequisites or required skills.</li>
              <li>Update your tutorial if you discover inaccuracies or new hazards.</li>
              <li>Respond to comments from users who encounter problems.</li>
            </ul>
          </section>

          <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">Summary — What You Cannot Post</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-[var(--red)] mb-2">Never post:</p>
                <ul className="space-y-1 text-[var(--text-secondary)]">
                  <li>• Suicide or self-harm instructions</li>
                  <li>• How to make weapons or explosives</li>
                  <li>• How to make or use illegal drugs</li>
                  <li>• How to hurt or kill people</li>
                  <li>• How to hack or commit cybercrime</li>
                  <li>• Content sexualizing minors</li>
                  <li>• CSAM or child exploitation</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-[var(--orange)] mb-2">Always include disclaimers for:</p>
                <ul className="space-y-1 text-[var(--text-secondary)]">
                  <li>• Medical or health advice</li>
                  <li>• Legal advice</li>
                  <li>• Electrical work</li>
                  <li>• Dangerous activities</li>
                  <li>• Extreme sports or stunts</li>
                  <li>• Alcohol or substance topics</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
