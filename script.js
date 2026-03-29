// 1. Firebase libraries import කිරීම
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. ඔයාගේ Firebase Config එක (මෙහි ඇත්තේ උදාහරණයක් පමණි, ඔයාගේ එක මීට වඩා වෙනස් විය හැක)
const firebaseConfig = {
    apiKey: "AIzaSyC9...",
    authDomain: "tailwatch-71333.firebaseapp.com",
    projectId: "tailwatch-71333",
    storageBucket: "tailwatch-71333.firebasestorage.app",
    messagingSenderId: "749007965376",
    appId: "1:749007965376:web:3164db7c22225632017125"
};

// 3. Firebase Initialize කිරීම
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// මෙතැනින් පහළට ඔයා දුන්නු ROLES, PERMISSIONS සහ අනිත් functions ටික තියාගන්න...
const ROLES = {
    USER: 'user',
    STAFF: 'staff',
    ADMIN: 'admin',
    PROVINCIAL_ADMIN: 'provincial_admin'
};

const PROVINCIAL_PERMISSIONS = {
    'Western': ['Western'],
    'Central': ['Central'],
    'Southern': ['Southern'],
    'Northern': ['Northern'],
    'Eastern': ['Eastern'],
    'North Western': ['North Western'],
    'North Central': ['North Central'],
    'Uva': ['Uva'],
    'Sabaragamuwa': ['Sabaragamuwa']
};

function checkAccess(requiredRole, requiredProvince = null) {
    const userRole = localStorage.getItem('userRole') || ROLES.USER;
    const userProvince = localStorage.getItem('userProvince');
    
    if (userRole !== requiredRole) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (requiredProvince && userRole === ROLES.PROVINCIAL_ADMIN) {
        if (!PROVINCIAL_PERMISSIONS[userProvince] || 
            !PROVINCIAL_PERMISSIONS[userProvince].includes(requiredProvince)) {
            showToast('Access denied. Provincial admin access only.', 'error');
            window.location.href = 'index.html';
            return false;
        }
    }
    
    return true;
}

if (window.location.pathname.includes('admin')) {
    if (!checkAccess(ROLES.ADMIN)) {
        showToast('Access denied. National admin only.', 'error');
    }
}

if (window.location.pathname.includes('staff')) {
    if (!checkAccess(ROLES.STAFF)) {
        showToast('Staff access required.', 'error');
    }
}

if (window.location.pathname.includes('provincial')) {
    const province = window.location.pathname.split('/').pop().replace('.html', '');
    if (!checkAccess(ROLES.PROVINCIAL_ADMIN, province)) {
        showToast(`Access denied. ${province} Province admin only.`, 'error');
    }
}

function checkUserInSriLanka() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                const inSriLanka = lat >= 5.916 && lat <= 9.826 && 
                                   lng >= 79.517 && lng <= 81.878;
                
                if (!inSriLanka) {
                    console.log('User appears to be outside Sri Lanka');
                }
                
                return inSriLanka;
            },
            function() {
                console.log('Could not determine location');
                return true; 
            }
        );
    }
    return true;
}

function isValidSriLankanPhone(phone) {
    const sriLankanPhoneRegex = /^(?:\+94|0)?(?:7[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|8[1-9]|9[0-9])[0-9]{6}$/;
    return sriLankanPhoneRegex.test(phone.replace(/\s+/g, ''));
}

function isValidSriLankanLocation(location) {
    const sriLankanCities = [
        'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Trincomalee', 'Matara',
        'Negombo', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Ratnapura',
        'Kurunegala', 'Puttalam', 'Batticaloa', 'Mannar', 'Vavuniya',
        'Hambantota', 'Kalutara', 'Gampaha', 'Matale', 'Nuwara Eliya',
        'Kegalle', 'Monaragala', 'Kilinochchi', 'Mullaitivu', 'Ampara'
    ];
    
    return sriLankanCities.some(city => 
        location.toLowerCase().includes(city.toLowerCase())
    ) || /^(lat|lng|latitude|longitude)/i.test(location);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log(message);
        return;
    }
    
    toast.textContent = message;
    toast.className = 'toast show';
    toast.classList.add(type);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.remove(type), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('report') || 
        window.location.pathname.includes('submit')) {
        checkUserInSriLanka();
    }
    
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidSriLankanPhone(this.value)) {
                showToast('Please enter a valid Sri Lankan phone number', 'error');
                this.focus();
            }
        });
    });
    
    const locationInputs = document.querySelectorAll('input[name="location"], #dogLocation');
    locationInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidSriLankanLocation(this.value)) {
                showToast('Please enter a valid Sri Lankan location', 'warning');
            }
        });
    });
});