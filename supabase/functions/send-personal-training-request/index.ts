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
  userStatus?: string; // "Guest", "Free User", "Gold Member", "Platinum Member"
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: PersonalTrainingRequest = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">New Personal Training Request</h1>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; font-size: 18px; margin-top: 0;">Client Information</h2>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${requestData.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${requestData.email}</p>
          ${requestData.userStatus ? `<p style="margin: 5px 0;"><strong>User Status:</strong> <span style="color: #d4af37; font-weight: bold;">${requestData.userStatus}</span></p>` : ''}
          <p style="margin: 5px 0;"><strong>Age:</strong> ${requestData.age}</p>
          <p style="margin: 5px 0;"><strong>Weight:</strong> ${requestData.weight} kg</p>
          <p style="margin: 5px 0;"><strong>Height:</strong> ${requestData.height} cm</p>
        </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Training Goals</h2>
        <p style="margin: 5px 0;"><strong>Performance Type:</strong> ${requestData.performanceType === 'human' ? 'Human Performance' : 'Athlete Performance'}</p>
        <p style="margin: 5px 0;"><strong>Specific Goal:</strong> ${requestData.specificGoal}</p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Program Details</h2>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${requestData.duration}</p>
        <p style="margin: 5px 0;"><strong>Training Days per Week:</strong> ${requestData.trainingDays}</p>
        <p style="margin: 5px 0;"><strong>Workout Duration:</strong> ${requestData.workoutDuration} minutes</p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Available Equipment</h2>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${requestData.equipment.map(eq => `<li style="margin: 5px 0;">${eq}</li>`).join('')}
        </ul>
        ${requestData.otherEquipment ? `<p style="margin: 5px 0;"><strong>Other Equipment:</strong> ${requestData.otherEquipment}</p>` : ''}
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; font-size: 18px; margin-top: 0;">Limitations and Safety Considerations</h2>
        <p style="margin: 5px 0;">${requestData.limitations || 'None specified'}</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="text-align: center; color: #666; font-size: 12px;">This request was submitted through the Smarty Gym Personal Training form at smartygym.com</p>
    </div>
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
