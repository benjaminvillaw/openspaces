// Initialize and add the map
let map, infoWindow, currentLocationMarker, currentLocationCircle;
let messages = [];

var socket = io('http://localhost:3001')

function addNewMessage(pos) {
    const infoWindow = new google.maps.InfoWindow();
    pos = {
        lat: typeof pos.lat === 'function' ? pos.lat() : pos.lat,
        lng: typeof pos.lng === 'function' ? pos.lng() : pos.lng,
    }
    console.log(pos)
    const message = prompt("Enter a message");
    if (message) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(message);
        infoWindow.open(map);
        map.setCenter(pos);

        messages.push({
            message,
            lat: pos.lat,
            lng: pos.lng,
        });
        socket.emit("messages", {
            message,
            userid: findGetParameter("userid"),
            lat: pos.lat,
            lng: pos.lng,
        })
        localStorage.setItem("messages", JSON.stringify(messages));

        const marker = new google.maps.Marker({
            position: { lat: pos.lat, lng: pos.lng },
            map,
        });

        marker.addListener("click", () => {
            infoWindow.setContent(message);
            infoWindow.setPosition(pos);
            infoWindow.open(map);
        });
    }
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function(item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

let pos

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const initRun = pos === undefined
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                console.log(pos)
                if (initRun) {
                    initMap()
                }

            })
    }
}


