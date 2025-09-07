
import { Client } from './client.inteface';
import { Destination } from './destination.inteface';
import { Facture } from './facture.inteface';


export interface Voyage {
  id?: number;
  prixTotal: number;
  destination_id: number;
  client_id: number;
  dateDepart: string;
  dateRetour: string;
  nombrePlaceReservee: number;
  typeHebergement: string;
  date_reservation: string;
  statut: string;
  created_at?: string;
  updated_at?: string;

  // Relations
  destination?: Destination;
   client?: Client;
  factures?: Facture[];
}
