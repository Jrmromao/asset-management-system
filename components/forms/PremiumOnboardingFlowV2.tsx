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
import { useSignUp, useAuth, useClerk, useSession } from "@clerk/nextjs";
import Link from "next/link";

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
}

const onboardingSchema = z.object({
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
  error?: string | undefined;
}

const WelcomeStep: React.FC = () => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={{
      visible: { transition: { staggerChildren: 0.2 } },
    }}
    className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24"
  >
    {/* Left Column: Welcome Message */}
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
      }}
      className="flex flex-col items-center text-center lg:items-start lg:text-left"
    >
      <HeaderIcon />
      <h1 className="mt-6 text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
        Welcome to EcoKeepr
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Let&apos;s get you set up with the perfect asset management solution.
        This will only take a few minutes.
      </p>
    </motion.div>

    {/* Right Column: Value Proposition & Social Proof */}
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
      }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">What you get:</h3>
        <ul className="space-y-3">
          {[
            {
              icon: Target,
              text: "Comprehensive, real-time asset tracking.",
            },
            {
              icon: Wrench,
              text: "Simplified and predictive maintenance schedules.",
            },
            { icon: Leaf, text: "Powerful sustainability and CO2 reporting." },
          ].map((item, index) => (
            <motion.li
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.4 + index * 0.1 },
                },
              }}
              className="flex items-center gap-3"
            >
              <item.icon className="h-6 w-6 text-green-500" />
              <span className="text-muted-foreground">{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-6">
        <blockquote className="text-muted-foreground">
          <p>
            &quot;EcoKeepr has transformed how we manage our assets. It&apos;s
            intuitive, powerful, and has saved us thousands.&quot;
          </p>
          <footer className="mt-2 text-sm font-semibold text-foreground">
            - Alex Johnson, CEO of Innovate Inc.
          </footer>
        </blockquote>
      </div>
    </motion.div>
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
            <Slider
              id="company-size-slider"
              min={0}
              max={companySizes.length - 1}
              step={1}
              value={[companySizeIndex]}
              onValueChange={([index]) => {
                form.setValue("companySize", companySizes[index]);
                form.trigger("companySize");
              }}
            />
            <div className="mt-2 text-center text-lg font-semibold text-foreground">
              {companySizeValue}
            </div>
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
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-400">
          Your Goals
        </CardTitle>
        <CardDescription>
          What do you want to achieve? Select all that apply.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-muted-foreground">
            Primary Use Cases *
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {useCases.map(({ value, label, icon: Icon }) => (
              <SelectableItem
                key={value}
                isSelected={form.watch("useCase", []).includes(value)}
                onClick={() => {
                  const currentSelection = form.getValues("useCase") || [];
                  const newSelection = currentSelection.includes(value)
                    ? currentSelection.filter((item) => item !== value)
                    : [...currentSelection, value];
                  form.setValue("useCase", newSelection);
                  form.trigger("useCase");
                }}
              >
                <Icon className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">{label}</span>
              </SelectableItem>
            ))}
          </div>
          {form.formState.errors.useCase && (
            <p className="mt-2 text-sm text-destructive">
              {form.formState.errors.useCase.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-muted-foreground">
            Biggest Pain Points *
          </label>
          <div className="space-y-2">
            {painPoints.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  form.watch("painPoints", []).includes(value)
                    ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                    : "border-border bg-transparent hover:border-green-300 dark:hover:border-green-700"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.watch("painPoints", []).includes(value)}
                  onChange={() => {
                    const currentSelection = form.getValues("painPoints") || [];
                    const newSelection = currentSelection.includes(value)
                      ? currentSelection.filter((item) => item !== value)
                      : [...currentSelection, value];
                    form.setValue("painPoints", newSelection);
                    form.trigger("painPoints");
                  }}
                />
                <span className="font-medium text-foreground">{label}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.painPoints && (
            <p className="mt-2 text-sm text-destructive">
              {form.formState.errors.painPoints.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
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
        <CustomInput
          label="Password"
          type="password"
          control={form.control}
          name="password"
          required
        />
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
          Final Step: Review
        </CardTitle>
        <CardDescription>
          Review your details and complete the sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border rounded-lg bg-background/50">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-muted-foreground">
            You are signing up for the{" "}
            <Badge variant="default">Premium Plan</Badge> with support for up to{" "}
            <span className="font-bold text-foreground">
              {form.getValues("assetCount")}
            </span>{" "}
            assets.
          </p>
          <p className="text-sm mt-4">
            No payment is required today. Your 14-day free trial will begin
            after you complete the sign-up.
          </p>
        </div>
        {error && <p className="text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

// --- Component Definition ---

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
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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
    },
    mode: "onBlur",
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
      ],
    },
    {
      name: "Payment",
      icon: CreditCard,
      component: PaymentStep,
    },
  ];

  const { currentStepIndex, step, next, back, isLastStep, goTo } =
    useMultistepForm(
      steps.map((s, index) => {
        const Component = s.component;
        const propsForStep: StepComponentProps = { form };
        if (Component === PaymentStep) {
          propsForStep.error = error || undefined;
        }
        return <Component key={index} {...propsForStep} />;
      }),
    );

  const onSubmit = async (data: OnboardingData) => {
    if (!isLoaded || !isAuthLoaded) return;
    setIsLoading(true);
    setError(undefined);

    try {
      // Step 1: Create user in Clerk if they don't exist
      let clerkUserId = userId;
      if (!clerkUserId) {
        const signUpResult = await signUp.create({
          emailAddress: data.email,
          password: data.password,
          unsafeMetadata: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        });

        if (signUpResult.status !== "complete") {
          // Handle cases like email verification if needed
          throw new Error("Clerk sign-up could not be completed.");
        }
        clerkUserId = signUpResult.createdUserId;
        // The session will be set active by Clerk's SignUp component logic
      }

      // Step 2: Register the company and create a subscription
      const companyResult = await registerCompany({
        ...data,
        clerkUserId: clerkUserId || "",
        status: "INACTIVE", // Company is inactive until subscription is confirmed
      });

      if (!companyResult.success || !companyResult.redirectUrl) {
        throw new Error(companyResult.error || "Failed to create company.");
      }

      // Step 3: Redirect to Stripe for payment
      if (typeof window !== "undefined") {
        window.location.href = companyResult.redirectUrl;
      }
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      setError(
        err.errors?.[0]?.message || err.message || "An unknown error occurred.",
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
        className="flex flex-col transition-colors duration-500 bg-gradient-to-b from-background to-green-50/30 dark:to-green-950/20"
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

        <footer className="px-4 py-4 border-t bg-background/80 backdrop-blur-lg border-border/30">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              {currentStepIndex > 0 ? (
                <Button
                  variant="ghost"
                  onClick={back}
                  type="button"
                  disabled={isLoading || currentStepIndex === 0}
                  className="hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 text-base font-semibold transition-all rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl"
                >
                  {isLoading ? "Processing..." : "Complete Sign-up"}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="px-8 py-3 text-base font-semibold transition-all rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl"
                >
                  Continue
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              )}
            </div>
            <div className="flex justify-center gap-4 pt-4 mt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
              <span className="text-muted-foreground">|</span>
              <Link
                href="/"
                className="text-sm font-semibold text-muted-foreground hover:text-primary hover:underline"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </footer>
      </form>
    </Form>
  );
};

export default PremiumOnboardingFlowV2;
