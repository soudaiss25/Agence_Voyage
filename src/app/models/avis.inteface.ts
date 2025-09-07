import { Client } from "./client.inteface";
import { Destination } from "./destination.inteface";


export interface Avis {
  id?: number;
  client_id: number;
  destination_id: number;
  note: number;
  commentaire: string;
  created_at?: string;
  updated_at?: string;

  // Relations
  client?: Client;
  destination?: Destination;
}
