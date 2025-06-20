import { useController } from "react-hook-form";
import { HexColorPicker } from "react-colorful";
import { FormControl, FormField, FormLabel } from "./ui/form";

interface CustomColorInputProps {
  label: string;
  name: string;
  control: any;
  disabled?: boolean;
  required?: boolean;
}

const CustomColorPicker = ({
  control,
  name,
  label,
  disabled,
  required,
}: CustomColorInputProps) => {
  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
    defaultValue: "#rrggbb",
  });

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <div className={"form-item"}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <div className={"flex w-full flex-col"}>
            <FormControl>
              <div className={disabled ? "pointer-events-none opacity-50" : ""}>
                <HexColorPicker color={value} onChange={onChange} />
              </div>
            </FormControl>
          </div>
        </div>
      )}
    />
  );
};

export default CustomColorPicker;
