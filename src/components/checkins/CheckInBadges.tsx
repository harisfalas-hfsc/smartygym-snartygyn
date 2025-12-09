import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Badge, CheckinStats } from '@/hooks/useCheckins';
import { 
  Trophy, 
  Flame, 
  Droplets, 
  Footprints, 
  Drumstick,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

interface CheckInBadgesProps {
  badges: Badge[];
  stats: CheckinStats | null;
}

const badgeConfig: Record<string, { 
  icon: React.ElementType; 
  name: string; 
  color: string;
  description: Record<string, string>;
}> = {
  consistency_champion: {
    icon: Flame,
    name: 'Consistency Champion',
    color: 'text-orange-500',
    description: {
      bronze: '7 consecutive complete days',
      silver: '30 consecutive complete days',
      gold: '90 consecutive complete days'
    }
  },
  hydration_hero: {
    icon: Droplets,
    name: 'Hydration Hero',
    color: 'text-blue-500',
    description: {
      bronze: '5/7 days with hydration score ≥8',
      silver: '20/30 days with hydration score ≥8'
    }
  },
  step_machine: {
    icon: Footprints,
    name: 'Step Machine',
    color: 'text-green-500',
    description: {
      bronze: '10/14 days with movement score ≥8',
      silver: '22/30 days with movement score ≥8'
    }
  },
  protein_pro: {
    icon: Drumstick,
    name: 'Protein Pro',
    color: 'text-purple-500',
    description: {
      bronze: '10/14 days hitting protein target',
      silver: '22/30 days hitting protein target'
    }
  },
  recovery_master: {
    icon: Heart,
    name: 'Recovery Master',
    color: 'text-red-500',
    description: {
      special: '5/7 days with optimal recovery'
    }
  },
  comeback_award: {
    icon: TrendingUp,
    name: 'Comeback Award',
    color: 'text-primary',
    description: {
      special: '15+ point improvement week-over-week'
    }
  }
};

const levelColors: Record<string, string> = {
  bronze: 'bg-amber-700 text-amber-100',
  silver: 'bg-slate-400 text-slate-900',
  gold: 'bg-yellow-500 text-yellow-900',
  special: 'bg-primary text-primary-foreground'
};

export function CheckInBadges({ badges, stats }: CheckInBadgesProps) {
  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-primary" />
            Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold text-primary">
                {stats?.currentStreak || 0}
              </p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold">
                {stats?.bestStreak || 0}
              </p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Badges Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No badges earned yet.</p>
              <p className="text-sm mt-1">Keep completing check-ins to earn badges!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {badges.map((badge) => {
                const config = badgeConfig[badge.badge_type];
                if (!config) return null;
                
                const Icon = config.icon;
                
                return (
                  <div 
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`p-2 rounded-full bg-background ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.name}</span>
                        <BadgeComponent className={levelColors[badge.badge_level]}>
                          {badge.badge_level.charAt(0).toUpperCase() + badge.badge_level.slice(1)}
                        </BadgeComponent>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.description[badge.badge_level]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {format(new Date(badge.earned_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Possible Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Badges to Earn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(badgeConfig).map(([type, config]) => {
              const earnedLevels = badges
                .filter(b => b.badge_type === type)
                .map(b => b.badge_level);
              
              const Icon = config.icon;
              const nextLevel = ['bronze', 'silver', 'gold'].find(l => !earnedLevels.includes(l));
              
              if (!nextLevel && type !== 'recovery_master' && type !== 'comeback_award') return null;
              if ((type === 'recovery_master' || type === 'comeback_award') && earnedLevels.includes('special')) return null;

              return (
                <div 
                  key={type}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/30 text-center opacity-60"
                >
                  <Icon className={`h-8 w-8 mb-2 ${config.color}`} />
                  <span className="text-xs font-medium">{config.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {nextLevel || 'special'}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}