function getInitials(name) {
    if (!name) return 'US';
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function isUserLoggedIn() {
    const userName = localStorage.getItem('userName');
    return userName && userName !== 'Deshan Silva';
}

function getCurrentUser() {
    const userName = localStorage.getItem('userName');
    
    if (userName === 'Deshan Silva') {
        return {
            role: 'guest',
            name: 'Guest User',
            email: 'guest@example.com',
            type: 'guest',
            location: 'Unknown',
            phone: '',
            bio: ''
        };
    }
    
    return {
        role: localStorage.getItem('userRole') || 'community_member',
        name: userName || 'Guest User',
        email: localStorage.getItem('userEmail') || 'guest@example.com',
        type: localStorage.getItem('userType') || 'volunteer',
        location: localStorage.getItem('userLocation') || 'Unknown',
        phone: localStorage.getItem('userPhone') || '',
        bio: localStorage.getItem('userBio') || ''
    };
}

function logoutUser() {
    const keys = [
        'userRole', 'userName', 'userEmail', 'userType', 'userLocation', 
        'userPhone', 'userBio', 'profileImage', 'userReports', 'userPoints',
        'userRank', 'userBadges', 'rememberMe', 'storedEmail',
        'loginSuccess', 'signupSuccess', 'logoutSuccess',
        'adminViewingUserInterface', 'adminViewingStaffDashboard',
        'adminViewingAsStaff', 'adminOriginalView',
        'userReturnToStaffDashboard'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    window.location.href = 'index.html';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = 'toast';
        document.body.appendChild(newToast);
    }
    
    const toastElement = document.getElementById('toast');
    toastElement.textContent = message;
    toastElement.className = 'toast show';
    toastElement.classList.add(type);
    
    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.classList.remove(type), 300);
    }, 3000);
}

