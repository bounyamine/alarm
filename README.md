# ⏰ Alarm App

Une application web d'alarme simple et efficace, développée avec React.js. Cette application vous permet de configurer des alarmes et de recevoir des notifications lorsque l'heure est atteinte, avec une interface moderne et intuitive.

## 🎨 Aperçu

L'application **Alarm App** affiche une interface utilisateur simple où les utilisateurs peuvent définir des heures d'alarme, visualiser les alarmes actives, et recevoir des notifications au moment de l'alarme.

![Alarm App Screenshot](https://github.com/bounyamine/alarm/blob/master/public/screenshots/screen.png)

## 🚀 Fonctionnalités

- **Définir des alarmes** : Permet de configurer plusieurs alarmes avec des horaires spécifiques.
- **Notifications** : L'utilisateur reçoit une notification au moment où l'alarme est déclenchée.
- **Actions sur notifications** : Options pour "Snooze" ou arrêter l'alarme directement depuis la notification (si supporté par le navigateur).
- **Affichage en temps réel** : Montre l'heure actuelle et le compte à rebours jusqu'à la prochaine alarme.
- **Interface réactive** : Adaptée aux écrans de bureau et mobiles.

## 🛠️ Technologies

- **React.js** : Pour la gestion de l'interface utilisateur et des états.
- **Service Workers** : Pour la gestion des notifications persistantes.
- **CSS3** : Pour la mise en page et le style de l'interface.
- **Notification API** : Pour l'envoi de notifications natives au navigateur.

## 📦 Installation

1. **Cloner le projet :**

   ```bash
   git clone https://github.com/yourusername/alarm-app.git
   cd alarm-app
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   ```

3. **Démarrer l'application :**

   ```bash
   npm start
   ```

4. **Accéder à l'application :**
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Utilisation

- Ouvrez l'application et définissez une nouvelle alarme en sélectionnant l'heure souhaitée.
- À l'heure programmée, une notification apparaîtra. Selon votre configuration, vous pouvez snoozer ou arrêter l'alarme directement depuis la notification.
- Vous pouvez voir et supprimer les alarmes actives via l'interface.

## 🗂 Structure du projet

```
/public
  index.html              # Page HTML principale
  service-worker.js        # Gestion des notifications via Service Worker
/src
  App.js                  # Composant principal de l'application
  App.css                 # Style de l'application
  Alarm.js                # Composant pour gérer l'ajout et l'affichage des alarmes
  index.js                # Point d'entrée de React
  index.css               # Style global de l'application
```

## 🎥 Démo

Découvrez une démo en direct de l'application [ici](https://your-demo-url.com) !

## 🤝 Contributions

Les contributions sont les bienvenues ! Si vous souhaitez améliorer cette application ou ajouter de nouvelles fonctionnalités, suivez ces étapes :

1. Fork le projet.
2. Créez une nouvelle branche (`git checkout -b feature/new-feature`).
3. Committez vos changements (`git commit -am 'Ajout d'une nouvelle fonctionnalité'`).
4. Poussez sur la branche (`git push origin feature/new-feature`).
5. Créez une Pull Request.

## 📄 Licence

Ce projet est sous licence **MIT**. Consultez le fichier [LICENSE](./LICENSE) pour plus d'informations.
