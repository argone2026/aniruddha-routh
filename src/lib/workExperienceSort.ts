type WorkExperienceLike = {
  period: string;
  createdAt?: Date;
};

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseMonthYear(value: string): Date | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  const monthYear = normalized.match(
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/
  );
  if (monthYear) {
    const [, monthToken, yearToken] = monthYear;
    const month = MONTHS[monthToken];
    const year = Number(yearToken);
    if (Number.isFinite(month) && Number.isFinite(year)) {
      return new Date(Date.UTC(year, month, 1));
    }
  }

  const yearOnly = normalized.match(/\b(19|20)\d{2}\b/);
  if (yearOnly) {
    const year = Number(yearOnly[0]);
    return new Date(Date.UTC(year, 0, 1));
  }

  return null;
}

function getPeriodScores(period: string) {
  const parts = period.split(/\s*(?:-|\u2013|\u2014|to)\s*/i).map((p) => p.trim()).filter(Boolean);
  const start = parseMonthYear(parts[0] ?? period);
  const endToken = parts[1] ?? "";
  const isPresent = /present|current|now/i.test(endToken);
  const end = isPresent ? new Date("9999-12-31T00:00:00.000Z") : parseMonthYear(endToken);

  return {
    endScore: end ? end.getTime() : 0,
    startScore: start ? start.getTime() : 0,
  };
}

export function sortWorkExperienceByMostRecent<T extends WorkExperienceLike>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aScores = getPeriodScores(a.period ?? "");
    const bScores = getPeriodScores(b.period ?? "");

    if (bScores.endScore !== aScores.endScore) {
      return bScores.endScore - aScores.endScore;
    }
    if (bScores.startScore !== aScores.startScore) {
      return bScores.startScore - aScores.startScore;
    }

    const aCreated = a.createdAt ? a.createdAt.getTime() : 0;
    const bCreated = b.createdAt ? b.createdAt.getTime() : 0;
    return bCreated - aCreated;
  });
}
