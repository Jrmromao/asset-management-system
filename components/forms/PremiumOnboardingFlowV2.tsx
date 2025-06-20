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
  Building,
  User,
  CreditCard,
  Rocket,
  HeartHandshake,
  ClipboardCheck,
} from "lucide-react";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomInput from "@/components/CustomInput";
import { Form } from "@/components/ui/form";
import HeaderIcon from "@/components/page/HeaderIcon";
import ReCAPTCHA from "@/components/ReCAPTCHA";
import { UserContext } from "@/components/providers/UserContext"; // Keeping for context, though not used in logic
import { useRouter } from "next/navigation"; // Keeping for context, though not used in logic
import { registerCompany } from "@/lib/actions/company.actions"; // Assuming this is your server action
import { Stepper } from "@/components/ui/stepper";
import { Slider } from "@/components/ui/slider";

// Define the schema for your form data
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
    assetCount: z.number().min(100, "Minimum 100 assets"), // Ensure this is handled if user can change it
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

// Static data for form options
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

// Helper function to create selectable items (for reusability)
const SelectableItem: React.FC<{
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isSelected, onClick, children }) => (
  <button
    type="button" // IMPORTANT: Ensure this is a button, not a submit
    onClick={onClick}
    className={`p-4 rounded-lg border text-center transition-all hover:scale-105 w-full ${
      isSelected
        ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
        : "border-border bg-transparent hover:border-green-300 dark:hover:border-green-700"
    }`}
  >
    {children}
  </button>
);

// --- Step Components ---

// Prop type for step components to ensure they receive `form`
interface StepComponentProps {
  form: UseFormReturn<OnboardingData>;
  // Add other props if needed for specific steps (e.g., error for PaymentStep)
  error?: string;
}

const WelcomeStep: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center space-y-6"
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
      className="text-5xl font-bold tracking-tight text-foreground"
    >
      Welcome to EcoKeepr
    </motion.h1>
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="max-w-2xl mx-auto text-xl text-muted-foreground"
    >
      Let&apos;s get you set up with the perfect asset management solution. This
      will only take a few minutes.
    </motion.p>
  </motion.div>
);

