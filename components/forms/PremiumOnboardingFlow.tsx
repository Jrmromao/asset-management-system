"use client";
import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Globe,
  Leaf,
  Monitor,
  Server,
  Shield,
  Smartphone,
  Target,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomInput from "@/components/CustomInput";
import { Form } from "@/components/ui/form";
import HeaderIcon from "@/components/page/HeaderIcon";
import ReCAPTCHA from "@/components/ReCAPTCHA";
import { UserContext } from "@/components/providers/UserContext";
import { useRouter } from "next/navigation";
import { registerCompany } from "@/lib/actions/company.actions";

interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  assetCount: number;
  useCase: string[];
  painPoints: string[];
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  primaryContactEmail: string;
  password: string;
  repeatPassword: string;
  recaptchaToken: string;
}

const onboardingSchema = z
  .object({
    companyName: z.string().min(2, "Company name is required"),
    industry: z.string().min(1, "Please select an industry"),
    companySize: z.string().min(1, "Please select company size"),
    assetCount: z.number().min(100, "Minimum 100 assets"),
    useCase: z.array(z.string()).min(1, "Select at least one use case"),
    painPoints: z.array(z.string()).min(1, "Select at least one pain point"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("A valid email is required"),
    phoneNumber: z.string().optional(),
    primaryContactEmail: z.string().email("A valid contact email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeatPassword: z.string(),
    recaptchaToken: z.string().min(1, "Please complete the security check"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

const industries = [
  { value: "technology", label: "Technology", icon: Monitor },
  { value: "manufacturing", label: "Manufacturing", icon: Server },
  { value: "healthcare", label: "Healthcare", icon: Smartphone },
  { value: "education", label: "Education", icon: Globe },
  { value: "finance", label: "Finance", icon: BarChart3 },
  { value: "retail", label: "Retail", icon: Wrench },
  { value: "construction", label: "Construction", icon: Building2 },
  { value: "other", label: "Other", icon: Zap },
];

const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

const useCases = [
  { value: "asset-tracking", label: "Asset Tracking", icon: Target },
  { value: "maintenance", label: "Maintenance Management", icon: Wrench },
  { value: "compliance", label: "Compliance & Auditing", icon: Shield },
  { value: "cost-optimization", label: "Cost Optimization", icon: TrendingUp },
  { value: "inventory", label: "Inventory Management", icon: BarChart3 },
  { value: "sustainability", label: "Sustainability Tracking", icon: Leaf },
];

const painPoints = [
  { value: "lost-assets", label: "Lost or misplaced assets" },
  { value: "manual-tracking", label: "Manual tracking processes" },
  { value: "compliance-issues", label: "Compliance issues" },
  { value: "cost-overruns", label: "Unexpected costs" },
  { value: "data-scattered", label: "Data scattered across systems" },
  { value: "no-visibility", label: "No real-time visibility" },
];

interface PremiumOnboardingFlowProps {
  assetCount?: number;
}

const PremiumOnboardingFlow = ({
  assetCount = 100,
}: PremiumOnboardingFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);
  const router = useRouter();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      assetCount,
      companyName: "",
      industry: "",
      companySize: "",
      useCase: [],
      painPoints: [],
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      primaryContactEmail: "",
      password: "",
      repeatPassword: "",
      recaptchaToken: "",
    },
    mode: "onChange",
  });

  const WelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
      >
        <HeaderIcon />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-5xl font-bold tracking-tight text-gray-800"
      >
        Welcome to EcoKeepr
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="max-w-2xl mx-auto text-xl text-gray-500"
      >
        Let&apos;s get you set up with the perfect asset management solution.
        This will only take a few minutes.
      </motion.p>
    </motion.div>
  );

  const CompanyInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Tell us about your company</CardTitle>
          <CardDescription>
            This helps us tailor your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <CustomInput
            label="Company Name"
            placeholder="e.g., Acme Inc."
            control={form.control}
            {...form.register("companyName")}
            required
          />
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Industry *
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {industries.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => form.setValue("industry", value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                    form.watch("industry") === value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Company Size (employees) *
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {companySizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => form.setValue("companySize", size)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    form.watch("companySize") === size
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const GoalsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What are your goals?</CardTitle>
            <CardDescription>Select all that apply.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {useCases.map(({ value, label, icon: Icon }) => {
              const isSelected = form.watch("useCase").includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const updated = isSelected
                      ? form.watch("useCase").filter((v) => v !== value)
                      : [...form.watch("useCase"), value];
                    form.setValue("useCase", updated);
                  }}
                  className={`flex items-center w-full gap-4 p-4 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What are your biggest challenges?</CardTitle>
            <CardDescription>Select your top pain points.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {painPoints.map(({ value, label }) => {
              const isSelected = form.watch("painPoints").includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const updated = isSelected
                      ? form.watch("painPoints").filter((v) => v !== value)
                      : [...form.watch("painPoints"), value];
                    form.setValue("painPoints", updated);
                  }}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const AccountStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Finally, let&apos;s get your login details sorted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomInput
              label="First Name"
              control={form.control}
              {...form.register("firstName")}
              required
            />
            <CustomInput
              label="Last Name"
              control={form.control}
              {...form.register("lastName")}
              required
            />
          </div>
          <CustomInput
            label="Work Email"
            type="email"
            control={form.control}
            {...form.register("email")}
            required
          />
          <CustomInput
            label="Primary Contact Email"
            type="email"
            control={form.control}
            {...form.register("primaryContactEmail")}
            required
          />
          <CustomInput
            label="Phone Number (Optional)"
            type="tel"
            control={form.control}
            {...form.register("phoneNumber")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <CustomInput
              label="Password"
              type="password"
              control={form.control}
              {...form.register("password")}
              required
            />
            <CustomInput
              label="Repeat Password"
              type="password"
              control={form.control}
              {...form.register("repeatPassword")}
              required
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const PaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Start Your Free Trial</CardTitle>
          <CardDescription>
            Confirm your plan details. No charges today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 space-y-4 border rounded-lg bg-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-emerald-800">
                Pro Plan
              </h3>
              <Badge variant="secondary" className="text-base">
                15-Day Free Trial
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Assets to track:</span>
              <strong>{form.watch("assetCount")}</strong>
            </div>
            <div className="flex justify-between">
              <span>Price per asset/month:</span> <strong>€0.35</strong>
            </div>
            <div className="my-4 border-t border-emerald-200"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total per month:</span>
              <span>€{(form.watch("assetCount") * 0.35).toFixed(2)}</span>
            </div>
            <p className="text-xs text-center text-gray-500">
              You will be redirected to Stripe to securely enter your payment
              details. You won&apos;t be charged until your trial ends.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-center gap-4">
          <ReCAPTCHA
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onVerify={(token) => form.setValue("recaptchaToken", token)}
            onExpire={() => form.setValue("recaptchaToken", "")}
          />
          {form.formState.errors.recaptchaToken && (
            <p className="text-sm text-red-500">
              {form.formState.errors.recaptchaToken.message}
            </p>
          )}
          {error && (
            <div className="p-3 text-sm text-center text-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );

  const steps: {
    component: React.ComponentType;
    fields?: (keyof OnboardingData)[];
  }[] = [
    { component: WelcomeStep },
    {
      component: CompanyInfoStep,
      fields: ["companyName", "industry", "companySize"],
    },
    { component: GoalsStep, fields: ["useCase", "painPoints"] },
    {
      component: AccountStep,
      fields: [
        "firstName",
        "lastName",
        "email",
        "primaryContactEmail",
        "password",
        "repeatPassword",
      ],
    },
    { component: PaymentStep, fields: ["recaptchaToken"] },
  ];

  const { currentStepIndex, step, next, back, isFirstStep, isLastStep } =
    useMultistepForm(steps.map((s) => <s.component key={s.component.name} />));

  const onSubmit = async (data: OnboardingData) => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      // TODO: Send welcome email upon successful registration start
      const result = await registerCompany({ ...data, status: "INACTIVE" });

      if (result.success && result.redirectUrl) {
        // TODO: Send internal notification (e.g., Slack) about new sign-up
        window.location.href = result.redirectUrl;
      } else {
        setError(result.error || "An unknown error occurred.");
        setIsLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStepIndex].fields;

    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (isLastStep) {
      await onSubmit(form.getValues());
    } else {
      next();
    }
  };

  const progress = (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col justify-center min-h-screen px-4 py-12 transition-colors duration-500 bg-gradient-to-b from-gray-50 to-emerald-50">
      <div className="w-full max-w-5xl mx-auto">
        {currentStepIndex > 0 && (
          <div className="mb-12">
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <AnimatePresence mode="wait">{step}</AnimatePresence>

        <div className="flex items-center justify-center mt-12">
          {currentStepIndex > 0 && (
            <Button
              variant="ghost"
              onClick={back}
              disabled={currentStepIndex === 0}
              className="absolute left-1/2 -ml-64 -translate-x-1/2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-6 text-base font-semibold bg-emerald-600 rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all"
          >
            {isLoading
              ? "Processing..."
              : isLastStep
                ? "Complete Sign-up"
                : "Continue"}
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumOnboardingFlow;
