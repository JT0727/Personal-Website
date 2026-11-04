# Personal-site direction (proposed Nov 4, 2026)

Owner directive, Nov 4, 2026: jarrodtran.com is a personal website, not a
resume site and not a job-search site. This doc puts the full proposal in one
place for review: the structure, the homepage copy, what this PR already
changes, and what stays phased because it conflicts with current repo rules.

## Principle

Writing is the product. Work is context: one compressed block, subordinate.
The resume is a subordinate link (About and footer), never the organizing
purpose and never a nav item. A visitor should leave knowing how Jarrod
thinks and what he is writing about, not holding a hiring pitch.

## Sitemap (target state)

| Page        | URL         | Purpose                                               |
| ----------- | ----------- | ----------------------------------------------------- |
| Home        | /           | Who he is, featured writing, where to go next         |
| Writing     | /writing/   | Essays and notes index (see rule conflict below)      |
| About       | /about/     | The person: story, photo rule applies, interests      |
| Now         | /now/       | What he is doing and thinking this month              |
| Work        | /work/      | One compressed page of roles, in short form           |
| Contact     | /#contact   | Email, LinkedIn, subscribe, speaking                  |
| Reading     | /reading/   | Optional v2: recommendations with one-line takes      |
| Colophon    | /colophon/  | Optional v2: how the site is built                    |

Target nav: Writing, About, Now, Contact.

## Homepage layout (target state)

1. Hero: name, headline, two or three sentences in first person, subscribe.
2. Featured writing: three editor picks under a "Start here" label.
3. Latest writing: five most recent posts with dates.
4. About teaser: one short paragraph, link to /about/.
5. Now teaser: two or three timestamped lines, link to /now/.
6. Work, briefly: five compressed role lines (copy below).
7. How I think: the five existing principles, personal framing.
8. Contact: "Say hello." Email, LinkedIn, RSS, Substack.
9. Footer: location and a personal line, not a company list.

## Homepage copy (personal voice, drop-in)

Rules applied while drafting: no em-dashes or en-dashes, no banned framing
tokens in visitor copy, no figure that is not already on the resume ledger,
no five-word phrase repeated across strings, no invented career facts.

### Meta

- Title: keep `site.positioning.documentTitle` (tab-length rule).
- Description (valueProp, changed in this PR): "Personal site of Jarrod
  Tran. I lead AI enablement at Tesla Energy, where my team ships tools
  people use in their daily work. Here I write about judgment, capital
  calls, and lessons from Apple and Waymo."
- Status (OG image, changed in this PR): "Notes on AI, judgment, and
  building" replaces "Open to the right role."

### Hero

Keep the existing headline: "I write about AI product work, judgment, and
making a P&L move." It was always the personal thesis. The hero component
renders name plus headline only (pinned by tests/sections.test.tsx), so the
longer first-person intro lives in About for now. Phase 2 candidate: relax
the hero test to allow one intro sentence under the headline.

### Writing (Worth Mulling)

Empty state (changed in this PR): "First essays are in draft. Subscribe and
they will land in your inbox as they ship." Honest, and it sets an
expectation the old "Nothing published yet" copy did not.

Seed essays, converted from the existing case studies:

1. "The AI product that got used" (from /work/tesla-energy-ai-product/)
2. "Which dollar moves the P&L" (from /work/tesla-energy-portfolio/)
3. "0 to 1 in India" (from /work/apple-iphone-india/)

### About (second paragraph added in this PR)

"The thread through all of it: an unclear brief, real stakes, and a team
that needs one plan. Get the facts, cut what does not matter, name an
owner, then stay until it ships and hand it off clean."

Still open: an outside-work line (training, travel, food). Drafted in the
working notes, not shipped, because only Jarrod can word it.

### Work, briefly (target copy, phase 2)

- Tesla Energy (2023 to now): current role. 20+ AI tools in production,
  1,000+ active users, and before the AI role, the investment roadmap
  behind the Megapack scale-up.
