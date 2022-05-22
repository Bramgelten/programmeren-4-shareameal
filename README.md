# Share-a-meal API

Een API gemaakt voor gebruikers die zich willen registreren en maaltijden wilt maken, verwijderen of op zoeken.
De code is in het Engels geschreven aan de hand van de programmeren 4 lessen en verder uitbereid door Ayrianna Chatlein.

Een API gemaakt voor de mogelijkheid om gebruikers een maaltijden toe te voegen, en de mogelijkheid voor een gebruiker om zich
te registreren voor een maaltijd. 
Deze API is gemaakt aan de hand van de programmeren 4 lessen.

De link naar [de online API](https://brgeltenshareameal.herokuapp.com/)

## Aanleiding voor de API

Voor programmeren 4 is de opdracht gegeven om een API te maken die gebruik maakt van een externe database. De database moet users en maaltijden kunnen aanmaken, wijzigen en verwijderen.

## Routes van de API

Om de Api te kunnen gebruiken zijn er routes gemaakt die een bepaalde request verwachten.
Met de API is het mogelijk om:

- In te loggen
- Gebruikers te beheren
- Maaltijden te beheren

| Request |       Route       |       Functionaliteit        |
| :-----: | :---------------: | :--------------------------: |
|  Post   |  /api/auth/login  |           Inloggen           |
|  Post   |     /api/user     |         Registreren          |
|   Get   |     /api/user     | Lijst van gebruikers ophalen |
|   Get   | /api/user/profile |  Peroonlijk profiel ophalen  |
|   Get   |  /api/user/{id}   |      Gebruiker ophalen       |
|   Put   |  /api/user/{id}   |      Gebruiker bewerken      |
| Delete  |  /api/user/{id}   |    Gebruiker verwijderen     |
|  Post   |     /api/meal     |      Maaltijd toevoegen      |
|   Put   |  /api/meal/{id}   |      Maaltijd bewerken       |
|   Get   |     /api/meal     | Lijst van maaltijden ophalen |
|   Get   |  /api/meal/{id}   |       Maaltijd ophalen       |
| Delete  |  /api/meal/{id}   |     Maaltijd verwijderen     |

De routes zijn gebasseerd op de documentatie van [Swagger](https://shareameal-api.herokuapp.com/docs/). Hierin staan de endpoints beschreven met welke functionaliteit verwacht word, wat er in de body word meegestuurd en het verwachtte resultaat.

Om ervoor te zorgen dat alles werkt naar behoren, zijn er testen gemaakt met mocha om de routes te testen.

## Contact

Voor vragen kan er een email gestuurd worden naar [br.gelten@student.avans.nl](mailto:br.gelten@student.avans.nl)