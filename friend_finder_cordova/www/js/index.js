var HOST = "http://138.68.138.186:8000";

var URLS = {
    login: "/rest/tokenlogin/",
    signup: "/signup/",
    userme: "/rest/userme/",
    updateposition: "/rest/updateposition/",
    username: "/rest/user/"
};

var map;

var curIcon = L.ExtraMarkers.icon({
    icon: 'fa-crosshairs',
    iconColor: 'white',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});

var otherIcon = L.ExtraMarkers.icon({
    icon: 'fa-crosshairs',
    iconColor: 'white',
    markerColor: 'red',
    shape: 'square',
    prefix: 'fa'
});

function onLoad() {
    console.log("In onLoad.");
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
    console.log("In onDeviceReady.");

    $("#btn-login").on("touchstart", loginPressed);
    $("#btn-reg").on("touchstart", register);
    $("#sp-logout").on("touchstart", logoutPressed);
    $("#btn-mapusername").on("touchstart", showUserLocation);
    $("#sp-userprofile").on("touchstart", showUserProfile);
    $("#btn-backtomap").on("touchstart", showMap);

    if (localStorage.lastUserName && localStorage.lastUserPwd) {
        $("#in-username").val(localStorage.lastUserName);
        $("#in-password").val(localStorage.lastUserPwd);
    }

    $(document).on("pagecreate", "#map-page", function (event) {
        console.log("In pagecreate. Target is " + event.target.id + ".");

        $("#goto-currentlocation").on("touchstart", function () {
            getCurrentlocation();
        });

        $("#map-page").enhanceWithin();

        makeBasicMap();
        getCurrentlocation();
    });

    $(document).on("pageshow", function (event) {
        console.log("In pageshow. Target is " + event.target.id + ".");
        if (!localStorage.authtoken) {
            $.mobile.navigate("#login-page");
        }
        setUserName();
    });

    $(document).on("pageshow", "#map-page", function () {
        console.log("In pageshow / #map-page.");
        map.invalidateSize();
    });

    console.log("TOKEN: " + localStorage.authtoken);
    if (localStorage.authtoken) {
        $.mobile.navigate("#map-page");
    } else {
        $.mobile.navigate("#login-page");
    }
}

function showUserProfile() {
    //showOkAlert("worked!");
    $.mobile.navigate("#userprofile-page");

    console.log("In setUserName.");
    $.ajax({
        type: "GET",
        headers: {"Authorization": localStorage.authtoken},
        url: HOST + URLS["userme"]
    }).done(function (data, status, xhr) {
        $(".label-profile-username").html("Username: " + xhr.responseJSON.properties.username);
        $(".label-profile-firstname").html("Firstname: " + xhr.responseJSON.properties.first_name);
        $(".label-profile-lastname").html("Lastname: " + xhr.responseJSON.properties.last_name);
        $(".label-profile-email").html("Email: " + xhr.responseJSON.properties.email);
        var c_date = xhr.responseJSON.properties.date_joined;
        $(".label-profile-created").html("Created: " + c_date.substring(0,10))
        //showOkAlert("success")
    }).fail(function (xhr, status, error) {
        //$(".sp-username").html("");
        showOkAlert("failed to connect, try again!")
    });

}

function showMap() {
    if (localStorage.authtoken) {
        $.mobile.navigate("#map-page");
    } else {
        $.mobile.navigate("#login-page");
    }
}

function register() {

    $.ajax({
        url: HOST + URLS["signup"],
        type: "POST",
        data: {
            username: $("#in-reg-username").val(),
            password: $("#in-reg-password").val(),
            password2: $("#in-reg-confpassword").val(),
            first_name: $("#in-reg-firstname").val(),
            last_name: $("#in-reg-lastname").val(),
            email: $("#in-reg-email").val()
        },
    }).done(function (data, status, xhr) {
        //message += "Status: " + xhr.status + " " + xhr.responseText;
        showOkAlert("Success");
        console.log(data);
    }).fail(function (xhr, status, error) {
        // message += "Status: " + xhr.status + " " + xhr.responseText;
        // showOkAlert(message);
        showOkAlert("Failure");

    });
}

function loginPressed() {
    console.log("login pressed");
    $.ajax({
        type: "GET",
        url: HOST + URLS["login"],
        data: {
            username: $("#in-username").val(),
            password: $("#in-password").val()
        }
    }).done(function (data, status, xhr) {
        localStorage.authtoken = localStorage.authtoken = "Token " + xhr.responseJSON.token;
        localStorage.lastUserName = $("#in-username").val();
        localStorage.lastUserPwd = $("#in-password").val();

        $.mobile.navigate("#map-page");
    }).fail(function (xhr, status, error) {
        var message = "Login Failed\n";
        if ((!xhr.status) && (!navigator.onLine)) {
            message += "Bad Internet Connection\n";
        }
        message += "Status: " + xhr.status + " " + xhr.responseText;
        showOkAlert(message);
        logoutPressed();
    });
}

