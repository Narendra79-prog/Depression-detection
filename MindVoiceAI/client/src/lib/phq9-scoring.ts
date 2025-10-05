import type { PHQ9Question } from "@/types/assessment";

export const PHQ9_QUESTIONS: PHQ9Question[] = [
  {
    id: 0,
    text: "Little interest or pleasure in doing things?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 1,
    text: "Feeling down, depressed, or hopeless?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 2,
    text: "Trouble falling or staying asleep, or sleeping too much?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 3,
    text: "Feeling tired or having little energy?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 4,
    text: "Poor appetite or overeating?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 5,
    text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 6,
    text: "Trouble concentrating on things, such as reading the newspaper or watching television?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 7,
    text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  },
  {
    id: 8,
    text: "Thoughts that you would be better off dead, or of hurting yourself in some way?",
    options: [
      { value: 0, label: "Not at all", description: "(0 points)" },
      { value: 1, label: "Several days", description: "(1 point)" },
      { value: 2, label: "More than half the days", description: "(2 points)" },
      { value: 3, label: "Nearly every day", description: "(3 points)" }
    ]
  }
];

export function calculatePHQ9Score(responses: { questionIndex: number; score: number }[]): number {
  return responses.reduce((total, response) => total + response.score, 0);
}

export function getSeverityLevel(score: number): {
  level: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  description: string;
} {
  if (score <= 4) {
    return { level: "minimal", description: "Minimal Depression" };
  } else if (score <= 9) {
    return { level: "mild", description: "Mild Depression" };
  } else if (score <= 14) {
    return { level: "moderate", description: "Moderate Depression" };
  } else if (score <= 19) {
    return { level: "moderately-severe", description: "Moderately Severe Depression" };
  } else {
    return { level: "severe", description: "Severe Depression" };
  }
}
