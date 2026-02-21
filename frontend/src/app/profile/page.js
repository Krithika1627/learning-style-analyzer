"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Profile() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* HEADER */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Learning Style Analyzer
        </h1>

        <div className="flex items-center gap-4">
          <span>{user.firstName}</span>

          <SignOutButton>
            <button className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </SignOutButton>
        </div>
      </header>


      {/* BODY */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="w-64 bg-white shadow-md p-5">

          <div className="flex flex-col items-center mb-6">
            <img
              src={user.imageUrl}
              className="w-20 h-20 rounded-full mb-2"
            />

            <h3 className="font-semibold">{user.fullName}</h3>

            <p className="text-sm text-gray-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <nav className="flex flex-col gap-3 text-gray-700">

            <Link
              href="/profile"
              className="hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>

            <Link
              href="/assessment"
              className="hover:text-blue-600"
            >
              Assessment
            </Link>

            <Link
              href="/result"
              className="hover:text-blue-600"
            >
              Results
            </Link>

            <Link
              href="/resources"
              className="hover:text-blue-600"
            >
              Study Resources
            </Link>

            <Link
              href="/settings"
              className="hover:text-blue-600"
            >
              Settings
            </Link>

          </nav>
        </aside>


        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">

          <h2 className="text-2xl font-semibold mb-6">
            Dashboard
          </h2>


          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500">Assessment Status</h3>
              <p className="text-xl font-bold text-blue-600">
                Not Attempted
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500">Learning Style</h3>
              <p className="text-xl font-bold text-green-600">
                Pending
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500">Progress</h3>
              <p className="text-xl font-bold text-purple-600">
                0%
              </p>
            </div>

          </div>


          {/* ACTIONS */}
          <div className="bg-white p-6 rounded shadow mb-6">

            <h3 className="text-lg font-semibold mb-4">
              Quick Actions
            </h3>

            <div className="flex gap-4 flex-wrap">

              <Link
                href="/assessment"
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
              >
                Start Assessment
              </Link>

              <Link
                href="/result"
                className="border border-blue-600 text-blue-600 px-5 py-2 rounded hover:bg-blue-50"
              >
                View Results
              </Link>

              <Link
                href="/resources"
                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
              >
                Resources
              </Link>

            </div>

          </div>


          {/* ACTIVITY */}
          <div className="bg-white p-6 rounded shadow">

            <h3 className="text-lg font-semibold mb-4">
              Recent Activity
            </h3>

            <ul className="text-gray-600 space-y-2">
              <li>• Logged in</li>
              <li>• Profile updated</li>
              <li>• Assessment pending</li>
              <li>• No results yet</li>
            </ul>

          </div>

          {/* LEARNING GOALS */}
<div className="bg-white p-6 rounded shadow mb-6">
  <h3 className="text-lg font-semibold mb-3">🎯 Learning Goals</h3>

  <ul className="text-gray-700 space-y-2">
    <li>✔ Complete assessment</li>
    <li>✔ Review learning style report</li>
    <li>⬜ Practice recommended methods</li>
  </ul>
</div>


{/* NOTIFICATIONS */}
<div className="bg-white p-6 rounded shadow mb-6">
  <h3 className="text-lg font-semibold mb-3">🔔 Notifications</h3>

  <ul className="text-gray-600 space-y-2">
    <li>📢 New study resources available</li>
    <li>📊 Assessment module updated</li>
    <li>✅ Profile verified</li>
  </ul>
</div>


{/* PERSONALIZED TIPS */}
<div className="bg-white p-6 rounded shadow mb-6">
  <h3 className="text-lg font-semibold mb-3">💡 Study Tips</h3>

  <p className="text-gray-700">
    Visual learners perform better using charts, diagrams,
    and color-coded notes. Try creating mind maps.
  </p>
</div>


{/* PERFORMANCE SUMMARY */}
<div className="bg-white p-6 rounded shadow mb-6">
  <h3 className="text-lg font-semibold mb-3">📈 Learning Progress</h3>

  <div className="grid grid-cols-3 gap-4 text-center">

    <div>
      <p className="text-xl font-bold text-blue-600">1</p>
      <p className="text-sm text-gray-500">Tests</p>
    </div>

    <div>
      <p className="text-xl font-bold text-green-600">--</p>
      <p className="text-sm text-gray-500">Accuracy</p>
    </div>

    <div>
      <p className="text-xl font-bold text-purple-600">--</p>
      <p className="text-sm text-gray-500">Rank</p>
    </div>

  </div>
</div>


{/* QUICK LINKS */}
<div className="bg-white p-6 rounded shadow">
  <h3 className="text-lg font-semibold mb-3">⚡ Quick Links</h3>

  <div className="flex gap-3 flex-wrap">

    <Link
      href="/assessment"
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Resume Test
    </Link>

    <Link
      href="/result"
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Download Report
    </Link>

    <Link
      href="/contact"
      className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
    >
      Contact Mentor
    </Link>

  </div>
</div>


        </main>

      </div>


      {/* FOOTER */}
      <footer className="bg-white text-center text-gray-500 py-3 text-sm shadow-inner">

        © {new Date().getFullYear()} Learning Style Analyzer | All Rights Reserved

      </footer>

    </div>
  );
}
