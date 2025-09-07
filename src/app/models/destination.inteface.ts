// src/app/models/destination.model.ts

export interface Destination {
  id?: number;
  nom: string;
  pays?: string;
  description?: string;
  climat?: string;
  langueLocale?: string;
  activites?: string[];
  meilleurePeriode?: string;
   photo?: string; 
   prix?:number;
   type_voyage_id?: number;  // ✅ ajout
  typeVoyage?: {           // si tu veux afficher le libellé directement
    id: number;
    libelle: string;
  };
  created_at?: Date;
  updated_at?: Date;
}