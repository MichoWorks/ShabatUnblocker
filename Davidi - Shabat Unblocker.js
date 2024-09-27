// ==UserScript==
// @name         Davidi - Shabat Unblocker
// @namespace    https://github.com/MichoWorks/ShabatUnblocker
// @version      1.2
// @description  Remove unwanted elements and body classes on www.ddavidi.co.il during Shabbat hours, with popup notification and Shabbat times
// @author       MichoWorks
// @match        https://www.ddavidi.co.il/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    function isShabbat() {
        const now = new Date();
        const day = now.getDay(); // 5 is Friday, 6 is Saturday
        const hour = now.getHours();

        if (day === 5 && hour >= 17) {
            return true; // It's Friday after 17:00
        }
        if (day === 6 && hour < 20) {
            return true; // It's Saturday before 20:00
        }
        return false;
    }

    function removeElements() {
        document.body.className = "";

        const fancyboxContainer = document.getElementById('fancybox-container-1');
        if (fancyboxContainer) {
            fancyboxContainer.style.display = 'none'; // Hide the fancybox container
        }
    }

    function showPopup(candleLighting, havdalah) {
        const now = new Date();
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const currentDate = now.toLocaleDateString('en-GB', options); // Format the date

        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.zIndex = '10000'; // Make sure it's on top of everything
        popup.style.padding = '10px';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        popup.style.borderRadius = '10px';
        popup.style.opacity = '0'; // Start as invisible
        popup.style.transition = 'opacity 0.5s';

        const img = document.createElement('img');
        img.src = 'https://i.ibb.co/H7hmqg4/Black-and-White-Simple-Pirates-Illustration-Gaming-Logo-1.png';
        img.style.width = '450px';
        popup.appendChild(img);

        const timeDiv = document.createElement('div');
        timeDiv.style.color = 'white';
        timeDiv.style.marginTop = '10px';
        timeDiv.innerHTML = `<strong>תאריך:</strong> ${currentDate}<br><strong>כניסת שבת:</strong> ${candleLighting}<br><strong>יציאת שבת:</strong> ${havdalah}`;
        popup.appendChild(timeDiv);

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '1'; // Fade in
        }, 10);

        setTimeout(() => {
            popup.style.opacity = '0'; // Fade out
            setTimeout(() => {
                popup.remove();
            }, 500);
        }, 2000);
    }

    function fetchShabbatTimes() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://raw.githubusercontent.com/MichoWorks/ShabatUnblocker/refs/heads/main/Shabat2024_2027.csv",
            onload: function(response) {
                const data = response.responseText.split('\n');
                const currentDate = new Date().toLocaleDateString('he-IL'); // Get current date in dd/mm/yyyy format
                let candleLighting = '';
                let havdalah = '';

                for (let i = 0; i < data.length; i++) {
                    const columns = data[i].split(',');

                    // Check for candle lighting
                    if (columns[0].includes('הדלקת נרות') && columns[1] === currentDate) {
                        candleLighting = columns[2]; // Get the START TIME
                    }

                    // Check for havdalah
                    if (columns[0].includes('הבדלה') && columns[1] === currentDate) {
                        havdalah = columns[2]; // Get the START TIME
                    }
                }

                showPopup(candleLighting, havdalah);
            }
        });
    }

    window.addEventListener('load', function() {
        if (isShabbat()) {
            removeElements();
            fetchShabbatTimes();

            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        removeElements();
                    }
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
    });
})();
