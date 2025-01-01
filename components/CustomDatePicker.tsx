import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid, startOfDay, addYears, subYears } from "date-fns";
import { DayPicker } from "react-day-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CustomDatePickerProps {
  label?: string;
  name: string;
  form: UseFormReturn<any>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  tooltip?: string;
  clearable?: boolean;
  formatString?: string;
}

// Custom calendar navigation component
const CalendarHeader = ({
  currentMonth,
  defaultMonth,
  onMonthSelect,
  onYearSelect,
  minDate,
  maxDate,
}: {
  currentMonth: Date;
  defaultMonth: Date;
  onMonthSelect: (date: Date) => void;
  onYearSelect: (year: number) => void;
  minDate?: Date;
  maxDate?: Date;
}) => {
  const startYear = minDate ? minDate.getFullYear() : 1900;
  const endYear = maxDate ? maxDate.getFullYear() : 2100;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="flex justify-center items-center gap-1 px-1">
      <Select
        value={currentMonth.getMonth().toString()}
        onValueChange={(value) => {
          const newDate = new Date(currentMonth);
          newDate.setMonth(parseInt(value));
          onMonthSelect(newDate);
        }}
      >
        <SelectTrigger className="w-[110px] h-8 text-sm">
          <SelectValue>{monthNames[currentMonth.getMonth()]}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white">
          {monthNames.map((month, index) => (
            <SelectItem key={index} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentMonth.getFullYear().toString()}
        onValueChange={(value) => {
          onYearSelect(parseInt(value));
        }}
      >
        <SelectTrigger className="w-[90px] h-8 text-sm bg-white">
          <SelectValue>{currentMonth.getFullYear()}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white">
          {Array.from(
            { length: endYear - startYear + 1 },
            (_, i) => startYear + i,
          ).map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.preventDefault();
            const prevMonth = new Date(currentMonth);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            onMonthSelect(prevMonth);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.preventDefault();
            const nextMonth = new Date(currentMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            onMonthSelect(nextMonth);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const CustomDatePicker = ({
  label,
  name,
  form,
  placeholder = "Select date",
  disabled = false,
  required = false,
  minDate,
  maxDate,
  disablePastDates = false,
  disableFutureDates = false,
  tooltip,
  clearable = true,
  formatString = "PPP",
}: CustomDatePickerProps) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const handleClear = (
    e: React.MouseEvent,
    onChange: (date: Date | null) => void,
  ) => {
    e.stopPropagation();
    onChange(null);
  };

  const getDisabledDays = (date: Date) => {
    if (disablePastDates && date < startOfDay(new Date())) return true;
    if (disableFutureDates && date > startOfDay(new Date())) return true;
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > startOfDay(maxDate)) return true;
    return false;
  };
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          {label && (
            <FormLabel className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </FormLabel>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    "group flex items-center justify-between",
                  )}
                  disabled={disabled}
                >
                  <span className="flex-grow truncate">
                    {field.value && isValid(field.value) ? (
                      format(field.value, formatString)
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 ml-2">
                    {clearable && field.value && (
                      <X
                        className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                        onClick={(e) => handleClear(e, field.onChange)}
                        role="button"
                        aria-label="Clear date"
                      />
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 bg-white rounded-md border">
                <DayPicker
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    if (date) setOpen(false);
                  }}
                  disabled={getDisabledDays}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  showOutsideDays={false}
                  className="p-0"
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                      "h-9 w-9 p-0 font-normal",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:rounded-md",
                    ),
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                  }}
                  components={{
                    Caption: ({ displayMonth }) => (
                      <CalendarHeader
                        currentMonth={displayMonth}
                        defaultMonth={displayMonth}
                        onMonthSelect={setCurrentMonth}
                        onYearSelect={(year) => {
                          const newDate = new Date(currentMonth);
                          newDate.setFullYear(year);
                          setCurrentMonth(newDate);
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                      />
                    ),
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomDatePicker;
