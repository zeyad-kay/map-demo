// Map styles
const styles = [
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [
            { color: "#ffffff" }
        ]
    },
    {
        featureType: "transit.station.airport",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    },
    {
        featureType: "landscape.natural.terrain",
        elementType: "geometry",
        stylers: [{ color: "#e7e9ed" }],
    },
    {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#e7e9ed" }],
    },
    {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#e7e9ed" }],
    },
]


const calculate_btn = document.getElementById("calculate-btn");
const add_kid = document.getElementById('add-kid');
const remove_kid = document.getElementById('remove-kid');
const kids_num = document.getElementById('kids-num');
const loading = document.getElementById('loading');
const originInput = document.getElementById("origin-input");
const destinationInput = document.getElementById("destination-input");
const info_card = document.getElementById("info-card");
const search_card = document.getElementById("search-card");
const prices_card = document.getElementById("prices-card");

// Callback function executed after loading the Maps API
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        disableDefaultUI: true,
        center: { lat: 30.0444, lng: 31.2357 },
        zoom: 10,
    });
    map.setOptions({ styles: styles });
    

    // Remove the loader when the map loads
    google.maps.event.addListenerOnce(map, 'idle', function () {
        loading.hidden = true;
    });

    new AutocompleteDirectionsHandler(map);

}

class AutocompleteDirectionsHandler {
    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.destinationPlaceId = "";
        this.travelMode = google.maps.TravelMode.DRIVING;
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);
        this.distance = 0;

        const originAutocomplete = new google.maps.places.Autocomplete(originInput);
        // Specify just the place data fields that you need.
        originAutocomplete.setFields(["place_id"]);

        originAutocomplete.setComponentRestrictions({
            country: ["eg"],
        });
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);

        // Specify just the place data fields that you need.
        destinationAutocomplete.setFields(["place_id"]);
        destinationAutocomplete.setComponentRestrictions({
            country: ["eg"],
        });

        this.setupPlaceChangedListener(originAutocomplete, "ORIG");
        this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

        // Places the search box on top of the map
        this.map.controls[google.maps.ControlPosition.TOP].push(search_card);
    }

    setupPlaceChangedListener(autocomplete, mode) {
        autocomplete.bindTo("bounds", this.map);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.place_id) {
                $(".alert").text("Please select a Home and School location.");
                $(".alert").show();
                return;
            }

            if (mode === "ORIG") {
                this.originPlaceId = place.place_id;
            } else {
                this.destinationPlaceId = place.place_id;
            }
            // displays the route
            this.route();
        });
    }
    route() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        const me = this;
        this.directionsService.route(
            {
                origin: { placeId: this.originPlaceId },
                destination: { placeId: this.destinationPlaceId },
                travelMode: this.travelMode,
                provideRouteAlternatives: true
            },
            (response, status) => {
                if (status === "OK") {
                    $(".alert").hide();
                    me.directionsRenderer.setDirections(response);
                    this.distance = response.routes[0].legs[0].distance.value / 1000;
                } else {
                    $(".alert").text("Something went wrong. Try again.")
                    $(".alert").show();
                    setTimeout(() => {
                        $(".alert").hide();
                    }, 2000);
                }
            }
        );
    }
}
