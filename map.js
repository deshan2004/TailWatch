
let map;
let markers = [];
let currentInfoWindow = null;
let autocomplete;
let userLocation = null;
let mapInitialized = false;


const sampleDogs = [
    {
        id: 1,
        name: "Buddy",
        status: "healthy",
        location: "Galle Face Green, Colombo",
        lat: 6.9271,
        lng: 79.8412,
        description: "Friendly brown dog with white patches, often seen near food stalls",
        reportedDate: "2023-10-15",
        reporter: "User123",
        photo: null
    },
    {
        id: 2,
        name: "Max",
        status: "sick",
        location: "Viharamahadevi Park, Colombo",
        lat: 6.9107,
        lng: 79.8618,
        description: "Thin black dog with limping back leg",
        reportedDate: "2023-10-14",
        reporter: "DogLover456",
        photo: null
    },
    {
        id: 3,
        name: "Unknown",
        status: "rabid",
        location: "Borella Junction, Colombo",
        lat: 6.9265,
        lng: 79.8785,
        description: "Aggressive white dog, foaming at mouth, avoid area",
        reportedDate: "2023-10-12",
        reporter: "SafetyFirst",
        photo: null
    }
];


function initApp() {
    
    if (typeof google === 'undefined') {
        showMapFallback();
        showToast('Google Maps failed to load. Please check your internet connection.', 'error');
        return;
    }
    
    initMap();
    initEventListeners();
    initAutocomplete();
    loadDogList();
    animateStats();
    createFloatingElements();
}


function initMap() {
    try {
        
        const defaultLocation = { lat: 6.9271, lng: 79.8612 };
        
        const mapOptions = {
            zoom: 12,
            center: defaultLocation,
            styles: getMapStyles(),
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        };
        
        map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);
        mapInitialized = true;
        
        
        addDogMarkers(sampleDogs);
        
        
        getUserLocation();
        
    } catch (error) {
        console.error('Error initializing map:', error);
        showMapFallback();
        showToast('Error loading map. Please refresh the page.', 'error');
    }
}


function showMapFallback() {
    const mapContainer = document.getElementById('googleMap');
    mapContainer.innerHTML = `
        <div class="map-loading">
            <div class="spinner"></div>
            <h3>Map Loading...</h3>
            <p>If the map doesn't load, please check your internet connection</p>
            <button onclick="location.reload()" class="btn btn-primary">
                <i class="fas fa-redo"></i> Reload Map
            </button>
        </div>
    `;
}


function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
            
                if (map && mapInitialized) {
                    map.setCenter(userLocation);
                    
                    
                    new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" fill="#3498db" stroke="white" stroke-width="2"/>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(20, 20),
                            anchor: new google.maps.Point(10, 10)
                        },
                        title: 'Your Location'
                    });
                    
                    showToast('Map centered on your location', 'success');
                }
            },
            function(error) {
                console.log('Geolocation error:', error);
                let errorMessage = 'Could not retrieve your location. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access was denied.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                
                showToast(errorMessage, 'warning');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        showToast('Geolocation is not supported by your browser.', 'warning');
    }
}

function getMapStyles() {
    return [
        {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{"weight": "2.00"}]
        },
        {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#9c9c9c"}]
        },
        {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{"visibility": "on"}]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#ffffff"}]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": -100}, {"lightness": 45}]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#eeeeee"}]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#7b7b7b"}]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#ffffff"}]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
        }
    ];
}


function initAutocomplete() {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        const input = document.getElementById('locationSearch');
        autocomplete = new google.maps.places.Autocomplete(input);
        
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                showToast('No details available for this location.', 'warning');
                return;
            }
            
            if (map && mapInitialized) {
                map.setCenter(place.geometry.location);
                map.setZoom(15);
                showToast(`Location set to: ${place.name}`, 'success');
            }
        });
    }
}


function addDogMarkers(dogs) {
    
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    dogs.forEach(dog => {
        const marker = new google.maps.Marker({
            position: { lat: dog.lat, lng: dog.lng },
            map: map,
            title: dog.name,
            icon: getMarkerIcon(dog.status)
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(dog)
        });
        
        marker.addListener('click', () => {
            if (currentInfoWindow) {
                currentInfoWindow.close();
            }
            infoWindow.open(map, marker);
            currentInfoWindow = infoWindow;
        });
        
        markers.push(marker);
    });
}


