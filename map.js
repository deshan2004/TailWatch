const MAP_CONFIG = {
    SRI_LANKA_BOUNDS: [
        [5.916, 79.517], // Southwest corner
        [9.826, 81.878]  // Northeast corner
    ],
    DEFAULT_LOCATION: [7.8731, 80.7718], // Center of Sri Lanka
    DEFAULT_ZOOM: 8,
    PROVINCES: {
        'Western': [[6.8, 79.8], [6.95, 80.1]],
        'Central': [[7.1, 80.4], [7.5, 80.9]],
        'Southern': [[5.9, 80.1], [6.5, 80.8]],
        'Northern': [[8.5, 79.7], [9.8, 80.5]],
        'Eastern': [[7.0, 81.0], [8.8, 81.8]],
        'North Western': [[7.3, 79.8], [8.0, 80.5]],
        'North Central': [[8.0, 80.2], [8.8, 81.0]],
        'Uva': [[6.5, 80.8], [7.2, 81.3]],
        'Sabaragamuwa': [[6.4, 80.2], [7.2, 80.8]]
    }
};

let map;
let markers = [];
let userLocationMarker = null;
let provinceLayer = null;

document.addEventListener("DOMContentLoaded", function() {
    console.log("map.js loaded, initializing Sri Lanka map...");
    initApp();
});

function initApp() {
    initMap();
    initEventListeners();
    loadSriLankaDogData();
    addProvinceOverlays();
}

function initMap() {
    const mapContainer = document.getElementById("mapContainer");
    if (!mapContainer) {
        console.error("Map container (#mapContainer) not found!");
        return;
    }

    const loadingDiv = mapContainer.querySelector('.map-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }

    map = L.map("mapContainer").setView(
        MAP_CONFIG.DEFAULT_LOCATION,
        MAP_CONFIG.DEFAULT_ZOOM
    );

    map.setMaxBounds(MAP_CONFIG.SRI_LANKA_BOUNDS);
    map.setMinZoom(7);
    map.setMaxZoom(18);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 7
    }).addTo(map);

    L.control.scale({imperial: false}).addTo(map);
    
    console.log("Sri Lanka Map initialized successfully");
}

function addProvinceOverlays() {
    if (!map) return;
    
    provinceLayer = L.layerGroup().addTo(map);
    
    Object.entries(MAP_CONFIG.PROVINCES).forEach(([province, bounds]) => {
        const [southWest, northEast] = bounds;
        const center = [
            (southWest[0] + northEast[0]) / 2,
            (southWest[1] + northEast[1]) / 2
        ];
        
        // Add province label
        L.marker(center, {
            icon: L.divIcon({
                className: 'province-label',
                html: `<div style="
                    background: rgba(52, 152, 219, 0.2);
                    padding: 5px 10px;
                    border-radius: 15px;
                    border: 1px solid rgba(52, 152, 219, 0.5);
                    font-weight: bold;
                    color: #2c3e50;
                    font-size: 12px;
                    white-space: nowrap;
                    backdrop-filter: blur(2px);
                    text-shadow: 1px 1px 1px rgba(255,255,255,0.5);
                ">${province}</div>`,
                iconSize: null
            })
        }).addTo(provinceLayer);
    });
}

function createMarker(lat, lng, title, status = "healthy", type = "dog", province = "Unknown") {
    if (!map) {
        console.error("Map not initialized!");
        return null;
    }

    const icon = getMarkerIcon(status, type);
    
    const marker = L.marker([lat, lng], { 
        icon: icon,
        title: title 
    }).addTo(map);

    const popupContent = createPopupContent(title, status, lat, lng, province);
    marker.bindPopup(popupContent);
    
    markers.push({
        marker: marker,
        status: status,
        type: type,
        province: province
    });

    return marker;
}

function getMarkerIcon(status, type) {
    let color = "blue";
    
    if (type === "user") {
        return L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [30, 46],
            iconAnchor: [15, 46],
            popupAnchor: [1, -34],
            className: 'user-location-marker'
        });
    } else if (type === "search") {
        return L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });
    } else {
        switch(status) {
            case "healthy": color = "blue"; break;
            case "sick": color = "yellow"; break;
            case "rabid": color = "red"; break;
            default: color = "blue";
        }
    }

    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
}

