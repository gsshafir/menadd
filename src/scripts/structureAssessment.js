import {
  assessmentLinks,
  findingLibrary,
  outputStrings,
  questionGroups,
  structureAssessmentCopy,
  verdicts
} from "../data/structureAssessment.js";

const severityRank = { high: 3, medium: 2, low: 1 };
const questions = questionGroups.flatMap((group) => group.questions);

function matchesTrigger(trigger, answers) {
  if (trigger.all) return trigger.all.every((condition) => matchesTrigger(condition, answers));
  if (trigger.any) return trigger.any.some((condition) => matchesTrigger(condition, answers));

  const answer = answers[trigger.question];
  if (trigger.operator === "equals") return answer === trigger.value;
  if (trigger.operator === "notEquals") return answer !== trigger.value;
  if (trigger.operator === "in") return trigger.values.includes(answer);
  return false;
}

function fill(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function lowercaseFirstWord(text) {
  return text.replace(/^[A-Z]/, (letter) => letter.toLowerCase());
}

export function evaluateStructureAssessment(answers) {
  const triggered = findingLibrary
    .map((finding, order) => ({ finding, order }))
    .filter(({ finding }) => matchesTrigger(finding.trigger, answers))
    .map(({ finding, order }) => {
      const escalation = finding.severityEscalations?.find((rule) => matchesTrigger(rule.trigger, answers));
      return { ...finding, severity: escalation?.severity ?? finding.severity, order };
    });

  const suppressed = new Set(triggered.flatMap((finding) => finding.suppresses ?? []));
  const findings = triggered
    .filter((finding) => !suppressed.has(finding.id))
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || a.order - b.order);

  const unknowns = questions.filter(
    (question) => question.id !== "entity_jurisdiction" && answers[question.id] === "unsure"
  ).length;
  const issues = findings.filter((finding) => finding.severity === "high");
  const points = findings.filter((finding) => finding.severity !== "high");
  const highCount = issues.length;
  const mediumCount = findings.filter((finding) => finding.severity === "medium").length;
  const verifyCount = points.length;

  let verdictKey = highCount > 0 || mediumCount >= 3 ? "work" : mediumCount > 0 ? "slow" : "clear";
  const unknownOverride = unknowns >= 5 && verdictKey === "clear";
  if (unknownOverride) verdictKey = "slow";

  const basis = fill(outputStrings.basis, {
    issues: countLabel(highCount, "structural issue", "structural issues"),
    points: countLabel(verifyCount, "point to verify", "points to verify"),
    unknowns: countLabel(unknowns, "unknown", "unknowns")
  }) + (findings[0]
    ? ` ${fill(outputStrings.priority, { finding: lowercaseFirstWord(findings[0].title) })}`
    : "");
  const unknownText = unknowns === 0
    ? outputStrings.noUnknowns
    : fill(outputStrings.unknown, { unknowns });

  const seenGroups = new Set();
  const actions = [];
  for (const finding of findings) {
    if (seenGroups.has(finding.group)) continue;
    seenGroups.add(finding.group);
    actions.push(finding);
    if (actions.length === 3) break;
  }

  return {
    actions,
    basis,
    findings,
    highCount,
    issues,
    mediumCount,
    unknownOverride,
    unknowns,
    unknownText,
    points,
    verdict: verdicts[verdictKey],
    verdictKey,
    verifyCount
  };
}