const CompanyInfoStep: React.FC<StepComponentProps> = ({ form }) => {
  // Set initial value for company size if it's not already set
  React.useEffect(() => {
    if (!form.getValues("companySize")) {
      form.setValue("companySize", companySizes[0]);
    }
  }, [form]);

  const companySizeValue = form.watch("companySize");
  const companySizeIndex = companySizes.indexOf(companySizeValue);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">
            Tell us about your company
          </CardTitle>
          <CardDescription>
            This helps us tailor your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <CustomInput
            label="Company Name"
            placeholder="e.g., Acme Inc."
            control={form.control}
            name="companyName" // Use name prop for CustomInput
            required
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-muted-foreground">
              Industry *
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {industries.map(({ value, label, icon: Icon }) => (
                <SelectableItem
                  key={value}
                  isSelected={form.watch("industry") === value}
                  onClick={() => {
                    form.setValue("industry", value);
                    form.trigger("industry");
                  }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">{label}</span>
                </SelectableItem>
              ))}
            </div>
            {form.formState.errors.industry && (
              <p className="mt-2 text-sm text-destructive">
                {form.formState.errors.industry.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="company-size-slider"
              className="block mb-4 text-sm font-medium text-muted-foreground"
            >
              Company Size (employees) *
            </label>
            <div className="flex items-center gap-6">
              <Slider
                id="company-size-slider"
                min={0}
                max={companySizes.length - 1}
                step={1}
                value={[companySizeIndex > -1 ? companySizeIndex : 0]}
                onValueChange={(value) => {
                  form.setValue("companySize", companySizes[value[0]]);
                  form.trigger("companySize");
                }}
                className="flex-grow"
              />
              <Badge
                variant="secondary"
                className="w-28 justify-center py-2 text-base font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                {companySizeValue || companySizes[0]}
              </Badge>
            </div>
            {form.formState.errors.companySize && (
              <p className="mt-2 text-sm text-destructive">
                {form.formState.errors.companySize.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const GoalsStep: React.FC<StepComponentProps> = ({ form }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
  >
    <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-2">
      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">
            What are your goals?
          </CardTitle>
          <CardDescription>Select all that apply.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {useCases.map(({ value, label, icon: Icon }) => {
            const isSelected = form.watch("useCase").includes(value);
            return (
              <button
                key={value}
                type="button" // IMPORTANT: Ensure this is a button
                onClick={() => {
                  const currentUseCases = form.watch("useCase");
                  const updated = isSelected
                    ? currentUseCases.filter((v: string) => v !== value)
                    : [...currentUseCases, value];
                  form.setValue("useCase", updated);
                  form.trigger("useCase");
                }}
                className={`flex items-center w-full gap-4 p-4 text-left border rounded-lg transition-all ${
                  isSelected
                    ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-border bg-transparent hover:border-green-300 dark:hover:border-green-700"
                }`}
              >
                <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
          {form.formState.errors.useCase && (
            <p className="text-sm text-destructive">
              {form.formState.errors.useCase.message}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">
            What are your biggest challenges?
          </CardTitle>
          <CardDescription>Select your top pain points.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {painPoints.map(({ value, label }) => {
            const isSelected = form.watch("painPoints").includes(value);
            return (
              <button
                key={value}
                type="button" // IMPORTANT: Ensure this is a button
                onClick={() => {
                  const currentPainPoints = form.watch("painPoints");
                  const updated = isSelected
                    ? currentPainPoints.filter((v: string) => v !== value)
                    : [...currentPainPoints, value];
                  form.setValue("painPoints", updated, {});
                  form.trigger("painPoints");
                }}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  isSelected
                    ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-border bg-transparent hover:border-green-300 dark:hover:border-green-700"
                }`}
              >
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
          {form.formState.errors.painPoints && (
            <p className="text-sm text-destructive">
              {form.formState.errors.painPoints.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

const AccountStep: React.FC<StepComponentProps> = ({ form }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
  >
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-400">
          Create Your Account
        </CardTitle>
        <CardDescription>
          Finally, let&apos;s get your login details sorted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <CustomInput
            label="First Name"
            control={form.control}
            name="firstName"
            required
          />
          <CustomInput
            label="Last Name"
            control={form.control}
            name="lastName"
            required
          />
        </div>
        <CustomInput
          label="Work Email"
          type="email"
          control={form.control}
          name="email"
          required
        />
        <CustomInput
          label="Primary Contact Email"
          type="email"
          control={form.control}
          name="primaryContactEmail"
          required
        />
        <CustomInput
          label="Phone Number (Optional)"
          type="tel"
          control={form.control}
          name="phoneNumber"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <CustomInput
            label="Password"
            type="password"
            control={form.control}
            name="password"
            required
          />
          <CustomInput
            label="Repeat Password"
            type="password"
            control={form.control}
            name="repeatPassword"
            required
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
        {form.formState.errors.repeatPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.repeatPassword.message}
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const PaymentStep: React.FC<StepComponentProps> = ({ form, error }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
  >
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-400">
          Start Your Free Trial
        </CardTitle>
        <CardDescription>
          Confirm your plan details. No charges today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 space-y-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
              Pro Plan
            </h3>
            <Badge
              variant="secondary"
              className="text-base bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
            >
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
          <div className="my-4 border-t border-green-200 dark:border-green-700"></div>
          <div className="flex justify-between text-xl font-bold text-green-700 dark:text-green-400">
            <span>Total per month:</span>
            <span>€{(form.watch("assetCount") * 0.35).toFixed(2)}</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to Stripe to securely enter your payment
            details. You won&apos;t be charged until your trial ends.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-center gap-4">
        <ReCAPTCHA
          siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onVerify={(token) => {
            form.setValue("recaptchaToken", token);
            form.trigger("recaptchaToken");
          }}
          onExpire={() => {
            form.setValue("recaptchaToken", "");
            form.trigger("recaptchaToken");
          }}
        />
        {form.formState.errors.recaptchaToken && (
          <p className="text-sm text-destructive">
            {form.formState.errors.recaptchaToken.message}
          </p>
        )}
        {error && (
          <div className="p-3 text-sm text-center rounded-lg text-destructive bg-destructive/10">
            {error}
          </div>
        )}
      </CardFooter>
    </Card>
  </motion.div>
);

// Define a type for the step configuration for better type safety
interface FormStepConfig {
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<any>; // Allow for any component props to resolve type conflict
  fields?: Readonly<(keyof OnboardingData)[]>;
}

interface PremiumOnboardingFlowProps {
  assetCount?: number;
}

const PremiumOnboardingFlowV2 = ({
  assetCount = 100,
}: PremiumOnboardingFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Removed unused user and router from useContext and useRouter for clarity,
  // but keep them if your component logic truly relies on them later.
  // const { user } = useContext(UserContext);
  // const router = useRouter();

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
    mode: "onBlur", // Validate on blur
  });

  const steps: readonly FormStepConfig[] = [
    {
      name: "Welcome",
      icon: Rocket,
      component: WelcomeStep,
    },
    {
      name: "Company",
      icon: Building,
      component: CompanyInfoStep,
      fields: ["companyName", "industry", "companySize"],
    },
    {
      name: "Goals",
      icon: HeartHandshake,
      component: GoalsStep,
      fields: ["useCase", "painPoints"],
    },
    {
      name: "Account",
      icon: User,
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
    {
      name: "Payment",
      icon: CreditCard,
      component: PaymentStep,
      fields: ["recaptchaToken"],
    },
  ];

  // Pass component and props to useMultistepForm
  const { currentStepIndex, step, next, back, isLastStep, goTo } =
    useMultistepForm(
      steps.map((s, index) => {
        // CRITICAL FIX: Use 'index' as the key for stable rendering
        const Component = s.component;
        const propsForStep: StepComponentProps = { form };
        if (Component === PaymentStep) {
          propsForStep.error = error;
        }
        return <Component key={index} {...propsForStep} />; // Corrected key prop
      }),
    );

  const onSubmit = async (data: OnboardingData) => {
    // This function should ONLY be called when the *final* submit button is clicked.
    // This check acts as a safeguard.
    if (!isLastStep) {
      console.warn(
        "Attempted form submission before the last step. Preventing.",
      );
      return;
    }

    if (isLoading) return; // Prevent double submission
    setIsLoading(true);
    setError("");

    try {
      console.log("Final form submission with data:", data); // For debugging
      const result = await registerCompany({ ...data, status: "INACTIVE" });

      if (result.success && result.redirectUrl) {
        console.log(
          "Registration successful, redirecting to:",
          result.redirectUrl,
        );
        // TODO: Send internal notification (e.g., Slack) about new sign-up
        window.location.href = result.redirectUrl;
      } else {
        console.error("Registration failed:", result.error);
        setError(result.error || "An unknown error occurred.");
      }
    } catch (e) {
      console.error("Exception during registration:", e);
      setError(
        e instanceof Error ? e.message : "Registration failed unexpectedly.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Determine which fields to validate for the current step
    const fieldsToValidate = steps[currentStepIndex]?.fields;

    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        console.log("Validation failed for current step, not proceeding.");
        // React Hook Form will display errors automatically if resolver is configured.
        return;
      }
    }

    // If validation passes (or no fields to validate for this step), proceed
    console.log(
      "Validation passed or no fields to validate. Moving to next step.",
    );
    next();
  };

  const progress = (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-screen transition-colors duration-500 bg-gradient-to-b from-background to-green-50/30 dark:to-green-950/20"
      >
        <header className="px-4 pt-12">
          <div className="w-full max-w-5xl mx-auto">
            {currentStepIndex > 0 && (
              <Stepper
                steps={steps.slice(1) as FormStepConfig[]}
                currentStep={currentStepIndex - 1}
                onStepClick={(stepIndex) => goTo(stepIndex + 1)}
              />
            )}
          </div>
        </header>

        <main className="flex-grow px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">{step}</AnimatePresence>
          </div>
        </main>

        <footer className="px-4 py-4 mt-auto border-t bg-background/80 backdrop-blur-lg border-border/30">
          <div className="w-full max-w-5xl mx-auto">
            <div className="relative flex items-center justify-center">
              {currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  onClick={back}
                  type="button"
                  disabled={isLoading || currentStepIndex === 0}
                  className="absolute left-0 hover:text-green-600 dark:hover:text-green-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 text-base font-semibold transition-all rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white hover:shadow-xl"
                >
                  {isLoading ? "Processing..." : "Complete Sign-up"}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="px-8 py-3 text-base font-semibold transition-all rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white hover:shadow-xl"
                >
                  Continue
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </form>
    </Form>
  );
};

export default PremiumOnboardingFlowV2;
