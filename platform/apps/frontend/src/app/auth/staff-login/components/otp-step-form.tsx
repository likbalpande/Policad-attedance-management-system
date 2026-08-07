import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLoader, IconArrowLeft } from "@/components/icons";
import { useStaffLogin } from "@/api/auth/staff-login.queries";
import { useRequestOtp } from "@/api/auth/request-otp.queries";
import { useAuthStore } from "@/stores/auth.store";
import { authStorage } from "@/lib/auth-storage";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { codeStepSchema, type CodeStepValues } from "../staff-login.schemas";

interface OtpStepFormProps {
  email: string;
  onBack: () => void;
  onLoginSuccess: (role: string) => void;
}

export function OtpStepForm({ email, onBack, onLoginSuccess }: OtpStepFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CodeStepValues>({ resolver: zodResolver(codeStepSchema) });
  const staffLogin = useStaffLogin();
  const requestOtp = useRequestOtp();
  const [resending, setResending] = useState(false);

  const onSubmit = handleSubmit(async ({ code }) => {
    try {
      const { data } = await staffLogin.mutateAsync({ email, code });
      useAuthStore.getState().setSession(data.data);
      await authStorage.setTokens(data.data);
      const role = useAuthStore.getState().user?.role ?? "";
      onLoginSuccess(role);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid credentials"));
    }
  });

  const handleResend = async () => {
    setResending(true);
    try {
      await requestOtp.mutateAsync(email);
      toast.success("Code resent");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="font-mono tracking-[0.3em]"
          {...register("code")}
        />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
        <p className="text-xs text-muted-foreground">Sent to {email}</p>
      </div>
      <Button type="submit" disabled={staffLogin.isPending}>
        {staffLogin.isPending && <IconLoader className="size-4 animate-spin" />}
        Verify &amp; continue
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="size-3.5" />
          Back
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-accent hover:underline disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    </form>
  );
}
