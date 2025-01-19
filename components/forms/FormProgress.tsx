import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface FormSection {
  name: string;
  isValid: boolean;
}

interface FormProgressProps {
  sections: FormSection[];
}

export const FormProgress = ({ sections }: FormProgressProps) => {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      <div className="sticky top-[104px]">
        <Card className="bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-medium">
              Form Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.name}
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        section.isValid ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                    <span className="text-sm text-slate-600">
                      {section.name}
                    </span>
                  </div>
                  {section.isValid && (
                    <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center">
                      <Check
                        className="h-3 w-3 text-green-500"
                        strokeWidth={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
