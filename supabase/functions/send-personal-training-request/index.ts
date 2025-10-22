import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PersonalTrainingRequest {
  email: string;
  name: string;
  age: string;
  weight: string;
  height: string;
  performanceType: string;
  specificGoal: string;
  duration: string;
  trainingDays: string;
  workoutDuration: string;
  equipment: string[];
  otherEquipment: string;
  limitations: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: PersonalTrainingRequest = await req.json();

    const emailHtml = `
      <h1>New Personal Training Request</h1>
      <h2>Client Information</h2>
      <p><strong>Name:</strong> ${requestData.name}</p>
      <p><strong>Email:</strong> ${requestData.email}</p>
      <p><strong>Age:</strong> ${requestData.age}</p>
      <p><strong>Weight:</strong> ${requestData.weight} kg</p>
      <p><strong>Height:</strong> ${requestData.height} cm</p>
      
      <h2>Training Goals</h2>
      <p><strong>Performance Type:</strong> ${requestData.performanceType === 'human' ? 'Human Performance' : 'Athlete Performance'}</p>
      <p><strong>Specific Goal:</strong> ${requestData.specificGoal}</p>
      
      <h2>Program Details</h2>
      <p><strong>Duration:</strong> ${requestData.duration}</p>
      <p><strong>Training Days per Week:</strong> ${requestData.trainingDays}</p>
      <p><strong>Workout Duration:</strong> ${requestData.workoutDuration} minutes</p>
      
      <h2>Available Equipment</h2>
      <ul>
        ${requestData.equipment.map(eq => `<li>${eq}</li>`).join('')}
      </ul>
      ${requestData.otherEquipment ? `<p><strong>Other Equipment:</strong> ${requestData.otherEquipment}</p>` : ''}
      
      <h2>Limitations and Safety Considerations</h2>
      <p>${requestData.limitations || 'None specified'}</p>
      
      <hr />
      <p><small>This request was submitted through the Smarty Gym Personal Training form.</small></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Smarty Gym <onboarding@resend.dev>",
      to: ["haris@smartygym.com"],
      subject: `New Personal Training Request - ${requestData.name}`,
      html: emailHtml,
      replyTo: requestData.email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-personal-training-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
