import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Upload, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ShopManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Fitness",
    amazon_url: "",
    image_url: "",
    price_range: "",
    is_featured: false,
    display_order: 0,
  });

  const queryClient = useQueryClient();
  const categories = ["Fitness", "Nutrition", "Clothing", "Apparel & Accessories"];

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-shop-products", categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("shop_products")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("shop_products").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      toast.success("Product added successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add product: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("shop_products")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      toast.success("Product updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      toast.success("Product deleted successfully");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete product: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Fitness",
      amazon_url: "",
      image_url: "",
      price_range: "",
      is_featured: false,
      display_order: 0,
    });
    setSelectedFile(null);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    setFormData({
      title: product.title,
      description: product.description,
      category: product.category || "General Equipment", // Preserve existing or use default
      amazon_url: product.amazon_url,
      image_url: product.image_url,
      price_range: product.price_range,
      is_featured: product.is_featured,
      display_order: product.display_order,
    });
    setEditingId(product.id);
    setIsCreating(true);
    
    // Scroll to form at the top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setIsUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `shop-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contact-files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contact-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = formData.image_url;
    
    // Upload new image if selected
    if (selectedFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) return; // Stop if upload failed
      finalImageUrl = uploadedUrl;
    }

    const dataToSubmit = { ...formData, image_url: finalImageUrl };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Shop Management</h2>
          <p className="text-muted-foreground">Manage Amazon affiliate products</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
            <CardDescription>
              Add your Amazon affiliate link and product details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Your Recommendation</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price_range">Price Range</Label>
                <Input
                  id="price_range"
                  placeholder="e.g., $20-$30"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amazon_url">Amazon URL (with affiliate tag)</Label>
                <Input
                  id="amazon_url"
                  type="url"
                  placeholder="https://www.amazon.com/dp/..."
                  value={formData.amazon_url}
                  onChange={(e) => setFormData({ ...formData, amazon_url: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Product Image</Label>
                
                {/* Current/Preview Image */}
                {(formData.image_url || selectedFile) && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setSelectedFile(null);
                        setFormData({ ...formData, image_url: "" });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* File Upload */}
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("Image must be less than 10MB");
                          return;
                        }
                        setSelectedFile(file);
                      }
                    }}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a product image (max 10MB) or paste an image URL below
                </p>

                {/* Manual URL Input (fallback) */}
                <Input
                  id="image_url"
                  type="url"
                  placeholder="Or paste image URL..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                  {isUploading ? "Uploading..." : editingId ? "Update Product" : "Add Product"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 items-center mb-4">
        <Label htmlFor="category-filter">Filter by Category:</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Nutrition">Nutrition</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Apparel & Accessories">Apparel & Accessories</SelectItem>
              </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {products?.length || 0} products
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading products...</p>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{product.title}</h3>
                    {product.is_featured && <Star className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-sm font-medium text-primary">{product.price_range}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No products yet. Add your first product!
          </p>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
