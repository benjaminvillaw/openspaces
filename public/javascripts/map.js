(function() {
    let map, currentLocationMarker, currentLocationCircle, pos, activeMessageId;
    let messages = [];
    const chatModal = document.getElementById("chat-modal");
    const modalClose = document.getElementById("modal-close");
    const modalMessages = document.getElementById("modal-messages");
    const modalReply = document.getElementById("modal-reply");

    var socket = io();

    function addMessageToMap(message) {
        const infoWindow = new google.maps.InfoWindow();
        const marker = new google.maps.Marker({
            position: { lat: message.lat, lng: message.lng },
            map,
        });
        infoWindow.setContent(buildContent(message));
        infoWindow.setPosition({ lat: message.lat, lng: message.lng });
        infoWindow.open(map);
        console.log(infoWindow);
        // infoWindow.content.parentNode.classList.add("test");

        marker.addListener("click", () => {
            infoWindow.open(map);
        });
    }

    function addMessageToModal(message) {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("row");
        const messageEl = document.createElement("div");
        messageEl.textContent = message.message;
        messageContainer.appendChild(messageEl);
        const timeEl = document.createElement("div");
        timeEl.textContent = new Date(message.time).toLocaleString();
        messageContainer.appendChild(timeEl);
        modalMessages.appendChild(messageContainer);
    }

    function showModal(message, replies) {
        chatModal.classList.add("show");

        modalMessages.innerHTML = "";

        const messageEl = document.createElement("div");
        messageEl.textContent = message;
        modalMessages.appendChild(messageEl);

        replies.forEach((reply) => {
            addMessageToModal(reply);
        });
    }

    function addReply(message) {
        // console.log(activeMessage, message);
        socket.emit("newReply", { activeMessageId, message });
    }

    function buildContent({ message, _id, replies }) {
        const container = document.createElement("div");
        const messageEl = document.createElement("span");
        messageEl.textContent = message.slice(0, 15);
        container.appendChild(messageEl);
        container.addEventListener("click", () => {
            activeMessageId = _id;
            showModal(message, replies);
        });
        if (message.length >= 15) {
            const messageMoreEl = document.createElement("span");
            messageMoreEl.textContent = "...";
            container.appendChild(messageMoreEl);
        }
        return container;
    }

    function receivedMessage(message) {
        if (!message.replies) {
            message.replies = [];
        }
        messages.push(message);
        if (!map) {
            return;
        }
        addMessageToMap(message);
    }

    function receivedReply(messageId, reply) {
        const message = messages.find((message) => {
            return message._id === messageId;
        });
        message.replies.push(reply);

        if (activeMessageId === messageId) {
            addMessageToModal(reply);
        }
    }

    function sendMessage(position) {
        const text = prompt("Enter a message");
        if (!text) {
            return;
        }
        const message = {
            message: text,
            lat: typeof position.lat === "function" ? position.lat() : position.lat,
            lng: typeof position.lng === "function" ? position.lng() : position.lng,
        };

        socket.emit("newMessage", {
            message,
        });
    }

    function initMessages() {
        socket.on("initMessages", (payload) => {
            payload.messages.forEach((message) => {
                receivedMessage(message);
            });
        });
        socket.on("newMessage", (payload) => {
            receivedMessage(payload.message);
        });
        socket.on("newReply", (payload) => {
            receivedReply(payload.messageId, payload.reply);
        });
    }

    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: pos,
            zoom: 15,
            mapId: "9243ba12eb830840",
            tilt: 45,
        });

        messages.forEach((message) => {
            addMessageToMap(message);
        });

        currentLocationCircle = new google.maps.Circle({
            map,
            radius: 100,
            fillColor: "#777",
            fillOpacity: 0.1,
            strokeColor: "#AA0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            editable: true,
        });
        currentLocationCircle.addListener("click", (event) => {
            sendMessage(event.latLng);
        });
    }

    function updateMap() {
        currentLocationCircle.setCenter(pos);
        map.setCenter(pos);
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
                const initRun = pos === undefined;
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                console.log(pos);
                if (initRun) {
                    initMap();
                }
                updateMap();
            });
        }
    }
    initMessages();
    // getLocation();
    window.getLocation = getLocation;

    modalClose.addEventListener("click", () => {
        chatModal.classList.remove("show");
    });
    modalReply.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const message = formData.get("message");
        addReply(message);
        event.target.reset();
    });
})();

// const webglOverlayView = new google.maps.WebGLOverlayView();
// webglOverlayView.setMap(map);

// map.moveCamera({
//     center: pos,
//     zoom: 16,
//     heading: 320,
//     tilt: 47.5,
// });

// const degreesPerSecond = 3;

// function animateCamera(time) {
//     // Update the heading, leave everything else as-is.
//     map.moveCamera({
//         heading: (time / 1000) * degreesPerSecond,
//     });

//     requestAnimationFrame(animateCamera);
// }

// // Start the animation.
// requestAnimationFrame(animateCamera);

// window.initMap = initMap;