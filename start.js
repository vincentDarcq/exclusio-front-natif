const { exec } = require('child_process');

console.log('Démarrage du serveur...');
exec('npx serve -s .', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erreur d'exécution : ${error}`);
    return;
  }
  if (stderr) {
    console.error(`Erreur stderr : ${stderr}`);
    return;
  }
  console.log(`Sortie stdout : ${stdout}`);
});
