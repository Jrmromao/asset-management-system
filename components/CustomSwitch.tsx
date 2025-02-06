import React from "react";
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useController } from "react-hook-form";

interface CustomSwitchInputProps {
  label: string;
  name: string;
  control: any;
  required?: boolean;
}

const CustomSwitch = ({
  control,
  name,
  label,
  required = false,
  ...rest
}: CustomSwitchInputProps) => {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: false,
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className={"form-item"}>
          <FormLabel className={"form-label"}>{label}</FormLabel>
          <div className={"flex w-full flex-col"}>
            <FormControl>
              <Switch
                checked={value}
                onCheckedChange={onChange}
                required={required}
              />
            </FormControl>
            <FormMessage className={"form-message mt-2"} />
          </div>
        </div>
      )}
    />
  );
};
export default CustomSwitch;
