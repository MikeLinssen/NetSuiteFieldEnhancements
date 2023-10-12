// ==UserScript==
// @name         Netsuite field enhancements
// @description  Netsuite field enhancements including row coloring, percentage rounding and adding currency symbols
// @version      2.30
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
    var closedRowColor = 'LightGray';
    var completedRowColor = 'Gainsboro';
    var availableRowcolor = '#c1f7c1';
    var unavailableRowColor = '#fcacac';

    //Define variables
    var divElements = "";
    var tdElements = "";
    var tooltipValues = "";
    var querySelector = "";

    //Check for different currency
    var currencySpan = document.querySelector('div[data-walkthrough="Field:currency"] span[data-nsps-type="field_input"]')
    if (currencySpan) {
        var spanContent = currencySpan.textContent.trim();
        if (spanContent === "British pound") {
            currency = "£ "
        }
    }

    //Color credit limit
    var creditBalanceSpan = document.querySelector('div[data-walkthrough="Field:balance"] span[data-nsps-type="field_input"]');
    var creditLimitSpan = document.querySelector('div[data-walkthrough="Field:custbody_customer_credit_limit"] span[data-nsps-type="field_input"]');
    if (creditBalanceSpan && creditLimitSpan) {
        var creditBalanceContent = parseFloat(creditBalanceSpan.textContent.replace(',', '.').trim());
        var creditLimitContent = parseFloat(creditLimitSpan.textContent.replace(',', '.').trim());
        if (creditBalanceContent > creditLimitContent) {
            creditBalanceSpan.style.setProperty('background-color', 'yellow');
            creditBalanceSpan.style.setProperty('font-weight', 'bold');
            creditBalanceSpan.style.setProperty('color', 'red', 'important');
        }
    }

    //Color max refund
    var maxRefundSpan = document.querySelector('div[data-walkthrough="Field:custbody_refpay_maximum_refund_amount"] span[data-nsps-type="field_input"]');
    if (maxRefundSpan) {
        var maxRefundContent = parseFloat(maxRefundSpan.textContent.replace(',', '.').trim());
        if (maxRefundContent > 0) {
            maxRefundSpan.style.setProperty('background-color', 'yellow');
            maxRefundSpan.style.setProperty('font-weight', 'bold');
            maxRefundSpan.style.setProperty('color', 'red', 'important');
        }
    }

    //Color max payment
    var maxPaymentSpan = document.querySelector('div[data-walkthrough="Field:custbody_refpay_maximum_pay_amount"] span[data-nsps-type="field_input"]');
    if (maxPaymentSpan) {
        var maxPaymentContent = parseFloat(maxPaymentSpan.textContent.replace(',', '.').trim());
        if (maxPaymentContent > 0) {
            maxPaymentSpan.style.setProperty('background-color', 'yellow');
            maxPaymentSpan.style.setProperty('font-weight', 'bold');
            maxPaymentSpan.style.setProperty('color', 'red', 'important');
        }
    }

    //Color gross margin percent
    var grossMarginSpan = document.querySelector('div[data-walkthrough="Field:estgrossprofitpercent"] span[data-nsps-type="field_input"]');
    if (grossMarginSpan) {
        var grossMarginContent = parseFloat(grossMarginSpan.textContent.replace(',', '.').trim());
        if (grossMarginContent < 20) {
            grossMarginSpan.style.setProperty('font-weight', 'bold');
            grossMarginSpan.style.setProperty('color', 'red', 'important');
        } else if (grossMarginContent < 30) {
            grossMarginSpan.style.setProperty('font-weight', 'bold');
            grossMarginSpan.style.setProperty('color', 'DarkOrange', 'important');
        } else {
            grossMarginSpan.style.setProperty('color', 'Green', 'important');
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

    //Change specific sublist currency fields
    tooltipValues = ["LIST PRICE", "RATE", "AMOUNT", "TAX AMT", "GROSS AMT", "EST. EXTENDED COST", "EST. GROSS PROFIT", "PURCHASE PRICE"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    tdElements = document.querySelectorAll(querySelector);
    tdElements.forEach(function(tdElement) {
        var content = tdElement.textContent
            tdElement.textContent = currency + content;
    });

    //Change specific sublist percentage fields
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
        //Color complete rows (sales order)
        var tdCommittedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="COMMITTED"], td.listtext[data-ns-tooltip="COMMITTED"]');
        tdCommittedCells.forEach(function(tdElement) {
            var quantityCommitted = parseFloat(tdElement.textContent.replace(',', '.').trim());
            var trElement = tdElement.closest('tr'); // Find the parent row (tr) element
            if (trElement) {
                var tdQty = trElement.querySelector('td.listtexthl[data-ns-tooltip="QUANTITY"], td.listtext[data-ns-tooltip="QUANTITY"]');
                var quantity = parseFloat(tdQty.textContent.replace(',', '.').trim());
                var tdFul = trElement.querySelector('td.listtexthl[data-ns-tooltip="FULFILLED"], td.listtext[data-ns-tooltip="FULFILLED"]');
                var quantityFulfilled = parseFloat(tdFul.textContent.replace(',', '.').trim());
                var quantityToFulfill = quantity - quantityFulfilled
                var tdElementsInRow = trElement.querySelectorAll('td'); // Find all td elements in the same row
                
                tdElementsInRow.forEach(function(tdInRow) {
                    if (quantityToFulfill === quantityCommitted) {
                        tdInRow.style.setProperty('background-color', availableRowcolor, 'important');
                    } else if (quantity === 0 || quantityToFulfill === 0) {
                        tdInRow.style.setProperty('background-color', completedRowColor, 'important');
                    } else {
                        tdInRow.style.setProperty('background-color', unavailableRowColor, 'important');
                    }
                });
            }
        });

        //Color confirmed cells (purchase order)
        var tdConfirmedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="LINE CONFIRMED"], td.listtext[data-ns-tooltip="LINE CONFIRMED"]');
        tdConfirmedCells.forEach(function(tdElement) {
            var trElement = tdElement.closest('tr');
            tdLineConfirmedContent = tdElement.textContent.trim();

            if (trElement) {
                var quantityField = trElement.querySelector('td.listtexthl[data-ns-tooltip="QUANTITY"], td.listtext[data-ns-tooltip="QUANTITY"]');
                var quantity = parseFloat(quantityField.textContent.replace(',', '.').trim());
                var quantityReceivedField = trElement.querySelector('td.listtexthl[data-ns-tooltip="RECEIVED"], td.listtext[data-ns-tooltip="RECEIVED"]');
                var quantityReceived = parseFloat(quantityReceivedField.textContent.replace(',', '.').trim());

                var tdElementsInRow = trElement.querySelectorAll('td'); // Find all td elements in the same row
                tdElementsInRow.forEach(function(tdInRow) {
                    if (quantity === quantityReceived) {
                        tdInRow.style.setProperty('background-color', completedRowColor, 'important');
                    } else if (tdLineConfirmedContent.toLowerCase().includes('yes')) {
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
