import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Home from "./components/Home.jsx";
import Lessons from "./components/Lessons.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Practice from "./components/Practice.jsx";
import Exam from "./components/Exam.jsx";

const TABS = [
  { to: "/", label: "Home", icon: "◇", end: true },
  { to: "/lessons", label: "Lessons", icon: "▤" },
  { to: "/flashcards", label: "Cards", icon: "▢" },
  { to: "/practice", label: "Practice", icon: "●" },
  { to: "/exam", label: "Exam", icon: "✎" },
];

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">RN</span>
          <div>
            <div className="brand-title">PNLE Reviewer</div>
            <div className="brand-sub">Nurse Licensure Exam · NP I</div>
          </div>
        </div>
        <nav className="topnav">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                "topnav-link" + (isActive ? " active" : "")
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="tabbar" aria-label="Primary">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => "tab" + (isActive ? " active" : "")}
          >
            <span className="tab-icon" aria-hidden="true">
              {t.icon}
            </span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
