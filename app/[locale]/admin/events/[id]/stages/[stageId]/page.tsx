'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
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
  Trophy,
  UserCheck,
  UserPlus,
  UserX,
  Heart,
  RefreshCw,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  useStageControllerFindOne,
  useStageControllerGenerateMatches,
  useStageControllerAdvanceWinners,
  useStageControllerFindMatchesByStage,
  getStageControllerFindOneQueryKey,
  getStageControllerFindMatchesByStageQueryKey,
} from '@/lib/services/stages/stages';
import {
  useParticipantControllerFindByStage,
  useParticipantControllerAssignPartner,
  useParticipantControllerRemovePartner,
  getParticipantControllerFindByStageQueryKey,
} from '@/lib/services/participants/participants';
import { useMatchScoreControllerFindAll } from '@/lib/services/match-scores/match-scores';

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
  IN_PROGRESS: { className: 'bg-red-500 text-white', label: 'In Progress' },
  COMPLETED: { className: 'bg-green-500 text-white', label: 'Completed' },
  CANCELLED: { className: 'bg-gray-500 text-white', label: 'Cancelled' },
};

function MatchRow({ match, statusConfig, eventId }: { match: any; statusConfig: Record<string, { className: string; label: string }>; eventId: string }) {
  const [showScore, setShowScore] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [copied, setCopied] = useState(false);

  const refereeUrl = `${process.env.REFEREE_UI_URL || 'https://dev-trongtai.5sport.vn'}/vi/events/${eventId}/matches/${match.id}`;

  useEffect(() => {
    if (showQrDialog) {
      QRCode.toDataURL(refereeUrl, { width: 256, margin: 2 })
        .then(setQrImage)
        .catch(console.error);
    }
  }, [showQrDialog, refereeUrl]);

  const { data: scoresData, isFetching: isFetchingScores, refetch } = useMatchScoreControllerFindAll(
    match.id,
    { query: { enabled: false } },
  );

  const handleShowScore = () => {
    setShowScore(true);
    refetch();
  };

  const handleHideScore = () => {
    setShowScore(false);
  };

  const scores: any[] = Array.isArray(scoresData) ? scoresData : (scoresData as any)?.data ?? [];

  return (
    <>
    <div
      className={`flex items-center justify-between rounded-md border p-3 text-sm ${match.status === 'IN_PROGRESS' ? 'bg-red-50 border-red-300' : match.status === 'COMPLETED' ? 'bg-green-50 border-green-300' : match.status === 'CANCELLED' ? 'bg-gray-100 border-gray-300' : ''}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-6 text-right font-mono">
          #{match.matchNumber || '-'}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate">{match.name}</p>
          {(match.startTime || match.endTime) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {match.startTime && (
                <span>Start: {new Date(match.startTime).toLocaleString()}</span>
              )}
              {match.startTime && match.endTime && <span className="mx-1">·</span>}
              {match.endTime && (
                <span>End: {new Date(match.endTime).toLocaleString()}</span>
              )}
            </p>
          )}
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
          {showScore && (
            <div className="mt-1.5">
              {isFetchingScores ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : scores.length > 0 ? (
                <div className="flex flex-col gap-1 font-mono text-xs">
                  {scores
                    .sort((a: any, b: any) => a.setNumber - b.setNumber)
                    .map((score: any) => (
                      <span
                        key={score.id}
                        className={`px-1.5 py-0.5 rounded ${
                          score.winnerTeam === 1
                            ? 'bg-green-100 text-green-800'
                            : score.winnerTeam === 2
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Set {score.setNumber}: {score.team1Points}-{score.team2Points}
                      </span>
                    ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">No scores yet</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setShowQrDialog(true)}
        >
          <QrCode className="h-3 w-3 mr-1" />
          QR Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={showScore ? handleHideScore : handleShowScore}
          disabled={isFetchingScores}
        >
          {isFetchingScores ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : showScore ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Hide Score
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Show Score
            </>
          )}
        </Button>
        {match.bracketType && (
          <Badge variant="outline" className="text-xs">
            {match.bracketType}
          </Badge>
        )}
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[match.status]?.className || 'bg-gray-100 text-gray-600'}`}
        >
          {statusConfig[match.status]?.label || match.status}
        </span>
      </div>
    </div>

    <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Referee QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-sm text-muted-foreground text-center">
            {match.name}
          </p>
          {qrImage ? (
            <img src={qrImage} alt="Referee QR Code" className="rounded-lg border" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={() => {
                navigator.clipboard.writeText(refereeUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <p className="text-xs text-muted-foreground break-all">{refereeUrl}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function StageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params?.id as string;
  const stageId = params?.stageId as string;

  const [activeTab, setActiveTab] = useState('matches');
  const [assigningParticipant, setAssigningParticipant] = useState<any | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  const { data: stageData, isLoading } = useStageControllerFindOne(eventId, stageId, {
    query: { enabled: !!eventId && !!stageId },
  });
  const stage = stageData as any;

  // Correct: use stageId directly for matches
  const { data: matchesData, refetch: refetchMatches, isFetching: isFetchingMatches } = useStageControllerFindMatchesByStage(eventId, stageId, {
    query: { enabled: !!eventId && !!stageId },
  });

  // Correct: use stageId to get participants assigned to this stage
  const { data: stageParticipantsData, isLoading: participantsLoading } =
    useParticipantControllerFindByStage(eventId, stageId, {
      query: { enabled: !!eventId && !!stageId },
    });

  const generateMatches = useStageControllerGenerateMatches();
  const advanceWinners = useStageControllerAdvanceWinners();
  const assignPartner = useParticipantControllerAssignPartner();
  const removePartner = useParticipantControllerRemovePartner();

  const invalidateParticipants = () => {
    queryClient.invalidateQueries({
      queryKey: getParticipantControllerFindByStageQueryKey(eventId, stageId),
    });
  };

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getStageControllerFindOneQueryKey(eventId, stageId),
    });
    queryClient.invalidateQueries({
      queryKey: getStageControllerFindMatchesByStageQueryKey(eventId, stageId),
    });
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

  const handleAssignPartner = (participant: any) => {
    setAssigningParticipant(participant);
    setSelectedPartnerId('');
  };

  const confirmAssignPartner = async () => {
    if (!assigningParticipant || !selectedPartnerId) return;
    try {
      await assignPartner.mutateAsync({
        eventId,
        id: assigningParticipant.id,
        data: { partnerParticipantId: selectedPartnerId },
      });
      invalidateParticipants();
      toast.success('Partner assigned successfully');
      setAssigningParticipant(null);
      setSelectedPartnerId('');
    } catch { }
  };

  const handleRemovePartner = async (participantId: string) => {
    try {
      await removePartner.mutateAsync({ eventId, id: participantId });
      invalidateParticipants();
      toast.success('Partner removed');
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
  const stageParticipants = (stageParticipantsData as any) || [];
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
          onClick={() => router.push(`/admin/events/${eventId}?tab=sessions`)}
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
            <div className="text-2xl font-bold">{stageParticipants.length}</div>
            <p className="text-xs text-muted-foreground">in this stage</p>
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

      {/* Tabs: Matches / Participants */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="matches" className="flex items-center gap-1.5">
            <Swords className="h-4 w-4" />
            Matches
            {matches.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {matches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" />
            Participants
            {stageParticipants.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {stageParticipants.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { refetchMatches(); setReloadCount(c => c + 1); }}
          disabled={isFetchingMatches}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetchingMatches ? 'animate-spin' : ''}`} />
          Reload
        </Button>
        </div>

        {/* Matches Tab */}
        <TabsContent value="matches" className="mt-4">
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
                          <MatchRow key={`${match.id}-${reloadCount}`} match={match} statusConfig={MATCH_STATUS_CONFIG} eventId={eventId} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="mt-4">
          {participantsLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : stageParticipants.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="font-medium">No participants in this stage</p>
                  <p className="text-sm">Participants assigned to this stage will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Stage Participants
                  <Badge variant="outline" className="text-xs font-normal">
                    {stageParticipants.length} total
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal ml-auto">
                    {stageParticipants.filter((p: any) => p.partnerId).length} paired
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {stageParticipants.map((participant: any, index: number) => {
                    const name =
                      participant.athlete?.name ||
                      participant.team?.name ||
                      participant.name ||
                      `Participant #${index + 1}`;
                    const sub =
                      participant.seedNumber != null
                        ? `Seed #${participant.seedNumber}`
                        : 'No rank';
                    const hasPartner = !!participant.partnerId;
                    const partnerName = participant.partner?.name || participant.partner?.fullName;
                    const isAssigning = assignPartner.isPending;
                    const isRemoving = removePartner.isPending;

                    return (
                      <div
                        key={participant.id}
                        className="rounded-md border p-3 text-sm"
                      >
                        {/* Main row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">{sub}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {participant.seedNumber != null && (
                              <Badge variant="outline" className="text-xs">
                                Seed #{participant.seedNumber}
                              </Badge>
                            )}
                            {participant.status && (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${participant.status === 'CHECKED_IN'
                                  ? 'bg-green-100 text-green-700'
                                  : participant.status === 'REGISTERED'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                                  }`}
                              >
                                {participant.status === 'CHECKED_IN'
                                  ? 'Checked In'
                                  : participant.status === 'REGISTERED'
                                    ? 'Registered'
                                    : participant.status}
                              </span>
                            )}
                            {/* Partner actions */}
                            {hasPartner ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemovePartner(participant.id)}
                                disabled={isRemoving}
                                title="Remove partner"
                              >
                                {isRemoving ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UserX className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleAssignPartner(participant)}
                                title="Assign partner"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Partner info row */}
                        {hasPartner && (
                          <div className="mt-2 ml-10 flex items-center gap-1.5 rounded-md bg-pink-50 border border-pink-100 px-2.5 py-1.5">
                            <Heart className="h-3 w-3 text-pink-500 shrink-0" />
                            <span className="text-xs text-pink-700 font-medium">Partner:</span>
                            <span className="text-xs text-pink-700">{partnerName || participant.partnerId}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Partner Dialog */}
      <Dialog
        open={!!assigningParticipant}
        onOpenChange={(open) => { if (!open) { setAssigningParticipant(null); setSelectedPartnerId(''); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Assign Partner
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 border px-3 py-2 text-sm">
              <span className="text-muted-foreground">Assigning partner for: </span>
              <span className="font-medium">
                {assigningParticipant?.athlete?.name ||
                  assigningParticipant?.team?.name ||
                  assigningParticipant?.name ||
                  'Participant'}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Select Partner <span className="text-destructive">*</span></Label>
              <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a participant..." />
                </SelectTrigger>
                <SelectContent>
                  {stageParticipants
                    .filter((p: any) =>
                      p.id !== assigningParticipant?.id && !p.partnerId
                    )
                    .map((p: any) => {
                      const pName =
                        p.athlete?.name || p.team?.name || p.name || p.id;
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          {pName}
                          {p.seedNumber != null && (
                            <span className="ml-1 text-muted-foreground text-xs">(Seed #{p.seedNumber})</span>
                          )}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {stageParticipants.filter((p: any) => p.id !== assigningParticipant?.id && !p.partnerId).length === 0 && (
                <p className="text-xs text-muted-foreground">No available participants without a partner.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssigningParticipant(null); setSelectedPartnerId(''); }}>
              Cancel
            </Button>
            <Button
              onClick={confirmAssignPartner}
              disabled={!selectedPartnerId || assignPartner.isPending}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {assignPartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Heart className="mr-2 h-4 w-4" />
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
