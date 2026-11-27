import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  ClipboardCheck,
  Send,
  ShieldCheck,
  LayoutDashboard,
  Building2,
} from "lucide-react";

import LandingNavbar from "../components/Landing/Navbar";
import FeatureCard from "../components/Landing/FeatureCard";
import LandingFooter from "../components/Landing/Footer";

const features = [
  {
    icon: Building2,
    title: "Organize your workspace",
    description:
      "Create organizations and bring different teams together under one structured workspace.",
  },
  {
    icon: Users,
    title: "Manage your teams",
    description:
      "Create teams, assign team heads, manage members and keep responsibilities clear.",
  },
  {
    icon: ClipboardCheck,
    title: "Track tasks",
    description:
      "Create tasks, assign team members, set priorities and track progress from one place.",
  },
  {
    icon: Send,
    title: "Cross-team requests",
    description:
      "Send formal requests to other teams, get approvals and assign members to complete the work.",
  },
  {
    icon: LayoutDashboard,
    title: "Clear dashboards",
    description:
      "See your tasks, pending requests, teams and important work without unnecessary clutter.",
  },
  {
    icon: ShieldCheck,
    title: "Structured permissions",
    description:
      "Keep responsibilities organized with organization-level roles and team-level permissions.",
  },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-indigo-50/70 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Great teams work better
              <span className="text-indigo-600"> together.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
              TeamHub brings your organization, teams, tasks and cross-team
              requests together in one place. Spend less time coordinating
              work and more time getting it done.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-gray-700"
              >
                Get started for free
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/login"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Login to TeamHub
              </Link>
            </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Everything in one place
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Built for teams that get things done
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              From managing your own tasks to coordinating with another team,
              TeamHub keeps the entire workflow organized.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      
      <section id="how-it-works" className="scroll-mt-24 bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Simple workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              From planning to completion
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Give every team a clear way to organize work and collaborate
              across your organization.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create your organization",
                description:
                  "Set up your workspace and bring your organization members together.",
              },
              {
                number: "02",
                title: "Build teams and assign tasks",
                description:
                  "Create teams, add members and distribute responsibilities clearly.",
              },
              {
                number: "03",
                title: "Collaborate and track progress",
                description:
                  "Send requests between teams, approve work and track it until completion.",
              },
            ].map((step) => (
              <div key={step.number} className="relative rounded-2xl border border-gray-200 bg-white p-7">
                <span className="text-sm font-bold tracking-widest text-indigo-600">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gray-900 px-7 py-14 text-center text-white sm:px-14">
          <p className="text-sm font-medium text-indigo-300">Your team workspace starts here</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Bring your people, tasks and teams together.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
            Create your TeamHub workspace and make team coordination simpler.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-indigo-50"
          >
            Create your workspace
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}