"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

export interface SearchableSelectItem {
  value: string;
  label: string;
  secondaryLabel?: string;
}

interface SearchableSelectProps {
  name: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  notFoundText: string;
  items: SearchableSelectItem[];
  form: UseFormReturn<any>;
  required?: boolean;
}

export function SearchableSelect({
  name,
  label,
  placeholder,
  searchPlaceholder,
  notFoundText,
  items,
  form,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value
                    ? items.find((item) => item.value === field.value)?.label
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-gray-900 border shadow-md">
              <Command>
                <CommandInput placeholder={searchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{notFoundText}</CommandEmpty>
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        value={`${item.label} ${item.secondaryLabel || ""}`}
                        key={item.value}
                        onSelect={() => {
                          form.setValue(name, item.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            item.value === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          {item.secondaryLabel && (
                            <span className="text-xs text-muted-foreground">
                              {item.secondaryLabel}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