function renderAuthButtons() {
    const authButtonsContainer = document.getElementById('authButtonsContainer');
    if (!authButtonsContainer) return;
    
    const user = getCurrentUser();
    const isAdminViewingUI = localStorage.getItem('adminViewingUserInterface') === 'true';
    const isAdminViewingStaff = localStorage.getItem('adminViewingStaffDashboard') === 'true';
    const isAdminViewingAsStaff = localStorage.getItem('adminViewingAsStaff') === 'true';
    const shouldReturnToStaff = localStorage.getItem('userReturnToStaffDashboard') === 'true';
    
    if (isUserLoggedIn() || isAdminViewingUI || isAdminViewingStaff || isAdminViewingAsStaff) {
        const userName = localStorage.getItem('userName') || 'Admin';
        const initials = getInitials(userName);
        const profileImage = localStorage.getItem('profileImage');
        const userRole = localStorage.getItem('userRole');
        const userType = localStorage.getItem('userType');
        
        let extraMenuItems = '';
        let navLinks = '';
        
        const isStaff = userRole === 'admin' || 
                       userType === 'veterinarian' || 
                       userType === 'animal_rescue' || 
                       userType === 'health_officer';
        
        if (isStaff || shouldReturnToStaff) {
            navLinks = `
                <li><a href="staff-dashboard.html"><i class="fas fa-user-md"></i> Staff Dashboard</a></li>
            `;
            
            extraMenuItems = `
                <div class="dropdown-divider"></div>
                <a href="staff-dashboard.html" class="dropdown-item">
                    <i class="fas fa-user-md"></i> Staff Dashboard
                </a>
            `;
        }
        
        if (isAdminViewingUI) {
            extraMenuItems = `
                <div class="dropdown-divider"></div>
                <a href="admin-dashboard.html" class="dropdown-item">
                    <i class="fas fa-user-shield"></i> Admin Dashboard
                </a>
                <a href="staff-dashboard.html" class="dropdown-item">
                    <i class="fas fa-user-md"></i> Staff Dashboard
                </a>
            `;
        } else if (isAdminViewingStaff || isAdminViewingAsStaff) {
            extraMenuItems = `
                <div class="dropdown-divider"></div>
                <a href="admin-dashboard.html" class="dropdown-item">
                    <i class="fas fa-user-shield"></i> Admin Dashboard
                </a>
                <a href="dashboard.html" class="dropdown-item">
                    <i class="fas fa-users"></i> User Interface
                </a>
            `;
        } else if (userRole === 'admin') {
            extraMenuItems = `
                <div class="dropdown-divider"></div>
                <a href="staff-dashboard.html" class="dropdown-item">
                    <i class="fas fa-user-md"></i> Staff Dashboard
                </a>
                <a href="dashboard.html" class="dropdown-item">
                    <i class="fas fa-users"></i> User Interface
                </a>
            `;
        }
        
        authButtonsContainer.innerHTML = `
            <div class="user-dropdown">
                <div class="user-dropdown-toggle">
                    <div class="user-avatar-small">
                        ${profileImage ? `<img src="${profileImage}" alt="Profile">` : initials}
                    </div>
                    <span class="user-name">${userName}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="user-dropdown-menu">
                    <a href="dashboard.html" class="dropdown-item">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="myprofile.html" class="dropdown-item">
                        <i class="fas fa-user"></i> My Profile
                    </a>
                    <a href="myreports.html" class="dropdown-item">
                        <i class="fas fa-flag"></i> My Reports
                    </a>
                    <a href="settings.html" class="dropdown-item">
                        <i class="fas fa-cog"></i> Settings
                    </a>
                    ${extraMenuItems}
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;
        
        const dropdownToggle = document.querySelector('.user-dropdown-toggle');
        const dropdownMenu = document.querySelector('.user-dropdown-menu');
        
        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            document.addEventListener('click', function() {
                dropdownMenu.classList.remove('show');
            });
            
            dropdownMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
                showToast('Logged out successfully!', 'success');
            });
        }
        
        const nav = document.querySelector('nav ul');
        if (nav && navLinks) {
            const existingStaffLink = nav.querySelector('a[href="staff-dashboard.html"]');
            if (!existingStaffLink && isStaff) {
                const li = document.createElement('li');
                li.innerHTML = `<a href="staff-dashboard.html"><i class="fas fa-user-md"></i> Staff</a>`;
                nav.appendChild(li);
            }
        }
    } else {
        authButtonsContainer.innerHTML = `
            <div class="auth-buttons">
                <a href="login.html" class="btn btn-outline"><i class="fas fa-sign-in-alt"></i> Login</a>
                <a href="signup.html" class="btn btn-primary"><i class="fas fa-user-plus"></i> Sign Up</a>
            </div>
        `;
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function checkStaffAccess() {
    const userRole = localStorage.getItem('userRole');
    const userType = localStorage.getItem('userType');
    const isAdminViewing = localStorage.getItem('adminViewingStaffDashboard') === 'true';
    const isAdminViewingAsStaff = localStorage.getItem('adminViewingAsStaff') === 'true';
    const shouldReturnToStaff = localStorage.getItem('userReturnToStaffDashboard') === 'true';
    
    if (!localStorage.getItem('userName') || localStorage.getItem('userName') === 'Deshan Silva') {
        if (!isAdminViewing && !isAdminViewingAsStaff && !shouldReturnToStaff) {
            showToast('Access denied. Please login first.', 'error');
            window.location.href = 'login.html';
            return false;
        }
    }
    
    if (!userRole || (userRole !== 'admin' && 
                      userType !== 'veterinarian' && 
                      userType !== 'animal_rescue' && 
                      userType !== 'health_officer')) {
        if (!isAdminViewing && !isAdminViewingAsStaff && !shouldReturnToStaff) {
            showToast('Staff access required. Please contact administrator.', 'error');
            window.location.href = 'login.html';
            return false;
        }
    }
    
    return true;
}

function checkAdminAccess() {
    const userRole = localStorage.getItem('userRole');
    const isAdminViewingAsStaff = localStorage.getItem('adminViewingAsStaff') === 'true';
    
    if (!userRole || (userRole !== 'admin' && !isAdminViewingAsStaff)) {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

function setReturnToStaffFlag() {
    localStorage.setItem('userReturnToStaffDashboard', 'true');
}

function clearReturnToStaffFlag() {
    localStorage.removeItem('userReturnToStaffDashboard');
}

function clearAdminViewingFlags() {
    localStorage.removeItem('adminViewingAsStaff');
    localStorage.removeItem('adminOriginalView');
}

function checkStaffRedirect() {
    const shouldReturn = localStorage.getItem('userReturnToStaffDashboard') === 'true';
    const currentPage = window.location.pathname;
    
    if (shouldReturn && currentPage.includes('dashboard.html') && !currentPage.includes('admin-dashboard.html') && !currentPage.includes('staff-dashboard.html')) {
        const userRole = localStorage.getItem('userRole');
        const userType = localStorage.getItem('userType');
        
        const isStaff = userRole === 'admin' || 
                       userType === 'veterinarian' || 
                       userType === 'animal_rescue' || 
                       userType === 'health_officer';
        
        if (isStaff) {
            showToast('Redirecting to Staff Dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'staff-dashboard.html';
            }, 1500);
        } else {
            clearReturnToStaffFlag();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkStaffRedirect();
    
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
        enableAdminEditing();
    }
    
    restoreEditedContent();
    
    if (typeof setupAdminNavigation === 'function') {
        setupAdminNavigation();
    }
});

function enableAdminEditing() {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    
    if (isAdmin) {
        document.addEventListener('dblclick', function(e) {
            if (isAdmin && e.target.classList.contains('editable')) {
                e.target.contentEditable = true;
                e.target.focus();
                e.target.classList.add('editing');
            }
        });
        
        document.addEventListener('blur', function(e) {
            if (e.target.classList.contains('editable')) {
                e.target.contentEditable = false;
                e.target.classList.remove('editing');
                saveContentChanges(e.target);
            }
        }, true);
    }
}

function saveContentChanges(element) {
    const elementId = element.id || element.className;
    const content = element.innerHTML;
    
    localStorage.setItem(`edited_${elementId}`, content);
    showToast('Changes saved!', 'success');
}

function restoreEditedContent() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('edited_')) {
            const elementId = key.replace('edited_', '');
            const content = localStorage.getItem(key);
            
            let element = document.getElementById(elementId);
            if (!element) {
                element = document.querySelector(`.${elementId}`);
            }
            
            if (element) {
                element.innerHTML = content;
            }
        }
    });
}

function setupAdminNavigation() {
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';
    const isAdminViewingAsStaff = localStorage.getItem('adminViewingAsStaff') === 'true';
    
    if (isAdmin || isAdminViewingAsStaff) {
        const nav = document.querySelector('nav ul');
        if (nav) {
            const currentPage = window.location.pathname;
            const existingAdminLink = nav.querySelector('a[href="admin-dashboard.html"]');
            if (!existingAdminLink && !currentPage.includes('admin-dashboard.html')) {
                const li = document.createElement('li');
                li.innerHTML = '<a href="admin-dashboard.html"><i class="fas fa-user-shield"></i> Admin</a>';
                nav.appendChild(li);
            }
            
            const existingStaffLink = nav.querySelector('a[href="staff-dashboard.html"]');
            if (!existingStaffLink && !currentPage.includes('staff-dashboard.html')) {
                const li = document.createElement('li');
                li.innerHTML = '<a href="staff-dashboard.html"><i class="fas fa-user-md"></i> Staff View</a>';
                nav.appendChild(li);
            }
        }
    }
}