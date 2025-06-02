document.addEventListener('DOMContentLoaded', function() {
    const navHome = document.getElementById('nav-home');
    const navRequests = document.getElementById('nav-requests');
    const navOffers = document.getElementById('nav-offers');
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');
    
    const navProfile = document.getElementById('nav-profile');
    const navCreateRequest = document.getElementById('nav-create-request');
    const navCreateOffer = document.getElementById('nav-create-offer');
    const navConversations = document.getElementById('nav-conversations');
    const navLogout = document.getElementById('nav-logout');
    const logoutLink = document.getElementById('logout-link');

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('mockToken');

    // Ensure all elements exist before trying to set display style
    if (userId && token) { // Logged-in state
        if (navLogin) navLogin.style.display = 'none';
        if (navSignup) navSignup.style.display = 'none';

        if (navProfile) navProfile.style.display = 'inline-block'; // or 'list-item' or 'block' depending on CSS
        if (navCreateRequest) navCreateRequest.style.display = 'inline-block';
        if (navCreateOffer) navCreateOffer.style.display = 'inline-block';
        if (navConversations) navConversations.style.display = 'inline-block';
        if (navLogout) navLogout.style.display = 'inline-block';
        
        // Common links visible to both states, ensure they are shown if hidden by default
        if (navHome) navHome.style.display = 'inline-block';
        if (navRequests) navRequests.style.display = 'inline-block';
        if (navOffers) navOffers.style.display = 'inline-block';

    } else { // Logged-out state
        if (navLogin) navLogin.style.display = 'inline-block';
        if (navSignup) navSignup.style.display = 'inline-block';

        if (navProfile) navProfile.style.display = 'none';
        if (navCreateRequest) navCreateRequest.style.display = 'none';
        if (navCreateOffer) navCreateOffer.style.display = 'none';
        if (navConversations) navConversations.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';

        // Common links visible to both states
        if (navHome) navHome.style.display = 'inline-block';
        if (navRequests) navRequests.style.display = 'inline-block';
        if (navOffers) navOffers.style.display = 'inline-block';
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('userId');
            localStorage.removeItem('mockToken');
            // Optionally, could also clear other app-specific localStorage items
            window.location.href = 'login.html';
        });
    }
});
