htmx.onLoad(function() {
    const form = document.querySelector('#creationCompteForm');
    
    const password1 = form.querySelector("#password");
    const password2 = form.querySelector("#passwordConf");
    
    // Function to check if passwords match
    function checkPasswordsMatch() {
        if (password1.value === password2.value) {
            password2.setCustomValidity('');
            return true;
        } else {
            password2.setCustomValidity('Les mots de passe ne correspondent pas');
            return false;
        }
    }
    
    // Add event listeners to password fields
    password1.addEventListener('change', checkPasswordsMatch);
    password2.addEventListener('input', checkPasswordsMatch);
    
    // Add form submission handler
    form.addEventListener('submit', function(event) {
        // Validate passwords match before submission
        if (!checkPasswordsMatch()) {
            event.preventDefault();
            password2.reportValidity();
        }
        
        // Could add additional validation here if needed
    });
    
    checkPasswordsMatch();
});