function createPopupContent(title, status, lat, lng, province) {
    const statusColors = {
        healthy: "#4CAF50",
        sick: "#FF9800",
        rabid: "#F44336"
    };
    
    const statusIcons = {
        healthy: "fa-check-circle",
        sick: "fa-exclamation-triangle",
        rabid: "fa-skull-crossbones"
    };
    
    return `
        <div class="dog-popup" style="padding: 10px; min-width: 250px;">
            <h4 style="margin: 0 0 10px 0; color: ${statusColors[status] || '#333'}">
                <i class="fas ${statusIcons[status] || 'fa-paw'}"></i> ${title}
            </h4>
            <p style="margin: 5px 0; font-size: 14px;">
                <strong>Status:</strong> <span style="color: ${statusColors[status] || '#333'}">${status.toUpperCase()}</span>
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
                <strong>Province:</strong> ${province || 'Unknown'}
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
                <i class="fas fa-map-marker-alt"></i> ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">
                Reported: Today
            </p>
            <button onclick="window.MapManager.focusOnDog(${lat}, ${lng})" 
                    style="background: var(--primary-color); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                <i class="fas fa-map-marker-alt"></i> Zoom to Location
            </button>
        </div>
    `;
}

function getUserLocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation not supported by your browser", "error");
        return;
    }

    showToast("Getting your location in Sri Lanka...", "info");

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            console.log("User location found:", lat, lng);
            
            if (!isLocationInSriLanka(lat, lng)) {
                showToast("You appear to be outside Sri Lanka", "warning");
                return;
            }
            
            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }
            
            userLocationMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    iconSize: [30, 46],
                    iconAnchor: [15, 46],
                    popupAnchor: [1, -34]
                }),
                title: "Your Current Location in Sri Lanka",
                zIndexOffset: 1000
            }).addTo(map);
            
            const province = getProvinceFromCoordinates(lat, lng);
            
            userLocationMarker.bindPopup(`
                <div style="padding: 10px; min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0; color: #27ae60;">
                        <i class="fas fa-user-circle"></i> Your Location in Sri Lanka
                    </h4>
                    <p style="margin: 5px 0; font-size: 14px;">
                        <strong>Province:</strong> ${province}
                    </p>
                    <p style="margin: 5px 0; font-size: 14px;">
                        <i class="fas fa-map-marker-alt"></i> ${lat.toFixed(6)}, ${lng.toFixed(6)}
                    </p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">
                        Current position in ${province} Province
                    </p>
                </div>
            `).openPopup();
            
            map.setView([lat, lng], 13);
            
            showToast(`Your location in ${province} Province has been marked!`, "success");
        },
        function(error) {
            console.error("Geolocation error:", error);
            let message = "Could not get your location in Sri Lanka";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = "Location permission denied. Please allow location access.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = "Location information unavailable";
                    break;
                case error.TIMEOUT:
                    message = "Location request timed out";
                    break;
            }
            showToast(message, "error");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function isLocationInSriLanka(lat, lng) {
    const bounds = MAP_CONFIG.SRI_LANKA_BOUNDS;
    return lat >= bounds[0][0] && lat <= bounds[1][0] && 
           lng >= bounds[0][1] && lng <= bounds[1][1];
}

function getProvinceFromCoordinates(lat, lng) {
    for (const [province, bounds] of Object.entries(MAP_CONFIG.PROVINCES)) {
        const [southWest, northEast] = bounds;
        if (lat >= southWest[0] && lat <= northEast[0] && 
            lng >= southWest[1] && lng <= northEast[1]) {
            return province;
        }
    }
    return "Unknown Province";
}

