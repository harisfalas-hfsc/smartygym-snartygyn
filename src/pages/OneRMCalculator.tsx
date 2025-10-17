import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const OneRMCalculator = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateOneRM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      return;
    }
    
    // Using Brzycki formula: 1RM = weight × (36 / (37 - reps))
    const oneRM = w * (36 / (37 - r));
    setResult(Math.round(oneRM * 10) / 10);
  };

  const getPercentages = () => {
    if (!result) return [];
    return [
      { percent: 95, weight: Math.round(result * 0.95 * 10) / 10 },
      { percent: 90, weight: Math.round(result * 0.90 * 10) / 10 },
      { percent: 85, weight: Math.round(result * 0.85 * 10) / 10 },
      { percent: 80, weight: Math.round(result * 0.80 * 10) / 10 },
      { percent: 75, weight: Math.round(result * 0.75 * 10) / 10 },
      { percent: 70, weight: Math.round(result * 0.70 * 10) / 10 },
      { percent: 65, weight: Math.round(result * 0.65 * 10) / 10 },
      { percent: 60, weight: Math.round(result * 0.60 * 10) / 10 },
    ];
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-4xl font-bold text-center mb-8">1RM Calculator</h1>
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight Lifted (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  step="0.5"
                />
              </div>
              
              <div>
                <Label htmlFor="reps">Number of Repetitions</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Enter reps (1-12)"
                  max="12"
                  min="1"
                />
              </div>

              <Button onClick={calculateOneRM} className="w-full">
                Calculate 1RM
              </Button>
            </div>

            {result && (
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <h2 className="text-lg font-semibold mb-2">Your Estimated 1RM</h2>
                  <p className="text-4xl font-bold text-primary">{result} kg</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Training Percentages</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {getPercentages().map((item) => (
                      <div key={item.percent} className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">{item.percent}%</p>
                        <p className="text-lg font-semibold">{item.weight} kg</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This is an estimate using the Brzycki formula. 
                    Actual 1RM may vary. Always use proper form and have a spotter when testing maximum lifts.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OneRMCalculator;