function appendTextElement(parent, tagName, text, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function buildCopyText(result) {
  const lines = [result.verdict, result.basis, ""];

  if (result.findings.length) {
    lines.push(structureAssessmentCopy.findingsHeading + ":");
    for (const finding of result.findings) {
      lines.push(`- ${finding.title}`);
      lines.push(`  ${finding.diligence}`);
    }
    lines.push("");
  }

  lines.push(result.unknownText);

  if (result.actions.length) {
    lines.push("");
    lines.push(structureAssessmentCopy.actionsHeading + ":");
    result.actions.forEach((finding, index) => lines.push(`${index + 1}. ${finding.fixedBy}`));
  }

  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
  lines.push("");
  lines.push(fill(outputStrings.generated, { date }));
  lines.push(outputStrings.attribution);
  return lines.join("\n");
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // The textarea fallback below handles denied clipboard access.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

export function initialiseStructureAssessment() {
  const form = document.querySelector("[data-structure-form]");
  const resultsElement = document.querySelector("[data-structure-results]");
  const progressElement = document.querySelector("[data-question-progress]");
  const readinessElement = document.querySelector("[data-question-readiness]");
  const summaryElement = document.querySelector("[data-result-summary]");
  const findingsSection = document.querySelector("[data-findings-section]");
  const issuesGroup = document.querySelector("[data-issues-group]");
  const issuesElement = document.querySelector("[data-issues]");
  const pointsGroup = document.querySelector("[data-points-group]");
  const pointsElement = document.querySelector("[data-points]");
  const actionsSection = document.querySelector("[data-actions-section]");
  const actionsElement = document.querySelector("[data-actions]");
  const ctaTextElement = document.querySelector("[data-cta-text]");
  const copyButton = document.querySelector("[data-copy-structure]");
  const copyStatus = document.querySelector("[data-copy-structure-status]");

  if (!(form instanceof HTMLFormElement)) return;
  if (!(resultsElement instanceof HTMLElement)) return;

  let lastResult = null;

  const readAnswers = () => {
    const data = new FormData(form);
    return Object.fromEntries(questions.map((question) => [question.id, String(data.get(question.id) || "")]));
  };

  const updateProgress = () => {
    const answers = readAnswers();
    const remaining = questions.filter((question) => !answers[question.id]).length;
    if (progressElement) {
      progressElement.textContent = `${remaining} ${remaining === 1 ? "question" : "questions"} remaining.`;
    }
    if (readinessElement) {
      readinessElement.textContent = remaining === 0 ? "All questions answered. Ready to see your result." : "";
    }
  };

  const render = (result) => {
    if (summaryElement) {
      summaryElement.innerHTML = "";
      appendTextElement(summaryElement, "h2", result.verdict);
      if (result.unknownOverride) appendTextElement(summaryElement, "p", result.unknownText);
      appendTextElement(summaryElement, "p", result.basis);
      if (!result.unknownOverride) appendTextElement(summaryElement, "p", result.unknownText);
    }

    if (findingsSection && issuesGroup && issuesElement && pointsGroup && pointsElement) {
      issuesElement.innerHTML = "";
      pointsElement.innerHTML = "";
      findingsSection.hidden = result.findings.length === 0;
      issuesGroup.hidden = result.issues.length === 0;
      pointsGroup.hidden = result.points.length === 0;

      const renderFinding = (finding, parent) => {
        const article = document.createElement("article");
        article.className = "section-entry";
        appendTextElement(article, "h3", finding.title);
        appendTextElement(article, "p", finding.diligence);
        const fixedBy = appendTextElement(article, "p", finding.fixedBy);
        const label = document.createElement("strong");
        label.textContent = "Fixed by: ";
        fixedBy.prepend(label);
        parent.append(article);
      };

      result.issues.forEach((finding) => renderFinding(finding, issuesElement));
      result.points.forEach((finding) => renderFinding(finding, pointsElement));
    }

    if (actionsSection && actionsElement) {
      actionsElement.innerHTML = "";
      actionsSection.hidden = result.actions.length === 0;
      for (const finding of result.actions) {
        appendTextElement(actionsElement, "li", finding.fixedBy);
      }
    }

    if (ctaTextElement) {
      ctaTextElement.textContent = result.highCount > 0 || result.mediumCount > 0
        ? outputStrings.issueCta
        : outputStrings.clearCta;
    }

    resultsElement.hidden = false;
    resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  form.addEventListener("change", updateProgress);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answers = readAnswers();
    const firstUnanswered = questions.find((question) => !answers[question.id]);
    if (firstUnanswered) {
      const questionElement = document.getElementById(`question-${firstUnanswered.id}`);
      questionElement?.focus();
      return;
    }

    lastResult = evaluateStructureAssessment(answers);
    render(lastResult);
  });

  copyButton?.addEventListener("click", async () => {
    if (!lastResult) return;
    const copied = await copyText(buildCopyText(lastResult));
    if (copyStatus) {
      copyStatus.textContent = copied ? structureAssessmentCopy.copied : structureAssessmentCopy.copyFailed;
    }
  });

  const calendarLink = document.querySelector("[data-calendar-link]");
  if (calendarLink instanceof HTMLAnchorElement) calendarLink.href = assessmentLinks.calendar;

  updateProgress();
}
