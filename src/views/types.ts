import type { CandidateWork, PatientCase, ScenarioEvent, View } from '../model'

/** Props shared by every candidate-facing screen. */
export interface CandidateViewProps {
  patient: PatientCase
  work: CandidateWork
  onUpdate: (patch: Partial<CandidateWork>) => void
  onNotice: (message: string) => void
}

export interface CandidateFlowProps extends CandidateViewProps {
  event: ScenarioEvent
  onNavigate: (view: View) => void
}

/** Replace the item with a matching id, merging in the patch. */
export function updateById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id)
}
