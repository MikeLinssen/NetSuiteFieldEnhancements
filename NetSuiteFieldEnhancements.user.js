// ==UserScript==
// @name         Netsuite field enhancements
// @description  Netsuite field enhancements including row coloring, percentage rounding and adding currency symbols
// @version      2.50
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
    var tempRowColor = '#ffd885';
    var unavailableRowColor = '#fcacac';

    //Define variables
    var divElements = "";
    var tdElements = "";
    var tooltipValues = "";
    var querySelector = "";

    //Set colors for statusses (See https://htmlcolorcodes.com/color-names/ for references)
    const statusColors = {
        "Accepted by Customer": "LightGreen",
        "Allocation Check Needed": "PaleTurquoise",
        "Automatic Credit (No Return Needed)": "DarkGray",
        "Backorder": "IndianRed",
        "Check Prices": "Tomato",
        "Closed Won": "DarkKhaki",
        "Confirmed": "Orange",
        "Creating / In Progress": "PowderBlue",
        "Customer Service Follow-up": "Fuchsia",
        "Expired": "LightGray",
        "Financial Audit": "Aquamarine",
        "Followed Up": "Orange",
        "Intercompany": "Aqua",
        "Lost - Closed By Customer": "Violet",
        "Lost - Closed By Econox": "Red",
        "On Hold": "Silver",
        "Open - Econox": "Red",
        "Partially Received": "Plum",
        "Pick & Pack": "DeepSkyBlue",
        "Product Decision": "Plum",
        "Quotation Sent": "Khaki",
        "Released": "Yellow",
        "Return approved": "Plum",
        "Return back to customer": "Plum",
        "Return Credited": "Plum",
        "Return not approved": "Plum",
        "Return Not OK": "Plum",
        "Return OK": "Plum",
        "Return received in warehouse": "Plum",
        "Return registered": "Plum",
        "Return technical evaluation": "Plum",
        "Return to supplier": "Plum",
        "Shipped": "DarkGray",
        "Supply Chain Follow-up": "LightSeaGreen",
        "Technical Evaluation": "Plum",
        "Wait For Payment": "MediumAquamarine",
        "Waiting for shipment label": "Plum",
        "Manually Closed": "Gray",
        "Pending Approval": "MediumSpringGreen",
        "Pending Re-Approval": "MediumSpringGreen",
        "In Order": "MediumPurple",
        "Open": "Red",
        "OCI Syntess": "Gainsboro",
        "Ventilation advice report (IN PROGRESS)": "Blue",
        "Ventilation advice report (UNTREATED)": "IndianRed",
        "Supply Chain Review": "MediumTurquoise",
        "Financial Credit Without Return": "LightGray",
        "Check External Remark": "Gold",
        "On-Hold Go-Live": "Pink",
        "Tax Audit": "Coral",
        "Financial Audit Rejected": "DarkSalmon",
        "Pending Manual Invoice": "DarkOrchid"
      };

    //Check for different currency
    var currencySpan = document.querySelector('div[data-walkthrough="Field:currency"] span[data-nsps-type="field_input"]')
    if (currencySpan) {
        var spanContent = currencySpan.textContent.trim();
        if (spanContent === "British pound") {
            currency = "£ ";
        } else if (spanContent === "Polish Zloty") {
            currency = "zł ";
        } else if (spanContent === "Danish Krone") {
            currency = "kr. ";
        } else if (spanContent === "Swedish Krona") {
            currency = "kr ";
        }
    }

    //Color credit limit
    var creditBalanceSpan = document.querySelector('div[data-walkthrough="Field:balance"] span[data-nsps-type="field_input"]');
    var creditLimitSpan = document.querySelector('div[data-walkthrough="Field:custbody_customer_credit_limit"] span[data-nsps-type="field_input"]');
    if (creditBalanceSpan && creditLimitSpan) {
        var creditBalanceContent = parseFloat(creditBalanceSpan.textContent.replace('.', '').replace(',', '.').trim());
        var creditLimitContent = parseFloat(creditLimitSpan.textContent.replace('.', '').replace(',', '.').trim());
        if (creditBalanceContent > creditLimitContent) {
            highlightField(creditBalanceSpan);
        }
    }

    //Color max refund
    var maxRefundSpan = document.querySelector('div[data-walkthrough="Field:custbody_refpay_maximum_refund_amount"] span[data-nsps-type="field_input"]');
    if (maxRefundSpan) {
        var maxRefundContent = parseFloat(maxRefundSpan.textContent.replace('.', '').replace(',', '.').trim());
        if (maxRefundContent > 0) {
            highlightField(maxRefundSpan);
        }
    }

    //Color payment method
    var paymentMethodSpan = document.querySelector('div[data-walkthrough="Field:custbody_cs_payment_term"] span[data-nsps-type="field_input"] span a');
    if (paymentMethodSpan) {
        var paymentMethodContent = paymentMethodSpan.textContent.trim();
        if (paymentMethodContent == "Contante betaling") {
            highlightField(paymentMethodSpan);
        }
    }

    //Color max payment
    var maxPaymentSpan = document.querySelector('div[data-walkthrough="Field:custbody_refpay_maximum_pay_amount"] span[data-nsps-type="field_input"]');
    if (maxPaymentSpan) {
        var maxPaymentContent = parseFloat(maxPaymentSpan.textContent.replace('.', '').replace(',', '.').trim());
        var paymentMethodSpan = document.querySelector('div[data-walkthrough="Field:terms"] span[data-nsps-type="field_input"]');
        var paymentMethodContent = paymentMethodSpan.textContent;
        if (maxPaymentContent > 0 && paymentMethodContent.toLowerCase().includes('vooruitbetaling')) {
            highlightField(maxPaymentSpan);
        }
    }

    //Color payment links
    var paymentLinksSpan = document.querySelector('div[data-walkthrough="Field:custbody_pending_paylink_amount"] span[data-nsps-type="field_input"]');
    if (paymentLinksSpan) {
        var paymentLinksContent = parseFloat(paymentLinksSpan.textContent.replace('.', '').replace(',', '.').trim());
        if (paymentLinksContent > 0) {
            highlightField(paymentLinksSpan);
        }
    }

    //Color overdue balance
    var overdueBalanceSpan = document.querySelector('div[data-walkthrough="Field:custbody_so_invoice_overdue"] span[data-nsps-type="field_input"]');
    if (overdueBalanceSpan) {
        var overdueBalanceContent = parseFloat(overdueBalanceSpan.textContent.replace('.', '').replace(',', '.').trim());
        if (overdueBalanceContent > 0) {
            highlightField(overdueBalanceSpan);
        }
    }

    //Highlight field function
    function highlightField(element) {
            element.style.setProperty('background-color', 'yellow');
            element.style.setProperty('font-weight', 'bold');
            element.style.setProperty('color', 'red', 'important');
    }

    //Color gross margin percent
    var grossMarginSpan = document.querySelector('div[data-walkthrough="Field:estgrossprofitpercent"] span[data-nsps-type="field_input"]');
    if (grossMarginSpan) {
        var grossMarginContent = parseFloat(grossMarginSpan.textContent.replace('.', '').replace(',', '.').trim());
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
        var spanContent = parseFloat(spanElement.textContent.replace('.', '').replace(',', '.').trim());
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
    var prePaymentSpan = document.querySelector('div[data-walkthrough="Field:custbody_prepayment_percentage"] span[data-nsps-type="field_input"]')
    if (prePaymentSpan) {
        var prePaymentContent = prePaymentSpan.textContent.trim();
        prePaymentSpan.textContent = prePaymentContent + "%";
    }

    //Change specific sublist currency fields
    tooltipValues = ["List Price", "Rate", "Amount", "Tax Amt", "Gross Amt", "Est. Extended Cost", "Est. Gross Profit", "Purchase Price"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    tdElements = document.querySelectorAll(querySelector);
    tdElements.forEach(function(tdElement) {
        console.log(tdElement);
        var content = tdElement.textContent
            tdElement.textContent = currency + content;
    });

    //Change specific sublist percentage fields
    tooltipValues = ["List Price Discount", "Est. Gross Profit Percent"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    tdElements = document.querySelectorAll(querySelector);
    tdElements.forEach(function(tdElement) {
        var content = parseFloat(tdElement.textContent.replace('.', '').replace(',', '.').trim());
        if (!isNaN(content)) {
            var roundedContent = content.toFixed(1).replace('.', ',');
            tdElement.textContent = roundedContent + '%';
        }
    });

    var statusField = document.querySelector('div[data-walkthrough="Field:custbody_econox_order_status"] span[data-nsps-type="field_input"] span a');
    var statusFieldSpan = document.querySelector('div[data-walkthrough="Field:custbody_econox_order_status"] span[data-nsps-type="field_input"]');
    if (statusField && statusFieldSpan) {
        var statusText = statusField.textContent;
        console.log(statusText)
        if (statusColors.hasOwnProperty(statusText)) {
            var statusColor = statusColors[statusText];
            console.log(statusColor);
            statusFieldSpan.style.setProperty('background-color', statusColor, 'important');
            statusFieldSpan.style.setProperty('padding', '5px', 'important');
            statusField.style.setProperty('color', 'black', 'important');
            statusField.style.setProperty('text-decoration', 'none', 'important');
            statusField.removeAttribute('href');
        };
    };

    function colorRows() {
        //Color complete rows (sales order)
        var tdCommittedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="Committed"], td.listtext[data-ns-tooltip="Committed"]');
        tdCommittedCells.forEach(function(tdElement) {
            var quantityCommitted = parseFloat(tdElement.textContent.replace('.', '').replace(',', '.').trim());
            var trElement = tdElement.closest('tr'); // Find the parent row (tr) element
            if (trElement) {
                var tdQty = trElement.querySelector('td.listtexthl[data-ns-tooltip="Quantity"], td.listtext[data-ns-tooltip="Quantity"]');
                var quantity = parseFloat(tdQty.textContent.replace('.', '').replace(',', '.').trim());
                var tdFul = trElement.querySelector('td.listtexthl[data-ns-tooltip="Fulfilled"], td.listtext[data-ns-tooltip="Fulfilled"]');
                var quantityFulfilled = parseFloat(tdFul.textContent.replace('.', '').replace(',', '.').trim());
                var tdAvailable = trElement.querySelector('td.listtexthl[data-ns-tooltip="Available"], td.listtext[data-ns-tooltip="Available"]');
                var quantityAvailable = parseFloat(tdAvailable.textContent.replace('.', '').replace(',', '.').trim());
                var quantityToFulfill = quantity - quantityFulfilled
                var tdElementsInRow = trElement.querySelectorAll('td'); // Find all td elements in the same row

                tdElementsInRow.forEach(function(tdInRow) {
                    if (quantityToFulfill === quantityCommitted && quantityToFulfill != 0) {
                        tdInRow.style.setProperty('background-color', availableRowcolor, 'important');
                    } else if (isNaN(quantity)) {
                        return
                    } else if (quantity === 0 || quantityToFulfill === 0) {
                        tdInRow.style.setProperty('background-color', completedRowColor, 'important');
                    } else if (quantityAvailable >= quantityToFulfill) {
                        tdInRow.style.setProperty('background-color', tempRowColor, 'important');
                    }else {
                        tdInRow.style.setProperty('background-color', unavailableRowColor, 'important');
                    }
                });
            }
        });

        //Color confirmed cells (purchase order)
        var tdConfirmedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="Line Confirmed"], td.listtext[data-ns-tooltip="Line Confirmed"]');
        tdConfirmedCells.forEach(function(tdElement) {
            var trElement = tdElement.closest('tr');
            var tdLineConfirmedContent = tdElement.textContent.trim();

            if (trElement) {
                var quantityField = trElement.querySelector('td.listtexthl[data-ns-tooltip="Quantity"], td.listtext[data-ns-tooltip="Quantity"]');
                var quantity = parseFloat(quantityField.textContent.replace('.', '').replace(',', '.').trim());
                var quantityReceivedField = trElement.querySelector('td.listtexthl[data-ns-tooltip="Received"], td.listtext[data-ns-tooltip="Received"]');
                var quantityReceived = parseFloat(quantityReceivedField.textContent.replace('.', '').replace(',', '.').trim());

                var tdElementsInRow = trElement.querySelectorAll('td'); // Find all td elements in the same row
                tdElementsInRow.forEach(function(tdInRow) {
                    if (quantity <= quantityReceived) {
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
        var tdClosedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="Closed"], td.listtext[data-ns-tooltip="Closed"]');
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
        var tdClosedCells = document.querySelectorAll('td.listtexthl[data-ns-tooltip="Closed"], td.listtext[data-ns-tooltip="Closed"]');
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