function initMap() {

    socket.on('initMessages', (msg) => {
        messages.push(msg);
        console.log('initMessages: ', messages);
    });

    map = new google.maps.Map(document.getElementById("map"), {
        center: pos,
        zoom: 15,
        mapId: '9243ba12eb830840',
    });

    infoWindow = new google.maps.InfoWindow();

    currentLocationMarker = new google.maps.Marker({
        map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
        },
    });

    currentLocationCircle = new google.maps.Circle({
        map,
        radius: 100,
        fillColor: '#777',
        fillOpacity: 0.1,
        strokeColor: '#AA0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: true,
    });

    currentLocationCircle.setCenter(pos);

    currentLocationCircle.addListener("click", (event) => {
        addNewMessage(event.latLng);
    });

    // map.addListener("click", (event) => {
    //     addNewMessage(event.latLng);
    // });

    const locationButton = document.createElement("button");

    locationButton.textContent = "Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(
        //         (position) => {
        //             const pos = {
        //                 lat: position.coords.latitude,
        //                 lng: position.coords.longitude,
        //             };
        infoWindow.setPosition(pos);
        currentLocationCircle.setCenter(pos);
        infoWindow.setContent("Location found.");
        currentLocationMarker.setPosition(pos);
        currentLocationCircle.setCenter(e.latLng);
        infoWindow.open(map);

        map.addListener("click", (e) => {
            currentLocationMarker.setPosition(e.latLng);
        });
        map.setCenter(pos);
        //         },
        //         () => {
        //             handleLocationError(true, infoWindow, map.getCenter());
        //         }
        //     );
        // } else {
        //     // Browser doesn't support Geolocation
        //     handleLocationError(false, infoWindow, map.getCenter());
        // }
    });

    const messageButton = document.createElement("button");
    messageButton.textContent = "Create a Message";
    messageButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(messageButton);
    messageButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(
        //         (position) => {
        //             const pos = {
        //                 lat: position.coords.latitude,
        //                 lng: position.coords.longitude,
        //             };
        addNewMessage(pos)
            //                 // const message = prompt("Enter a message");
            //                 // if (message) {
            //                 //     infoWindow.setPosition(pos);
            //                 //     infoWindow.setContent(message);
            //                 //     infoWindow.open(map);
            //                 //     map.setCenter(pos);

        //             //     messages.push({
        //             //         message,
        //             //         lat: pos.lat,
        //             //         lng: pos.lng,
        //             //     });
        //             //     localStorage.setItem("messages", JSON.stringify(messages));
        //             // }
        //         },
        //         () => {
        //             handleLocationError(true, infoWindow, map.getCenter());
        //         }
        //     );
        // } else {
        //     // Browser doesn't support Geolocation
        //     handleLocationError(false, infoWindow, map.getCenter());
        // }
    });

    const savedMessages = JSON.parse(localStorage.getItem("messages"));
    if (savedMessages) {
        messages = savedMessages
        savedMessages.forEach((message) => {
            const infoWindow = new google.maps.InfoWindow();
            const marker = new google.maps.Marker({
                position: { lat: message.lat, lng: message.lng },
                map,
            });
            infoWindow.setContent(message.message);
            infoWindow.setPosition({ lat: message.lat, lng: message.lng });
            infoWindow.open(map);

            marker.addListener("click", () => {
                infoWindow.setContent(message.message);
                infoWindow.setPosition({ lat: message.lat, lng: message.lng });
                infoWindow.open(map);
            });
        });
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ?
        "Error: The Geolocation service failed." :
        "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

window.initMap = initMap;

// CIRCLE
// // Initialize and add the map
// let map, infoWindow, currentLocationMarker, currentLocationCircle;
// let messages = [];

// var socket = io('http://localhost:3001')

// function addNewMessage(pos) {
//     const message = prompt("Enter a message");
//     if (message) {
//         infoWindow.setPosition(pos);
//         infoWindow.setContent(message);
//         infoWindow.open(map);
//         map.setCenter(pos);

//         messages.push({
//             message,
//             lat: pos.lat,
//             lng: pos.lng,
//         });
//         socket.emit("messages", {
//             message,
//             userid: findGetParameter("userid"),
//             lat: pos.lat,
//             lng: pos.lng,
//         })
//         localStorage.setItem("messages", JSON.stringify(messages));
//     }
// }

// function findGetParameter(parameterName) {
//     var result = null,
//         tmp = [];
//     location.search
//         .substr(1)
//         .split("&")
//         .forEach(function(item) {
//             tmp = item.split("=");
//             if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
//         });
//     return result;
// }


// function initMap() {

//     socket.on('initMessages', (msg) => {
//         messages.push(msg);
//         console.log('initMessages: ', messages);
//     });

//     map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 42.37371031466209, lng: -71.10993752682701 },
//         zoom: 15,
//         mapId: '9243ba12eb830840',
//     });
//     infoWindow = new google.maps.InfoWindow();

//     currentLocationMarker = new google.maps.Marker({
//         map,
//         icon: {
//             path: google.maps.SymbolPath.CIRCLE,
//             scale: 8,
//         },
//     });

//     currentLocationCircle = new google.maps.Circle({
//         map,
//         radius: 100,
//         fillColor: '#777',
//         fillOpacity: 0.1,
//         strokeColor: '#AA0000',
//         strokeOpacity: 0.8,
//         strokeWeight: 2,
//         editable: false,
//     });

//     map.addListener("click", (event) => {
//         addNewMessage(event.latLng);
//     });

//     const locationButton = document.createElement("button");

//     locationButton.textContent = "Pan to Current Location";
//     locationButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
//     locationButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };

//                     infoWindow.setPosition(pos);
//                     currentLocationCircle.setCenter(pos);
//                     infoWindow.setContent("Location found.");
//                     currentLocationMarker.setPosition(pos);
//                     currentLocationCircle.setCenter(e.latLng);
//                     infoWindow.open(map);

//                     map.addListener("click", (e) => {
//                         currentLocationMarker.setPosition(e.latLng);
//                     });
//                     map.setCenter(pos);
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });

//     const messageButton = document.createElement("button");
//     messageButton.textContent = "Create a Message";
//     messageButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(messageButton);
//     messageButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };
//                     addNewMessage(pos)
//                         // const message = prompt("Enter a message");
//                         // if (message) {
//                         //     infoWindow.setPosition(pos);
//                         //     infoWindow.setContent(message);
//                         //     infoWindow.open(map);
//                         //     map.setCenter(pos);

