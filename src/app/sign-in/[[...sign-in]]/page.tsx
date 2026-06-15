import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="scanline flex min-h-screen items-center justify-center px-5">
      <SignIn />
    </div>
  );
}
