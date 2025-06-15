import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { insertItemSchema } from "@shared/schema";
import { CATEGORIES } from "@/lib/types";
import { Gift, HandHeart, Upload, X } from "lucide-react";
import { z } from "zod";

const postItemSchema = insertItemSchema.extend({
  type: z.enum(["donate", "rent"]),
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
});

type PostItemForm = z.infer<typeof postItemSchema>;

interface PostItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostItemModal({ open, onOpenChange }: PostItemModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRentalPrice, setShowRentalPrice] = useState(false);

  const form = useForm<PostItemForm>({
    resolver: zodResolver(postItemSchema),
    defaultValues: {
      type: "donate",
      category: "",
      title: "",
      description: "",
      location: "",
      pincode: "",
      condition: "",
      status: "available",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: PostItemForm) => {
      if (!isAuthenticated) {
        throw new Error("Please login to post items");
      }
      return await apiRequest("POST", "/api/items", data);
    },
    onSuccess: () => {
      toast({
        title: "Item Posted Successfully!",
        description: "Your item is now visible to the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostItemForm) => {
    createItemMutation.mutate(data);
  };

  const handleTypeChange = (type: string) => {
    form.setValue("type", type as "donate" | "rent");
    setShowRentalPrice(type === "rent");
    if (type === "donate") {
      form.setValue("price", undefined);
      form.setValue("priceUnit", undefined);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Login Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Please login to post items and connect with the community.
            </p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-primary/90"
            >
              Login to Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Post an Item
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Share something with your community
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I want to:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={handleTypeChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="donate" id="donate" />
                        <Label 
                          htmlFor="donate" 
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer flex-1 ${
                            field.value === "donate" 
                              ? "border-primary bg-primary/5" 
                              : "border-gray-200"
                          }`}
                        >
                          <Gift className="mr-2 text-primary" size={20} />
                          <span className="font-medium">Donate</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rent" id="rent" />
                        <Label 
                          htmlFor="rent" 
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer flex-1 ${
                            field.value === "rent" 
                              ? "border-primary bg-primary/5" 
                              : "border-gray-200"
                          }`}
                        >
                          <HandHeart className="mr-2 text-gray-600" size={20} />
                          <span className="font-medium">Rent Out</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Office Chair, Study Books" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Describe the item, its condition, and any other details..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images Upload */}
            <div>
              <Label>Images</Label>
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop images</p>
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Koramangala, Bangalore" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 560034" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs-repair">Needs Repair</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rental Price */}
            {showRentalPrice && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rental Price</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">₹</span>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">per day</SelectItem>
                          <SelectItem value="week">per week</SelectItem>
                          <SelectItem value="month">per month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={createItemMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {createItemMutation.isPending ? "Posting..." : "Post Item"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
