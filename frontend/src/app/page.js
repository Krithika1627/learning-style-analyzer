import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Learning Style Analyzer
      </h1>

      <p className="text-lg text-gray-600 text-center max-w-xl mb-8">
        An AI-powered platform to analyze learning behavior and provide
        personalized study recommendations.
      </p>

      <div className="flex gap-4">

        <Link
          href="/sign-in"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>

        <Link
          href="/profile"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>

      </div>

    </div>
  );
}
