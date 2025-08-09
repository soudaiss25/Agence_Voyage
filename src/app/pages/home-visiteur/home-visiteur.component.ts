import { Component } from '@angular/core';

@Component({
  selector: 'app-home-visiteur',
  templateUrl: './home-visiteur.component.html',
  styleUrl: './home-visiteur.component.css'
})
export class HomeVisiteurComponent {
  destinations = [
    {
      nom: 'Zanzibar',
      image: 'assets/zanzibar.jpg',
      description: 'Une île paradisiaque entre sable blanc et mer turquoise.'
    },
    {
      nom: 'Moroni',
      image: 'assets/moroni.jpg',
      description: 'Découvrez la culture comorienne et ses paysages volcaniques.'
    },
    {
      nom: 'Madagascar',
      image: 'assets/madagascar.jpg',
      description: 'Une aventure entre faune rare et nature luxuriante.'
    }
  ];

}