function getMarkerIcon(status) {
    const baseIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="${getStatusColor(status)}" stroke="white" stroke-width="2"/>
                <text x="15" y="20" text-anchor="middle" fill="white" font-size="12">🐾</text>
            </svg>
        `),
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 15)
    };
    return baseIcon;
}


function getStatusColor(status) {
    switch(status) {
        case 'healthy': return '#2ecc71';
        case 'sick': return '#f39c12';
        case 'rabid': return '#e74c3c';
        default: return '#3498db';
    }
}


function createInfoWindowContent(dog) {
    return `
        <div class="dog-info-window">
            <div class="dog-header">
                <h3>${dog.name}</h3>
                <span class="status-badge" style="background: ${getStatusColor(dog.status)}">${dog.status.toUpperCase()}</span>
            </div>
            <div class="dog-details">
                <p><strong>Location:</strong> ${dog.location}</p>
                <p><strong>Description:</strong> ${dog.description}</p>
                <p><strong>Reported:</strong> ${dog.reportedDate} by ${dog.reporter}</p>
            </div>
            <div class="dog-actions">
                <button class="btn-report" onclick="reportSimilarDog('${dog.location}')">
                    <i class="fas fa-flag"></i> Report Similar
                </button>
                <button class="btn-details" onclick="showDogDetails(${dog.id})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `;
}


function filterDogs(status) {
    const filteredDogs = status === 'all' ? sampleDogs : sampleDogs.filter(dog => dog.status === status);
    addDogMarkers(filteredDogs);
    updateDogList(filteredDogs);
}


function loadDogList() {
    updateDogList(sampleDogs);
}


function updateDogList(dogs) {
    const dogList = document.getElementById('dogList');
    dogList.innerHTML = '';
    
    dogs.forEach(dog => {
        const listItem = document.createElement('div');
        listItem.className = 'dog-list-item';
        listItem.innerHTML = `
            <div class="dog-avatar ${dog.status}">
                <i class="fas fa-dog"></i>
            </div>
            <div class="dog-info">
                <h4>${dog.name}</h4>
                <span class="dog-status ${dog.status}">${dog.status.toUpperCase()}</span>
                <p class="dog-location">${dog.location}</p>
                <p class="dog-date">Reported: ${dog.reportedDate}</p>
            </div>
            <div class="dog-action">
                <button onclick="centerOnDog(${dog.lat}, ${dog.lng})" title="View on Map">
                    <i class="fas fa-map-marker-alt"></i>
                </button>
            </div>
        `;
        dogList.appendChild(listItem);
    });
}


function centerOnDog(lat, lng) {
    if (map && mapInitialized) {
        map.setCenter({ lat, lng });
        map.setZoom(16);
    }
}


