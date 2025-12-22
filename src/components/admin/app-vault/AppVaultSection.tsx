import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Edit2, Save, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VaultField {
  id: string;
  section: string;
  field_key: string;
  field_value: string | null;
  field_type: string;
  notes: string | null;
  display_order: number;
}

interface AppVaultSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: VaultField[];
  onUpdate: () => void;
}

export function AppVaultSection({ title, description, icon, fields, onUpdate }: AppVaultSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatFieldLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCopy = async (value: string, fieldKey: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(fieldKey);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const startEditing = (field: VaultField) => {
    setEditingField(field.field_key);
    setEditValue(field.field_value || "");
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveField = async (field: VaultField) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_vault_data')
        .update({ field_value: editValue })
        .eq('id', field.id);

      if (error) throw error;
      
      toast.success("Field updated");
      setEditingField(null);
      onUpdate();
    } catch (err) {
      console.error("Error saving field:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const isMultiline = (value: string | null) => {
    return value && (value.length > 100 || value.includes('\n'));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data configured yet.</p>
        ) : (
          fields.map((field) => (
            <div key={field.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {formatFieldLabel(field.field_key)}
                  </Label>
                  {field.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{field.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {field.field_type === 'url' && field.field_value && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(field.field_value!, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {field.field_value && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopy(field.field_value!, field.field_key)}
                    >
                      {copiedField === field.field_key ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                  {editingField !== field.field_key && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEditing(field)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {editingField === field.field_key ? (
                <div className="space-y-2">
                  {isMultiline(field.field_value) ? (
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[100px] text-sm"
                    />
                  ) : (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveField(field)}
                      disabled={saving}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded p-2">
                  {field.field_value ? (
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                      {field.field_value}
                    </pre>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Not set</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
