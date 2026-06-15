import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="scanline flex min-h-screen items-center justify-center px-5">
      <SignUp />
    </div>
  );
}
