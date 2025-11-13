"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveExcursion } from "@/server-actions";
import type { Excursion } from "@/lib/types";
import { ChevronLeft, Trash2, Link2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ExcursionEditorProps {
  excursionData?: Excursion | null;
}

export default function ExcursionEditor({
  excursionData,
}: ExcursionEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [excursion, setExcursion] = React.useState<Partial<Excursion> | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const isNew = !excursionData;

  React.useEffect(() => {
    if (excursionData) {
      setExcursion(excursionData);
    } else {
      setExcursion({
        title: "",
        slug: "",
        tagline: "",
        description: "",
        price: { adult: 0 },
        promo: { headline: "", subheadline: "" },
        practicalInfo: {
          departure: "",
          duration: "",
          pickup: "",
          notes: [],
          pickupMapLink: "",
        },
        inclusions: [],
        gallery: [],
        image: "",
        icon: "Sailboat",
      });
    }
  }, [excursionData]);

  const handleInputChange = (field: string, value: any) => {
    setExcursion((prev) => {
      if (!prev) return null;
      const newExcursion = { ...prev };
      const keys = field.split(".");
      let current: any = newExcursion;
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = { ...(current[key] || {}) };
          current = current[key];
        }
      });
      return newExcursion;
    });
  };

  const handleListChange = (
    field: "inclusions" | "notes" | "gallery",
    value: string[]
  ) => {
    setExcursion((prev) => {
      if (!prev) return null;
      const newExcursion = { ...prev };
      if (field === "inclusions") {
        newExcursion.inclusions = value;
      } else if (field === "notes") {
        newExcursion.practicalInfo = {
          ...(newExcursion.practicalInfo || {
            departure: "",
            duration: "",
            pickup: "",
            notes: [],
            pickupMapLink: "",
          }),
          notes: value,
        };
      } else if (field === "gallery") {
        newExcursion.gallery = value as any;
      }
      return newExcursion;
    });
  };

  React.useEffect(() => {
    if (isNew && excursion?.title) {
      const newSlug = excursion.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      handleInputChange("slug", newSlug);
    }
  }, [excursion?.title, isNew]);

  const handleSave = async () => {
    if (!excursion || !excursion.title || !excursion.slug) {
      toast({
        title: "Missing Information",
        description: "Title and slug are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { id } = await saveExcursion(excursion as Excursion);
      setExcursion((prev) => (prev ? { ...prev, id } : { id }));

      toast({
        title: "Success!",
        description: "Excursion saved successfully.",
      });
      if (isNew && excursion.slug) {
        router.push(`/admin/excursions/edit/${excursion.slug}`);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save excursion. ${
          error instanceof Error ? error.message : ""
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddListItem = (
    field: "inclusions" | "notes" | "gallery",
    inputElement: HTMLInputElement
  ) => {
    const newItem = inputElement.value.trim();
    if (newItem) {
      if (field === "inclusions") {
        const current = excursion?.inclusions || [];
        handleListChange("inclusions", [...current, newItem]);
      } else if (field === "notes") {
        const current = excursion?.practicalInfo?.notes || [];
        handleListChange("notes", [...current, newItem]);
      } else if (field === "gallery") {
        const current = excursion?.gallery || [];
        handleListChange("gallery", [...current, newItem]);
      }
      inputElement.value = "";
    }
  };

  const handleRemoveListItem = (
    field: "inclusions" | "notes" | "gallery",
    index: number
  ) => {
    if (field === "inclusions") {
      const current = excursion?.inclusions || [];
      handleListChange(
        "inclusions",
        current.filter((_, i) => i !== index)
      );
    } else if (field === "notes") {
      const current = excursion?.practicalInfo?.notes || [];
      handleListChange(
        "notes",
        current.filter((_, i) => i !== index)
      );
    } else if (field === "gallery") {
      const current = excursion?.gallery || [];
      handleListChange(
        "gallery",
        current.filter((_, i) => i !== index)
      );
    }
  };

  if (!excursion) {
    return (
      <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
        <header className="flex items-center gap-4 mb-6">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </header>
        <Skeleton className="h-10 w-96 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-7 w-7">
              <Link href="/admin/excursions">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-shpc-ink">
                {isNew ? "Create New Excursion" : `Edit ${excursion.title}`}
              </h1>
              <p className="text-muted-foreground">
                Manage tour details, content, and pricing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save & Publish"}
            </Button>
          </div>
        </header>

        <Tabs defaultValue="details" className="w-full">
          <div className="overflow-x-auto pb-1">
            <TabsList className="mb-6 inline-flex">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="promo">Promo</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="practical">Practical Info</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Excursion Details</CardTitle>
                <CardDescription>
                  This information will be displayed on the public excursion
                  page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isNew && excursion.id && (
                  <div className="space-y-2">
                    <Label htmlFor="id">Excursion ID</Label>
                    <Input
                      id="id"
                      value={excursion.id}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Isla Saona Catamaran Tour"
                    value={excursion.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="isla-saona-catamaran-tour"
                    value={excursion.slug || ""}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    required
                    readOnly={!isNew}
                  />
                  {!isNew && (
                    <p className="text-xs text-muted-foreground">
                      Changing the slug can break existing links. Use with
                      caution.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Short Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="A full-day escape to a Caribbean paradise."
                    value={excursion.tagline || ""}
                    onChange={(e) =>
                      handleInputChange("tagline", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the tour..."
                    rows={5}
                    value={excursion.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promo">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Homepage Promo</CardTitle>
                <CardDescription>
                  This content appears in the promo grid on the homepage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="promo-headline">Promo Headline</Label>
                  <Input
                    id="promo-headline"
                    placeholder="e.g., Isla Saona Tour"
                    value={excursion.promo?.headline || ""}
                    onChange={(e) =>
                      handleInputChange("promo.headline", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-subheadline">Promo Subheadline</Label>
                  <Textarea
                    id="promo-subheadline"
                    placeholder="A short, catchy description for the homepage."
                    rows={3}
                    value={excursion.promo?.subheadline || ""}
                    onChange={(e) =>
                      handleInputChange("promo.subheadline", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set the per-person price for this excursion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price-adult">Price (Adult)</Label>
                    <Input
                      id="price-adult"
                      type="number"
                      placeholder="99"
                      value={excursion.price?.adult || ""}
                      onChange={(e) =>
                        handleInputChange("price.adult", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practical">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Practical Information</CardTitle>
                <CardDescription>
                  Provide key details for guests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="departure">Departure Time</Label>
                    <Input
                      id="departure"
                      placeholder="e.g., 7:00 AM"
                      value={excursion.practicalInfo?.departure || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "practicalInfo.departure",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., Approx. 9 hours"
                      value={excursion.practicalInfo?.duration || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "practicalInfo.duration",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Details</Label>
                  <Input
                    id="pickup"
                    placeholder="e.g., From your hotel lobby"
                    value={excursion.practicalInfo?.pickup || ""}
                    onChange={(e) =>
                      handleInputChange("practicalInfo.pickup", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-map">Pickup Map Link</Label>
                  <Input
                    id="pickup-map"
                    placeholder="https://maps.app.goo.gl/..."
                    value={excursion.practicalInfo?.pickupMapLink || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "practicalInfo.pickupMapLink",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-4">
                  <Label>Inclusions</Label>
                  <div className="space-y-2">
                    {(excursion.inclusions || []).map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={item} readOnly className="bg-muted" />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() =>
                            handleRemoveListItem("inclusions", index)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Buffet lunch on the island"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddListItem("inclusions", e.currentTarget);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        handleAddListItem("inclusions", input);
                      }}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Good to Know (Notes)</Label>
                  <div className="space-y-2">
                    {(excursion.practicalInfo?.notes || []).map(
                      (item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={item} readOnly className="bg-muted" />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => handleRemoveListItem("notes", index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Bring sunscreen and a hat."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddListItem("notes", e.currentTarget);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        handleAddListItem("notes", input);
                      }}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Set the main cover image and build a photo gallery for this
                  tour. Use public image URLs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label
                    className="text-base font-semibold"
                    htmlFor="cover-image-url"
                  >
                    Cover Image
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paste a URL for the main image. Recommended: 800x600px
                    landscape.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cover-image-url"
                        placeholder="https://your-host.com/image.jpg"
                        value={excursion.image || ""}
                        onChange={(e) =>
                          handleInputChange("image", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {excursion.image && (
                    <div className="mt-4 relative group border rounded-lg overflow-hidden max-w-sm">
                      <Image
                        src={excursion.image}
                        alt="Cover image preview"
                        width={400}
                        height={300}
                        className="object-cover aspect-[4/3]"
                      />
                      <Badge className="absolute top-2 left-2">
                        Cover Preview
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t">
                  <Label className="text-base font-semibold">
                    Photo Gallery
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add image URLs for the gallery.
                  </p>
                  <div className="space-y-4">
                    {(excursion.gallery || []).map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={url as string}
                          readOnly
                          className="bg-muted"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => handleRemoveListItem("gallery", index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        id="gallery-url-input"
                        placeholder="https://your-host.com/gallery-image.jpg"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddListItem("gallery", e.currentTarget);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            "gallery-url-input"
                          ) as HTMLInputElement;
                          handleAddListItem("gallery", input);
                        }}
                        size="sm"
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
