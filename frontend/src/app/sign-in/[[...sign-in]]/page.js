import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <SignIn routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/profile"
        afterSignUpUrl="/profile" />
  </div>
);
}
