import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  ScanEye,
  BellRing,
  Users,
  ClipboardList,
  ImagePlus,
  ArrowRight,
  Mail,
  Link2,
  Share2,
} from "lucide-react";

const TOKENS = {
  void: "#0A0E14",
  panel: "#121826",
  line: "#1E2A3F",
  signal: "#22D3EE",
  alert: "#F59E0B",
  danger: "#EF4444",
  ink: "#E7ECF3",
  fog: "#8B98AC",
};

const STATUS_COLOR = {
  online: TOKENS.signal,
  degraded: TOKENS.alert,
  offline: TOKENS.danger,
};

const TILE_COUNT = 18;

function makeInitialCameras() {
  return Array.from({ length: TILE_COUNT }, (_, i) => ({
    id: `CAM-${String(i + 1).padStart(2, "0")}`,
    status: Math.random() < 0.82 ? "online" : Math.random() < 0.6 ? "degraded" : "offline",
  }));
}

export default function Home() {
  const [cameras, setCameras] = useState(makeInitialCameras);

  useEffect(() => {
    const interval = setInterval(() => {
      setCameras((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        const roll = Math.random();
        const status = roll < 0.78 ? "online" : roll < 0.93 ? "degraded" : "offline";
        next[idx] = { ...next[idx], status };
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = cameras.filter((c) => c.status === "online").length;

  return (
    <div
      style={{ backgroundColor: TOKENS.void, color: TOKENS.ink }}
      className="min-h-screen w-full"
    >
      {/* NAV */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ borderColor: TOKENS.line, backgroundColor: "rgba(10,14,20,0.85)" }}
      >
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <ScanEye size={22} color={TOKENS.signal} strokeWidth={2} />
            <span className="text-lg tracking-wide font-semibold">CamGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: TOKENS.fog }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#about", label: "About" },
              { href: "#contact", label: "Contact" },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>
         <Link
            to="/login"
            className="text-sm px-4 py-2 rounded border transition-colors"
            style={{ borderColor: TOKENS.signal, color: TOKENS.signal }}
          >
            Login →
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl leading-[1.15] font-semibold tracking-tight mb-5">
            CCTV Health
            <br />
            Monitoring <span style={{ color: TOKENS.signal }}>System</span>
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: TOKENS.fog }}>
            Real-time camera monitoring, automatic issue detection, and technician dispatch — all in one place.
          </p>
          <div className="flex items-center gap-4">
             <Link
              to="/login"
              className="text-sm px-5 py-3 rounded flex items-center gap-2 font-medium transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: TOKENS.signal, color: TOKENS.void }}
            >
              Login to Dashboard <ArrowRight size={16} />
            </Link>
            <span className="text-xs" style={{ color: TOKENS.fog }}>
              Admin &amp; Technician access
            </span>
          </div>
        </div>

        {/* Live camera wall */}
        <div
          className="relative rounded-lg border p-4 overflow-hidden"
          style={{ borderColor: TOKENS.line, backgroundColor: TOKENS.panel }}
        >
          <div className="flex items-center justify-between mb-3 text-xs" style={{ color: TOKENS.fog }}>
            <span className="tracking-[0.15em] uppercase">Live feed status</span>
            <span>
              {onlineCount}/{TILE_COUNT} online
            </span>
          </div>

          <div className="rounded overflow-hidden" style={{ backgroundColor: "#0D1219" }}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3">
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="rounded border px-2 py-2 flex flex-col items-center gap-1.5 transition-colors duration-500"
                  style={{ borderColor: TOKENS.line, backgroundColor: TOKENS.panel }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
                    style={{ backgroundColor: STATUS_COLOR[cam.status] }}
                  />
                  <span className="text-[9px]" style={{ color: TOKENS.fog }}>
                    {cam.id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-[10px]" style={{ color: TOKENS.fog }}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TOKENS.signal }} /> Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TOKENS.alert }} /> Degraded
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TOKENS.danger }} /> Offline
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t" style={{ borderColor: TOKENS.line }}>
        <div className="mb-12">
          <span className="text-xs tracking-[0.2em] uppercase" style={{ color: TOKENS.signal }}>
            Capabilities
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold mt-3">Features of CamGuard</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Camera,
              title: "Real-Time Health Checks",
              desc: "Every camera is pinged and stream-tested on a schedule, so an offline camera is caught in minutes, not after someone asks for footage that isn't there.",
            },
            {
              icon: ScanEye,
              title: "Vision Analysis",
              desc: "Captured frames are automatically screened for blur and obstruction, flagging cameras that are technically online but not actually seeing anything useful.",
            },
            {
              icon: BellRing,
              title: "Instant Alerts",
              desc: "The moment an issue is detected, admins are notified in real time — no need to babysit a dashboard waiting for something to go wrong.",
            },
            {
              icon: Users,
              title: "Smart Dispatch",
              desc: "Technician suggestions rank by current workload, so the least-busy person gets the next job and nobody's queue quietly piles up.",
            },
            {
              icon: ClipboardList,
              title: "Full Incident Trail",
              desc: "Every issue is tracked from open to resolved, with remarks at each step — assign, accept, reject, complete — so nothing is left ambiguous.",
            },
            {
              icon: ImagePlus,
              title: "Live Snapshots",
              desc: "Pull the last known frame from any camera on demand, even if the live stream is down, to see exactly what it last captured.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded p-6 border"
              style={{ borderColor: TOKENS.line, backgroundColor: TOKENS.panel }}
            >
              <Icon size={20} color={TOKENS.signal} strokeWidth={1.75} className="mb-4" />
              <h3 className="text-sm uppercase tracking-wide mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: TOKENS.fog }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t" style={{ borderColor: TOKENS.line }}>
        <div className="mb-14">
          <span className="text-xs tracking-[0.2em] uppercase" style={{ color: TOKENS.signal }}>
            Pipeline
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold mt-3">How an issue gets resolved</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px" style={{ backgroundColor: TOKENS.line }} />
          {[
            { n: "01", title: "Detect", desc: "A scheduled health check finds a camera offline, blurred, or obstructed." },
            { n: "02", title: "Alert", desc: "Admins get an instant notification — the issue is logged automatically." },
            { n: "03", title: "Assign", desc: "A technician is suggested by workload and dispatched to the incident." },
            { n: "04", title: "Resolve", desc: "The fix is confirmed on-site and the camera's health is re-verified." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="relative">
              <div
                className="text-xs w-12 h-12 rounded-full border flex items-center justify-center relative z-10 mb-4"
                style={{ borderColor: TOKENS.signal, color: TOKENS.signal, backgroundColor: TOKENS.void }}
              >
                {n}
              </div>
              <h3 className="text-sm uppercase tracking-wide mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: TOKENS.fog }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20 border-t" style={{ borderColor: TOKENS.line }}>
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: TOKENS.signal }}>
              About
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold mt-3">Why this system exists</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: TOKENS.fog }}>
            Manually checking whether every camera in a network is actually online, in focus, and unobstructed
            doesn't scale — issues get found only after someone needs footage that was never captured. VIGIL
            automates that watch: it runs the health checks, raises the alerts, and tracks every incident through
            to a technician's fix, so camera downtime is caught in minutes instead of discovered after the fact.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t" style={{ borderColor: TOKENS.line }}>
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center justify-center gap-2 mb-10">
            <ScanEye size={16} color={TOKENS.signal} />
            <span className="text-sm">CamGuard</span>
          </div>

          <div className="grid sm:grid-cols-4 gap-y-10">
            {/* About Us */}
            <div className="px-6 text-center sm:text-left">
              <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: TOKENS.signal }}>
                About Us
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: TOKENS.fog }}>
                CamGuard was built by a 3-member team — [Name 1], [Name 2], and [Name 3] — as a
                course project for SWE 0610-3250.
              </p>
            </div>

            {/* Contact */}
            <div className="px-6 sm:border-l text-center sm:text-left" style={{ borderColor: TOKENS.line }}>
              <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: TOKENS.signal }}>
                Contact
              </h4>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Name 1", email: "name1@example.com", linkedin: "#", facebook: "#" },
                  { name: "Name 2", email: "name2@example.com", linkedin: "#", facebook: "#" },
                  { name: "Name 3", email: "name3@example.com", linkedin: "#", facebook: "#" },
                ].map((person) => (
                  <div key={person.name}>
                    <p className="text-xs mb-1.5" style={{ color: TOKENS.ink }}>
                      {person.name}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <a href={`mailto:${person.email}`} className="hover:text-white transition-colors" style={{ color: TOKENS.fog }}>
                        <Mail size={14} />
                      </a>
                      <a href={person.linkedin} className="hover:text-white transition-colors" style={{ color: TOKENS.fog }}>
                        <Link2 size={14} />
                      </a>
                      <a href={person.facebook} className="hover:text-white transition-colors" style={{ color: TOKENS.fog }}>
                        <Share2 size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="px-6 sm:border-l text-center sm:text-left" style={{ borderColor: TOKENS.line }}>
              <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: TOKENS.signal }}>
                Terms and Conditions
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: TOKENS.fog }}>
                This system is provided for authorized administrators and technicians only.
              </p>
            </div>

            {/* Privacy Policy */}
            <div className="px-6 sm:border-l text-center sm:text-left" style={{ borderColor: TOKENS.line }}>
              <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: TOKENS.signal }}>
                Privacy Policy
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: TOKENS.fog }}>
                Account and incident data is used only for camera monitoring and task management.
              </p>
            </div>
          </div>

          <div className="border-t mt-10 pt-5" style={{ borderColor: TOKENS.line }}>
            <p className="text-xs text-center" style={{ color: TOKENS.fog }}>
              CCTV Health Monitoring System · SWE 0610-3250
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}