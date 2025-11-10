function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.querySelector("#map").innerHTML =
      "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const zoom = 5;
  const delta = 0.05 / Math.pow(2, zoom - 10);

  const bboxEdges = {
    south: position.coords.latitude - delta,
    north: position.coords.latitude + delta,
    west: position.coords.longitude - delta,
    east: position.coords.longitude + delta,
  };

  const bbox = `${bboxEdges.west}%2C${bboxEdges.south}%2C${bboxEdges.east}%2C${bboxEdges.north}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${position.coords.latitude}%2C${position.coords.longitude}`;

  document.getElementById("map").innerHTML = `
    <iframe
      width="100%"
      height="200"
      frameborder="0"
      scrolling="no"
      src="${iframeSrc}">
    </iframe>
  `;

  // 🧭 Étape supplémentaire : géocodage inverse
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Utilisation de l'API publique Nominatim pour obtenir l’adresse
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.display_name) {
        // Remplir le champ adresse avec l’adresse trouvée
        document.querySelector("#adresse").value = data.display_name;

        // ✅ Mettre à jour le compteur de caractères à côté du champ
        calcNbChar("adresse");
      }
    })
    .catch((error) => {
      console.error("Erreur géocodage inverse :", error);
    });
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      document.querySelector("#map").innerHTML = "Permission refusée.";
      break;
    case error.POSITION_UNAVAILABLE:
      document.querySelector("#map").innerHTML = "Position non disponible.";
      break;
    case error.TIMEOUT:
      document.querySelector("#map").innerHTML = "Délai dépassé.";
      break;
    default:
      document.querySelector("#map").innerHTML = "Erreur inconnue.";
  }
}
