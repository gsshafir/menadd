export const structureAssessmentSeo = {
  title: "Structure and Ownership Assessment | MENADD",
  description:
    "Fourteen questions on the company investors will buy, the ownership record behind it, employee equity and control. Five minutes, no documents, nothing stored."
};

export const structureAssessmentCopy = {
  heading: "Structure and Ownership Assessment",
  question: "Will your ownership record survive investor diligence?",
  introduction:
    "Fourteen questions about the company investors will buy, the ownership record behind it, employee equity and control. In five minutes you see what could stop a round, what could slow it down, and who has to fix it.",
  privacy: "No documents to upload. Your answers stay in your browser. Nothing is stored or sent.",
  authority:
    "Written by Gennady Shafir, a CFO and board advisor in Abu Dhabi who works on cap tables, governance and cross-border structure for companies raising in the UAE and Europe. The questions are the ones that come up on the other side of the table.",
  authorityLink: "Why this assessment exists",
  submit: "See your result",
  findingsHeading: "Findings",
  issuesHeading: "Issues",
  pointsHeading: "Points to verify",
  actionsHeading: "Where to start",
  boundary:
    "This check looks at fourteen things. A real review looks at the documents behind them, which is not something a form can do.",
  copyButton: "Copy this result",
  copied: "Copied. Paste it into your notes or send it to the people working on the structure.",
  copyFailed: "Copy failed. Select the result and copy it manually.",
  disclaimer: "MENADD provides general information, not legal, tax or investment advice.",
  calendarLabel: "Book a 30-minute call",
  emailLabel: "gennady@menadd.com",
  libraryLabel: "Read the Ownership and Cap Table library"
};

