export const siteUrl = "https://jarrodtran.com";

/** Official current title. Every surface (bio, experience, JSON-LD) reads this one value. */
const currentTitle = "Lead, AI Enablement & Factory Strategy";

export interface ImpactBullet {
  text: string;
  metric?: string;
}

export interface WorkPanel {
  kicker: string;
  value: string;
  label: string;
}

export interface Role {
  title: string;
  dates: string;
  summary?: string;
  bullets: ImpactBullet[];
}

export interface Employer {
  company: string;
  note?: string;
  roles: Role[];
}

export interface CaseStudy {
  /** Opening scene for the deep page. */
  context: string;
  constraints: string[];
  decisions: string[];
  /** Longer outcome narrative; figures must stay on the résumé ledger. */
  outcomeDetail: string;
  /** What Jarrod personally owned. Prefer dropping a claim over inventing credit. */
  role: string[];
}

export interface SelectedWorkItem {
  /** Stable URL segment under /work/[slug]. */
  slug: string;
  title: string;
  problem: string;
  contribution: string;
  outcome: string;
  panel: WorkPanel;
  link?: { label: string; href: string };
  caseStudy: CaseStudy;
}

export interface SiteContent {
  positioning: {
    name: string;
    headline: string;
    documentTitle: string;
    valueProp: string;
    status: string;
    location: string;
    currentRole: string;
    currentCompany: string;
  };
  /**
   * Public Substack. `url` is the only publication setting: subscribe href,
   * `/feed`, and the allowed https host are all derived from it.
   * `name` drives the #writing heading.
   */
  substack: {
    name: string;
    url: string;
  };
  talks: { event: string; date: string; href: string }[];
  highlights: { value: string; label: string; source?: string }[];
  about: {
    bio: string[];
    education: string;
  };
  experience: Employer[];
  selectedWork: SelectedWorkItem[];
  principles: { title: string; description: string }[];
  capabilities: { group: string; items: string[] }[];
  sections: {
    experience: { title: string };
    work: { title: string };
    about: { title: string };
    approach: { title: string };
    capabilities: { title: string };
    contact: { title: string };
  };
  knowsAbout: string[];
  nav: { label: string; href: string }[];
  contact: {
    email: string;
    linkedin: string;
    github?: string;
    phone?: string;
    resumeHref: string;
    resumeFilename: string;
    calendar?: string;
    intro: string;
  };
  /** Paste-ready outreach. Not rendered on the public site. */
  outreach: {
    linkedin: string;
    email: string;
    intro: string;
  };
}

