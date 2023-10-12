// ==UserScript==
// @name         Netsuite field enhancements
// @description  Netsuite field enhancements including percentage rounding and adding currency symbols
// @version      2.12
// @match        https://*.app.netsuite.com/app/accounting/transactions/*?id=*
// @exclude     https://*.app.netsuite.com/*&e=T*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=netsuite.com
// @require      http://code.jquery.com/jquery-latest.js
// @author       Mike Linssen
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */


jQuery(function($) {

    function toggleColorRows() {
        colorRowsEnabled = !colorRowsEnabled;
        if (colorRowsEnabled) {
            colorRows();
        } else {
            clearBackgroundColors();
        }
    }

    function toggleHideClosed() {
        hideClosedEnabled = !hideClosedEnabled;
        if (hideClosedEnabled) {
            hideClosed();
        } else {
            showClosed();
        }
    }

    //Hide alert box
    $(".uir-alert-box.warning").hide();

    //Set default values
    var currency = "€ "; //Default currency
    var colorRowsEnabled = true; //Color rows by default
    var hideClosedEnabled = false; //Hide closed rows by default
    var closedRowColor = 'Gainsboro';
    var availableRowcolor = '#c1f7c1';
    var unavailableRowColor = '#fcacac';

    //Define variables
    var divElements = "";
    var tdElements = "";
    var tooltipValues = "";
    var querySelector = "";

    //Check for different currency
    var currencySpan = document.querySelector('div[data-nsps-label="Currency"] span[data-nsps-type="field_input"]')
    if (currencySpan) {
        var spanContent = currencySpan.textContent.trim();
        if (spanContent === "British pound") {
            currency = "£ "
        }
    }

    //Change all header percentage fields
    divElements = document.querySelectorAll('div[data-field-type="percent"]');
    divElements.forEach(function(divElement) {
        var spanElement = divElement.querySelector('span[data-nsps-type="field_input"]');
        var spanContent = parseFloat(spanElement.textContent.replace(',', '.').trim());
        if (!isNaN(spanContent)) {
            var roundedSpanContent = spanContent.toFixed(1).replace('.', ',');
            spanElement.textContent = roundedSpanContent + '%';
        }
    });

    //Change all header currency fields
    divElements = document.querySelectorAll('div[data-field-type="currency"]');
    divElements.forEach(function(divElement) {
        var spanElement = divElement.querySelector('span[data-nsps-type="field_input"]');
        var spanContent = spanElement.textContent.trim()
        if (spanContent != "") {
        spanElement.textContent = currency + spanContent;
        }
    });

    //Change prePayment to add % sign
    var prePaymentSpan = document.querySelector('div[data-nsps-label="Prepayment Percentage"] span[data-nsps-type="field_input"]')
    if (prePaymentSpan) {
        var prePaymentContent = prePaymentSpan.textContent.trim();
        prePaymentSpan.textContent = prePaymentContent + "%";
    }

    //Change sublist currency fields
    tooltipValues = ["LIST PRICE", "RATE", "AMOUNT", "TAX AMT", "GROSS AMT", "EST. EXTENDED COST", "EST. GROSS PROFIT", "PURCHASE PRICE"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    tdElements = document.querySelectorAll(querySelector);
    tdElements.forEach(function(tdElement) {
        var content = tdElement.textContent
            tdElement.textContent = currency + content;
    });

    //Change sublist percentage fields
    tooltipValues = ["LIST PRICE DISCOUNT", "EST. GROSS PROFIT PERCENT"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    tdElements = document.querySelectorAll(querySelector);
    tdElements.forEach(function(tdElement) {
        var content = parseFloat(tdElement.textContent.replace(',', '.').trim());
        if (!isNaN(content)) {
            var roundedContent = content.toFixed(1).replace('.', ',');
            tdElement.textContent = roundedContent + '%';
        }
    });

    function colorRows() {
        //Color complete rows
        var tdCommittedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="COMMITTED"], td.listtext[data-ns-tooltip="COMMITTED"]');
        tdCommittedCells.forEach(function(tdElement) {
            var content = parseFloat(tdElement.textContent.replace(',', '.').trim());
                var trElement = tdElement.closest('tr'); // Find the parent row (tr) element
                if (trElement) {
                    var tdQty = trElement.querySelector('td.listtexthl[data-ns-tooltip="QUANTITY"], td.listtext[data-ns-tooltip="QUANTITY"]'); // Find all td elements in the same row
                        var content2 = parseFloat(tdQty.textContent.replace(',', '.').trim());
                        var tdElementsInRow = trElement.querySelectorAll('td'); // Find all td elements in the same row
                        tdElementsInRow.forEach(function(tdInRow) {
                        if (content2 === content) {
                            tdInRow.style.setProperty('background-color', availableRowcolor, 'important');
                        } else {
                            tdInRow.style.setProperty('background-color', unavailableRowColor, 'important');
                        }
                        });
                }
        });

        //Color closed rows
        var tdClosedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="CLOSED"], td.listtext[data-ns-tooltip="CLOSED"]');
        tdClosedCells.forEach(function(tdElement) {
            var content = tdElement.textContent.trim();
            if (content.toLowerCase().includes('yes')) {
                var trElement = tdElement.closest('tr'); // Find the parent row (tr) element
                if (trElement) {
                    var tdElementsInRow = trElement.querySelectorAll('td'); // Find all td elements in the same row
                    tdElementsInRow.forEach(function(tdInRow) {
                        tdInRow.style.setProperty('background-color', closedRowColor, 'important');
                    });
                }
            }
        });
    };

    function hideClosed() {
        //Hide closed rows
        var tdClosedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="CLOSED"], td.listtext[data-ns-tooltip="CLOSED"]');
        tdClosedCells.forEach(function(tdElement) {
            var content = tdElement.textContent.trim();
            if (content.toLowerCase().includes('yes')) {
                var trElement = tdElement.closest('tr'); // Find the parent row (tr) element
                if (trElement) {
                        trElement.style.setProperty('display', 'none');
                }
            }
        });
    };

    function clearBackgroundColors() {
        // Clear the background colors set by the script
        var tdCells = document.querySelectorAll('td.listtexthl, td.listtext');
        tdCells.forEach(function(tdElement) {
            tdElement.style.removeProperty('background-color');
        });
    }

    function showClosed() {
        // Clear the background colors set by the script
        var tRows = document.querySelectorAll('tr');
        tRows.forEach(function(tRow) {
            tRow.style.removeProperty('display');
        });
    }

// Add a button to toggle the bottom part of the script
var toggleColorRowsButton = $('<button id="toggleColorRowsButton"style="margin: 0 5px 10px 0; padding: 7px; background-color: #607799; color: white; font-size: 14px; border: none; font-weight: 400; border-radius: 3px;">Toggle colored rows</button>');
toggleColorRowsButton.on('click', toggleColorRows);

var toggleHideClosedButton = $('<button id="toggleHideClosedButton" style="margin: 0 5px 10px 0; padding: 7px; background-color: #607799; color: white; font-size: 14px; border: none; font-weight: 400; border-radius: 3px;">Toggle hide closed rows</button>');
toggleHideClosedButton.on('click', toggleHideClosed);

// Find the table element and insert the button just before it
var tableElement = $('table.uir-table-block.uir_form_tab_container');
tableElement.before(toggleColorRowsButton);
tableElement.before(toggleHideClosedButton);

if (colorRowsEnabled) {
    colorRows();
};

if (hideClosedEnabled) {
    hideClosed();
};

});