function searchLocation(query) {
    if (!query || query.trim() === "") {
        showToast("Please enter a location in Sri Lanka to search", "warning");
        return;
    }

    showToast(`Searching "${query}" in Sri Lanka...`, "info");

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Sri Lanka')}&limit=1&countrycodes=lk`)
        .then(response => {
            if (!response.ok) throw new Error("Search failed");
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                showToast("Location not found in Sri Lanka. Try a different search term.", "error");
                return;
            }

            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const displayName = data[0].display_name;

            console.log("Location found in Sri Lanka:", lat, lng, displayName);

            if (!isLocationInSriLanka(lat, lng)) {
                showToast("Location is outside Sri Lanka", "warning");
                return;
            }

            map.setView([lat, lng], 14);
            
            const province = getProvinceFromCoordinates(lat, lng);
            createMarker(lat, lng, displayName.split(',')[0], "search", "search", province);

            showToast(`Location found in ${province} Province!`, "success");
        })
        .catch(error => {
            console.error("Search error:", error);
            showToast("Search failed. Please try again.", "error");
        });
}

function loadSriLankaDogData() {
    const dogs = [
        // Western Province
        { name: "Friendly dog near Galle Face", status: "healthy", lat: 6.9271, lng: 79.8412, description: "Brown medium-sized dog, appears healthy", province: "Western" },
        { name: "Dog near Colombo Fort", status: "sick", lat: 6.9344, lng: 79.8500, description: "Black dog with injured leg", province: "Western" },
        
        // Central Province
        { name: "Stray near Temple of Tooth", status: "sick", lat: 7.2937, lng: 80.6413, description: "Dog with visible injuries near temple", province: "Central" },
        { name: "Dog in Peradeniya", status: "healthy", lat: 7.2548, lng: 80.5974, description: "Friendly dog near university", province: "Central" },
        
        // Southern Province
        { name: "Dog in Galle Fort", status: "healthy", lat: 6.0264, lng: 80.2165, description: "Brown dog near Galle Fort entrance", province: "Southern" },
        { name: "Sick dog in Matara", status: "sick", lat: 5.9480, lng: 80.5351, description: "Dog showing signs of illness", province: "Southern" },
        
        // Northern Province
        { name: "Dog near Jaffna Fort", status: "healthy", lat: 9.6657, lng: 80.0103, description: "Local stray near historical site", province: "Northern" },
        { name: "Aggressive dog in Vavuniya", status: "rabid", lat: 8.7514, lng: 80.4971, description: "Dog showing aggressive behavior", province: "Northern" },
        
        // Eastern Province
        { name: "Beach dog in Trincomalee", status: "healthy", lat: 8.5808, lng: 81.2373, description: "Dog near Nilaveli beach", province: "Eastern" },
        { name: "Sick dog in Batticaloa", status: "sick", lat: 7.7167, lng: 81.7000, description: "Dog with skin issues", province: "Eastern" },
        
        // North Western Province
        { name: "Dog near Athugala", status: "sick", lat: 7.4847, lng: 80.3659, description: "Dog with visible health issues", province: "North Western" },
        { name: "Healthy dog in Puttalam", status: "healthy", lat: 8.0362, lng: 79.8283, description: "Friendly local stray", province: "North Western" },
        
        // North Central Province
        { name: "Dog near Ruwanwelisaya", status: "healthy", lat: 8.3441, lng: 80.3967, description: "Stray near sacred area", province: "North Central" },
        { name: "Sick dog in Polonnaruwa", status: "sick", lat: 7.9329, lng: 81.0081, description: "Old dog moving slowly", province: "North Central" },
        
        // Uva Province
        { name: "Mountain dog in Badulla", status: "healthy", lat: 6.9934, lng: 81.0550, description: "Dog in hilly area", province: "Uva" },
        { name: "Rabid dog in Monaragala", status: "rabid", lat: 6.8728, lng: 81.3500, description: "Aggressive behavior observed", province: "Uva" },
        
        // Sabaragamuwa Province
        { name: "Dog near gem mines", status: "rabid", lat: 6.6828, lng: 80.3992, description: "Aggressive dog near mines", province: "Sabaragamuwa" },
        { name: "Friendly dog in Kegalle", status: "healthy", lat: 7.2533, lng: 80.3464, description: "Small friendly dog", province: "Sabaragamuwa" }
    ];

    displayDogList(dogs);

    dogs.forEach(dog => {
        createMarker(dog.lat, dog.lng, dog.name, dog.status, "dog", dog.province);
    });
    
    if (dogs.length > 0) {
        const bounds = dogs.map(dog => [dog.lat, dog.lng]);
        const group = L.featureGroup(bounds.map(coord => L.marker(coord)));
        map.fitBounds(group.getBounds().pad(0.1));
    }
    
    console.log(`Loaded ${dogs.length} dog markers across Sri Lanka's 9 provinces`);
}

