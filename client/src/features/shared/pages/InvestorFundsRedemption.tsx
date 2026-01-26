import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// -----------------------------
// 1) Validation schema
// -----------------------------
const baseSchema = z.object({
  investmentId: z.string().min(3, "Investment ID is required"),
  date: z.string().min(1, "Date is required"),

  fundType: z.enum(["ethical", "equity", "debt"] as const, {
    message: "Select a fund type",
  }),

  amountFigures: z
    .string()
    .transform((v) => v.replaceAll(",", "").trim())
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount"),

  amountWords: z.string().min(5, "Amount in words is required"),

  redemptionType: z.enum(["partial", "full"] as const, {
    message: "Select redemption type",
  }),

  fullName: z.string().min(3, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City/Town is required"),
  lga: z.string().min(2, "LGA is required"),
  state: z.string().min(2, "State is required"),

  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Enter a valid email"),

  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),

  confirmAuthorized: z
    .boolean()
    .refine((v) => v === true, "You must confirm this request is authorized"),
});

const formSchema = baseSchema.superRefine((values, ctx) => {
  const bankName = values.bankName?.trim() ?? "";
  const accountName = values.accountName?.trim() ?? "";
  const accountNumber = values.accountNumber?.trim() ?? "";
  const accountType = values.accountType?.trim() ?? "";

  const anyProvided =
    bankName.length > 0 ||
    accountName.length > 0 ||
    accountNumber.length > 0 ||
    accountType.length > 0;

  if (!anyProvided) return;

  if (!bankName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bank name is required when providing bank details",
      path: ["bankName"],
    });
  }

  if (!accountName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account name is required when providing bank details",
      path: ["accountName"],
    });
  }

  if (!accountNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account number is required when providing bank details",
      path: ["accountNumber"],
    });
  } else if (!/^\d{10}$/.test(accountNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account number must be 10 digits",
      path: ["accountNumber"],
    });
  }

  if (!accountType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account type is required when providing bank details",
      path: ["accountType"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

// -----------------------------
// 2) Component
// -----------------------------
export default function RedemptionForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      investmentId: "",
      date: "",
      fundType: "ethical",
      amountFigures: "",
      amountWords: "",
      redemptionType: "partial",
      fullName: "",
      address: "",
      city: "",
      lga: "",
      state: "",
      phone: "",
      email: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      accountType: "",
      confirmAuthorized: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Replace with your API call
    console.log("Submitted values", values);

    // Example POST
    // await fetch("/api/redemption", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(values),
    // })
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            Investors Funds Redemption Form
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Investment Details */}
              <section className="space-y-4">
                <h3 className="font-semibold">Investment Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="investmentId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Investment ID</FormLabel>
                        <FormControl>
                          <Input placeholder="INV-12345" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fundType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Fund Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ethical" id="fund-ethical" />
                            <Label htmlFor="fund-ethical">Ethical</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="equity" id="fund-equity" />
                            <Label htmlFor="fund-equity">Equity</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="debt" id="fund-debt" />
                            <Label htmlFor="fund-debt">Debt</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amountFigures"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Amount (Figures)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="250000"
                            inputMode="decimal"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value.replaceAll(",", ""),
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amountWords"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Amount (Words)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Two Hundred and Fifty Thousand Naira"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="redemptionType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Redemption Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="partial"
                              id="redemption-partial"
                            />
                            <Label htmlFor="redemption-partial">
                              Part Redemption
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full" id="redemption-full" />
                            <Label htmlFor="redemption-full">
                              Full Redemption
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </section>
              <Separator />
              {/* Investor Details */}
              <section className="space-y-4">
                <h3 className="font-semibold">Investor Details</h3>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Full Name / Corporate Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Home Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>City / Town</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lga"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Local Govt Area</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="tel"
                            inputMode="tel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
              <Separator />
              {/* Bank Details */}
              <section className="space-y-4">
                <h3 className="font-semibold">
                  Bank Account Details (Optional)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="0123456789"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value.replace(/\D/g, ""));
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="domiciliary">
                              Domiciliary
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <FormField
                control={form.control}
                name="confirmAuthorized"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!m-0 font-normal">
                        I confirm this request is authorized
                      </FormLabel>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Submit Redemption Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
