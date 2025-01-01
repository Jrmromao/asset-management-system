import { useController } from "react-hook-form";
import { HexColorPicker } from "react-colorful";
import { FormControl, FormField, FormLabel, FormMessage } from "./ui/form";

interface CustomColorInputProps {
  label: string;
  name: string;
  control: any;
}

const CustomColorPicker = ({ control, name, label }: CustomColorInputProps) => {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: "#rrggbb", // Default initial color
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className={"form-item"}>
          <FormLabel>{label}</FormLabel>
          <div className={"flex w-full flex-col"}>
            <FormControl>
              <HexColorPicker color={value} onChange={onChange} />
            </FormControl>
          </div>
        </div>
      )}
    />
  );
};

export default CustomColorPicker;
