import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProgramLeaderboardTemplate = () => {
  const topMembers = [
    { rank: 1, name: "Elite", programs: 12, icon: Trophy },
    { rank: 2, name: "Advanced", programs: 10, icon: Medal },
    { rank: 3, name: "Dedicated", programs: 8, icon: Award },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-primary mb-4">Program Leaderboard</h1>
        <p className="text-2xl text-muted-foreground">Most dedicated members</p>
      </div>

      <div className="flex-1 space-y-6">
        {topMembers.map((member) => {
          const Icon = member.icon;
          return (
            <Card key={member.rank} className="border-primary border-2">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="text-6xl font-bold text-primary w-20">
                  #{member.rank}
                </div>
                <div className="p-5 rounded-full bg-primary/10">
                  <Icon className="w-14 h-14 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">{member.name}</h3>
                  <p className="text-2xl text-muted-foreground">
                    {member.programs} programs completed
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <p className="text-xl font-semibold text-primary">smartygym.com</p>
      </div>
    </div>
  );
};