function logoutPressed() {
    console.log("In logoutPressed.");
    localStorage.removeItem("authtoken");
    $.mobile.navigate("#login-page");
    // $.ajax({
    //     type: "GET",
    //     headers: {"Authorization": localStorage.authtoken}
    //     // url: HOST + URLS["logout"]
    // }).always(function () {
    //     localStorage.removeItem("authtoken");
    //     $.mobile.navigate("#login-page");
    // });
}

function showOkAlert(message) {
    navigator.notification.alert(message, null, "Friend Finder", "OK");
}

function showUserLocation() {
    //username: $("#in-username").val()
    //showOkAlert("Map User button worked!");
    console.log("show user location touched");
    $.ajax({
        type: "GET",
        headers: {"Authorization": localStorage.authtoken},
        url: HOST + URLS["username"] + $("#in-mapusername").val()
    }).done(function (data, status, xhr) {
        console.log("user coodinates: " + xhr.responseJSON.geometry);

        var friendPos = (xhr.responseJSON.geometry);

        if(friendPos.coordinates[0] == null) {
            showOkAlert("user coordinates not set!")
        } else {
            var myLatLon = L.latLng(friendPos.coordinates[1], friendPos.coordinates[0]);
            L.marker(myLatLon, {icon: otherIcon}).addTo(map);
            map.flyTo(myLatLon, 15);
            console.log(friendPos.coordinates[0]);
        }

    }).fail(function (xhr, status, error) {
        showOkAlert("username does not exist!")
    });
}

function getCurrentlocation() {
    console.log("In getCurrentlocation.");
    var myLatLon;
    var myPos;

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            //myLatLon = L.latLng(pos.coords.latitude, pos.coords.longitude);
            myPos = new myGeoPosition(pos);
            localStorage.lastKnownCurrentPosition = JSON.stringify(myPos);

            setMapToCurrentLocation();
            updatePosition();
        },
        function (err) {
        },
        {
            enableHighAccuracy: true
            // maximumAge: 60000,
            // timeout: 5000
        }
    );
}

function setMapToCurrentLocation() {
    console.log("In setMapToCurrentLocation.");
    if (localStorage.lastKnownCurrentPosition) {
        console.log(localStorage.lastKnownCurrentPosition);
        var myPos = JSON.parse(localStorage.lastKnownCurrentPosition);
        var myLatLon = L.latLng(myPos.coords.latitude, myPos.coords.longitude);
        L.marker(myLatLon, {icon: curIcon}).addTo(map);
        map.flyTo(myLatLon, 15);
    }
}

function updatePosition() {
    console.log("In updatePosition.");
    if (localStorage.lastKnownCurrentPosition) {
        var myPos = JSON.parse(localStorage.lastKnownCurrentPosition);
        $.ajax({
            type: "PATCH",
            headers: {"Authorization": localStorage.authtoken},
            url: HOST + URLS["updateposition"],
            data: {
                lat: myPos.coords.latitude,
                lon: myPos.coords.longitude
            }
        }).done(function (data, status, xhr) {
            showOkAlert("Position Updated");
        }).fail(function (xhr, status, error) {
            var message = "Position Update Failed\n";
            if ((!xhr.status) && (!navigator.onLine)) {
                message += "Bad Internet Connection\n";
            }
            message += "Status: " + xhr.status + " " + xhr.responseText;
            showOkAlert(message);
        }).always(function () {
            $.mobile.navigate("#map-page");
        });
    }
}

function makeBasicMap() {
    console.log("In makeBasicMap.");
    map = L.map("map-var", {
        zoomControl: false,
        attributionControl: false
    }).fitWorld();
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        useCache: true
    }).addTo(map);

    $("#leaflet-copyright").html("Leaflet | Map Tiles &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors");
}

function myGeoPosition(p) {
    this.coords = {};
    this.coords.latitude = p.coords.latitude;
    this.coords.longitude = p.coords.longitude;
    this.coords.accuracy = (p.coords.accuracy) ? p.coords.accuracy : 0;
    this.timestamp = (p.timestamp) ? p.timestamp : new Date().getTime();
}

function setUserName() {
    //console.log("Display Username = " + $(".sp-username"));
    //$(".sp-username").html(localStorage.lastUserName);
    console.log("In setUserName.");
    $.ajax({
        type: "GET",
        headers: {"Authorization": localStorage.authtoken},
        url: HOST + URLS["userme"]
    }).done(function (data, status, xhr) {
        $(".sp-username").html(xhr.responseJSON.properties.username);
        //showOkAlert("success")
    }).fail(function (xhr, status, error) {
        $(".sp-username").html("");
        //showOkAlert("failed")
    });
}