export const questionGroups = [
  {
    id: "company",
    title: "The company investors will buy",
    questions: [
      {
        id: "entity_jurisdiction",
        text: "Where is the company investors will buy shares in registered?",
        options: [
          { id: "mainland_uae", text: "UAE mainland" },
          { id: "freezone_other", text: "A UAE free zone other than ADGM or DIFC" },
          { id: "adgm", text: "ADGM" },
          { id: "difc", text: "DIFC" },
          { id: "lux_sarl", text: "Luxembourg, SARL" },
          { id: "lux_sa", text: "Luxembourg, SA" },
          { id: "europe_other", text: "Another European country" },
          { id: "us_delaware", text: "United States, Delaware" },
          { id: "offshore", text: "Offshore, such as Cayman or BVI" },
          { id: "undecided", text: "Not decided yet" }
        ]
      },
      {
        id: "group_shape",
        text: "How is the group put together?",
        options: [
          { id: "single", text: "One company only" },
          { id: "holdco_opco", text: "A holding company and an operating company" },
          { id: "three_tier", text: "A holding company, an intermediate holding company and operating companies" },
          { id: "complex_unsure", text: "More layers than that, or we are not certain of the exact chain" }
        ]
      },
      {
        id: "ip_location",
        text: "Where is the product and the intellectual property held?",
        options: [
          { id: "same_entity", text: "In the company investors will buy shares in" },
          { id: "other_group_documented", text: "In another company we own, with signed paperwork covering who owns it or who may use it" },
          { id: "other_group_undocumented", text: "In another company we own, with nothing signed between them" },
          { id: "founder_or_contractor", text: "In a founder's name, or with a contractor" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "contracts_revenue",
        text: "Who signs customer contracts and receives the money?",
        options: [
          { id: "same_entity", text: "The company investors will buy shares in" },
          { id: "other_group_documented", text: "Other companies in the group, with signed paperwork between them" },
          { id: "other_group_undocumented", text: "Other companies in the group, with nothing signed between them" },
          { id: "varies_unclear", text: "It varies, and I could not explain the pattern" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "convenience_entities",
        text: "Do you have companies that exist mainly to hold a licence, visas or a bank account?",
        options: [
          { id: "none", text: "No" },
          { id: "yes_current", text: "Yes, and their filings and accounts are up to date" },
          { id: "yes_behind", text: "Yes, and some are behind on filings or accounts" },
          { id: "unsure", text: "Not sure" }
        ]
      }
    ]
  },
  {
    id: "holders",
    title: "Who holds the shares",
    questions: [
      {
        id: "nominee_trust",
        text: "Are the shares registered to the people and companies that actually own them?",
        options: [
          { id: "yes_all", text: "Yes" },
          { id: "documented_matched", text: "No, some are held by someone else on their behalf, and there is a signed agreement and the official records reflect it" },
          { id: "documented_unmatched", text: "No, and either the agreement is missing or the official records have not been updated" },
          { id: "unsure", text: "Not sure" }
        ]
      }
    ]
  },
  {
    id: "record",
    title: "The ownership record",
    questions: [
      {
        id: "legal_register",
        text: "Where is the company's legal register of shareholders kept?",
        options: [
          { id: "provider", text: "The company or its corporate services provider maintains it" },
          { id: "platform_as_register", text: "An equity platform is used as the legal register" },
          { id: "cap_table_only", text: "We have a cap table, but I do not know whether it is the legal register" },
          { id: "multiple_versions", text: "There are several versions in different places" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "last_reconciliation",
        text: "When did someone last check that the record matches the signed documents?",
        options: [
          { id: "within_12m", text: "In the last twelve months" },
          { id: "longer", text: "Longer ago" },
          { id: "never", text: "Never" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "instrument_terms",
        text: "Do all outstanding SAFEs, convertible notes and side letters follow one set of terms you understand?",
        options: [
          { id: "none_outstanding", text: "None are outstanding" },
          { id: "one_set_modelled", text: "Yes, and someone has worked out what they convert into" },
          { id: "different_terms", text: "They use different caps, discounts or side terms" },
          { id: "not_modelled", text: "They have never been worked through together" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "off_register_promises",
        text: "Has anyone been promised equity, in writing or verbally, that does not appear in the cap table?",
        options: [
          { id: "no", text: "No" },
          { id: "yes", text: "Yes" },
          { id: "unsure", text: "Not sure" }
        ]
      }
    ]
  },
  {
    id: "employee-equity",
    title: "Employee equity",
    questions: [
      {
        id: "esop_pool",
        text: "Is there an option pool set aside with a written plan behind it?",
        options: [
          { id: "pool_and_plan", text: "Yes, a pool is set aside and there is a written plan" },
          { id: "discussed_no_doc", text: "A pool has been discussed or shown in the cap table, but there is no plan document" },
          { id: "nothing", text: "Nothing yet" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "esop_agreements",
        text: "Have employees signed individual option agreements setting out vesting and what happens if they leave?",
        options: [
          { id: "all_signed", text: "Everyone who was promised options has signed" },
          { id: "some_signed", text: "Some have" },
          { id: "none_signed", text: "Nobody has" },
          { id: "no_options", text: "No employee options exist" },
          { id: "unsure", text: "Not sure" }
        ]
      }
    ]
  },
  {
    id: "control",
    title: "Control",
    questions: [
      {
        id: "investor_veto",
        text: "Can an investor block decisions in your company, and is that written down?",
        options: [
          { id: "none_yet", text: "No investor has that right" },
          { id: "documented", text: "Yes, and it is in signed documents" },
          { id: "discussed_only", text: "Yes, but it was only discussed" },
          { id: "unsure", text: "Not sure" }
        ]
      },
      {
        id: "founder_vesting",
        text: "Do the founders' shares vest, meaning they are earned over time?",
        options: [
          { id: "documented", text: "Yes, documented" },
          { id: "no", text: "No" },
          { id: "discussed_only", text: "Discussed, nothing signed" },
          { id: "unsure", text: "Not sure" }
        ]
      }
    ]
  }
];

const equals = (question, value) => ({ question, operator: "equals", value });
const notEquals = (question, value) => ({ question, operator: "notEquals", value });
const oneOf = (question, values) => ({ question, operator: "in", values });
const all = (...conditions) => ({ all: conditions });
const any = (...conditions) => ({ any: conditions });

export const findingLibrary = [
  {
    id: "entity_may_need_change",
    group: "entity_form",
    severity: "medium",
    trigger: oneOf("entity_jurisdiction", ["mainland_uae", "freezone_other"]),
    severityEscalations: [
      {
        severity: "high",
        trigger: any(
          oneOf("instrument_terms", ["different_terms", "not_modelled", "unsure"]),
          equals("esop_pool", "pool_and_plan")
        )
      }
    ],
    title: "The receiving entity may need to change before an institutional round",
    diligence:
      "Institutional investors usually expect share classes, investor rights and transfer mechanics that this company's current form may not support. Whether a new holding company is needed depends on the licence, the constitutional documents and what the incoming investor requires. Where instruments or an option pool already exist, the question is sharper, because they have to land somewhere that can carry them.",
    fixedBy: "A structuring decision taken before a term sheet, not during closing.",
    action: "Test whether the current entity can carry the round, before a term sheet."
  },
  {
    id: "entity_undecided",
    group: "entity_form",
    severity: "medium",
    trigger: equals("entity_jurisdiction", "undecided"),
    title: "The receiving entity has not been chosen",
    diligence: "The jurisdiction question arrives with the term sheet instead of before it, and the investor prices the delay.",
    fixedBy: "A structuring decision ahead of the first serious conversation.",
    action: "Choose the receiving entity before the first serious investor conversation."
  },
  {
    id: "sarl_mechanics",
    group: "entity_form",
    severity: "medium",
    trigger: all(
      equals("entity_jurisdiction", "lux_sarl"),
      any(notEquals("instrument_terms", "none_outstanding"), equals("esop_pool", "pool_and_plan"))
    ),
    title: "A SARL carrying instruments or an option plan needs its mechanics checked early",
    diligence:
      "A Luxembourg SARL can carry different rights, instruments and employee equity, but admitting new holders, amending the articles and issuing new units can require approvals and formal steps that an SA does not. With several instruments or an active plan, the corporate steps should be modelled before the round timetable is agreed.",
    fixedBy:
      "Luxembourg counsel, including a decision on whether the SARL remains the right form for the expected financing and employee equity.",
    action: "Have Luxembourg counsel confirm the SARL still fits the planned financing and option plan."
  },
  {
    id: "offshore_substance",
    group: "entity_form",
    severity: "medium",
    trigger: all(
      equals("entity_jurisdiction", "offshore"),
      any(
        oneOf("ip_location", ["other_group_documented", "other_group_undocumented"]),
        oneOf("contracts_revenue", ["other_group_documented", "other_group_undocumented", "varies_unclear"])
      )
    ),
    suppresses: ["value_outside_entity_undocumented", "group_explanation_needed"],
    title: "The company investors buy is not where the business happens",
    diligence:
      "The investor asks what the shares give a claim on, and whether the top company has enough substance to hold it. Standard for offshore holding structures, and it needs a prepared answer rather than an improvised one.",
    fixedBy:
      "Counsel, and in some cases an intra-group transfer whose tax consequences should be modelled first.",
    action: "Prepare the substance answer with counsel, and model any intra-group transfer before making it."
  },
  {
    id: "value_outside_entity_undocumented",
    group: "group_value",
    severity: "high",
    trigger: any(
      equals("ip_location", "other_group_undocumented"),
      oneOf("contracts_revenue", ["other_group_undocumented", "varies_unclear"])
    ),
    title: "Value sits in other companies with nothing signed between them",
    diligence:
      "A group where the product, the contracts and the shares sit in different companies is normal. A group where nothing records the relationship between them is not. Without those documents, the investor cannot trace what their shares have a claim on, and this is found in the first week.",
    fixedBy:
      "Corporate counsel, drafting the ownership, licence or service arrangements that should already exist, before closing.",
    action: "Have corporate counsel document the ownership, licence or service arrangements before closing."
  },
  {
    id: "group_explanation_needed",
    group: "group_value",
    severity: "low",
    trigger: any(equals("ip_location", "other_group_documented"), equals("contracts_revenue", "other_group_documented")),
    title: "A multi-entity group that has to be explained",
    diligence:
      "Not a defect. Diligence will still ask why each company exists, what moves between them and on what terms, and the answer should be written down once rather than assembled under time pressure.",
    fixedBy:
      "You, with counsel, preparing the group explanation and the agreements as part of the data room.",
    action: "Prepare the group explanation and supporting agreements with counsel for the data room."
  },
  {
    id: "ip_outside_company",
    group: "group_value",
    severity: "high",
    trigger: equals("ip_location", "founder_or_contractor"),
    title: "The core asset is not owned by any company",
    diligence:
      "Ownership of the product cannot be proven. Assignments have to be drafted and signed, sometimes by contractors or former colleagues over whom you no longer have leverage.",
    fixedBy: "Counsel, plus signatures that can take weeks to collect.",
    action: "Have counsel prepare the assignments and collect every required signature."
  },
  {
    id: "chain_not_evidenced",
    group: "group_chain",
    severity: "high",
    trigger: all(
      oneOf("group_shape", ["three_tier", "complex_unsure"]),
      oneOf("last_reconciliation", ["longer", "never", "unsure"])
    ),
    title: "A multi-level structure that has never been reconciled",
    diligence:
      "The group chart in the deck is not proof of ownership. Each link needs its own register, resolutions and certificates, and in practice the gaps are in the middle layers nobody maintains.",
    fixedBy: "Reconstruction at entity level, before anything is migrated anywhere.",
    action: "Reconstruct the ownership record at entity level before migrating anything."
  },
  {
    id: "group_shape_unknown",
    group: "group_chain",
    severity: "high",
    trigger: equals("group_shape", "complex_unsure"),
    title: "The chain itself is uncertain",
    diligence:
      "If the founders cannot draw the ownership chain from memory, diligence will draw it for them. That takes weeks and it usually produces at least one surprise.",
    fixedBy: "A corporate map built from each entity's own register. This is the first step of any structuring work.",
    action: "Build a corporate map from each entity's own register before any structuring work."
  },
  {
    id: "convenience_entities_behind",
    group: "group_chain",
    severity: "medium",
    trigger: oneOf("convenience_entities", ["yes_behind", "unsure"]),
    title: "Entities that exist for practical reasons, and are behind",
    diligence:
      "Holding a licence, visas or a bank account in a separate company is ordinary in the UAE. Overdue filings and unreconciled intercompany balances are not, and each one becomes a condition to closing.",
    fixedBy:
      "A corporate services provider, bringing filings and accounts current, in parallel with the raise rather than during diligence.",
    action: "Bring every entity's filings and accounts current before diligence."
  },
  {
    id: "holder_mismatch",
    group: "holders",
    severity: "high",
    trigger: oneOf("nominee_trust", ["documented_unmatched", "unsure"]),
    title: "Shares held by someone other than the owner, without complete paperwork",
    diligence:
      "The register does not show who actually owns the company, and the official records do not resolve it. This collides with the investor's own onboarding checks, and it is one of the few findings capable of ending a round rather than delaying it.",
    fixedBy:
      "Documenting the arrangement properly or unwinding it, and aligning the official records. Both take longer than founders expect.",
    action: "Document or unwind the ownership arrangement and align the official records."
  },
  {
    id: "holder_arrangement_consistency",
    group: "holders",
    severity: "low",
    trigger: equals("nominee_trust", "documented_matched"),
    title: "An arrangement that has to stay consistent",
    diligence: "Not a defect. It becomes one when the agreement, the register and the official records say three different things.",
    fixedBy: "A check that all three match. An hour now, a week of explanation later.",
    action: "Check that the agreement, the register and the official records all match."
  },
  {
    id: "legal_register_unidentified",
    group: "ownership_record",
    severity: "high",
    trigger: oneOf("legal_register", ["cap_table_only", "multiple_versions", "unsure"]),
    title: "The legal ownership record has not been identified",
    diligence:
      "A cap table is a working model. The legal register is what records who holds the shares. If nobody can say which document is the register and who maintains it, investors reconcile every version against the underlying issuances and transfers, and they do it on their timetable.",
    fixedBy:
      "Identifying the legal register, naming who maintains it, and reconciling it to the cap table and the signed documents.",
    action: "Identify the legal register, name its maintainer and reconcile it to the cap table and signed documents."
  },
  {
    id: "platform_as_register_check",
    group: "ownership_record",
    severity: "low",
    trigger: equals("legal_register", "platform_as_register"),
    title: "Confirm the platform is the register in your jurisdiction",
    diligence:
      "Some jurisdictions accept a platform as the statutory register, others require the register to sit with the company or a licensed provider. Worth confirming once rather than discovering it during a transfer.",
    fixedBy: "Your corporate services provider or counsel, in a single question.",
    action: "Confirm with your provider or counsel that the platform is the legal register."
  },
  {
    id: "never_reconciled",
    group: "ownership_record",
    severity: "medium",
    trigger: oneOf("last_reconciliation", ["longer", "never", "unsure"]),
    severityEscalations: [
      { severity: "high", trigger: oneOf("last_reconciliation", ["never", "unsure"]) }
    ],
    title: "The record has not been checked against the documents",
    diligence: "Every ownership number is treated as an estimate until it is tied back to signed instruments and resolutions.",
    fixedBy: "A reconciliation exercise. Document work, not software work.",
    action: "Reconcile the ownership record to the signed instruments and resolutions."
  },
  {
    id: "instrument_terms",
    group: "instruments",
    severity: "high",
    trigger: oneOf("instrument_terms", ["different_terms", "not_modelled", "unsure"]),
    title: "Instruments whose combined effect has not been worked out",
    diligence:
      "Caps, discounts and most favoured nation terms interact with each other and with the new round. Three identical instruments are simple. Two different ones with a side letter are not, and the fully diluted outcome is frequently not the one founders assumed.",
    fixedBy: "Modelling the conversion before agreeing a price, then documenting the result.",
    action: "Model every instrument's conversion before agreeing a price, then document the result."
  },
  {
    id: "off_register_promises",
    group: "instruments",
    severity: "high",
    trigger: oneOf("off_register_promises", ["yes", "unsure"]),
    title: "Equity promised outside the cap table",
    diligence:
      "The most common late surprise in a round. It surfaces when the person who was promised something hears that money is arriving.",
    fixedBy: "Finding every promise, deciding which are real, then documenting or settling them. Before diligence, not during.",
    action: "Find every equity promise, decide which are real, then document or settle them before diligence."
  },
  {
    id: "pool_without_documents",
    group: "employee_equity",
    severity: "medium",
    trigger: equals("esop_pool", "discussed_no_doc"),
    title: "A pool with nothing behind it",
    diligence:
      "A line in the cap table that no document creates. Investors will either require it to be documented before closing or price it as larger than you intend.",
    fixedBy: "A plan document, and a decision about which company in the group grants the options.",
    action: "Put a plan document in place and decide which group company grants the options."
  },
  {
    id: "grants_not_signed",
    group: "employee_equity",
    severity: "medium",
    trigger: oneOf("esop_agreements", ["some_signed", "none_signed"]),
    severityEscalations: [
      {
        severity: "high",
        trigger: all(equals("esop_agreements", "none_signed"), equals("esop_pool", "pool_and_plan"))
      }
    ],
    title: "Options promised but never signed",
    diligence:
      "Employees who believe they own part of the company, with nothing stating vesting, exercise or what happens when they leave. Each is a potential claim, and they tend to raise it at the worst moment.",
    fixedBy: "Individual grant agreements, issued from the entity legally able to grant them.",
    action: "Issue individual grant agreements from the entity legally able to grant them."
  },
  {
    id: "informal_control",
    group: "control",
    severity: "medium",
    trigger: equals("investor_veto", "discussed_only"),
    title: "Control rights agreed in conversation",
    diligence:
      "An investor believes they hold a veto and the founders believe they do not. That disagreement gets settled during the round, rarely on the founders' terms.",
    fixedBy: "Counsel, and a conversation that is far cheaper before the next investor arrives.",
    action: "Have counsel document the control rights before the next investor arrives."
  },
  {
    id: "no_founder_vesting",
    group: "control",
    severity: "low",
    trigger: oneOf("founder_vesting", ["no", "discussed_only"]),
    title: "Founders' shares do not vest",
    diligence:
      "Not a defect. An incoming institutional investor is likely to reopen it, and the terms are better when you arrive with a position rather than react to theirs.",
    fixedBy: "You, before the term sheet.",
    action: "Decide your position on founder vesting before the term sheet."
  }
];

export const verdicts = {
  work: "The structure needs work before you sign a term sheet.",
  slow: "This will slow the round down, it will not stop it.",
  clear: "Nothing here looks like a blocker."
};

export const outputStrings = {
  basis: "Your answers produced {issues}, {points} and {unknowns}.",
  priority: "The first priority is {finding}.",
  unknown:
    'You answered "not sure" to {unknowns} of 14 questions. In diligence, an unknown stays an open item until a document or a register closes it. Closing it now is faster than explaining it after the investor asks.',
  noUnknowns: "You answered every question. That alone puts you ahead of most companies at this stage.",
  issueCta:
    "Review the result with me. Thirty minutes, no charge. We work out which finding matters first, which documents would confirm it, and whether a written review is worth doing. No documents are reviewed on the call.",
  clearCta:
    "Nothing here looks like a blocker. The remaining risk is in the documents behind your answers. Thirty minutes, no charge, to identify which ones are worth checking before the round. You leave with a defined scope and no obligation to proceed.",
  generated: "Generated from self-reported answers on {date}. No documents were reviewed.",
  attribution: "MENADD, menadd.com. MENADD provides general information, not legal, tax or investment advice."
};

export const assessmentLinks = {
  calendar: "https://calendar.app.google/NHdtM4bGDWJgMDi16",
  email: "mailto:gennady@menadd.com",
  ownership: "/library/ownership/"
};
