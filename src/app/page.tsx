import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Heart,
  Image as ImageIcon,
  ArrowRight,
  Star,
  Mail,
  Github,
  Linkedin,
} from "lucide-react";

async function getData() {
  const [achievements, hobbies, photos] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.hobby.findMany({ orderBy: { createdAt: "asc" }, take: 4 }),
    prisma.photo.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  return { achievements, hobbies, photos };
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  heart: Heart,
  star: Star,
};

export default async function Home() {
  const { achievements, hobbies, photos } = await getData();

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
            <Link href="#achievements" className="text-slate-600 hover:text-indigo-600 transition-colors">Achievements</Link>
            <Link href="#hobbies" className="text-slate-600 hover:text-indigo-600 transition-colors">Hobbies</Link>
            <Link href="#gallery" className="text-slate-600 hover:text-indigo-600 transition-colors">Gallery</Link>
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
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              A passionate individual who loves exploring technology, creativity, and life. Welcome to my personal space on the internet.
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
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, title: "Achievements", count: achievements.length, label: "milestones reached", href: "#achievements", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: Heart, title: "Hobbies", count: hobbies.length, label: "passions pursued", href: "#hobbies", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: ImageIcon, title: "Photos", count: photos.length, label: "moments captured", href: "#gallery", color: "text-indigo-500", bg: "bg-indigo-50" },
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

      {/* Hobbies Section */}
      <section id="hobbies" className="py-20 px-6 bg-white">
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

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-6">
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

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-8" />
          <p className="text-slate-600 mb-8">I&apos;d love to connect! Feel free to reach out via any of the platforms below.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="mailto:hello@example.com" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              <Mail className="w-4 h-4" /> Email Me
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Aniruddha Routh. All rights reserved.</p>
          <Link href="/admin/login" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
