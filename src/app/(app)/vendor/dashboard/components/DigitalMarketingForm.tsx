"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  datetimeLocalToIso,
  isoToDatetimeLocalValue,
} from "@/lib/vendor-marketing-profile";
import type { Control } from "react-hook-form";
const marketingChannelSchema = z.object({
  platform: z.enum([
    "facebook-group",
    "instagram-page",
    "whatsapp-group",
    "other",
  ]),
  name: z.string().min(1, "Name is required"),
  url: z.string().min(1, "URL is required"),
  region: z.string().optional(),
  audienceNotes: z.string().optional(),
  isActive: z.boolean().optional(),
  lastPostedAt: z.string().nullable().optional(),
});

const marketingProfileSchema = z.object({
  socialChannels: z.object({
    socialInstagram: z.string().optional(),
    socialFacebook: z.string().optional(),
    socialWhatsAppGroup: z.string().optional(),
    socialWhatsAppGroupJid: z.string().optional(),
    socialNotes: z.string().optional(),
    socialInstagramLastPostedAt: z.string().nullable().optional(),
    socialFacebookLastPostedAt: z.string().nullable().optional(),
    socialWhatsAppGroupLastPostedAt: z.string().nullable().optional(),
  }),
  marketingChannels: z.array(marketingChannelSchema),
  whatsappConfig: z.object({
    businessNumber: z.string().optional(),
    phoneNumberId: z.string().optional(),
    wabaId: z.string().optional(),
    accessToken: z.string().optional(),
    notificationsEnabled: z.boolean().optional(),
  }),
  metaConfig: z.object({
    facebookPageId: z.string().optional(),
    instagramBusinessId: z.string().optional(),
    pageAccessToken: z.string().optional(),
    instagramAccessToken: z.string().optional(),
  }),
});

type MarketingProfileFormValues = z.infer<typeof marketingProfileSchema>;

type MarketingChannelFromApi = {
  platform: MarketingProfileFormValues["marketingChannels"][number]["platform"];
  name: string;
  url: string;
  region?: string | null;
  audienceNotes?: string | null;
  isActive?: boolean | null;
  lastPostedAt?: string | null;
};

const PLATFORM_LABELS: Record<
  MarketingProfileFormValues["marketingChannels"][number]["platform"],
  string
> = {
  "facebook-group": "Facebook group",
  "instagram-page": "Instagram page",
  "whatsapp-group": "WhatsApp group",
  other: "Other",
};

function formatTimestamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return null;
  }
}

function SocialLastPostedField({
  control,
  name,
  label,
}: {
  control: Control<MarketingProfileFormValues>;
  name:
    | "socialChannels.socialInstagramLastPostedAt"
    | "socialChannels.socialFacebookLastPostedAt"
    | "socialChannels.socialWhatsAppGroupLastPostedAt";
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const display = formatTimestamp(
          typeof field.value === "string" ? field.value : null
        );
        return (
          <FormItem>
            <FormLabel className="text-xs text-gray-600">{label}</FormLabel>
            <div className="flex flex-wrap items-center gap-2">
              <FormControl>
                <Input
                  type="datetime-local"
                  className="max-w-[220px]"
                  value={isoToDatetimeLocalValue(
                    typeof field.value === "string" ? field.value : null
                  )}
                  onChange={(e) => field.onChange(datetimeLocalToIso(e.target.value))}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.onChange(new Date().toISOString())}
              >
                Posted today
              </Button>
            </div>
            <FormDescription>
              {display ? (
                <>Last posted: {display}</>
              ) : (
                <>No post logged yet — set when you last promoted on this channel</>
              )}
            </FormDescription>
          </FormItem>
        );
      }}
    />
  );
}

const emptyChannel = (): MarketingProfileFormValues["marketingChannels"][number] => ({
  platform: "facebook-group",
  name: "",
  url: "",
  region: "",
  audienceNotes: "",
  isActive: true,
  lastPostedAt: null,
});

