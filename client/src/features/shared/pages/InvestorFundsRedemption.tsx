import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getApiErrorMessage } from "@/lib/api";
import { redemptionFormSchema, type RedemptionFormValues } from "../schema";
import { useInvestor } from "../contexts/Investor-startupContext";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/animations/PageTransition";
import { FadeIn } from "@/components/animations/FadeIn";
import DashboardNavigation from "@/components/layout/DashboardLayout";
import { Spinner } from "@/components/ui/spinner";

const getTodayISODate = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function RedemptionForm() {
  const { submitRedemptionRequest, getRedemptionBankDetails } = useInvestor();
  const didPrefillRef = useRef(false);
  const form = useForm<RedemptionFormValues>({
    resolver: zodResolver(redemptionFormSchema),
    mode: "onChange",
    defaultValues: {
      investmentId: "",
      date: getTodayISODate(),
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

  useEffect(() => {
    if (didPrefillRef.current) return;
    didPrefillRef.current = true;

    let mounted = true;
    const load = async () => {
      try {
        const bank = await getRedemptionBankDetails();
        if (!mounted) return;

        const current = form.getValues();
        const patch: Partial<RedemptionFormValues> = {};

        if (
          !form.getFieldState("bankName").isDirty &&
          !current.bankName &&
          bank.bankName
        ) {
          patch.bankName = bank.bankName;
        }
        if (
          !form.getFieldState("accountName").isDirty &&
          !current.accountName &&
          bank.accountName
        ) {
          patch.accountName = bank.accountName;
        }
        if (
          !form.getFieldState("accountNumber").isDirty &&
          !current.accountNumber &&
          bank.accountNumber
        ) {
          patch.accountNumber = bank.accountNumber;
        }
        if (
          !form.getFieldState("accountType").isDirty &&
          !current.accountType &&
          bank.accountType
        ) {
          patch.accountType = bank.accountType;
        }

        if (Object.keys(patch).length > 0) {
          form.reset({ ...current, ...patch }, { keepDirty: true });
        }
      } catch {
        // If unauthenticated or bank details missing, keep fields empty.
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [form, getRedemptionBankDetails]);

  const onSubmit = async (values: RedemptionFormValues) => {
    const submitDate = getTodayISODate();
    try {
      form.setValue("date", submitDate, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      await submitRedemptionRequest({ ...values, date: submitDate });
      toast.success("Redemption request submitted successfully");
      form.reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <DashboardNavigation>
      <PageTransition>
        <FadeIn>
          <div className="mx-auto w-full max-w-4xl">
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-xl sm:text-2xl font-semibold">
                  Funds Redemption
                </CardTitle>
                <CardDescription className="text-sm">
                  Complete the details below to request redemption of your
                  invested funds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
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
                                <Input
                                  type="date"
                                  {...field}
                                  disabled
                                  className="bg-muted/40 cursor-not-allowed"
                                />
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
                                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
                              >
                                <Label
                                  htmlFor="fund-ethical"
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition",
                                    field.value === "ethical"
                                      ? "border-brand-primary bg-brand-primary/10"
                                      : "border-gray-300 bg-gray-50 hover:bg-white",
                                  )}
                                >
                                  <RadioGroupItem
                                    value="ethical"
                                    id="fund-ethical"
                                    className="sr-only"
                                  />
                                  <span className="font-medium">Ethical</span>
                                </Label>

                                <Label
                                  htmlFor="fund-equity"
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition",
                                    field.value === "equity"
                                      ? "border-brand-primary bg-brand-primary/10"
                                      : "border-gray-300 bg-gray-50 hover:bg-white",
                                  )}
                                >
                                  <RadioGroupItem
                                    value="equity"
                                    id="fund-equity"
                                    className="sr-only"
                                  />
                                  <span className="font-medium">Equity</span>
                                </Label>

                                <Label
                                  htmlFor="fund-debt"
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition",
                                    field.value === "debt"
                                      ? "border-brand-primary bg-brand-primary/10"
                                      : "border-gray-300 bg-gray-50 hover:bg-white",
                                  )}
                                >
                                  <RadioGroupItem
                                    value="debt"
                                    id="fund-debt"
                                    className="sr-only"
                                  />
                                  <span className="font-medium">Debt</span>
                                </Label>
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
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"
                              >
                                <Label
                                  htmlFor="redemption-partial"
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition",
                                    field.value === "partial"
                                      ? "border-brand-primary bg-brand-primary/10"
                                      : "border-gray-300 bg-gray-50 hover:bg-white",
                                  )}
                                >
                                  <RadioGroupItem
                                    value="partial"
                                    id="redemption-partial"
                                    className="sr-only"
                                  />
                                  <span className="font-medium">
                                    Part Redemption
                                  </span>
                                </Label>

                                <Label
                                  htmlFor="redemption-full"
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition",
                                    field.value === "full"
                                      ? "border-brand-primary bg-brand-primary/10"
                                      : "border-gray-300 bg-gray-50 hover:bg-white",
                                  )}
                                >
                                  <RadioGroupItem
                                    value="full"
                                    id="redemption-full"
                                    className="sr-only"
                                  />
                                  <span className="font-medium">
                                    Full Redemption
                                  </span>
                                </Label>
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
                                <Input
                                  type="email"
                                  autoComplete="email"
                                  {...field}
                                />
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
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold">
                            Bank Account Details
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Optional. We may prefill these from your saved bank
                            details. Leave blank to keep your existing payout
                            account.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          Optional
                        </span>
                      </div>

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
                                    field.onChange(
                                      e.target.value.replace(/\D/g, ""),
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
                                  <SelectItem value="savings">
                                    Savings
                                  </SelectItem>
                                  <SelectItem value="current">
                                    Current
                                  </SelectItem>
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

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Spinner />
                          Submitting...
                        </>
                      ) : (
                        "Submit Redemption Request"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </PageTransition>
    </DashboardNavigation>
  );
}
