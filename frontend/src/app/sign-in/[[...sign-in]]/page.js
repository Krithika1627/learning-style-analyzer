import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/30 md:p-10">
        <SignIn
          routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/profile"
          afterSignUpUrl="/profile"
          appearance={{
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: "#1e293b",
              colorText: "#e2e8f0",
              colorInputBackground: "#0f172a",
              colorInputText: "#e2e8f0",
              colorTextSecondary: "#94a3b8",
              borderRadius: "12px",
            },
            elements: {
              card: "shadow-none bg-transparent",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-300",
              socialButtonsBlockButton: "border border-slate-600 text-slate-200 hover:bg-slate-800",
              formButtonPrimary: "bg-indigo-500 hover:bg-indigo-400 text-white",
              formFieldInput: "border border-slate-600 focus:border-indigo-400",
              footerActionLink: "text-indigo-300 hover:text-indigo-200",
            },
          }}
        />
      </div>
    </div>
  );
}
