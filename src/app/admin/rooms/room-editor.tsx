"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveRoom } from "@/server-actions";
import type { Room } from "@/lib/types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { ref as storageRef, deleteObject } from "firebase/storage";

import {
  ChevronLeft,
  Trash2,
  DollarSign,
  Loader2,
  Star,
  Link2,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface RoomEditorProps {
  slug?: string;
}

const initialAmenities = [
  "Private balcony",
  "Air conditioning",
  "Free Wi-Fi",
  "Smart TV with Netflix",
  "Private bathroom",
  "Hot water",
  "Towels & toiletries",
  "Wardrobe",
  "Mini fridge",
  "Patio Access",
  "Daily cleaning",
];

export default function RoomEditor({ slug }: RoomEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const [room, setRoom] = React.useState<Partial<Room> | null>(null);
  const [isLoading, setIsLoading] = React.useState(!!slug);
  const [isSaving, setIsSaving] = React.useState(false);
  const isNew = !slug;

  const [allAmenities, setAllAmenities] = React.useState(initialAmenities);
  const [newAmenityLabel, setNewAmenityLabel] = React.useState("");

  React.useEffect(() => {
    async function fetchRoom() {
      if (!slug) {
        setRoom({
          name: "",
          slug: "",
          tagline: "",
          description: "",
          amenities: [],
          gallery: [],
          price: 0,
          capacity: 2,
          inventoryUnits: 1,
        });
        setIsLoading(false);
        return;
      }

      if (!db) {
        // Firestore is not available yet, wait for it
        return;
      }

      setIsLoading(true);
      try {
        const q = query(collection(db, "rooms"), where("slug", "==", slug));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          toast({
            title: "Not Found",
            description: "Room not found",
            variant: "destructive",
          });
          router.push("/admin/rooms");
        } else {
          const doc = snapshot.docs[0];
          setRoom({ id: doc.id, ...doc.data() } as Room);
        }
      } catch (error) {
        console.error("Failed to fetch room:", error);
        toast({
          title: "Error",
          description: "Could not load room data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoom();
  }, [slug, router, toast, db]);

  const handleInputChange = (field: keyof Room, value: any) => {
    setRoom((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  React.useEffect(() => {
    if (isNew && room?.name) {
      const newSlug = room.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      handleInputChange("slug", newSlug);
    }
  }, [room?.name, isNew]);

  const handleSave = async () => {
    if (!room) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const newRoomData: Room = {
          id: "", // Firestore will generate this
          name: room.name || "",
          slug: room.slug || "",
          tagline: room.tagline || "",
          description: room.description || "",
          bedding: room.bedding || "King",
          capacity: room.capacity || 2,
          price: room.price || 0,
          image: room.image || "",
          amenities: room.amenities || [],
          gallery: room.gallery || [],
          inventoryUnits: room.inventoryUnits || 1,
        };
        const { id } = await saveRoom(newRoomData);
        console.log('save room data:',{ id })
        setRoom((prev) => ({ ...prev, id }));
        toast({
          title: "Success",
          description: "Room created. You can now manage photos.",
        });
        router.push(`/admin/rooms/edit/${newRoomData.slug}`);
        router.refresh();
      } else {
        await saveRoom(room as Room);
        toast({ title: "Success", description: "Room saved successfully." });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to save room.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setRoom((prev) => {
      if (!prev) return null;
      const currentAmenities = prev.amenities || [];
      const newAmenities = checked
        ? [...currentAmenities, amenity]
        : currentAmenities.filter((a) => a !== amenity);
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleAddAmenity = () => {
    if (
      newAmenityLabel.trim() !== "" &&
      !allAmenities.includes(newAmenityLabel.trim())
    ) {
      setAllAmenities((prev) => [...prev, newAmenityLabel.trim()]);
      setNewAmenityLabel("");
    }
  };

  const handleAddGalleryUrl = () => {
    const inputElement = document.getElementById(
      "gallery-url-input"
    ) as HTMLInputElement;
    const newUrl = inputElement?.value.trim();
    if (newUrl && room) {
      const currentGallery = room.gallery || [];
      // Ensure the URL is not already in the gallery
      if (!currentGallery.includes(newUrl)) {
        const updatedGallery = [...currentGallery, newUrl];
        setRoom({ ...room, gallery: updatedGallery });
      }
      inputElement.value = ""; // Clear input field
    }
  };

  const handleRemoveGalleryItem = (index: number) => {
    if (room && room.gallery) {
      const updatedGallery = room.gallery.filter((_, i) => i !== index);
      setRoom({ ...room, gallery: updatedGallery });
    }
  };

  const handleSetAsCover = async (url: string) => {
    if (!room) return;
    const updatedRoom = { ...room, image: url };
    setRoom(updatedRoom);
    await saveRoom(updatedRoom as Room);
    toast({ title: "Cover Image Updated" });
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    if (!room) return;

    const newGallery = (room.gallery || []).filter(
      (url) => url !== urlToDelete
    );
    const newMainImage =
      room.image === urlToDelete ? newGallery[0] || "" : room.image;
    const updatedRoom = { ...room, gallery: newGallery, image: newMainImage };

    setRoom(updatedRoom);

    try {
      await saveRoom(updatedRoom as Room);
      toast({ title: "Image Removed" });
    } catch (error) {
      console.error("Failed to update room after image removal:", error);
      toast({
        title: "Update Failed",
        description: "Could not save changes after removing image.",
        variant: "destructive",
      });
      // Revert UI change on failure
      setRoom(room);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading room editor...</div>;
  }

  if (!room) {
    return <div className="p-6">Room data could not be loaded.</div>;
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
              <Link href="/admin/rooms">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-shpc-ink">
                {isNew ? "Create New Room" : `Edit ${room.name}`}
              </h1>
              <p className="text-muted-foreground">
                Manage room details, photos, and visibility.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90"
              type="submit"
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
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
                <CardDescription>
                  This information will be displayed on the public room page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., King Room with Ocean View"
                    value={room.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="king-room-with-ocean-view"
                    value={room.slug || ""}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    required
                    readOnly={!isNew}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="A short, catchy description for the rooms page."
                    value={room.tagline || ""}
                    onChange={(e) =>
                      handleInputChange("tagline", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the room, its features, and what makes it special..."
                    value={room.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bed-type">Bed Type</Label>
                    <Select
                      value={room.bedding || ""}
                      onValueChange={(value) =>
                        handleInputChange("bedding", value)
                      }
                    >
                      <SelectTrigger id="bed-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="King">King</SelectItem>
                        <SelectItem value="Queen">Queen</SelectItem>
                        <SelectItem value="California King">
                          California King
                        </SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (guests)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="2"
                      value={room.capacity || ""}
                      onChange={(e) =>
                        handleInputChange("capacity", Number(e.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="150"
                        value={room.price || ""}
                        onChange={(e) =>
                          handleInputChange("price", Number(e.target.value))
                        }
                        required
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="inventory-units">Inventory Units</Label>
                  <Input
                    id="inventory-units"
                    type="number"
                    placeholder="1"
                    value={room.inventoryUnits || 1}
                    onChange={(e) =>
                      handleInputChange(
                        "inventoryUnits",
                        Number(e.target.value)
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    How many identical units of this room type are available?
                  </p>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <Label className="font-semibold">Guest Rating</Label>
                  <div className="space-y-2">
                    <Label htmlFor="rating-review">Review Highlight</Label>
                    <Input
                      id="rating-review"
                      placeholder="e.g., Guests love the amazing ocean view"
                      value={room.rating?.review || ""}
                      onChange={(e) =>
                        setRoom((r) =>
                          r
                            ? {
                                ...r,
                                rating: {
                                  ...r.rating,
                                  review: e.target.value,
                                } as any,
                              }
                            : null
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="cancellation-policy">
                    Cancellation Policy
                  </Label>
                  <Input
                    id="cancellation-policy"
                    placeholder="e.g., Free cancellation until 3 days before check-in."
                    value={room.cancellationPolicy || ""}
                    onChange={(e) =>
                      handleInputChange("cancellationPolicy", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities">
            <Card className="shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>
                  Select all amenities available in this room.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allAmenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center space-x-2 p-3 bg-shpc-sand/50 rounded-lg"
                    >
                      <Switch
                        id={amenity.toLowerCase().replace(/\s+/g, "-")}
                        checked={room.amenities?.includes(amenity)}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(amenity, checked)
                        }
                      />
                      <Label
                        htmlFor={amenity.toLowerCase().replace(/\s+/g, "-")}
                        className="cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <Label htmlFor="new-amenity" className="font-medium">
                    Add a Custom Amenity
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="new-amenity"
                      placeholder="e.g., Ocean View"
                      value={newAmenityLabel}
                      onChange={(e) => setNewAmenityLabel(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddAmenity}>
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
                  Paste public image URLs from the Firebase Console or any other
                  hosting service.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label
                    className="text-base font-semibold"
                    htmlFor="cover-image-url"
                  >
                    Cover Image URL
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    This is the main image for the room.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cover-image-url"
                        placeholder="https://your-host.com/image.jpg"
                        value={room.image || ""}
                        onChange={(e) =>
                          handleInputChange("image", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {room.image && (
                    <div className="mt-4 relative group border rounded-lg overflow-hidden max-w-sm">
                      <Image
                        src={room.image}
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
                    Photo Gallery URLs
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add more image URLs for the room's gallery.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      id="gallery-url-input"
                      placeholder="https://your-host.com/gallery-image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddGalleryUrl();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      size="sm"
                    >
                      Add URL
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(room.gallery || []).map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                      >
                        <span className="text-sm text-muted-foreground truncate flex-grow">
                          {url}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => handleRemoveGalleryItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t">
                  <h4 className="text-base font-semibold">Gallery Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {room.gallery?.map((photoUrl) => (
                      <div
                        key={photoUrl}
                        className="relative group border rounded-lg overflow-hidden"
                      >
                        <Image
                          src={photoUrl}
                          alt="Room gallery photo"
                          width={400}
                          height={300}
                          className="object-cover aspect-[4/3]"
                          data-ai-hint="hotel room"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end items-center p-2 gap-2">
                          <div className="flex items-center gap-2">
                            {room.image !== photoUrl && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSetAsCover(photoUrl)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Set Cover
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleDeleteImage(photoUrl)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
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