export const site: SiteContent = {
  positioning: {
    name: "Jarrod Tran",
    headline: "I lead the AI product and engineering team at Tesla Energy.",
    documentTitle: "Jarrod Tran · Product & strategy · Tesla, Apple, Waymo",
    valueProp:
      "Product and strategy at Tesla Energy, with earlier roles at Apple and Waymo.",
    status: "Open to the right role",
    location: "Houston, TX",
    currentRole: currentTitle,
    currentCompany: "Tesla Energy",
  },
  substack: {
    name: "Worth Mulling",
    url: "https://jarrodtran.substack.com",
  },
  talks: [],
  highlights: [
    {
      value: "1,000+",
      label: "Active users on AI tools I shipped",
      source: "Tesla Energy",
    },
    {
      value: "20+",
      label: "Production AI solutions",
      source: "Tesla Energy",
    },
    {
      value: "$156M",
      label: "Incremental annual profit",
      source: "Tesla Energy",
    },
    {
      value: "$260M",
      label: "Annualized savings",
      source: "Tesla Energy",
    },
  ],
  about: {
    bio: [
      "I worked on Apple's entry into India, Waymo's Engineering Operations, and Tesla's 4680 program.",
    ],
    education:
      "University at Buffalo · B.S. Business Administration, Finance · Cum Laude",
  },
  experience: [
    {
      company: "Tesla",
      note: "Rejoined in 2023 after Apple and Waymo.",
      roles: [
        {
          title: currentTitle,
          dates: "Aug 2023 - Present",
          summary:
            "I set Tesla Energy’s AI product roadmap, lead the team that ships it, and report adoption and business results to leadership.",
          bullets: [
            {
              text: "Built and now lead a team that ships 20+ production AI tools, used by 1,000+ people for troubleshooting, reporting, workflow automation, and decision support.",
              metric: "1,000+",
            },
            {
              text: "Our model estimates about 540 hours reclaimed each week, worth $1.6M annually.",
              metric: "$1.6M",
            },
            {
              text: "Set investment priorities across California, Texas, and Shanghai. Allocated $23M across 50+ initiatives, producing $156M in incremental annual profit and 3.2× Megapack growth. A separate program saved $260M annually.",
              metric: "$156M",
            },
            {
              text: "Mitigated $550M in projected tariff exposure by redesigning the product and investment plan, then built and promoted successors so I could focus on AI enablement.",
              metric: "$550M",
            },
          ],
        },
        {
          title: "Program Manager, Special Projects",
          dates: "Jun 2018 - Jun 2021",
          summary:
            "I ran new programs at Tesla, including the 4680 launch and the Model 3 and Model Y scale-up.",
          bullets: [
            {
              text: "Advanced Project Roadrunner, Tesla's 4680 program, from pilot to launch readiness through Battery Day.",
            },
            {
              text: "Designed and launched a $3.5M/month coordination platform (“Warehouse on Wheels”) to protect product availability during rapid scale-up.",
              metric: "$3.5M/month",
            },
            {
              text: "Led planning and recovery across Model 3 and Model Y programs through demand surges and supply disruptions.",
            },
          ],
        },
      ],
    },
    {
      company: "Waymo",
      roles: [
        {
          title: "Strategy & Operations Manager",
          dates: "Oct 2022 - May 2023",
          bullets: [
            {
              text: "Led annual planning and quarterly business reviews for Engineering Operations. Turned priorities into OKRs, resource plans, and milestones.",
            },
            {
              text: "Brought hardware, software, fleet, Product, Legal, and Engineering teams together on safety and regulatory work for commercial autonomous-vehicle deployment.",
            },
            {
              text: "Built dashboards for performance, fleet health, and program milestones, reducing ad hoc reporting for senior leaders.",
            },
          ],
        },
      ],
    },
    {
      company: "Apple",
      roles: [
        {
          title: "Strategic Operations Program Manager",
          dates: "Jun 2021 - Jun 2022",
          bullets: [
            {
              text: "Led Apple's first iPhone launch in India from market entry to scaled delivery, coordinating partner readiness, quality, and regulatory requirements.",
            },
            {
              text: "Translated demand into investment and launch-readiness plans as iPhone volume grew 293% year over year, from 4.3M to 16.9M units. Reported program revenue rose from $2B to $10B.",
              metric: "293%",
            },
            {
              text: "Expanded exports from India from 6 to 40+ countries and built a second-source network to reduce reliance on one region.",
              metric: "40+",
            },
          ],
        },
      ],
    },
  ],
  selectedWork: [
    {
      slug: "tesla-energy-ai-product",
      title: "Tesla Energy: AI product that got used",
      problem:
        "Tesla Energy had scattered AI experiments, but no one owned the use cases or tracked whether adoption improved results.",
      contribution:
        "I formed a product and engineering team, prioritized use cases, and added training and adoption tracking to each release.",
      outcome:
        "Our model estimates about 540 hours reclaimed each week, or $1.6M in annual productivity value.",
      panel: {
        kicker: "Tesla Energy",
        value: "1,000+",
        label: "Active users across 20+ production AI solutions",
      },
      link: { label: "Tesla Energy", href: "https://www.tesla.com/energy" },
      caseStudy: {
        context:
          'Scattered experiments sat next to real Energy work with no shared bar for "done." Leaders wanted tools people used in their daily work.',
        constraints: [
          "Adoption was measured by use in real workflows",
          "Finite roadmap capacity meant every use case needed a named owner",
          "Security and data boundaries could not bend for release speed",
        ],
        decisions: [
          "Build a dedicated product-and-engineering team",
          "Sequence the backlog by hours reclaimed and decision quality",
          "Ship training plus weekly adoption reporting with each release",
        ],
        outcomeDetail:
          "Weekly reports tracked adoption after each release. A model estimates about 540 hours reclaimed per week and $1.6M in annual productivity value.",
        role: [
          "Owned the enablement roadmap and what leadership saw each week",
          "Hired and led the product-and-engineering squad",
          "Set prioritization rules, governance, and adoption metrics",
        ],
      },
    },
    {
      slug: "tesla-energy-portfolio",
      title: "Tesla Energy: which dollar moves the P&L",
      problem:
        "Demand outran what we could fund. 50+ asks. $23M to spend. Which dollar moved the P&L?",
      contribution:
        "I built Python and Tableau models to compare return, labor, cost, and timing. We funded the highest-return work and cut the rest.",
      outcome:
        "Megapack grew 3.2×, a separate program saved $260M annually, and a redesign mitigated $550M in tariff exposure.",
      panel: {
        kicker: "Tesla Energy",
        value: "$156M",
        label: "Incremental annual profit from a $23M portfolio",
      },
      link: { label: "Tesla Megapack", href: "https://www.tesla.com/megapack" },
      caseStudy: {
        context:
          "50+ initiatives competed for a $23M budget. Their expected returns were hard to compare.",
        constraints: [
          "Only $23M was available against 50+ competing requests",
          "Leaders needed one clear rule for what got funded and what got cut",
          "Labor, cost, and timing had to live in one decision model",
        ],
        decisions: [
          "Tie each ask to return and risk in Python and Tableau models",
          "Fund the highest-return work and stop the rest in public reviews",
          "Reuse the ranking method later when sequencing AI use cases",
        ],
        outcomeDetail:
          "Megapack grew 3.2×. Separate programs delivered $260M in annualized savings and mitigated $550M in tariff exposure.",
        role: [
          "Owned the Energy investment roadmap and review cadence",
          "Built the models executives used to compare asks",
          "Ran the tradeoff meetings that killed low-return work",
        ],
      },
    },
    {
      slug: "apple-iphone-india",
      title: "Apple: 0→1 iPhone India",
      problem:
        "Apple had to forecast demand, qualify partners, and clear local requirements before taking iPhone to India.",
      contribution:
        "I led market-entry decisions and partner qualification, then coordinated demand, quality, and geopolitical risks through launch.",
      outcome:
        "The program reported revenue growth from $2B to $10B, and exports from India grew from 6 to 40+ countries.",
      panel: {
        kicker: "Apple",
        value: "293%",
        label: "Year-over-year growth, 4.3M → 16.9M units",
      },
      link: { label: "Apple India", href: "https://www.apple.com/in/" },
      caseStudy: {
        context:
          "India had to move from slides to a live, scaled iPhone launch while partners and demand kept shifting.",
        constraints: [
          "Quality and regulatory bars could not slip to buy speed",
          "Partner readiness trailed the volume curve",
          "Geopolitical risk had to sit inside the same plan as demand",
        ],
        decisions: [
          "Treat entry calls, partner checks, and go-live gates as one program",
          "Convert volume signals into funding and readiness plans leaders could run weekly",
          "Build second sources so exports weren't pinned to one geography",
        ],
        outcomeDetail:
          "Volume grew from 4.3M to 16.9M units year over year, while exports from India reached 40+ countries.",
        role: [
          "Led the India launch program end to end",
          "Kept entry, partners, and readiness on one schedule",
          "Brought quality, regulatory, and timing risks to leadership",
        ],
      },
    },
    {
      slug: "waymo-engineering-ops",
      title: "Waymo: one plan, six functions",
      problem:
        "Six functions used different plans and numbers. Leaders had no shared basis for settling conflicts.",
      contribution:
        "I set up shared annual planning, OKRs, quarterly reviews, and dashboards for six functions.",
      outcome:
        "The teams used one planning calendar and one set of numbers. Scheduled reviews replaced many one-off reporting requests.",
      panel: {
        kicker: "Waymo",
        value: "One plan",
        label: "Six functions on one shared scoreboard",
      },
      link: { label: "Waymo", href: "https://waymo.com/" },
      caseStudy: {
        context:
          "Six Engineering Operations functions brought different plans and numbers to leadership reviews.",
        constraints: [
          "Every plan had to account for safety and regulatory work",
          "Six functions needed shared targets without private scorekeeping",
          "Senior leaders spent too much time on one-off decks",
        ],
        decisions: [
          "Set shared dates for OKRs, resource planning, quarterly reviews, and dashboards",
          "Move tradeoffs into scheduled reviews instead of private escalations",
          "Publish dashboards covering performance, vehicle health, and milestones",
        ],
        outcomeDetail:
          "All six functions used a common planning calendar and shared numbers, which cut one-off reporting requests.",
        role: [
          "Facilitated planning and QBR cycles for Engineering Operations",
          "Built the scoreboard leadership used instead of ad-hoc pulls",
          "Aligned targets and resources across functions",
        ],
      },
    },
  ],
  principles: [
    {
      title: "Get the facts first",
      description:
        "Get the outcome, constraints, economics, and assumptions on the table before anyone spends. Structured problem-solving starts there.",
    },
    {
      title: "Find where work stalls",
      description:
        "Follow the dependencies, incentives, and bottlenecks. Problems usually show up where one team hands work to another.",
    },
    {
      title: "Cut what doesn't matter",
      description:
        "Cut work that doesn't serve the outcome. On Megapack that was 50+ requests down to a ranked $23M portfolio.",
    },
    {
      title: "Name an owner",
      description:
        "Name the tradeoff, the owner, and the next move. A plan only counts once each step has an owner.",
    },
    {
      title: "Keep improving it",
      description:
        "Add the feedback (and the automation) that makes the system better as it grows. I add AI where it clearly saves time.",
    },
  ],
  capabilities: [
    {
      group: "Strategy & Product",
      items: [
        "Problem framing",
        "Capital allocation",
        "0→1 launches",
        "New product introduction",
        "Portfolio management",
        "Geographic expansion",
        "Business cases",
        "Stage-gate design",
      ],
    },
    {
      group: "AI & Analytics",
      items: [
        "AI product strategy",
        "AI enablement",
        "Forward-deployed engineering",
        "Use-case prioritization",
        "Decision models",
      ],
    },
    {
      group: "Leadership & Influence",
      items: [
        "Hiring and leading teams",
        "Executive reporting",
        "Workforce planning",
        "OKRs & QBRs",
      ],
    },
    {
      group: "Tools & Platforms",
      items: ["Python", "Tableau", "Excel", "SQL"],
    },
  ],
  sections: {
    about: {
      title: "About Jarrod",
    },
    experience: {
      title: "Experience",
    },
    work: {
      title: "Selected work",
    },
    approach: {
      title: "How I work",
    },
    capabilities: {
      title: "Capabilities",
    },
    contact: {
      title: "Contact",
    },
  },
  knowsAbout: [
    "AI product",
    "Cross-functional leadership",
    "Structured problem-solving",
    "Capital allocation",
    "0→1 launches",
  ],
  nav: [
    { label: "Writing", href: "#writing" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
  ],
  contact: {
    email: "jarrodtran@outlook.com",
    phone: "(607) 760-2068",
    linkedin: "https://www.linkedin.com/in/jarrodtran/",
    github: "https://github.com/jarrodtran",
    resumeHref: "/resume.pdf",
    resumeFilename: "Jarrod-Tran-Resume.pdf",
    intro: "Open to AI product leadership roles. Based in Houston.",
  },
  outreach: {
    linkedin:
      "Product and strategy at Tesla Energy (AI product) after Apple and Waymo. 1,000+ people on tools we shipped. Looking at growth-stage tech, consulting, early-stage startups, and VC-adjacent seats. Happy to talk.",
    email:
      "I do product, strategy, and AI product work. I lead AI enablement at Tesla Energy (1,000+ users, $1.6M modeled annualized value) after Apple and Waymo. Open to growth-stage tech, consulting, early-stage startups, or a VC-adjacent operator role when the brief is real.",
    intro:
      "Jarrod Tran does product and strategy work. He leads AI enablement at Tesla Energy: AI tools in use by 1,000+ people, plus $156M incremental profit on the business side. He's looking at growth-stage tech, consulting, early-stage startups, and VC-adjacent operator seats.",
  },
};

export function getSelectedWorkBySlug(
  slug: string,
): SelectedWorkItem | undefined {
  return site.selectedWork.find((item) => item.slug === slug);
}

export function selectedWorkSlugs(): string[] {
  return site.selectedWork.map((item) => item.slug);
}

export function nextSelectedWork(slug: string): SelectedWorkItem | undefined {
  const items = site.selectedWork;
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) return undefined;
  return items[(index + 1) % items.length];
}
