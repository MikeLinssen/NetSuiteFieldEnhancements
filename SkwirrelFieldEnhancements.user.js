// ==UserScript==
// @name         Skwirrel
// @version      0.02
// @description  Skwirrel x Econox enhancements
// @author       Mike Linssen
// @match        https://econox.z04.skwirrel.eu/base/categories/sub/edit/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skwirrel.eu
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Define your column widths here (data-col-name: width)
    // Example: "manufacturer_name": "150px"
    const columnWidths = {
        "product_id": "3rem",
        "product_type": "5rem",
        "product_status": "5rem",
        "product_description": "50rem",
        "product_erp_description": "50rem"
        // Add more column names and their respective widths as needed
    };

    // Function to apply widths
    function applyColumnWidths() {
        // Find all th elements that have the data-col-name attribute
        const headers = document.querySelectorAll('th[data-col-name]');

        // Loop through each header
        headers.forEach(header => {
            // Get the column name
            const colName = header.getAttribute('data-col-name');

            // Check if we have a defined width for this column
            if (columnWidths[colName]) {
                // Apply the width as inline style
                header.style.width = columnWidths[colName];

                // Optionally, you might want to add min-width as well for better control
                header.style.minWidth = columnWidths[colName];
            }
        });
    }

    // Initial application when page loads
    window.addEventListener('load', function() {
        console.log('Econox TH Width Customizer: Applying column widths...');
        applyColumnWidths();
    });

    // In case the table is loaded dynamically or updated after page load
    // You may need to use a MutationObserver or set a timeout
    // This is a simple timeout approach
    setTimeout(applyColumnWidths, 1500);

    // Optional: Set up a mutation observer to watch for changes in the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Check if relevant nodes were added
                applyColumnWidths();
            }
        });
    });

    // Start observing once the document body is available
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();