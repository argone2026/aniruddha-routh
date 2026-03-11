import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Heart,
  Image as ImageIcon,
  Briefcase,
  Code2,
  ArrowRight,
  Star,
  Mail,
  Github,
  Linkedin,
} from "lucide-react";

export const dynamic = "force-dynamic";

type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
};

type HeatmapCell = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type CodingProfile = {
  name: "LeetCode" | "GitHub" | "Codeforces";
  handle: string;
  url: string;
  cells: HeatmapCell[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildHeatmapCells(activityByDay: Map<string, number>, totalDays = 98): HeatmapCell[] {
  const today = new Date();
  const days: HeatmapCell[] = [];
  let maxCount = 0;

  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const date = new Date(today.getTime() - i * DAY_MS);
    const key = isoDay(date);
    const count = activityByDay.get(key) ?? 0;
    maxCount = Math.max(maxCount, count);
    days.push({ date: key, count, level: 0 });
  }

  if (maxCount === 0) return days;

  return days.map((cell) => {
    if (cell.count === 0) return cell;
    const ratio = cell.count / maxCount;
    const level = ratio >= 0.75 ? 4 : ratio >= 0.5 ? 3 : ratio >= 0.25 ? 2 : 1;
    return { ...cell, level: level as 1 | 2 | 3 | 4 };
  });
}

async function fetchGitHubActivity(handle: string): Promise<Map<string, number>> {
  try {
    const res = await fetch(`https://api.github.com/users/${handle}/events/public?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return new Map();

    const events = (await res.json()) as Array<{ created_at?: string }>;
    const map = new Map<string, number>();
    for (const event of events) {
      if (!event.created_at) continue;
      const key = event.created_at.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function fetchLeetCodeActivity(handle: string): Promise<Map<string, number>> {
  try {
    const query = `query userProfileCalendar($username: String!, $year: Int) {\n  matchedUser(username: $username) {\n    userCalendar(year: $year) {\n      submissionCalendar\n    }\n  }\n}`;
    const year = new Date().getUTCFullYear();
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username: handle, year },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return new Map();

    const json = (await res.json()) as {
      data?: {
        matchedUser?: {
          userCalendar?: {
            submissionCalendar?: string;
          };
        };
      };
    };

    const calendarRaw = json.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (!calendarRaw) return new Map();

    const calendar = JSON.parse(calendarRaw) as Record<string, number>;
    const map = new Map<string, number>();
    for (const [timestamp, count] of Object.entries(calendar)) {
      const date = new Date(Number(timestamp) * 1000);
      const key = isoDay(date);
      map.set(key, (map.get(key) ?? 0) + Number(count));
    }
    return map;
  } catch {
    return new Map();
  }
}

async function fetchCodeforcesActivity(handle: string): Promise<Map<string, number>> {
  try {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return new Map();

    const json = (await res.json()) as {
      status?: string;
      result?: Array<{ creationTimeSeconds?: number }>;
    };
    if (json.status !== "OK" || !json.result) return new Map();

    const map = new Map<string, number>();
    for (const submission of json.result) {
      if (!submission.creationTimeSeconds) continue;
      const date = new Date(submission.creationTimeSeconds * 1000);
      const key = isoDay(date);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  } catch {
    return new Map();
  }
}

function getHeatCellClass(level: HeatmapCell["level"]) {
  switch (level) {
    case 1:
      return "bg-emerald-200";
    case 2:
      return "bg-emerald-300";
    case 3:
      return "bg-emerald-400";
    case 4:
      return "bg-emerald-500";
    default:
      return "bg-slate-200";
  }
}

async function getData() {
  const [achievements, hobbies, photos, workExperience, projects, leetcodeActivity, githubActivity, codeforcesActivity] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.hobby.findMany({ orderBy: { createdAt: "asc" }, take: 4 }),
    prisma.photo.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.workExperience.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    fetch(
      "https://api.github.com/users/argone2026/repos?sort=created&direction=asc&per_page=3",
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: 3600 },
      }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((repos: GitHubRepo[]) => repos.slice(0, 3))
      .catch(() => [] as GitHubRepo[]),
    fetchLeetCodeActivity("aniruddharouth"),
    fetchGitHubActivity("argone2026"),
    fetchCodeforcesActivity("argone.exe"),
  ]);

  const codingProfiles: CodingProfile[] = [
    {
      name: "LeetCode",
      handle: "aniruddharouth",
      url: "https://leetcode.com/u/aniruddharouth/",
      cells: buildHeatmapCells(leetcodeActivity),
    },
    {
      name: "GitHub",
      handle: "argone2026",
      url: "https://github.com/argone2026",
      cells: buildHeatmapCells(githubActivity),
    },
    {
      name: "Codeforces",
      handle: "argone.exe",
      url: "https://codeforces.com/profile/argone.exe",
      cells: buildHeatmapCells(codeforcesActivity),
    },
  ];

  return { achievements, hobbies, photos, workExperience, projects, codingProfiles };
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  heart: Heart,
  star: Star,
};

export default async function Home() {
  const { achievements, hobbies, photos, workExperience, projects, codingProfiles } = await getData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            AR
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#about" className="text-slate-600 hover:text-indigo-600 transition-colors">About</Link>
            <Link href="#coding" className="text-slate-600 hover:text-indigo-600 transition-colors">Coding</Link>
            <Link href="#experience" className="text-slate-600 hover:text-indigo-600 transition-colors">Experience</Link>
            <Link href="#projects" className="text-slate-600 hover:text-indigo-600 transition-colors">Projects</Link>
            <Link href="#achievements" className="text-slate-600 hover:text-indigo-600 transition-colors">Achievements</Link>
            <Link href="#gallery" className="text-slate-600 hover:text-indigo-600 transition-colors">Gallery</Link>
            <Link href="#hobbies" className="text-slate-600 hover:text-indigo-600 transition-colors">Hobbies</Link>
            <Link href="#contact" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Welcome to my portfolio
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Hi, I&apos;m{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Aniruddha Routh
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
              Software engineer focused on building things that actually work.
              <br />
              <br />
              I turn messy problems into clean systems using Python, Java, and machine learning. My work sits at the intersection of software engineering and practical AI - APIs, data pipelines, and products that solve real problems.
              <br />
              <br />
              When I&apos;m not writing code, I&apos;m lifting heavy, studying systems deeply, or building the next version of myself.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#achievements" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                View Achievements <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#contact" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors font-medium">
                Get in Touch
              </Link>
            </div>
          </div>
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-200 text-white text-6xl font-bold">
            AR
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">About Me</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Briefcase, title: "Experience", count: workExperience.length, label: "roles delivered", href: "#experience", color: "text-sky-500", bg: "bg-sky-50" },
              { icon: Github, title: "Projects", count: projects.length, label: "repos on GitHub", href: "#projects", color: "text-violet-500", bg: "bg-violet-50" },
              { icon: Trophy, title: "Achievements", count: achievements.length, label: "milestones reached", href: "#achievements", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: Heart, title: "Hobbies", count: hobbies.length, label: "passions pursued", href: "#hobbies", color: "text-rose-500", bg: "bg-rose-50" },
            ].map(({ icon: Icon, title, count, label, href, color, bg }) => (
              <Link key={title} href={href} className="p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bg} ${color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{count}+</div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-sm font-medium text-indigo-600 mt-2 flex items-center gap-1">
                  View {title} <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section id="experience" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Work Experience</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full" />
            </div>
          </div>
          {workExperience.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No work experience added yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {workExperience.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md hover:border-sky-200 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{item.role}</h3>
                      <p className="text-slate-600 font-medium mt-1">{item.company}</p>
                    </div>
                    <div className="text-sm text-slate-400 md:text-right">
                      <div>{item.period}</div>
                      {item.location && <div>{item.location}</div>}
                    </div>
                  </div>
                  <p className="text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Projects</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
            </div>
            <a
              href="https://github.com/argone2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              Show more <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Projects are temporarily unavailable.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <a
                  key={project.id}
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                >
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 min-h-[42px]">
                    {project.description ?? "No description provided."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{project.language ?? "Unknown"}</span>
                    <span>Stars: {project.stargazers_count}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Coding Profiles Section */}
      <section id="coding" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Coding Profiles</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {codingProfiles.map((profile) => (
              <a
                key={profile.name}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                    <p className="text-sm text-slate-500">@{profile.handle}</p>
                  </div>
                  <Code2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
                  {profile.cells.map((cell) => (
                    <div
                      key={`${profile.name}-${cell.date}`}
                      title={`${cell.date}: ${cell.count} activity`}
                      className={`w-2.5 h-2.5 rounded-sm ${getHeatCellClass(cell.level)}`}
                    />
                  ))}
                </div>

                <div className="mt-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>Last {profile.cells.length} days</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    Open profile <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Achievements</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            </div>
            <Link href="/achievements" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {achievements.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No achievements yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const Icon = ICON_MAP[achievement.icon] ?? Trophy;
                return (
                  <div key={achievement.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-500 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{achievement.date}</div>
                    <h3 className="font-semibold text-slate-900 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Gallery</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
            </div>
            <Link href="/gallery" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {photos.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No photos yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-200">
                  <Image
                    src={photo.url}
                    alt={photo.alt ?? photo.caption ?? "Gallery photo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hobbies Section */}
      <section id="hobbies" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Hobbies &amp; Interests</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
            </div>
            <Link href="/hobbies" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {hobbies.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hobbies listed yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {hobbies.map((hobby) => {
                const Icon = ICON_MAP[hobby.icon] ?? Heart;
                return (
                  <div key={hobby.id} className="p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-rose-200 transition-all duration-300 text-center group">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{hobby.name}</h3>
                    <p className="text-sm text-slate-500">{hobby.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-8" />
          <p className="text-slate-600 mb-8">I&apos;d love to connect! Feel free to reach out via any of the platforms below.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="mailto:bat.coder.2024@gmail.com" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              <Mail className="w-4 h-4" /> Email Me
            </a>
            <a href="https://github.com/argone2026" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/aniruddha-routh/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Aniruddha Routh. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="mailto:bat.coder.2024@gmail.com"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Email
            </a>
            <a
              href="https://github.com/argone2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/aniruddha-routh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              LinkedIn
            </a>
            <Link href="/admin/login" className="text-slate-400 hover:text-slate-600 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
