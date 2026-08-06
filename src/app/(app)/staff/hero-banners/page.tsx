"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type {
  HappyBannerPreset,
  HeroBannerConfigDoc,
  MotionIntensity,
  ProductSourceMode,
} from "@/lib/happy-banner/types";

type ConfigDoc = HeroBannerConfigDoc;

interface ConfigForm {
  enabled: boolean;
  productSource: ProductSourceMode;
  maxTiles: number;
  preset: HappyBannerPreset;
  intensity: MotionIntensity;
  height: number;
  tileSize: number;
  speed: number;
  backgroundMode: "auto-palette" | "image" | "gradient" | "theme-token";
  gradientFrom: string;
  gradientTo: string;
}

function toForm(config: ConfigDoc): ConfigForm {
  return {
    enabled: config.enabled ?? false,
    productSource: (config.productSource ?? "all-active") as ProductSourceMode,
    maxTiles: config.maxTiles ?? 24,
    preset: (config.preset ?? "marquee-max") as HappyBannerPreset,
    intensity: (config.intensity ?? "lively") as MotionIntensity,
    height: config.height ?? 360,
    tileSize: config.tileSize ?? 128,
    speed: config.speed ?? 1,
    backgroundMode: (config.backgroundMode ?? "auto-palette") as ConfigForm["backgroundMode"],
    gradientFrom: config.gradientFrom ?? "#1e1b4b",
    gradientTo: config.gradientTo ?? "#312e81",
  };
}

function HeroBannerConfigForm({ config }: { config: ConfigDoc }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ConfigForm>(() => toForm(config));

  const updateMutation = trpc.admin.heroBannerConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Happy Banner config saved");
      void utils.admin.heroBannerConfig.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global settings</CardTitle>
        <CardDescription>Vendors edit header and tagline only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled">Enable Happy Banner</Label>
          <Switch
            id="enabled"
            checked={form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Product source</Label>
            <Select
              value={form.productSource}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, productSource: v as ProductSourceMode }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-active">All active</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="best-sellers">Best sellers</SelectItem>
                <SelectItem value="manual">Manual (per-vendor override)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preset</Label>
            <Select
              value={form.preset}
              onValueChange={(v) => setForm((f) => ({ ...f, preset: v as HappyBannerPreset }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marquee-max">Marquee Max</SelectItem>
                <SelectItem value="kinetic-wall">Kinetic Wall</SelectItem>
                <SelectItem value="crossfire">Crossfire</SelectItem>
                <SelectItem value="gravity-well">Gravity Well</SelectItem>
                <SelectItem value="confetti">Confetti</SelectItem>
                <SelectItem value="liquid-ribbon">Liquid Ribbon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Intensity</Label>
            <Select
              value={form.intensity}
              onValueChange={(v) => setForm((f) => ({ ...f, intensity: v as MotionIntensity }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="lively">Lively</SelectItem>
                <SelectItem value="showcase">Showcase</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTiles">Max tiles</Label>
            <Input
              id="maxTiles"
              type="number"
              value={form.maxTiles}
              onChange={(e) => setForm((f) => ({ ...f, maxTiles: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={form.height}
              onChange={(e) => setForm((f) => ({ ...f, height: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tileSize">Tile size (px)</Label>
            <Input
              id="tileSize"
              type="number"
              value={form.tileSize}
              onChange={(e) => setForm((f) => ({ ...f, tileSize: Number(e.target.value) }))}
            />
          </div>
        </div>

        <Button disabled={updateMutation.isPending} onClick={() => updateMutation.mutate(form)}>
          {updateMutation.isPending ? "Saving…" : "Save configuration"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function StaffHeroBannersPage() {
  const { data: config, isLoading } = trpc.admin.heroBannerConfig.get.useQuery();

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Happy Banner</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Platform-wide motion, product source, and background settings for vendor storefront banners.
      </p>

      {isLoading || !config ? (
        <div>Loading…</div>
      ) : (
        <HeroBannerConfigForm config={config} />
      )}
    </div>
  );
}
