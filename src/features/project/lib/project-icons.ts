import {
  Activity,
  Box,
  Code2,
  Cpu,
  Database,
  FolderKanban,
  Globe,
  Layers,
  Rocket,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ProjectIconPreset {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const PROJECT_ICON_PRESETS: ProjectIconPreset[] = [
  { id: 'folder', label: 'Folder', icon: FolderKanban },
  { id: 'shield-check', label: 'Security', icon: ShieldCheck },
  { id: 'zap', label: 'Speed', icon: Zap },
  { id: 'database', label: 'Data', icon: Database },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'globe', label: 'Web', icon: Globe },
  { id: 'terminal', label: 'CLI', icon: Terminal },
  { id: 'rocket', label: 'Launch', icon: Rocket },
  { id: 'layers', label: 'Platform', icon: Layers },
  { id: 'box', label: 'Product', icon: Box },
  { id: 'cpu', label: 'Systems', icon: Cpu },
  { id: 'activity', label: 'Telemetry', icon: Activity },
];

export function getProjectIconComponent(iconName?: string | null): LucideIcon {
  if (!iconName) return FolderKanban;
  const match = PROJECT_ICON_PRESETS.find((p) => p.id === iconName);
  return match?.icon ?? FolderKanban;
}

export function generateProjectKey(title: string): string {
  const words = title.trim().split(/[\s-_]+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }
  return words
    .slice(0, 4)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