//                     //     messages.push({
//                     //         message,
//                     //         lat: pos.lat,
//                     //         lng: pos.lng,
//                     //     });
//                     //     localStorage.setItem("messages", JSON.stringify(messages));
//                     // }
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });

//     const savedMessages = JSON.parse(localStorage.getItem("messages"));
//     if (savedMessages) {
//         messages = savedMessages
//         savedMessages.forEach((message) => {
//             const marker = new google.maps.Marker({
//                 position: { lat: message.lat, lng: message.lng },
//                 map,
//             });

//             marker.addListener("click", () => {
//                 infoWindow.setContent(message.message);
//                 infoWindow.open(map, marker);
//             });
//         });
//     }
// }

// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//     infoWindow.setPosition(pos);
//     infoWindow.setContent(
//         browserHasGeolocation ?
//         "Error: The Geolocation service failed." :
//         "Error: Your browser doesn't support geolocation."
//     );
//     infoWindow.open(map);
// }

// window.initMap = initMap;

// // Initialize and add the map
// let map, infoWindow, currentLocationMarker;
// let messages = [];

// var socket = io('http://localhost:3001')

// function addNewMessage(pos) {
//     const message = prompt("Enter a message");
//     if (message) {
//         infoWindow.setPosition(pos);
//         infoWindow.setContent(message);
//         infoWindow.open(map);
//         map.setCenter(pos);

//         messages.push({
//             message,
//             lat: pos.lat,
//             lng: pos.lng,
//         });
//         socket.emit("messages", {
//             message,
//             userid: findGetParameter("userid"),
//             lat: pos.lat,
//             lng: pos.lng,
//         })
//         localStorage.setItem("messages", JSON.stringify(messages));
//     }
// }

// function findGetParameter(parameterName) {
//     var result = null,
//         tmp = [];
//     location.search
//         .substr(1)
//         .split("&")
//         .forEach(function(item) {
//             tmp = item.split("=");
//             if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
//         });
//     return result;
// }


// function initMap() {

//     socket.on('initMessages', (msg) => {
//         messages.push(msg);
//         console.log('initMessages: ', messages);
//     });

//     map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 42.37371031466209, lng: -71.10993752682701 },
//         zoom: 15,
//         mapId: '9243ba12eb830840'
//     });
//     infoWindow = new google.maps.InfoWindow();

//     currentLocationMarker = new google.maps.Marker({
//         map,
//         icon: {
//             path: google.maps.SymbolPath.CIRCLE,
//             scale: 8,
//         },
//     });

//     map.addListener("click", (event) => {
//         addNewMessage(event.latLng);
//     });

//     const locationButton = document.createElement("button");

//     locationButton.textContent = "Pan to Current Location";
//     locationButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
//     locationButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };

//                     infoWindow.setPosition(pos);
//                     infoWindow.setContent("Location found.");
//                     currentLocationMarker.setPosition(pos);
//                     infoWindow.open(map);

//                     map.addListener("click", (e) => {
//                         currentLocationMarker.setPosition(e.latLng);
//                     });
//                     map.setCenter(pos);
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });

//     const messageButton = document.createElement("button");
//     messageButton.textContent = "Create a Message";
//     messageButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(messageButton);
//     messageButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };
//                     addNewMessage(pos)
//                         // const message = prompt("Enter a message");
//                         // if (message) {
//                         //     infoWindow.setPosition(pos);
//                         //     infoWindow.setContent(message);
//                         //     infoWindow.open(map);
//                         //     map.setCenter(pos);

//                     //     messages.push({
//                     //         message,
//                     //         lat: pos.lat,
//                     //         lng: pos.lng,
//                     //     });
//                     //     localStorage.setItem("messages", JSON.stringify(messages));
//                     // }
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });

