function bootstrap() {

  // ejecuta un http request al server y cuando la respuesta es OK, ejecuta un callback sobre los datos recibidos.
  requestJSON = function(url, callback, caller) { // no se declara var para que sea global a todas las clases
      var xhttp;
      xhttp = new XMLHttpRequest(); // interfaz para realizar peticiones a servidores web
      xhttp.onreadystatechange = function() {// Evento que se dispara con cada cambio de estado
          if (this.readyState == 4 && this.status == 200) {
              console.log("Request status " + this.statusText);
              console.log("llamando funcion callback: " + callback);
              callback(JSON.parse(this.responseText), caller); // parsea ej json que s elo pasa porparametro
          }
      };
      xhttp.open("GET", url, true); // especifica el tipo de request
      xhttp.send(); // envia la request al server (usada por el get)
  }

  var requestsSource = "https://snapcar.herokuapp.com/api/requests/";
  var driversSource = "https://snapcar.herokuapp.com/api/drivers/";
  var positionsSource = "https://snapcar.herokuapp.com/api/positions/";
  var incidentsSource = "https://snapcar.herokuapp.com/api/incidents/";
  var incidentstypesSource = "https://snapcar.herokuapp.com/api/incidentstypes";

  //----------------------------------------------------------------------------

  // Ubicación de la UNGS.
  var ungsLocation = [-34.5221554, -58.7000067];

  // Creación del componente mapa de Leaflet.
  var map = L.map("mapid").setView(ungsLocation, 14);

  // Agregamos los Layers de OpenStreetMap.
  var baseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Agregamos el control para seleccionar Layers al mapa
  var layersControl = L.control.layers({
      "Base": baseLayer
  });
  layersControl.addTo(map);
  // hack:
  map.layersControl = layersControl;

  //----------------------------------------------------------------------------

  //Creamos un marker sobre la UNGS.
  console.log("creando Maker sobre UNGS");
  var ungsMarker = L.marker(ungsLocation);
  ungsMarker.addTo(map);

  //----------------------------------------------------------------------------

  var formularioInicial = document.formulario;

  $("#myBtn").click(function(){
    console.log("se hizo click en enviar solicitud");
    if (cargaFinalizada()) {
      document.getElementById('drivers').style.visibility='visible';
      document.getElementById("formularioInicial").style.visibility='hidden';


    } else {
        console.log("carga incompleta");
        // un warning de bootstrap para indicar que la carga no ha finalizado
        var alert = "<div class=\"alert alert-warning alert-dismissable\">" +
            "\<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">×</a>" +
            "<strong>Atención!</strong> No se han cargado todos los elementos en el mapa.</div>";
        $("#aviso").append(alert).show(500); //y aca le decimos a jquery que cargue el cartel en el html
    }
  });

  //determina si la carga de los datos finalizo o no.
  function cargaFinalizada() {
      return travelreq.finishedLoad && driversLoader.finishedLoad && positionsLoader.finishedLoad && incidentsLoader.finishedLoad;
  }

  //----------------------------------------------------------------------------

  //creamos el viaje
  console.log("creando Viaje");
  travelreq = new TravelRequest("Pedido a ungs", map);

  //creamos los conductores y las posiciones
  console.log("creando Driversloader");
  var driversLoader = new DriversLoader(driversSource);
  console.log("creando Positionsloader");
  var positionsLoader = new PositionsLoader(positionsSource);

  // cargamos los conductores con sus posiciones
  console.log("loadDrivers");
  driversLoader.loadDriversTo(travelreq, positionsLoader);

  var incidenciasTypes = new incidentTypes(incidentstypesSource);
  incidenciasTypes.requestIncidencias;

  //creamos y cargamos las incidencias
  console.log("creando incidentsLoader");
  var incidentsLoader = new IncidentsLoader(incidentsSource);

  console.log("loadIncidents");
  incidentsLoader.loadIncidents(map, incidenciasTypes); // llama a la funcion loadIncidents de incidentsSource.js

  //----------------------------------------------------------------------------

}

function iniciar(id){
  travelreq.startTravel(id);
  document.getElementById("izquierda").style.width='0%';
  document.getElementById("derecha").style.width='100%';
}

$(bootstrap);
