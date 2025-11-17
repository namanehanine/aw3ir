// js/main.js
var app;
window.onload = function () {
  app = new Vue({
    el: "#weatherApp",
    data: {
      loaded: false,
      formCityName: "",
      message: "",       // message global (erreurs API)
      messageForm: "",   // message pour le formulaire (ex: existe déjà)
      cityList: [
        { name: "Paris" } // initialiser avec Paris comme demandé
      ],
      cityWeather: null,       // contiendra la réponse JSON d'OWM
      cityWeatherLoading: false,
      // ===========================
      // CONFIG
      // Remplace par ta clé. NE COMMIT PAS la clé dans un repo public.
      // ===========================
      apiKey: "3ef5c546c4852eea2d8e7059dd361f2a"
    },

    mounted: function () {
      this.loaded = true;
      this.readData();
    },

    methods: {
      // pour debug: afficher la liste actuelle
      readData: function () {
        console.log("JSON.stringify(this.cityList)", JSON.stringify(this.cityList));
        console.log("this.loaded:", this.loaded);
      },

      // Ajoute une ville (exécuté quand le formulaire est soumis)
      addCity: function (event) {
        event.preventDefault();

        // Nettoyage des espaces en trop
        var newName = this.formCityName.trim();
        if (!newName) {
          this.messageForm = "Veuillez saisir un nom de ville valide.";
          return;
        }

        // Test si la ville existe déjà (insensible à la casse)
        if (this.isCityExist(newName)) {
          this.messageForm = "La ville existe déjà.";
          return;
        }

        // Ajoute à la liste et reset du champ + message
        this.cityList.push({ name: newName });
        this.messageForm = "";
        this.formCityName = "";

        // Optionnel : charger tout de suite la météo de cette ville
        // this.meteo({ name: newName });
      },

      // Supprimer une ville de la liste
      remove: function (_city) {
        this.cityList = this.cityList.filter(item => item.name != _city.name);
        // Si la météo affichée est pour la ville supprimée, la nettoyer
        if (this.cityWeather && this.cityWeather.name == _city.name) {
          this.cityWeather = null;
        }
      },

      // Vérifie si la ville existe déjà dans cityList
      isCityExist: function (_cityName) {
        return this.cityList.filter(item =>
          item.name.toUpperCase() == _cityName.toUpperCase()
        ).length > 0;
      },

      // Récupère la météo pour une ville via OpenWeatherMap (par nom)
      meteo: function (_city) {
        var cityName = _city.name;
        this.cityWeatherLoading = true;
        this.message = "";
        this.cityWeather = null;

        // Construction de l'URL
        var url =
          "https://api.openweathermap.org/data/2.5/weather?q=" +
          encodeURIComponent(cityName) +
          "&units=metric&lang=fr&appid=" +
          this.apiKey;

        console.log("Fetching:", url);

        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(function (json) {
            app.cityWeatherLoading = false;

            // Vérifier le code renvoyé par l'API
            // json.cod peut être number ou string selon la version
            var code = typeof json.cod === "string" ? parseInt(json.cod) : json.cod;

            if (code === 200) {
              app.cityWeather = json;
              app.message = "";
            } else {
              app.cityWeather = null;
              app.message = "Météo introuvable pour " + cityName + " (" + (json.message || "erreur") + ")";
            }
          })
          .catch(function (err) {
            app.cityWeatherLoading = false;
            app.cityWeather = null;
            app.message = "Erreur de connexion à l'API météo: " + err.message;
            console.error(err);
          });
      },

      // Bonus : géolocalisation (ma position)
      myPosition: function () {
        var self = this;
        if (!navigator.geolocation) {
          this.message = "Géolocalisation non supportée par votre navigateur.";
          return;
        }

        this.message = "";
        this.cityWeatherLoading = true;

        navigator.geolocation.getCurrentPosition(
          function (pos) {
            var lat = pos.coords.latitude;
            var lon = pos.coords.longitude;

            // Appel OWM par coordonnée lat/lon
            var url =
              "https://api.openweathermap.org/data/2.5/weather?lat=" +
              lat +
              "&lon=" +
              lon +
              "&units=metric&lang=fr&appid=" +
              self.apiKey;

            fetch(url)
              .then(r => r.json())
              .then(function (json) {
                app.cityWeatherLoading = false;
                var code = typeof json.cod === "string" ? parseInt(json.cod) : json.cod;
                if (code === 200) {
                  app.cityWeather = json;
                  // Optionnel : ajouter la ville à la liste si elle n'existe pas
                  if (!app.isCityExist(json.name)) {
                    app.cityList.push({ name: json.name });
                  }
                } else {
                  app.cityWeather = null;
                  app.message = "Météo introuvable pour la position (" + (json.message || "erreur") + ")";
                }
              })
              .catch(function (err) {
                app.cityWeatherLoading = false;
                app.cityWeather = null;
                app.message = "Erreur de connexion: " + err.message;
              });
          },
          function (err) {
            self.cityWeatherLoading = false;
            self.message = "Erreur géolocalisation: " + err.message;
          }
        );
      }
    },

    computed: {
      // Convertit le timestamp en heure:minute
      cityWheaterDate: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.dt * 1000);
          var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
          return date.getHours() + ":" + minutes;
        } else {
          return "";
        }
      },
      cityWheaterSunrise: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.sys.sunrise * 1000);
          var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
          return date.getHours() + ":" + minutes;
        } else {
          return "";
        }
      },
      cityWheaterSunset: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.sys.sunset * 1000);
          var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
          return date.getHours() + ":" + minutes;
        } else {
          return "";
        }
      },

      // Calcul bbox pour OpenStreetMap (on prend un delta fonction du zoom)
      openStreetMapArea: function () {
        if (this.cityWeather !== null) {
          const zoom = 8;
          const delta = 0.05 / Math.pow(2, zoom - 10);
          const bboxEdges = {
            south: this.cityWeather.coord.lat - delta,
            north: this.cityWeather.coord.lat + delta,
            west: this.cityWeather.coord.lon - delta,
            east: this.cityWeather.coord.lon + delta
          };
          // format requis: west,south,east,north (avec %2C pour virgule encodée)
          return `${bboxEdges.west}%2C${bboxEdges.south}%2C${bboxEdges.east}%2C${bboxEdges.north}`;
        } else {
          return "";
        }
      }
    }
  });
};
