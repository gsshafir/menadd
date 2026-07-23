export const site = {
  name: "MENADD",
  url: "https://menadd.com",
  positioning:
    "MENADD. Investor-grade structure for MENA founders. Built from the diligence backwards.",
  linkedIn: "https://www.linkedin.com/in/gennadyshafir"
};

export const nav = [
  { href: "/library/", label: "Library" },
  { href: "/assessment/", label: "Assessment" },
  { href: "/about/", label: "About" },
  { href: "/notes/", label: "Diligence Notes" }
];

export const sections = [
  {
    key: "ownership",
    title: "Ownership & Cap Table",
    href: "/library/ownership/",
    description:
      "Who owns what, and what that ownership survives. Vesting, ESOP and phantom equity, SAFEs and convertible notes, dilution mechanics, down rounds. The section of the diligence report founders read last and pay for first.",
    short:
      "Vesting, ESOP, phantom equity, dilution, down rounds. Who owns what, and what that ownership survives."
  },
  {
    key: "control",
    title: "Control & Governance",
    href: "/library/control/",
    description:
      "Ownership percentages are not control. Board composition, veto rights, reserved matters, protective provisions, parent-company dynamics. Control rarely moves in one round. It moves through clauses signed three rounds earlier.",
    short:
      "Board seats, veto rights, reserved matters. Ownership percentages are not control."
  },
  {
    key: "structure",
    title: "Structure & Jurisdiction",
    href: "/library/structure/",
    description:
      "ADGM, DIFC, UAE mainland, offshore holdcos, cross-border setups. A company can be operational and still not be fundable. This section covers the gap between a structure that invoices and a structure that holds capital.",
    short:
      "ADGM, DIFC, mainland, cross-border holdcos. A clean structure is not the same as a fundable structure."
  },
  {
    key: "cash",
    title: "Cash & Finance",
    href: "/library/cash/",
    description:
      "Cash reporting, runway, backlog versus revenue, working capital. Investors do not read your P&L first. They ask where the cash is, where it goes, and who finances the gap between delivery and payment.",
    short:
      "Cash reporting, runway, backlog, working capital. Where the cash is, and who finances the gap."
  },
  {
    key: "process",
    title: "The MENA Process",
    href: "/library/process/",
    description:
      "How a raise actually works in the UAE, Saudi Arabia, and the wider region. The trust process, family offices, timelines, and why a Silicon Valley playbook produces MENA-specific failure modes.",
    short:
      "How a raise actually works in the region. The trust process, family offices, timelines."
  }
] as const;

export const meta = {
  home: {
    title: "MENADD | Investor-Grade Structure for MENA Founders",
    description:
      "What due diligence checks in a MENA company, section by section, and what an investor-grade answer looks like. Cap tables, governance, structure, cash."
  },
  library: {
    title: "The Diligence Library | MENADD",
    description:
      "Diligence for MENA founders, organized the way a diligence report is organized: ownership, control, structure, cash, process."
  },
  ownership: {
    title: "Ownership & Cap Table | MENADD",
    description:
      "Vesting, ESOP, phantom equity, dilution and down round mechanics for founders in the UAE, Saudi Arabia and MENA."
  },
  control: {
    title: "Control & Governance | MENADD",
    description:
      "Board seats, veto rights, reserved matters and protective provisions. How control actually moves in venture-backed companies."
  },
  structure: {
    title: "Structure & Jurisdiction | MENADD",
    description:
      "ADGM vs DIFC vs UAE mainland, holding companies and cross-border structures that survive investor diligence."
  },
  cash: {
    title: "Cash & Finance | MENADD",
    description:
      "Cash reporting, runway, backlog conversion and working capital. Investor-grade finance for early-stage MENA companies."
  },
  process: {
    title: "The MENA Process | MENADD",
    description:
      "How fundraising actually works in the UAE and MENA: trust sequences, family offices, and realistic timelines."
  },
  assessment: {
    title: "Investor Readiness Assessment | MENADD",
    description:
      "A 3-minute baseline diagnostic for B2B founders: 13 numbers, one verdict, and the questions investors will ask in diligence."
  },
  about: {
    title: "About | MENADD",
    description:
      "Written by a CFO and board advisor based in Abu Dhabi, with a decade of operating experience inside venture-backed companies."
  },
  notes: {
    title: "Diligence Notes | MENADD",
    description:
      "Periodic notes on diligence, cap tables, governance and structure in MENA. No frequency promises. No marketing."
  }
} as const;
