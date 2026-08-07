import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLoader, IconMail } from "@/components/icons";
import { useRequestOtp } from "@/api/auth/request-otp.queries";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { emailStepSchema, type EmailStepValues } from "../staff-login.schemas";

interface EmailStepFormProps {
  onSent: (email: string) => void;
}

export function EmailStepForm({ onSent }: EmailStepFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EmailStepValues>({ resolver: zodResolver(emailStepSchema) });
  const requestOtp = useRequestOtp();

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await requestOtp.mutateAsync(email);
      toast.success("Check your email for a code");
      onSent(email);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't send a code for that email"));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@policad.com"
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" disabled={requestOtp.isPending}>
        {requestOtp.isPending ? <IconLoader className="size-4 animate-spin" /> : <IconMail className="size-4" />}
        Send code
      </Button>
    </form>
  );
}
