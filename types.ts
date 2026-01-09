
export enum PaymentStatus {
  PAID = 'Pagado',
  PENDING = 'Pendiente',
  OVERDUE = 'Atrasado'
}

export interface Subscription {
  id: string;
  name: string;
  icon: string;
  totalCost: number;
  renewalDate: string;
  status: 'Activo' | 'Pausado' | 'Cancelado';
  memberCount: number;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  email: string;
  lastPayment: string;
  amountDue: number;
  status: PaymentStatus;
  subscriptionId: string;
  subscriptionName: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  type: 'Pago' | 'Cargo';
}
