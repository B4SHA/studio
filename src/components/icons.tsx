import {
  CheckCircle2,
  XCircle,
  Newspaper,
  Video,
  AudioWaveform,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  BarChart,
  Check,
} from 'lucide-react';

export const Icons = {
  checkCircle: CheckCircle2,
  xCircle: XCircle,
  news: Newspaper,
  video: Video,
  audio: AudioWaveform,
  shield: ShieldCheck,
  spinner: (props: { className?: string }) => <Loader2 className={cn('animate-spin', props.className)} />,
  alert: AlertTriangle,
  barChart: BarChart,
  check: Check,
};

function cn(...inputs: any[]) {
    // A simplified cn for internal use, as full cn is not needed here.
    return inputs.filter(Boolean).join(' ');
}