function displayDogList(dogs) {
    const list = document.getElementById("dogList");
    if (!list) {
        console.error("Dog list container not found!");
        return;
    }

    list.innerHTML = dogs.map(dog => {
        const statusClass = dog.status;
        const statusIcon = dog.status === "healthy" ? "fa-check-circle" : 
                          dog.status === "sick" ? "fa-exclamation-triangle" : 
                          "fa-skull-crossbones";
        
        return `
            <div class="dog-list-item ${statusClass}">
                <div class="dog-list-header">
                    <h4><i class="fas ${statusIcon}"></i> ${dog.name}</h4>
                    <span class="dog-status ${statusClass}">${dog.status.toUpperCase()}</span>
                </div>
                <p class="dog-description">${dog.description}</p>
                <div class="dog-list-footer">
                    <span class="dog-province"><i class="fas fa-map"></i> ${dog.province}</span>
                    <span class="dog-location">${dog.lat.toFixed(4)}, ${dog.lng.toFixed(4)}</span>
                    <button class="btn-view-map" onclick="window.MapManager.focusOnDog(${dog.lat}, ${dog.lng})">
                        <i class="fas fa-map-marker-alt"></i> View on Map
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function focusOnDog(lat, lng) {
    if (!map) {
        console.error("Map not initialized!");
        return;
    }
    
    map.setView([lat, lng], 16);
    
    markers.forEach(item => {
        if (Math.abs(item.marker.getLatLng().lat - lat) < 0.001 && 
            Math.abs(item.marker.getLatLng().lng - lng) < 0.001) {
            item.marker.openPopup();
        }
    });
    
    showToast("Centered on selected dog", "info");
}

function filterMarkers(filter) {
    markers.forEach(item => {
        if (filter === "all" || item.status === filter || item.type !== "dog") {
            item.marker.addTo(map);
        } else {
            map.removeLayer(item.marker);
        }
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    showToast(`Showing ${filter === "all" ? "all dogs" : filter + " dogs"}`, "info");
}

function filterByProvince(province) {
    markers.forEach(item => {
        if (province === "all" || item.province === province || item.type !== "dog") {
            item.marker.addTo(map);
        } else {
            map.removeLayer(item.marker);
        }
    });
    
    if (province !== "all") {
        const provinceBounds = MAP_CONFIG.PROVINCES[province];
        if (provinceBounds) {
            map.fitBounds([provinceBounds[0], provinceBounds[1]]);
            showToast(`Showing dogs in ${province} Province`, "info");
        }
    } else {
        if (markers.length > 0) {
            const bounds = markers.map(item => item.marker.getLatLng());
            const group = L.featureGroup(bounds.map(coord => L.marker(coord)));
            map.fitBounds(group.getBounds().pad(0.1));
        }
        showToast("Showing all provinces", "info");
    }
}

function initEventListeners() {
    const searchInput = document.getElementById("locationSearch");
    if (searchInput) {
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                searchLocation(this.value);
            }
        });
    }

    const locationBtn = document.getElementById("currentLocationBtn");
    if (locationBtn) {
        locationBtn.addEventListener("click", getUserLocation);
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterMarkers(filter);
        });
    });

    const provinceFilter = document.getElementById("provinceFilter");
    if (provinceFilter) {
        provinceFilter.addEventListener("change", function() {
            filterByProvince(this.value);
        });
    }

    const reportLocationBtn = document.getElementById("useCurrentLocation");
    if (reportLocationBtn) {
        reportLocationBtn.addEventListener("click", function() {
            if (!navigator.geolocation) {
                alert("Geolocation not supported by your browser");
                return;
            }
            
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                if (!isLocationInSriLanka(lat, lng)) {
                    showToast("You appear to be outside Sri Lanka", "warning");
                    return;
                }
                
                const province = getProvinceFromCoordinates(lat, lng);
                document.getElementById("dogLocation").value = 
                    `${province} - Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                
                const provinceSelect = document.getElementById("dogProvince");
                if (provinceSelect) {
                    for (let i = 0; i < provinceSelect.options.length; i++) {
                        if (provinceSelect.options[i].text.includes(province)) {
                            provinceSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
                
                showToast(`Location added from ${province} Province`, "success");
            }, function() {
                showToast("Could not get your location", "error");
            });
        });
    }

    const reportForm = document.getElementById("reportForm");
    if (reportForm) {
        reportForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const province = document.getElementById("dogProvince").value;
            const location = document.getElementById("dogLocation").value;
            const status = document.getElementById("dogStatus").value;
            const description = document.getElementById("dogDescription").value;
            
            if (!province || !location || !status || !description) {
                showToast("Please fill in all required fields", "error");
                return;
            }
            
            let lat, lng;
            const provinceCoords = MAP_CONFIG.PROVINCES[province];
            if (provinceCoords) {
                const [southWest, northEast] = provinceCoords;
                lat = southWest[0] + Math.random() * (northEast[0] - southWest[0]);
                lng = southWest[1] + Math.random() * (northEast[1] - southWest[1]);
            } else {
                lat = MAP_CONFIG.DEFAULT_LOCATION[0] + (Math.random() * 0.02 - 0.01);
                lng = MAP_CONFIG.DEFAULT_LOCATION[1] + (Math.random() * 0.02 - 0.01);
            }
            
            const newDog = {
                name: `New Report in ${province}: ${description.substring(0, 30)}...`,
                status: status,
                lat: lat,
                lng: lng,
                description: description,
                province: province
            };
            
            createMarker(newDog.lat, newDog.lng, newDog.name, newDog.status, "dog", newDog.province);
            
            const list = document.getElementById("dogList");
            if (list) {
                const statusIcon = newDog.status === "healthy" ? "fa-check-circle" : 
                                  newDog.status === "sick" ? "fa-exclamation-triangle" : 
                                  "fa-skull-crossbones";
                
                const newItem = document.createElement('div');
                newItem.className = `dog-list-item ${newDog.status}`;
                newItem.innerHTML = `
                    <div class="dog-list-header">
                        <h4><i class="fas ${statusIcon}"></i> ${newDog.name}</h4>
                        <span class="dog-status ${newDog.status}">${newDog.status.toUpperCase()}</span>
                    </div>
                    <p class="dog-description">${newDog.description}</p>
                    <div class="dog-list-footer">
                        <span class="dog-province"><i class="fas fa-map"></i> ${newDog.province}</span>
                        <span class="dog-location">${newDog.lat.toFixed(4)}, ${newDog.lng.toFixed(4)}</span>
                        <button class="btn-view-map" onclick="window.MapManager.focusOnDog(${newDog.lat}, ${newDog.lng})">
                            <i class="fas fa-map-marker-alt"></i> View on Map
                        </button>
                    </div>
                `;
                list.insertBefore(newItem, list.firstChild);
            }
            
            showToast(`Report submitted successfully to ${province} Province database!`, "success");
            reportForm.reset();
            
            setTimeout(() => {
                scrollToSection('map');
            }, 500);
        });
    }
}

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) {
        console.log("Toast:", message);
        return;
    }

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

window.MapManager = {
    getUserLocation,
    searchLocation,
    focusOnDog,
    filterMarkers,
    filterByProvince,
    showToast,
    scrollToSection
};

console.log("Sri Lanka Map module loaded successfully!");