- Waymo (2022 to 2023): one planning and reporting rhythm for six
  functions that had each been running their own.
- Apple (2021 to 2022): the 0 to 1 iPhone India launch, market entry to
  scaled delivery, exports from 6 to 40+ countries.
- Tesla (2018 to 2021): special projects, the 4680 program, Model 3 and
  Model Y scale-up.
- Amazon (2017 to 2018): fulfillment operations.

Closing line: "That is the short version. LinkedIn has the long one; it is
better at being a resume than this site is."

Note: Amazon is on the resume but missing from site.experience today.
Adding it is a content change to content/site.ts, proposed here, not done
in this PR.

### How I think (heading changed in this PR)

Section heading changes from "How I work" to "How I think". The five
principles stay word for word.

### Contact (changed in this PR)

- Heading: "Say hello." (was "Looking for product, strategy, or AI roles.")
- Intro: "The best conversations start as a reply to something I wrote.
  Email is fastest. I am also glad to swap notes on AI adoption, or to
  come speak about it."
- Rows stay: Email, LinkedIn, Speaking, Resume (subordinate, last row).

### Footer (changed in this PR)

Right side changes from "Tesla, Apple, Waymo" to "Essays, notes, and the
occasional strong opinion."

## What this PR changes

1. content/site.ts: valueProp, status, about.bio (added paragraph),
   sections.approach.title, sections.contact.title, contact.intro.
2. components/sections/writing.tsx: writing empty-state copy.
3. components/footer.tsx: footer line.
4. tests/sections.test.tsx: CONTACT_INTRO and EMPTY_WRITING constants
   follow the new copy.
5. tests/copy-contract.test.ts: the positioning test now asserts the
   personal direction and asserts the retired audience pitch is gone from
   visitor copy. This is an intentional contract change for review.
6. POSITIONING.md: addendum pointing here. The main text is untouched so
   reviewers can diff the old brief against this proposal.
7. This doc.

## Conflicts with current repo rules (need an owner call, not done here)

- POSITIONING.md core direction says corporate operator positioning with
  four target audiences. The owner directive supersedes it, but the doc
  should be rewritten or retired in a follow-up once this direction is
  approved.
- rule:legacy-redirects: /writing/ and /work/ stay meta-refresh pages and
  case studies stay at /work/[slug]/. The target sitemap wants a real
  /writing/ index and essays at /writing/[slug]/. Not changed here.
- rule:no-photo: no photo of Jarrod ships. The usual personal-site advice
  (put a face in the hero) does not apply to this site. Kept.
- Hero test pins hero output to name plus headline only. A longer hero
  intro needs that test relaxed. Not changed here.
- selected-work-layout tests pin the Selected Work section's measured
  heights on the homepage. Compressing or removing Experience, Selected
  Work, and Capabilities from the homepage (target layout above) needs
  those tests reworked. Not changed here.
- Capabilities section: target state deletes it from the homepage. It
  stays in this PR for the layout-test reason above.

## Phased plan after approval

1. Rewrite POSITIONING.md to the personal direction; retire the audience
   pitch from outreach copy as well.
2. Add /about/ and /now/ routes; move the long About off the homepage.
3. Decide the writing URL question: keep Substack as home with /writing/
   as redirect (current), or publish on-domain with RSS and syndicate.
4. Convert the three case studies into essays; keep redirects working.
5. Compress homepage Experience, Selected Work, and Capabilities into
   "Work, briefly"; rework the layout tests in the same PR.
6. Nav to Writing, About, Now, Contact; resume link to About and footer.

## Review ask

@GrokBot: review for (a) copy quality and voice, (b) any figure, title, or
fact that drifts from the resume ledger or the official title, (c) rule
conflicts missed above, and (d) whether the phased plan is the right order.
Do not merge. Owner approval and the review-pass in docs/review-pass.md
still gate merge, per AGENTS.md.
