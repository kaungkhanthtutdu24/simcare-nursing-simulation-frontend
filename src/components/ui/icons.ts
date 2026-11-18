import {
  ClipboardCheck,
  FilePen,
  FolderOpen,
  HeartPulse,
  IdCard,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  NotebookPen,
  Pill,
  ScrollText,
  Send,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '../../model'

/** Icon for each navigation destination. Always shown next to a text label. */
export const navIcons: Record<View | 'dashboard' | 'profile', LucideIcon> = {
  dashboard: LayoutDashboard,
  profile: UserRound,
  cases: FolderOpen,
  overview: Stethoscope,
  background: Stethoscope,
  demographics: IdCard,
  history: ScrollText,
  medications: Pill,
  'clinical-notes': NotebookPen,
  consultation: NotebookPen,
  inbox: Inbox,
  referrals: Send,
  vitals: HeartPulse,
  feedback: MessageSquareText,
  'case-editor': FilePen,
  release: Megaphone,
  review: ClipboardCheck,
}
