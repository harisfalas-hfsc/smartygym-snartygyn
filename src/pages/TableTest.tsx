import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";

const TableTest = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Table Test - QA Only</title>
      </Helmet>
      
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Table Test Page</h1>
          <p className="text-muted-foreground">QA testing for table rendering consistency</p>
        </div>

        {/* DEFAULT STYLE TABLES */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Default Style Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <h3>2x2 Basic Table</h3>
              <table>
                <thead>
                  <tr>
                    <th>Header 1</th>
                    <th>Header 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cell 1</td>
                    <td>Cell 2</td>
                  </tr>
                </tbody>
              </table>

              <h3>3x3 Table</h3>
              <table>
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Squats</td>
                    <td>3</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Bench Press</td>
                    <td>4</td>
                    <td>10</td>
                  </tr>
                </tbody>
              </table>

              <h3>4x4 Table</h3>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monday</td>
                    <td>Squats</td>
                    <td>3</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Wednesday</td>
                    <td>Bench Press</td>
                    <td>4</td>
                    <td>10</td>
                  </tr>
                  <tr>
                    <td>Friday</td>
                    <td>Deadlifts</td>
                    <td>3</td>
                    <td>8</td>
                  </tr>
                </tbody>
              </table>

              <h3>5x5 Table</h3>
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Day 1</th>
                    <th>Day 2</th>
                    <th>Day 3</th>
                    <th>Day 4</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Week 1</td>
                    <td>Chest</td>
                    <td>Back</td>
                    <td>Legs</td>
                    <td>Arms</td>
                  </tr>
                  <tr>
                    <td>Week 2</td>
                    <td>Shoulders</td>
                    <td>Core</td>
                    <td>Cardio</td>
                    <td>Rest</td>
                  </tr>
                  <tr>
                    <td>Week 3</td>
                    <td>Full Body</td>
                    <td>Upper</td>
                    <td>Lower</td>
                    <td>Active Recovery</td>
                  </tr>
                  <tr>
                    <td>Week 4</td>
                    <td>Deload</td>
                    <td>Deload</td>
                    <td>Deload</td>
                    <td>Rest</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* COMPACT STYLE */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Compact Style Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <table className="table-compact">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Rest</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Push-ups</td>
                    <td>3</td>
                    <td>15</td>
                    <td>60s</td>
                  </tr>
                  <tr>
                    <td>Pull-ups</td>
                    <td>3</td>
                    <td>10</td>
                    <td>90s</td>
                  </tr>
                  <tr>
                    <td>Dips</td>
                    <td>3</td>
                    <td>12</td>
                    <td>60s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* WIDE STYLE */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Wide Style Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <table className="table-wide">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Chest & Triceps</td>
                    <td>Back & Biceps</td>
                    <td>Rest</td>
                    <td>Legs & Shoulders</td>
                    <td>Core & Cardio</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Upper Body</td>
                    <td>Lower Body</td>
                    <td>Rest</td>
                    <td>Full Body</td>
                    <td>Active Recovery</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* STRIPED STYLE */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Striped Style Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <table className="table-striped">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Target Muscle</th>
                    <th>Equipment</th>
                    <th>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Barbell Squat</td>
                    <td>Quadriceps</td>
                    <td>Barbell</td>
                    <td>Intermediate</td>
                  </tr>
                  <tr>
                    <td>Bench Press</td>
                    <td>Chest</td>
                    <td>Barbell</td>
                    <td>Beginner</td>
                  </tr>
                  <tr>
                    <td>Deadlift</td>
                    <td>Back</td>
                    <td>Barbell</td>
                    <td>Advanced</td>
                  </tr>
                  <tr>
                    <td>Pull-ups</td>
                    <td>Lats</td>
                    <td>Pull-up Bar</td>
                    <td>Intermediate</td>
                  </tr>
                  <tr>
                    <td>Overhead Press</td>
                    <td>Shoulders</td>
                    <td>Barbell</td>
                    <td>Intermediate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* COLUMN WIDTH VARIATIONS */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Column Width Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <h3>Custom Column Widths</h3>
              <table>
                <thead>
                  <tr>
                    <th data-colwidth="100">Narrow (100px)</th>
                    <th data-colwidth="200">Medium (200px)</th>
                    <th data-colwidth="300">Wide (300px)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Short</td>
                    <td>Medium length content here</td>
                    <td>This is a much wider column with more detailed content that spans longer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ADVANCED LAYOUTS */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Advanced Layouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <h3>Merged Cells (Colspan)</h3>
              <table>
                <thead>
                  <tr>
                    <th colSpan={3}>Training Program Week 1</th>
                  </tr>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Squats</td>
                    <td>3</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Bench Press</td>
                    <td>4</td>
                    <td>10</td>
                  </tr>
                </tbody>
              </table>

              <h3>Custom Row Heights</h3>
              <table>
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ height: '40px' }}>
                    <td>Small Row (40px)</td>
                    <td>Compact content</td>
                  </tr>
                  <tr style={{ height: '80px' }}>
                    <td>Large Row (80px)</td>
                    <td>More detailed explanation with multiple lines of content that requires extra vertical space</td>
                  </tr>
                  <tr style={{ height: '120px' }}>
                    <td>Extra Large Row (120px)</td>
                    <td>Comprehensive description with even more content that needs significant vertical space to display properly</td>
                  </tr>
                </tbody>
              </table>

              <h3>Custom Borders & Colors</h3>
              <table style={{ borderColor: 'hsl(var(--primary))' }}>
                <thead>
                  <tr>
                    <th style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}>Gold Headers</th>
                    <th style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}>With Gold</th>
                    <th style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}>Borders</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ borderColor: 'hsl(var(--primary))' }}>Cell 1</td>
                    <td style={{ borderColor: 'hsl(var(--primary))' }}>Cell 2</td>
                    <td style={{ borderColor: 'hsl(var(--primary))' }}>Cell 3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* TEXT-DISPLAY WRAPPER TEST */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Text-Display Wrapper Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-display">
              <table>
                <thead>
                  <tr>
                    <th>Testing</th>
                    <th>.text-display</th>
                    <th>Wrapper</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>This table</td>
                    <td>is wrapped in</td>
                    <td>.text-display class</td>
                  </tr>
                  <tr>
                    <td>Should render</td>
                    <td>identically to</td>
                    <td>.prose tables</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* LARGE COMPLEX TABLE */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Large Complex Table (8-Week Program)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Upper Body Strength</td>
                    <td>Lower Body Power</td>
                    <td>Rest</td>
                    <td>Full Body Circuit</td>
                    <td>Core & Cardio</td>
                    <td>Active Recovery</td>
                    <td>Rest</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Chest & Triceps</td>
                    <td>Back & Biceps</td>
                    <td>Legs</td>
                    <td>Shoulders</td>
                    <td>Arms</td>
                    <td>HIIT Cardio</td>
                    <td>Rest</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Push Day</td>
                    <td>Pull Day</td>
                    <td>Leg Day</td>
                    <td>Upper Body</td>
                    <td>Lower Body</td>
                    <td>Core Stability</td>
                    <td>Rest</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>Deload Week</td>
                    <td>Light Upper</td>
                    <td>Light Lower</td>
                    <td>Mobility Work</td>
                    <td>Yoga/Stretch</td>
                    <td>Rest</td>
                    <td>Rest</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
          <p>⚠️ This page is for internal QA testing only</p>
          <p>Compare tables here with the admin rich text editor to ensure WYSIWYG consistency</p>
        </div>
      </div>
    </>
  );
};

export default TableTest;
