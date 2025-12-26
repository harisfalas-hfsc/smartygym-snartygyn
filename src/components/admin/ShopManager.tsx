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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Upload, X, ShoppingCart, ExternalLink, Tag, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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

interface TaggingResult {
  dryRun: boolean;
  totalProducts: number;
  tagged: number;
  skippedHFSC: number;
  alreadyTagged: number;
  errors?: string[];
  taggedProducts?: { id: string; name: string }[];
  skippedHFSCProducts?: { id: string; name: string }[];
}

export const ShopManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [taggingPreview, setTaggingPreview] = useState<TaggingResult | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Fitness",
    product_type: "amazon_affiliate" as "amazon_affiliate" | "direct_sale",
    amazon_url: "",
    image_url: "",
    price_range: "",
    price: "",
    stock_quantity: "",
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
    mutationFn: async (data: any) => {
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
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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

  const uploadImage = async (file: File, productId?: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `shop-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('contact-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contact-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createStripeProduct = async (productData: typeof formData) => {
    const { data, error } = await supabase.functions.invoke('create-stripe-product', {
      body: {
        name: productData.title,
        price: parseFloat(productData.price),
        contentType: 'shop_product',
        imageUrl: productData.image_url || undefined,
      }
    });

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      
      let imageUrl = formData.image_url;
      let stripeProductId = null;
      let stripePriceId = null;
      
      // Upload image if a file is selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, editingId || undefined);
      }

      // Create Stripe product for direct sale items
      if (formData.product_type === 'direct_sale' && !editingId) {
        if (!formData.price) {
          toast.error("Price is required for direct sale products");
          setIsUploading(false);
          return;
        }
        
        const stripeData = await createStripeProduct({ ...formData, image_url: imageUrl });
        stripeProductId = stripeData.product_id;
        stripePriceId = stripeData.price_id;
        toast.success("Stripe product created successfully!");
      }

      const submitData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        product_type: formData.product_type,
        image_url: imageUrl,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
      };

      // Add type-specific fields
      if (formData.product_type === 'amazon_affiliate') {
        submitData.amazon_url = formData.amazon_url;
        submitData.price_range = formData.price_range;
      } else {
        submitData.price = parseFloat(formData.price);
        submitData.stock_quantity = formData.stock_quantity ? parseInt(formData.stock_quantity) : null;
        if (stripeProductId) submitData.stripe_product_id = stripeProductId;
        if (stripePriceId) submitData.stripe_price_id = stripePriceId;
      }

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Fitness",
      product_type: "amazon_affiliate",
      amazon_url: "",
      image_url: "",
      price_range: "",
      price: "",
      stock_quantity: "",
      is_featured: false,
      display_order: 0,
    });
    setIsCreating(false);
    setEditingId(null);
    setSelectedFile(null);
  };

  const handleEdit = (product: any) => {
    setFormData({
      title: product.title,
      description: product.description,
      category: product.category,
      product_type: product.product_type || "amazon_affiliate",
      amazon_url: product.amazon_url || "",
      image_url: product.image_url,
      price_range: product.price_range || "",
      price: product.price?.toString() || "",
      stock_quantity: product.stock_quantity?.toString() || "",
      is_featured: product.is_featured,
      display_order: product.display_order,
    });
    setEditingId(product.id);
    setIsCreating(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setFormData({ ...formData, image_url: "" });
    }
  };

  const handleTagProducts = async (dryRun: boolean) => {
    setIsTagging(true);
    try {
      const { data, error } = await supabase.functions.invoke('tag-smartygym-products', {
        body: { dryRun }
      });

      if (error) throw error;

      if (dryRun) {
        setTaggingPreview(data);
        toast.success("Preview loaded! Review the changes below.");
      } else {
        setTaggingPreview(null);
        toast.success(`Tagged ${data.tagged} products with SMARTYGYM. Skipped ${data.skippedHFSC} HFSC products.`);
      }
    } catch (error: any) {
      toast.error("Failed to tag products: " + error.message);
    } finally {
      setIsTagging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stripe Product Tagging Section */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Tag SmartyGym Products in Stripe
          </CardTitle>
          <CardDescription>
            Tag all Stripe products with "SMARTYGYM" metadata (skips HFSC products)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleTagProducts(true)}
              disabled={isTagging}
            >
              {isTagging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tag className="mr-2 h-4 w-4" />}
              Preview Changes
            </Button>
            <Button 
              onClick={() => handleTagProducts(false)}
              disabled={isTagging || !taggingPreview}
              variant="default"
            >
              {isTagging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Tag All Products
            </Button>
            {taggingPreview && (
              <Button 
                variant="ghost" 
                onClick={() => setTaggingPreview(null)}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Preview
              </Button>
            )}
          </div>

          {taggingPreview && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Products:</span>
                  <span>{taggingPreview.totalProducts}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Will Tag: {taggingPreview.tagged}</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Skip (HFSC): {taggingPreview.skippedHFSC}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Already Tagged: {taggingPreview.alreadyTagged}</span>
                </div>
              </div>

              {taggingPreview.taggedProducts && taggingPreview.taggedProducts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Products to be tagged:</p>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-0.5">
                    {taggingPreview.taggedProducts.map((p) => (
                      <div key={p.id} className="text-muted-foreground">{p.name}</div>
                    ))}
                    {taggingPreview.tagged > 20 && (
                      <div className="text-muted-foreground italic">...and {taggingPreview.tagged - 20} more</div>
                    )}
                  </div>
                </div>
              )}

              {taggingPreview.skippedHFSCProducts && taggingPreview.skippedHFSCProducts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-600">HFSC products (will skip):</p>
                  <div className="max-h-24 overflow-y-auto text-xs space-y-0.5">
                    {taggingPreview.skippedHFSCProducts.map((p) => (
                      <div key={p.id} className="text-muted-foreground">{p.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Shop Management</h2>
          <p className="text-muted-foreground">Manage Amazon affiliate products and direct sale items</p>
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
              Choose between Amazon affiliate or direct sale product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Type Selector */}
              <div className="space-y-3">
                <Label>Product Type</Label>
                <RadioGroup
                  value={formData.product_type}
                  onValueChange={(value: "amazon_affiliate" | "direct_sale") =>
                    setFormData({ ...formData, product_type: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amazon_affiliate" id="amazon" />
                    <Label htmlFor="amazon" className="font-normal cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Amazon Affiliate Product
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct_sale" id="direct" />
                    <Label htmlFor="direct" className="font-normal cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Direct Sale Product (via Stripe)
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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

              {/* Conditional Fields Based on Product Type */}
              {formData.product_type === 'amazon_affiliate' ? (
                <>
                  <div>
                    <Label htmlFor="price_range">Price Range</Label>
                    <Input
                      id="price_range"
                      placeholder="e.g., €20-€30"
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
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 25.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity (optional)</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      placeholder="Leave empty for unlimited"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    />
                  </div>
                </>
              )}

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
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload image (max 10MB) or provide URL below
                    </p>
                  </div>
                </div>

                {/* Manual URL Input */}
                {!selectedFile && (
                  <div>
                    <Label htmlFor="image_url">Or Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isUploading || createMutation.isPending || updateMutation.isPending}
                >
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

      {/* Category Filter */}
      <div className="flex gap-2">
        <Button
          variant={categoryFilter === "all" ? "default" : "outline"}
          onClick={() => setCategoryFilter("all")}
          size="sm"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={categoryFilter === category ? "default" : "outline"}
            onClick={() => setCategoryFilter(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products List */}
      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading products...</p>
        ) : products && products.length > 0 ? (
          products.map((product: any) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.title}</h3>
                        {product.is_featured && (
                          <Star className="h-4 w-4 fill-primary text-primary" />
                        )}
                        {product.product_type === 'direct_sale' && (
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="text-sm mt-1">{product.description}</p>
                      
                      {product.product_type === 'amazon_affiliate' ? (
                        <p className="text-sm font-semibold mt-1">{product.price_range}</p>
                      ) : (
                        <div className="text-sm font-semibold mt-1 space-y-1">
                          <p>€{product.price?.toFixed(2)}</p>
                          {product.stock_quantity !== null && (
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.stock_quantity}
                            </p>
                          )}
                          {product.stripe_product_id && (
                            <p className="text-xs text-muted-foreground font-mono">
                              Stripe: {product.stripe_product_id}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No products found. Add your first product!
          </p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};