function initEventListeners() {
    
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterDogs(filter);
            
    
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    

    const currentLocationBtn = document.getElementById('currentLocationBtn');
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', function() {
            if (userLocation && mapInitialized) {
                map.setCenter(userLocation);
                map.setZoom(15);
                showToast('Map centered on your location', 'success');
            } else {
                showToast('Location not available. Please enable location services.', 'error');
            }
        });
    }
    
    
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReport();
        });
    }
    
    
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.addEventListener('click', function() {
            if (userLocation) {
                
                const button = this;
                const originalText = button.innerHTML;
                button.innerHTML = '<div class="loading-spinner"></div> Getting location...';
                button.disabled = true;
                
                
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: userLocation }, function(results, status) {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('dogLocation').value = results[0].formatted_address;
                        showToast('Location set to your current position', 'success');
                    } else {
                        document.getElementById('dogLocation').value = `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
                        showToast('Could not get address. Using coordinates.', 'warning');
                    }
                    
                
                    button.innerHTML = originalText;
                    button.disabled = false;
                });
            } else {
                showToast('Location not available. Please enable location services.', 'error');
            }
        });
    }
    
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('dogPhoto');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileInfo = uploadArea.querySelector('.file-info');
                const file = this.files[0];
                
                
                if (file.size > 5 * 1024 * 1024) {
                    showToast('File size must be less than 5MB', 'error');
                    this.value = '';
                    fileInfo.textContent = 'No file selected';
                    return;
                }
                
                
                if (!file.type.startsWith('image/')) {
                    showToast('Please select an image file', 'error');
                    this.value = '';
                    fileInfo.textContent = 'No file selected';
                    return;
                }
                
                fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                uploadArea.style.borderColor = '#3498db';
                uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
            }
        });
        
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#3498db';
            this.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.style.borderColor = '#eaeaea';
            this.style.backgroundColor = '#f9f9f9';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#3498db';
            this.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        });
    }
    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                scrollToSection(targetId.substring(1));
            }
        });
    });
    
    
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        }
    });
    

    const alertBanner = document.querySelector('.alert-banner');
    if (alertBanner) {
        setTimeout(() => {
            alertBanner.style.display = 'none';
        }, 10000); // Hide after 10 seconds
        
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '15px';
        closeButton.style.top = '50%';
        closeButton.style.transform = 'translateY(-50%)';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', function() {
            alertBanner.style.display = 'none';
        });
        
        alertBanner.style.position = 'relative';
        alertBanner.appendChild(closeButton);
    }
}


function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const offsetTop = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}


function submitReport() {
    const form = document.getElementById('reportForm');
    const formData = new FormData(form);
    
    
    const location = document.getElementById('dogLocation').value;
    const status = document.getElementById('dogStatus').value;
    const description = document.getElementById('dogDescription').value;
    
    if (!location || !status || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading-spinner"></div> Submitting...';
    submitButton.disabled = true;
    
    
    setTimeout(() => {
        
        const newDog = {
            id: sampleDogs.length + 1,
            name: 'New Report',
            status: status,
            location: location,
            lat: userLocation ? userLocation.lat : 6.9271 + (Math.random() - 0.5) * 0.1,
            lng: userLocation ? userLocation.lng : 79.8612 + (Math.random() - 0.5) * 0.1,
            description: description,
            reportedDate: new Date().toISOString().split('T')[0],
            reporter: 'Current User',
            photo: null
        };
        
        
        sampleDogs.push(newDog);
        
        
        addDogMarkers(sampleDogs);
        updateDogList(sampleDogs);
        
        
        showToast('Report submitted successfully! Thank you for helping your community.', 'success');
        
        
        form.reset();
        const fileInfo = document.querySelector('.file-info');
        if (fileInfo) fileInfo.textContent = 'No file selected';
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.borderColor = '#eaeaea';
            uploadArea.style.backgroundColor = '#f9f9f9';
        }
        
        
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        
        scrollToSection('map');
        
    }, 2000);
}


function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                animateNumber(statNumber, 0, target, 2000);
                observer.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}


function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


function createFloatingElements() {
    const floatingContainer = document.querySelector('.floating-elements');
    if (!floatingContainer) return;
    
    
    for (let i = 0; i < 8; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.style.width = `${Math.random() * 80 + 40}px`;
        element.style.height = element.style.width;
        element.style.top = `${Math.random() * 100}%`;
        element.style.left = `${Math.random() * 100}%`;
        element.style.animationDelay = `${Math.random() * -20}s`;
        floatingContainer.appendChild(element);
    }
}


function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show';
    toast.classList.add(type);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.remove(type), 300);
    }, 4000);
}


function showApiKeyInstructions() {
    const instructions = `
        To enable the interactive map:
        
        1. Go to Google Cloud Console (https://console.cloud.google.com/)
        2. Create a new project or select existing one
        3. Enable Maps JavaScript API and Places API
        4. Create an API key
        5. Replace "YOUR_API_KEY" in the script tag with your actual API key
        
        Note: Make sure to restrict your API key for security.
    `;
    
    alert(instructions);
}


function reportSimilarDog(location) {
    document.getElementById('dogLocation').value = location;
    scrollToSection('report');
    showToast('Location pre-filled. Please complete the report form.', 'info');
}
function showDogDetails(dogId) {
    const dog = sampleDogs.find(d => d.id === dogId);
    if (dog) {
        const details = `
            Dog Details:
            Name: ${dog.name}
            Status: ${dog.status}
            Location: ${dog.location}
            Description: ${dog.description}
            Reported: ${dog.reportedDate} by ${dog.reporter}
        `;
        alert(details);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    
    if (typeof google === 'undefined') {
        
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initApp';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        initApp();
    }
});


window.initApp = initApp;
window.filterDogs = filterDogs;
window.centerOnDog = centerOnDog;
window.scrollToSection = scrollToSection;
window.showApiKeyInstructions = showApiKeyInstructions;
window.reportSimilarDog = reportSimilarDog;
window.showDogDetails = showDogDetails;
