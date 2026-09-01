export type ParcelStatus =
  | 'REGISTERED'
  | 'ASSIGNED_TO_TRIP'
  | 'LOADED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_STAGE'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED';

export type ParcelCategory = 'DOCUMENT' | 'SMALL_BOX' | 'LARGE_BOX' | 'BAG' | 'FRAGILE';

export interface ChainOfCustodyEvent {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  locationName: string;
  timestamp: string;
  actorName: string;
  actorRole: 'CLERK' | 'CONDUCTOR' | 'SYSTEM_GEOFENCE' | 'RECIPIENT';
  vehicleReg?: string;
  notes?: string;
}

export interface Parcel {
  id: string;
  waybillNumber: string;
  qrCodeData: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  recipientIdNumber?: string;
  originStage: string;
  destinationStage: string;
  category: ParcelCategory;
  description: string;
  declaredValueKsh: number;
  shippingFeeKsh: number;
  status: ParcelStatus;
  assignedVehicleReg?: string;
  assignedTripId?: string;
  createdAt: string;
  events: ChainOfCustodyEvent[];
}