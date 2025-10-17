import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const BMRCalculator = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    if (isNaN(w) || isNaN(h) || isNaN(a) || !gender) {
      return;
    }
    
    // Using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === "male") {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
    
    setResult(Math.round(bmr));
  };

  const getActivityLevels = () => {
    if (!result) return [];
    return [
      { level: "Sedentary (little or no exercise)", calories: Math.round(result * 1.2) },
      { level: "Lightly active (1-3 days/week)", calories: Math.round(result * 1.375) },
      { level: "Moderately active (3-5 days/week)", calories: Math.round(result * 1.55) },
      { level: "Very active (6-7 days/week)", calories: Math.round(result * 1.725) },
      { level: "Extra active (2x per day)", calories: Math.round(result * 1.9) },
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
        
        <h1 className="text-4xl font-bold text-center mb-8">BMR Calculator</h1>
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter your height"
                />
              </div>

              <Button onClick={calculateBMR} className="w-full">
                Calculate BMR
              </Button>
            </div>

            {result && (
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <h2 className="text-lg font-semibold mb-2">Your Basal Metabolic Rate</h2>
                  <p className="text-4xl font-bold text-primary">{result} cal/day</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Calories burned at complete rest
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Daily Calorie Needs by Activity Level</h3>
                  <div className="space-y-3">
                    {getActivityLevels().map((item, index) => (
                      <div key={index} className="bg-muted p-4 rounded-lg flex justify-between items-center">
                        <p className="text-sm">{item.level}</p>
                        <p className="text-lg font-semibold">{item.calories} cal</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>What is BMR?</strong> Your Basal Metabolic Rate is the number of calories 
                    your body needs to maintain basic physiological functions at rest. The activity level 
                    multipliers show your Total Daily Energy Expenditure (TDEE).
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

export default BMRCalculator;