type DigitalMarketingFormProps = {
  mode?: "vendor" | "staff";
  vendorId?: string;
  vendorName?: string;
};

export function DigitalMarketingForm({
  mode = "vendor",
  vendorId,
  vendorName,
}: DigitalMarketingFormProps) {
  const isStaff = mode === "staff";
  const utils = trpc.useUtils();

  const vendorProfileQuery = trpc.vendor.dashboard.getMarketingProfile.useQuery(undefined, {
    enabled: !isStaff,
  });

  const staffProfileQuery = trpc.admin.marketing.getProfile.useQuery(
    { vendorId: vendorId! },
    { enabled: isStaff && Boolean(vendorId) }
  );

  const data = isStaff ? staffProfileQuery.data : vendorProfileQuery.data;
  const isLoading = isStaff ? staffProfileQuery.isLoading : vendorProfileQuery.isLoading;
  const queryError = isStaff ? staffProfileQuery.error : vendorProfileQuery.error;

  const vendorUpdateMutation = trpc.vendor.dashboard.updateMarketingProfile.useMutation({
    onSuccess: (data) => {
      void utils.vendor.dashboard.getMarketingProfile.invalidate();
      const group = data.socialChannels.socialWhatsAppGroup?.trim();
      const jid = data.socialChannels.socialWhatsAppGroupJid?.trim();
      if (group && jid) {
        toast.success("Marketing channels saved. WhatsApp JID updated.");
      } else if (group && !jid) {
        toast.success("Invite saved");
        toast.message(
          "Open Post to social media, link WhatsApp (scan QR), and the JID fills from this invite.",
        );
      } else {
        toast.success("Marketing channels saved");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save marketing channels");
    },
  });

  const staffUpdateMutation = trpc.admin.marketing.updateProfile.useMutation({
    onSuccess: (data) => {
      if (vendorId) {
        void utils.admin.marketing.getProfile.invalidate({ vendorId });
      }
      const group = data?.socialChannels?.socialWhatsAppGroup?.trim();
      const jid = data?.socialChannels?.socialWhatsAppGroupJid?.trim();
      if (group && jid) {
        toast.success("Marketing channels saved. WhatsApp JID updated.");
      } else if (group && !jid) {
        toast.success("Marketing channels saved");
        toast.message(
          "WhatsApp JID is still empty. On Post to social media, link WhatsApp (scan QR) to resolve it from this invite.",
        );
      } else {
        toast.success("Marketing channels saved");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save marketing channels");
    },
  });

  const form = useForm<MarketingProfileFormValues>({
    resolver: zodResolver(marketingProfileSchema),
    defaultValues: {
      socialChannels: {
        socialInstagram: "",
        socialFacebook: "",
        socialWhatsAppGroup: "",
        socialWhatsAppGroupJid: "",
        socialNotes: "",
        socialInstagramLastPostedAt: null,
        socialFacebookLastPostedAt: null,
        socialWhatsAppGroupLastPostedAt: null,
      },
      marketingChannels: [],
      whatsappConfig: {
        businessNumber: "",
        phoneNumberId: "",
        wabaId: "",
        accessToken: "",
        notificationsEnabled: true,
      },
      metaConfig: {
        facebookPageId: "",
        instagramBusinessId: "",
        pageAccessToken: "",
        instagramAccessToken: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "marketingChannels",
  });

  const whatsappGroupLink = form.watch("socialChannels.socialWhatsAppGroup");
  const whatsappConnectEnabled = Boolean(whatsappGroupLink?.trim());

  useEffect(() => {
    if (!data || isStaff) return;
    form.reset({
      socialChannels: {
        socialInstagram: data.socialChannels.socialInstagram ?? "",
        socialFacebook: data.socialChannels.socialFacebook ?? "",
        socialWhatsAppGroup: data.socialChannels.socialWhatsAppGroup ?? "",
        socialWhatsAppGroupJid: data.socialChannels.socialWhatsAppGroupJid ?? "",
        socialNotes: data.socialChannels.socialNotes ?? "",
        socialInstagramLastPostedAt:
          data.socialChannels.socialInstagramLastPostedAt ?? null,
        socialFacebookLastPostedAt: data.socialChannels.socialFacebookLastPostedAt ?? null,
        socialWhatsAppGroupLastPostedAt:
          data.socialChannels.socialWhatsAppGroupLastPostedAt ?? null,
      },
      marketingChannels: (data.marketingChannels ?? []).map((ch: MarketingChannelFromApi) => ({
        platform: ch.platform,
        name: ch.name,
        url: ch.url,
        region: ch.region ?? "",
        audienceNotes: ch.audienceNotes ?? "",
        isActive: ch.isActive ?? true,
        lastPostedAt: ch.lastPostedAt ?? null,
      })),
      whatsappConfig: {
        businessNumber: data.whatsappConfig?.businessNumber ?? "",
        phoneNumberId: data.whatsappConfig?.phoneNumberId ?? "",
        wabaId: data.whatsappConfig?.wabaId ?? "",
        accessToken: "",
        notificationsEnabled: data.whatsappConfig?.notificationsEnabled ?? true,
      },
      metaConfig: {
        facebookPageId: data.metaConfig?.facebookPageId ?? "",
        instagramBusinessId: data.metaConfig?.instagramBusinessId ?? "",
        pageAccessToken: "",
        instagramAccessToken: "",
      },
    });
  }, [data, form, isStaff]);

  useEffect(() => {
    if (!isStaff || !data || !vendorId) return;
    form.reset({
      socialChannels: {
        socialInstagram: data.socialChannels.socialInstagram ?? "",
        socialFacebook: data.socialChannels.socialFacebook ?? "",
        socialWhatsAppGroup: data.socialChannels.socialWhatsAppGroup ?? "",
        socialWhatsAppGroupJid: data.socialChannels.socialWhatsAppGroupJid ?? "",
        socialNotes: data.socialChannels.socialNotes ?? "",
        socialInstagramLastPostedAt:
          data.socialChannels.socialInstagramLastPostedAt ?? null,
        socialFacebookLastPostedAt: data.socialChannels.socialFacebookLastPostedAt ?? null,
        socialWhatsAppGroupLastPostedAt:
          data.socialChannels.socialWhatsAppGroupLastPostedAt ?? null,
      },
      marketingChannels: (data.marketingChannels ?? []).map((ch: MarketingChannelFromApi) => ({
        platform: ch.platform,
        name: ch.name,
        url: ch.url,
        region: ch.region ?? "",
        audienceNotes: ch.audienceNotes ?? "",
        isActive: ch.isActive ?? true,
        lastPostedAt: ch.lastPostedAt ?? null,
      })),
      whatsappConfig: {
        businessNumber: data.whatsappConfig?.businessNumber ?? "",
        phoneNumberId: data.whatsappConfig?.phoneNumberId ?? "",
        wabaId: data.whatsappConfig?.wabaId ?? "",
        accessToken: "",
        notificationsEnabled: data.whatsappConfig?.notificationsEnabled ?? true,
      },
      metaConfig: {
        facebookPageId: data.metaConfig?.facebookPageId ?? "",
        instagramBusinessId: data.metaConfig?.instagramBusinessId ?? "",
        pageAccessToken: "",
        instagramAccessToken: "",
      },
    });
  }, [data, form, isStaff, vendorId]);

  const onSubmit = (values: MarketingProfileFormValues) => {
    // JID is server-resolved and read-only — never trust a client value.
    const payload = {
      ...values,
      socialChannels: {
        ...values.socialChannels,
        socialWhatsAppGroupJid: undefined,
      },
    };

    if (isStaff) {
      if (!vendorId) return;
      staffUpdateMutation.mutate({ vendorId, ...payload });
      return;
    }
    vendorUpdateMutation.mutate(payload);
  };

  if (isStaff && !vendorId) {
    return null;
  }

  if (queryError) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-red-600">
          Failed to load marketing profile: {queryError.message}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Digital marketing</CardTitle>
        <CardDescription>
          {isStaff && vendorName ? (
            <>
              Social accounts and community channels for{" "}
              <span className="font-medium text-gray-800">{vendorName}</span>.
            </>
          ) : (
            <>
              Your store&apos;s social accounts and community groups or pages where you promote
              products.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Your accounts (Instagram, Facebook, WhatsApp)
              </h3>
              <p className="text-xs text-gray-500">
                Account links are your profiles; use &quot;Last posted&quot; to log when you
                last promoted products on each channel.
              </p>
              <FormField
                control={form.control}
                name="socialChannels.socialInstagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/yourstore"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SocialLastPostedField
                control={form.control}
                name="socialChannels.socialInstagramLastPostedAt"
                label="Instagram — last posted"
              />
              <FormField
                control={form.control}
                name="socialChannels.socialFacebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook page</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/yourpage"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SocialLastPostedField
                control={form.control}
                name="socialChannels.socialFacebookLastPostedAt"
                label="Facebook — last posted"
              />
              <FormField
                control={form.control}
                name="socialChannels.socialWhatsAppGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp group / channel</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://chat.whatsapp.com/… or https://whatsapp.com/channel/…"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Paste a group invite (
                      <span className="font-mono text-[11px]">
                        chat.whatsapp.com/…
                      </span>
                      ) or channel link (
                      <span className="font-mono text-[11px]">
                        whatsapp.com/channel/…
                      </span>
                      ). Link WhatsApp and fill the JID on{" "}
                      <span className="font-medium">Post to social media</span>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SocialLastPostedField
                control={form.control}
                name="socialChannels.socialWhatsAppGroupLastPostedAt"
                label="WhatsApp — last posted"
              />
              <FormField
                control={form.control}
                name="socialChannels.socialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Posting preferences, handles, best times…"
                        rows={2}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Community channels
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Facebook groups, Instagram pages, or other places you promote your store.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(emptyChannel())}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add channel
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-gray-500 rounded-md border border-dashed border-gray-300 p-4 text-center">
                  No community channels yet. Add a Facebook group or Instagram page you post in.
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          Channel {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 h-8"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`marketingChannels.${index}.platform`}
                        render={({ field: platformField }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select
                              value={platformField.value}
                              onValueChange={platformField.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`marketingChannels.${index}.name`}
                        render={({ field: nameField }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Desi Fashion Deals"
                                {...nameField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`marketingChannels.${index}.url`}
                        render={({ field: urlField }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://…" {...urlField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`marketingChannels.${index}.region`}
                          render={({ field: regionField }) => (
                            <FormItem>
                              <FormLabel>Region</FormLabel>
                              <FormControl>
                                <Input placeholder="State or metro" {...regionField} value={regionField.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`marketingChannels.${index}.isActive`}
                          render={({ field: activeField }) => (
                            <FormItem className="flex flex-row items-end gap-2 pb-2">
                              <FormControl>
                                <Checkbox
                                  checked={activeField.value ?? true}
                                  onCheckedChange={activeField.onChange}
                                />
                              </FormControl>
                              <FormLabel className="mt-0 font-normal">Active</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`marketingChannels.${index}.audienceNotes`}
                        render={({ field: notesField }) => (
                          <FormItem>
                            <FormLabel>Audience & posting rules (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={2}
                                placeholder="Who is in this group and any posting rules"
                                {...notesField}
                                value={notesField.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`marketingChannels.${index}.lastPostedAt`}
                        render={({ field: postedField }) => {
                          const display = formatTimestamp(
                            typeof postedField.value === "string" ? postedField.value : null
                          );
                          return (
                            <FormItem>
                              <FormLabel>Last posted</FormLabel>
                              <div className="flex flex-wrap items-center gap-2">
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    className="max-w-[220px]"
                                    value={isoToDatetimeLocalValue(
                                      typeof postedField.value === "string"
                                        ? postedField.value
                                        : null
                                    )}
                                    onChange={(e) =>
                                      postedField.onChange(datetimeLocalToIso(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    postedField.onChange(new Date().toISOString())
                                  }
                                >
                                  Posted today
                                </Button>
                              </div>
                              <FormDescription>
                                {display ? (
                                  <>Last posted: {display}</>
                                ) : (
                                  <>Log when you last promoted in this group or page</>
                                )}
                              </FormDescription>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  WhatsApp Business notifications
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Connect your WhatsApp Business Cloud API account to receive order, like, and
                  favorite notifications and to post products to WhatsApp.
                </p>
                {!whatsappConnectEnabled ? (
                  <p className="mt-2 text-xs text-amber-700">
                    Add a WhatsApp group invite link above to enable WhatsApp Business connection.
                  </p>
                ) : null}
              </div>
              <fieldset disabled={!whatsappConnectEnabled} className="space-y-4 disabled:opacity-60">
              <FormField
                control={form.control}
                name="whatsappConfig.businessNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business number (E.164)</FormLabel>
                    <FormControl>
                      <Input placeholder="+13098253354" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>
                      Where notifications are sent. Use E.164 format, e.g. +13098253354.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="whatsappConfig.phoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number ID</FormLabel>
                      <FormControl>
                        <Input placeholder="From Meta" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappConfig.wabaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Business Account ID</FormLabel>
                      <FormControl>
                        <Input placeholder="From Meta" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="whatsappConfig.accessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          data?.whatsappConfig?.hasAccessToken
                            ? "•••••••• (leave blank to keep current)"
                            : "Paste WhatsApp Cloud API token"
                        }
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Stored securely and never shown after saving.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappConfig.notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="mt-0 font-normal">
                      Send WhatsApp notifications for orders, likes, and favorites
                    </FormLabel>
                  </FormItem>
                )}
              />
              </fieldset>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Instagram posting
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Paste your Instagram access token (<code className="text-xs">IGAA…</code>).
                  No Facebook Page required. Instagram user ID is filled in automatically when
                  you save.
                </p>
              </div>
              <FormField
                control={form.control}
                name="metaConfig.instagramAccessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram access token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          data?.metaConfig?.hasInstagramAccessToken
                            ? "•••••••• (leave blank to keep current)"
                            : "Paste Instagram token (IGAA…)"
                        }
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      From Meta Instagram Login / Graph API Explorer. Needs{" "}
                      <code className="text-xs">instagram_basic</code> and{" "}
                      <code className="text-xs">instagram_content_publish</code>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaConfig.instagramBusinessId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram account ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Auto-filled from token"
                        readOnly
                        className="bg-gray-50"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    {data?.metaConfig?.instagramUsername ? (
                      <FormDescription>
                        Connected as @{data.metaConfig.instagramUsername}
                      </FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-800">
                  Facebook Page posting (optional)
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Only needed to post to Facebook or to use the Facebook Page + Instagram path
                  with an <code className="text-xs">EAA…</code> token.
                </p>
              </div>
              <FormField
                control={form.control}
                name="metaConfig.pageAccessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Page access token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          data?.metaConfig?.hasPageAccessToken
                            ? "•••••••• (leave blank to keep current)"
                            : "Paste Page token (EAA…) — optional"
                        }
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaConfig.facebookPageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Page ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Auto-filled from Page token"
                        readOnly
                        className="bg-gray-50"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={vendorUpdateMutation.isPending || staffUpdateMutation.isPending}
            >
              {(vendorUpdateMutation.isPending || staffUpdateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save marketing channels
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
