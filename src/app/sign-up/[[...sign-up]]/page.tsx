import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/sign-up/select-gym"
        appearance={{
          variables: {
            colorPrimary: "oklch(0.7 0.19 41)",
            borderRadius: "1rem",
          },
        }}
      />
    </main>
  );
}
