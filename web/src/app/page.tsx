"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Lightbulb,
  PenLine,
  SearchCheck,
  BarChart3,
  Quote,
  Users,
  ArrowRight,
  Sparkles,
  Check,
  Star,
  Zap,
  BookOpen,
  FileText,
  Download,
} from "lucide-react";

/* ============================================================
   Animation Variants
   ============================================================ */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/* ============================================================
   Floating Elements (Hero Background)
   ============================================================ */
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.4), transparent)",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 2 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.4), transparent)",
        }}
        animate={{
          x: [-20, 20, -10, -20],
          y: [10, -30, 10, 10],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 3 */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.3), transparent)",
        }}
        animate={{
          x: [10, -15, 20, 10],
          y: [-10, 20, -15, -10],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Floating icons */}
      <motion.div
        className="absolute top-1/4 left-[15%] text-indigo-400/40"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <BookOpen className="w-8 h-8" />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-[20%] text-purple-400/30"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <PenLine className="w-7 h-7" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 left-[25%] text-cyan-400/30"
        animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>
      <motion.div
        className="absolute top-[60%] right-[10%] text-indigo-300/25"
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Star className="w-7 h-7" />
      </motion.div>
    </div>
  );
}

/* ============================================================
   Hero Section
   ============================================================ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      <FloatingElements />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-indigo-500/20 text-sm font-medium text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI-Powered Academic Writing Suite
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
        >
          <span className="gradient-text glow-text">Thesis Master</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          From idea to polished thesis —{" "}
          <span className="text-indigo-300 font-semibold">
            plan, write, and refine
          </span>{" "}
          your academic masterpiece with the power of advanced AI. Designed for
          researchers, by researchers.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-500/25 group"
          >
            Start Writing Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="btn-glass text-base px-8 py-3.5 rounded-xl"
          >
            Explore Features
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "10K+", label: "Theses Generated" },
            { value: "95%", label: "Satisfaction Rate" },
            { value: "50K+", label: "Citations Managed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text-blue">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0e27] to-transparent" />
    </section>
  );
}

/* ============================================================
   Features Section
   ============================================================ */
const features = [
  {
    icon: Lightbulb,
    title: "Smart Planning",
    description:
      "Generate comprehensive thesis outlines, research questions, and chapter structures tailored to your field.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: PenLine,
    title: "AI Writing",
    description:
      "Write each section with AI assistance that maintains academic tone, proper citations, and logical flow.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: SearchCheck,
    title: "Deep Review",
    description:
      "Get instant feedback on grammar, structure, argument strength, and academic style with detailed suggestions.",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Research Analysis",
    description:
      "Analyze research data, generate insights, and create visualizations that strengthen your arguments.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Quote,
    title: "Smart Citations",
    description:
      "Automatically format citations in APA, MLA, Chicago, and more. Never worry about bibliography formatting again.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Users,
    title: "Collaborate",
    description:
      "Work with advisors and peers in real-time. Share drafts, get comments, and track changes seamlessly.",
    gradient: "from-rose-500 to-red-600",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete suite of AI-powered tools designed for every stage of
            your academic writing journey.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="glass-card p-6 sm:p-8 group cursor-default"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   How It Works Section
   ============================================================ */
const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Input Your Topic",
    description:
      "Describe your research topic, field of study, and any specific requirements. Our AI understands academic contexts across all disciplines.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI Generates Content",
    description:
      "The AI crafts each section with proper academic rigor — from literature review to methodology, results, and discussion.",
  },
  {
    step: "03",
    icon: Download,
    title: "Review & Download",
    description:
      "Review the generated content, make refinements with AI assistance, then export your complete thesis in your preferred format.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[#080c22]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/3 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Three simple steps from idea to finished thesis. No complicated
            setup, just powerful results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-indigo-500/40" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={idx * 0.15}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="relative mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-indigo-400" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {idx + 1}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Pricing Section
   ============================================================ */
const pricingTiers = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Perfect for getting started and exploring the basics.",
    highlighted: false,
    features: [
      "1 thesis project",
      "Basic AI writing assistance",
      "5 AI generations per day",
      "Standard citation formats",
      "Export to PDF",
      "Community support",
    ],
    missing: [
      "Advanced AI models",
      "Priority processing",
      "Plagiarism check",
      "Collaboration tools",
    ],
    cta: "Get Started Free",
    href: "/login",
  },
  {
    name: "Pro",
    price: "29",
    period: "/month",
    description:
      "For serious researchers who need advanced AI capabilities.",
    highlighted: true,
    features: [
      "10 thesis projects",
      "Advanced AI writing (GPT-4)",
      "Unlimited AI generations",
      "All citation formats",
      "Export to PDF, Word, LaTeX",
      "Plagiarism checker",
      "Priority processing",
      "Email support",
    ],
    missing: [],
    cta: "Start Pro Trial",
    href: "/login?plan=pro",
  },
  {
    name: "VIP",
    price: "99",
    period: "/month",
    description: "For power users and research teams with maximum needs.",
    highlighted: false,
    features: [
      "Unlimited thesis projects",
      "Cutting-edge AI models",
      "Unlimited everything",
      "All citation formats + custom",
      "All export formats",
      "Advanced plagiarism check",
      "Real-time collaboration",
      "Priority 24/7 support",
      "API access",
      "Custom AI fine-tuning",
    ],
    missing: [],
    cta: "Go VIP",
    href: "/login?plan=vip",
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your research needs. Upgrade anytime as
            your requirements grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeInUp}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? "glass-strong border-indigo-500/30 shadow-xl shadow-indigo-500/10 scale-[1.02]"
                  : "glass-card"
              }`}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-semibold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    ¥{tier.price}
                  </span>
                  <span className="text-sm text-slate-400">{tier.period}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
                {tier.missing.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-500 line-through"
                  >
                    <span className="w-4 h-4 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.href}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
                    : "glass border border-indigo-500/20 text-slate-300 hover:text-white hover:bg-indigo-500/10"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA Section
   ============================================================ */
function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-cta overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Glow line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Icon */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Write Your{" "}
            <span className="gradient-text">Masterpiece</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Join thousands of researchers who are accelerating their academic
            writing with AI. Start free, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="btn-primary text-base px-10 py-4 rounded-xl shadow-xl shadow-indigo-500/25 group"
            >
              Start Writing Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="btn-glass text-base px-10 py-4 rounded-xl"
            >
              Learn More
            </Link>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-sm text-slate-500">
            No credit card required · Free forever plan available · Cancel
            anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Main Page Component
   ============================================================ */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
