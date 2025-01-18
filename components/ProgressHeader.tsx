interface ProgressHeaderProps {
  form: any;
}

export const ProgressHeader = ({ form }: ProgressHeaderProps) => (
  <div className="sticky top-0 z-40 bg-white border-b">
    <div className="max-w-[1200px] mx-auto px-4">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
              form.formState.isValid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {form.formState.isValid
              ? "Ready to submit"
              : "Required fields missing"}
          </div>
        </div>
        <span className="text-sm text-slate-500">
          {Object.keys(form.formState.dirtyFields).length} of{" "}
          {Object.keys(form.getValues()).length} fields completed
        </span>
      </div>
      <div className="h-0.5 bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{
            width: `${
              (Object.keys(form.formState.dirtyFields).length /
                Object.keys(form.getValues()).length) *
              100
            }%`,
          }}
        />
      </div>
    </div>
  </div>
);
