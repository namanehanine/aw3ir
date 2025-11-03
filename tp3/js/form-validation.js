window.onload = function () {
  console.log("DOM ready!");

  const form = document.querySelector("#formulaire");
  const modal = new bootstrap.Modal(document.getElementById("myModal"));
  const modalTitle = document.querySelector(".modal-title");
  const modalBody = document.querySelector(".modal-body");

  // Fonction de validation d’email
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Récupération des valeurs
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const adresse = document.getElementById("adresse").value.trim();
    const email = document.getElementById("email").value.trim();
    const birthday = document.getElementById("birthday").value;

    // Début de validation
    let isValid = true;
    let messages = [];

    // Longueur minimale de 5 caractères
    if (nom.length < 5) {
      isValid = false;
      messages.push("Le nom doit contenir au moins 5 caractères.");
    }
    if (prenom.length < 5) {
      isValid = false;
      messages.push("Le prénom doit contenir au moins 5 caractères.");
    }
    if (adresse.length < 5) {
      isValid = false;
      messages.push("L’adresse doit contenir au moins 5 caractères.");
    }

    // Validation du format de l'email
    if (!validateEmail(email)) {
      isValid = false;
      messages.push("L’adresse email est invalide.");
    }

    // Vérification de la date de naissance (pas dans le futur)
    const birthdayDate = new Date(birthday);
    const birthdayTimestamp = birthdayDate.getTime();
    const nowTimestamp = Date.now();

    if (isNaN(birthdayTimestamp)) {
      isValid = false;
      messages.push("Veuillez entrer une date de naissance valide.");
    } else if (birthdayTimestamp > nowTimestamp) {
      isValid = false;
      messages.push("La date de naissance ne peut pas être dans le futur.");
    }

    // Affichage de la modal selon le résultat
    if (!isValid) {
      modalTitle.textContent = "Erreurs dans le formulaire ❌";
      modalBody.innerHTML = `
        <div class="alert alert-danger text-start">
          <ul>${messages.map((m) => `<li>${m}</li>`).join("")}</ul>
        </div>`;
      modal.show();
    } else {
      modalTitle.textContent = "Formulaire validé ✅";

      // Carte Google Maps centrée sur l’adresse
      const encodedAddress = encodeURIComponent(adresse);
      const mapURL = `https://maps.googleapis.com/maps/api/staticmap?markers=${encodedAddress}&zoom=14&size=400x300&scale=2&key=AIzaSyAkmvI9DazzG9p77IShsz_Di7-5Qn7zkcg`;
      const mapLink = `http://maps.google.com/maps?q=${encodedAddress}`;

      modalBody.innerHTML = `
        <p class="mb-3">Merci <strong>${prenom} ${nom}</strong> !</p>
        <a href="${mapLink}" target="_blank">
          <img src="${mapURL}" alt="Carte de ${adresse}" class="img-fluid rounded shadow-sm" />
        </a>`;
      modal.show();
      form.reset();
    }
  });
};
