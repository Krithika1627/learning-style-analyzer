"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white px-6 py-4">
      <ul className="flex space-x-6 font-medium">
        <li>
          <Link href="/assessment/instructions" className="hover:underline">
            Instructions
          </Link>
        </li>
        <li>
          <Link href="/assessment" className="hover:underline">
            Assessment
          </Link>
        </li>
        <li>
          <Link href="/result" className="hover:underline">
            Result
          </Link>
        </li>
      </ul>
    </nav>
  );
}
