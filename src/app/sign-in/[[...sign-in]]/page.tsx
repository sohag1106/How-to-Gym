import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
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
