var mainCoordinates = {lat: 50.4845252, lng: 30.4962789};
var map = null;
var mainMarker = null;
var towerMarker = null;
var path = null;
var geocoder = null;
var towerCoordinates = null;

function calcDistance(p1, p2) {
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

function updateDistance() {
    document.getElementById('distance').innerHTML = calcDistance(mainMarker.getPosition(), towerMarker.getPosition());
    path.setPath([mainCoordinates, towerCoordinates]);
}

function init() {
    geocoder = new google.maps.Geocoder();
    const mapOptions = {
        zoom: 16,
        center: mainCoordinates,
        mapTypeId: google.maps.MapTypeId.HYBRID
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    mainMarker = new google.maps.Marker({
        position: mainCoordinates,
        draggable: true,
        icon: 'marker_tv.png',
        map: map
    });

    towerMarker = new google.maps.Marker({
        map: map,
        icon: 'marker_ant.png'
    });

    path = new google.maps.Polyline({
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });

    google.maps.event.addListener(mainMarker, 'position_changed', update);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            mainMarker.setPosition(pos);
            const centerControlDiv = document.createElement('div');
            CenterControl(centerControlDiv);
            centerControlDiv.index = 1;

            map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
        }, function () {
        });

    }

    $("#lis1t").change(updatedList);
}


function update() {
    mainCoordinates = mainMarker.getPosition();
    if (towerCoordinates != null) {
        updateDistance();
    }
}

function updatedList() {
    let newValue = document.getElementById('lis1t').value;
    if (newValue != null) {
        newValue = newValue.split('|');
        if (newValue.length > 1) {
            towerCoordinates = {lat: parseFloat(newValue[0]), lng: parseFloat(newValue[1])};
            towerMarker.setPosition(towerCoordinates);
            updateDistance();
        }
    }
}

function codeAddress() {
    const address = document.getElementById("address").value;
    geocoder.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            mainCoordinates = results[0].geometry.location;
            map.setCenter(mainCoordinates);
            mainMarker.setPosition(mainCoordinates);
            updateDistance();
        } else {
            alert("����� �� ��� ������.");
        }
    });
}

function CenterControl(controlDiv) {
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    const controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = '����� ����';
    controlUI.appendChild(controlText);

    controlUI.addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            mainMarker.setPosition(pos);
        }, function () {
        });
    });

}

function findNearest() {
    let ar = document.getElementsByClassName('tower');
    let min = 9007199254740991;
    let index;
    for (let i = 0; i < ar.length; i++) {
        let tmp = ar[i].value.split('|');
        if (tmp.length > 1) {
            let tm1p = parseFloat(calcDistance(mainMarker.getPosition(), new google.maps.LatLng(parseFloat(tmp[0]), parseFloat(tmp[1]))));
            if (min > tm1p) {
                min = tm1p;
                index = i;
                towerCoordinates = new google.maps.LatLng(parseFloat(tmp[0]), parseFloat(tmp[1]));
            }
        }
    }
    document.getElementById('lis1t').selectedIndex = index;
    towerMarker.setPosition(towerCoordinates);
    updateDistance();
}

function clearText() {
    document.getElementById('address').value = "";
    document.getElementById('address').style.fontStyle = "normal";
}
