import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp afterSignInUrl="/profile" afterSignUpUrl="/profile" />;
}
