'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Users,
  Swords,
  CheckCircle2,
  Zap,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useStageControllerFindOne,
  useStageControllerGenerateMatches,
  useStageControllerAdvanceWinners,
  useStageControllerFindAllBySession,
  getStageControllerFindOneQueryKey,
  getStageControllerFindAllBySessionQueryKey,
  getStageControllerFindMatchesByStageQueryKey,
} from '@/lib/services/stages/stages';
import { useParticipantControllerFindAll } from '@/lib/services/participants/participants';

const STAGE_TYPE_LABELS: Record<string, string> = {
  ROUND_ROBIN_PLAYOFF: 'Round Robin + Playoff',
  SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination',
  FLEX: 'Flex (Manual)',
};

const STAGE_TYPE_COLORS: Record<string, string> = {
  ROUND_ROBIN_PLAYOFF: 'bg-blue-100 text-blue-700',
  SINGLE_ELIMINATION: 'bg-orange-100 text-orange-700',
  DOUBLE_ELIMINATION: 'bg-purple-100 text-purple-700',
  FLEX: 'bg-gray-100 text-gray-700',
};

const STAGE_STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  DRAFT: { className: 'bg-gray-100 text-gray-600', label: 'Draft' },
  READY: { className: 'border-blue-300 text-blue-600 bg-blue-50', label: 'Ready' },
  IN_PROGRESS: { className: 'bg-primary text-primary-foreground', label: 'In Progress' },
  COMPLETED: { className: 'bg-green-100 text-green-700', label: 'Completed' },
};

const MATCH_STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  SCHEDULED: { className: 'bg-gray-100 text-gray-600', label: 'Scheduled' },
  IN_PROGRESS: { className: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
  COMPLETED: { className: 'bg-green-100 text-green-700', label: 'Completed' },
  CANCELLED: { className: 'bg-red-100 text-red-700', label: 'Cancelled' },
};

export default function StageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params?.id as string;
  const stageId = params?.stageId as string;

  const { data: stageData, isLoading } = useStageControllerFindOne(eventId, stageId, {
    query: { enabled: !!eventId && !!stageId },
  });
  const stage = stageData as any;

  const { data: participantsData } = useParticipantControllerFindAll(eventId, {
    query: { enabled: !!eventId },
  });
  const allParticipants = (participantsData as any) || [];

  const { data: matchesData } = useStageControllerFindAllBySession(eventId, stageId, {
    query: { enabled: !!eventId && !!stageId },
  });

  const generateMatches = useStageControllerGenerateMatches();
  const advanceWinners = useStageControllerAdvanceWinners();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getStageControllerFindOneQueryKey(eventId, stageId),
    });
    queryClient.invalidateQueries({
      queryKey: getStageControllerFindMatchesByStageQueryKey(eventId, stageId),
    });
    if (stage?.sessionId) {
      queryClient.invalidateQueries({
        queryKey: getStageControllerFindAllBySessionQueryKey(eventId, stage.sessionId),
      });
    }
  };

  const handleGenerateMatches = async () => {
    try {
      await generateMatches.mutateAsync({ eventId, stageId });
      invalidate();
      toast.success('Matches generated successfully');
    } catch { }
  };

  const handleAdvanceWinners = async () => {
    try {
      await advanceWinners.mutateAsync({ eventId, stageId });
      invalidate();
      toast.success('Winners advanced');
    } catch { }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-lg font-semibold text-foreground">Stage not found</p>
        <Button variant="outline" onClick={() => router.push(`/admin/events/${eventId}`)}>
          Back to Event
        </Button>
      </div>
    );
  }

  const matches = (matchesData as any) || [];
  console.log('Stage Data:', matchesData);
  const sessionParticipants = allParticipants.filter(
    (p: any) => p.sessionId === stage.sessionId,
  );
  const completedMatches = matches.filter((m: any) => m.status === 'COMPLETED');

  // Group matches by round
  const matchesByRound = new Map<string, any[]>();
  for (const match of matches) {
    const round = match.round || match.groupName || 'Unassigned';
    if (!matchesByRound.has(round)) matchesByRound.set(round, []);
    matchesByRound.get(round)!.push(match);
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-muted-foreground"
          onClick={() => router.push(`/admin/events/${eventId}`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Event
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{stage.name}</h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_TYPE_COLORS[stage.stageType] || 'bg-gray-100'}`}
          >
            {STAGE_TYPE_LABELS[stage.stageType] || stage.stageType}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STATUS_CONFIG[stage.status]?.className || ''}`}
          >
            {STAGE_STATUS_CONFIG[stage.status]?.label || stage.status}
          </span>
        </div>
        {stage.session && (
          <p className="text-sm text-muted-foreground mt-1">
            Session: {stage.session.name}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionParticipants.length}</div>
            <p className="text-xs text-muted-foreground">in this session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matches
            </CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
            <p className="text-xs text-muted-foreground">total matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedMatches.length}
              <span className="text-sm font-normal text-muted-foreground">
                /{matches.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">matches done</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {stage.status === 'DRAFT' && (
          <Button
            onClick={handleGenerateMatches}
            disabled={generateMatches.isPending}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {generateMatches.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Generate Matches
          </Button>
        )}
        {stage.status === 'IN_PROGRESS' && (
          <Button
            onClick={handleAdvanceWinners}
            disabled={advanceWinners.isPending}
          >
            {advanceWinners.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Advance Winners
          </Button>
        )}
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Swords className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="font-medium">No matches yet</p>
              <p className="text-sm">
                {stage.status === 'DRAFT'
                  ? 'Generate matches to get started'
                  : 'Matches will appear here'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[...matchesByRound.entries()].map(([round, roundMatches]) => (
            <Card key={round}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {round}
                  <Badge variant="outline" className="text-xs font-normal">
                    {roundMatches.length} matches
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {roundMatches
                    .sort((a: any, b: any) => (a.matchNumber || 0) - (b.matchNumber || 0))
                    .map((match: any) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between rounded-md border p-3 text-sm"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground w-6 text-right font-mono">
                            #{match.matchNumber || '-'}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{match.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {match.isBye ? (
                                <span className="italic">BYE</span>
                              ) : (
                                <>
                                  <span className={match.winnerTeam === 1 ? 'font-semibold text-foreground' : ''}>
                                    {match.team1Name ||
                                      [match.team1Player1?.name, match.team1Player2?.name].filter(Boolean).join(' / ') ||
                                      'TBD'}
                                  </span>
                                  <span>vs</span>
                                  <span className={match.winnerTeam === 2 ? 'font-semibold text-foreground' : ''}>
                                    {match.team2Name ||
                                      [match.team2Player1?.name, match.team2Player2?.name].filter(Boolean).join(' / ') ||
                                      'TBD'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {match.team1Score && match.team2Score && (
                            <span className="font-mono text-sm">
                              {match.team1Score.total ?? '-'} : {match.team2Score.total ?? '-'}
                            </span>
                          )}
                          {match.bracketType && (
                            <Badge variant="outline" className="text-xs">
                              {match.bracketType}
                            </Badge>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MATCH_STATUS_CONFIG[match.status]?.className || 'bg-gray-100 text-gray-600'}`}
                          >
                            {MATCH_STATUS_CONFIG[match.status]?.label || match.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
