import { AnimatePresence, motion } from "framer-motion";
import type { FieldPath, UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StableFormField } from "@/features/shared/components/forms/StableFormField";

type NextOfKinValues = {
  kinFullName: string;
  kinPhoneNumber: string;
  kinEmail: string;
  kinResidentialAddress: string;
  kinRelationship:
    | "Spouse"
    | "Sibling"
    | "Parent"
    | "Guardian"
    | "Friend"
    | "Other";
  kinRelationshipOther?: string;
};

type Props<T extends NextOfKinValues> = {
  form: UseFormReturn<T>;
};
export function NextOfKinStep<T extends NextOfKinValues>({ form }: Props<T>) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="nok"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <h2 className="text-lg sm:text-xl font-semibold">
          Next of Kin Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2">
          <StableFormField
            label="Full Name"
            name={"kinFullName" as FieldPath<T>}
            autoComplete="name"
            control={form.control}
            placeholder="Jane Doe"
          />
          <StableFormField
            label="Phone Number"
            name={"kinPhoneNumber" as FieldPath<T>}
            autoComplete="tel"
            control={form.control}
            placeholder="+2348073729324"
            type="tel"
            isPhone
          />
          <StableFormField
            label="Email Address"
            name={"kinEmail" as FieldPath<T>}
            autoComplete="email"
            control={form.control}
            placeholder="name@example.com"
            type="email"
          />

          <FormField
            control={form.control}
            name={"kinRelationship" as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm leading-0 mb-2 sm:text-base">
                  Relationship <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="py-5 border sm:text-base border-gray-300">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "Spouse",
                      "Sibling",
                      "Parent",
                      "Guardian",
                      "Friend",
                      "Other",
                    ].map((opt) => (
                      <SelectItem
                        className="focus:bg-brand-primary"
                        key={opt}
                        value={opt}
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          {form.watch("kinRelationship" as FieldPath<T>) === "Other" && (
            <StableFormField
              label="Specify Relationship"
              name={"kinRelationshipOther" as FieldPath<T>}
              control={form.control}
              placeholder="e.g., Cousin"
            />
          )}
        </div>

        <StableFormField
          label="Residential Address"
          name={"kinResidentialAddress" as FieldPath<T>}
          autoComplete="address"
          control={form.control}
          placeholder="123 Main Street, Ikeja, Lagos"
        />
      </motion.div>
    </AnimatePresence>
  );
}
