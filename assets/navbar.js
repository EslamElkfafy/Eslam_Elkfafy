document.addEventListener('DOMContentLoaded', function () {
    const burgerBtn = document.getElementById('burger-btn');
    const burgerIcon = document.getElementById('burger-icon');
    const mobileNav = document.getElementById('mobile-nav');

    burgerBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('active');
      // Swap icons
      burgerIcon.src = isOpen ? "{{ 'close-burger-icon.svg' | asset_url }}" : "{{ 'burger-icon.svg' | asset_url }}";
    });
  });