//     const savedMessages = JSON.parse(localStorage.getItem("messages"));
//     if (savedMessages) {
//         messages = savedMessages
//         savedMessages.forEach((message) => {
//             const marker = new google.maps.Marker({
//                 position: { lat: message.lat, lng: message.lng },
//                 map,
//             });

//             marker.addListener("click", () => {
//                 infoWindow.setContent(message.message);
//                 infoWindow.open(map, marker);
//             });
//         });
//     }
// }

// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//     infoWindow.setPosition(pos);
//     infoWindow.setContent(
//         browserHasGeolocation ?
//         "Error: The Geolocation service failed." :
//         "Error: Your browser doesn't support geolocation."
//     );
//     infoWindow.open(map);
// }

// window.initMap = initMap;







// // Initialize and add the map

// let map, infoWindow;
// let messages = [];

// function initMap() {
//     map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 42.37371031466209, lng: -71.10993752682701 },
//         zoom: 15,
//         mapId: '9243ba12eb830840'
//     });
//     infoWindow = new google.maps.InfoWindow();

//     const locationButton = document.createElement("button");

//     locationButton.textContent = "Pan to Current Location";
//     locationButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
//     locationButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };

//                     infoWindow.setPosition(pos);
//                     infoWindow.setContent("Location found.");
//                     infoWindow.open(map);
//                     map.setCenter(pos);
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });

//     const messageButton = document.createElement("button");
//     messageButton.textContent = "Create a Message";
//     messageButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(messageButton);
//     messageButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };

//                     const message = prompt("Enter a message");
//                     if (message) {
//                         infoWindow.setPosition(pos);
//                         infoWindow.setContent(message);
//                         infoWindow.open(map);
//                         map.setCenter(pos);

//                         messages.push({
//                             message,
//                             lat: pos.lat,
//                             lng: pos.lng,
//                         });
//                         localStorage.setItem("messages", JSON.stringify(messages));
//                     }
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });

//     const savedMessages = JSON.parse(localStorage.getItem("messages"));
//     if (savedMessages) {
//         savedMessages.forEach((message) => {
//             const marker = new google.maps.Marker({
//                 position: { lat: message.lat, lng: message.lng },
//                 map,
//             });

//             marker.addListener("click", () => {
//                 infoWindow.setContent(message.message);
//                 infoWindow.open(map, marker);
//             });
//         });
//     }
// }

// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//     infoWindow.setPosition(pos);
//     infoWindow.setContent(
//         browserHasGeolocation ?
//         "Error: The Geolocation service failed." :
//         "Error: Your browser doesn't support geolocation."
//     );
//     infoWindow.open(map);
// }

// window.initMap = initMap;







// // Initialize and add the map

// let map, infoWindow;

// function initMap() {
//     map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 42.37371031466209, lng: -71.10993752682701 },
//         zoom: 15,
//         mapId: '9243ba12eb830840'
//     });
//     infoWindow = new google.maps.InfoWindow();

//     const locationButton = document.createElement("button");

//     locationButton.textContent = "Pan to Current Location";
//     locationButton.classList.add("custom-map-control-button");
//     map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
//     locationButton.addEventListener("click", () => {
//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };

//                     infoWindow.setPosition(pos);
//                     infoWindow.setContent("Location found.");
//                     infoWindow.open(map);
//                     map.setCenter(pos);
//                 },
//                 () => {
//                     handleLocationError(true, infoWindow, map.getCenter());
//                 }
//             );
//         } else {
//             // Browser doesn't support Geolocation
//             handleLocationError(false, infoWindow, map.getCenter());
//         }
//     });
// }

// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//     infoWindow.setPosition(pos);
//     infoWindow.setContent(
//         browserHasGeolocation ?
//         "Error: The Geolocation service failed." :
//         "Error: Your browser doesn't support geolocation."
//     );
//     infoWindow.open(map);
// }

// window.initMap = initMap;