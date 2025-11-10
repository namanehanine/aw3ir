// ✅ Compteur de caractères
function calcNbChar(id) {
  const countElement = document
    .querySelector(`#${id}`)
    .parentElement.parentElement.querySelector("[data-count]");
  countElement.textContent =
    document.querySelector(`#${id}`).value.length + " car.";
}

// ✅ Affichage de la liste des contacts
function displayContactList() {
  const contactListString = localStorage.getItem("contactList");
  const contactList = contactListString ? JSON.parse(contactListString) : [];
  document.querySelector("table tbody").innerHTML = "";

  for (const contact of contactList) {
    document.querySelector("table tbody").innerHTML += `
      <tr>
        <td>${contact.name}</td>
        <td>${contact.firstname}</td>
        <td>${contact.date}</td>
        <td>${contact.adress}</td>
        <td><a href="mailto:${contact.mail}">${contact.mail}</a></td>
      </tr>
    `;
  }
}

// ✅ Au chargement de la page
window.onload = function () {
  console.log("DOM ready!");
  displayContactList();

  // soumission du formulaire
  document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();

    contactStore.add(
      document.querySelector("#name").value,
      document.querySelector("#firstname").value,
      document.querySelector("#birth").value,
      document.querySelector("#adresse").value,
      document.querySelector("#mail").value
    );

    displayContactList();
  });

  // bouton GPS
  document.querySelector("#gps").addEventListener("click", function (event) {
    event.preventDefault();
    getLocation();
  });

  // bouton Reset
  document.querySelector("#reset").addEventListener("click", function () {
    contactStore.reset();
    displayContactList();
  });
};
