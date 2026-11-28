import { IonBadge } from '@ionic/react';

import { STATUS_LABELS, type OrderStatus } from '../services/types';

const COLORS: Record<OrderStatus, 'success' | 'warning' | 'primary' | 'medium' | 'danger'> = {
  pending: 'warning',
  confirmed: 'primary',
  processing: 'primary',
  ready_for_pickup: 'success',
  completed: 'success',
  cancelled: 'danger',
};

export default function StatusBadge({ status }: { status: OrderStatus }): React.JSX.Element {
  return <IonBadge color={COLORS[status] ?? 'medium'}>{STATUS_LABELS[status] ?? status}</IonBadge>;
}
