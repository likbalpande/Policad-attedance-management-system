import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_ROLE } from "@platform/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTE_PATHS } from "@/routes/route-paths";
import type { LoginStep } from "@/types/auth.types";
import { EmailStepForm } from "../components/email-step-form";
import { OtpStepForm } from "../components/otp-step-form";

export default function StaffLoginPage() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLoginSuccess = (role: string) => {
    navigate(role === USER_ROLE.SUPER_ADMIN ? ROUTE_PATHS.SUPER_ADMIN : ROUTE_PATHS.STAFF, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Sign in to Policad</CardTitle>
          <CardDescription>
            {step === "email" ? "Super admin, admin, and faculty accounts" : "Enter the code we sent you"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <EmailStepForm
              onSent={(submittedEmail) => {
                setEmail(submittedEmail);
                setStep("otp");
              }}
            />
          ) : (
            <OtpStepForm email={email} onBack={() => setStep("email")} onLoginSuccess={handleLoginSuccess} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
