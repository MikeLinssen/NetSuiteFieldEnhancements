// ==UserScript==
// @name         Netsuite field enhancements
// @description  Netsuite field enhancements including percentage rounding and adding currency symbols
// @version      2.0
// @match        https://*.app.netsuite.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=netsuite.com
// @require      http://code.jquery.com/jquery-latest.js
// @author       Mike Linssen
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */


jQuery(function($) {

    //Hide alert box
    $(".uir-alert-box.warning").hide();

    //Set default currency
    var currency = "€ ";

    //Define variables
    var divElements = "";
    var tooltipValues = "";
    var querySelector = "";

    //Check for different currency
    var currencySpan = document.querySelector('div[data-nsps-label="Currency"] span[data-nsps-type="field_input"]')
    var spanContent = currencySpan.textContent.trim();
    if (spanContent === "British pound") {
        currency = "£ "
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
    var prePaymentContent = prePaymentSpan.textContent.trim();
    prePaymentSpan.textContent = prePaymentContent + "%";

    //Change sublist currency fields
    tooltipValues = ["LIST PRICE", "RATE", "AMOUNT", "TAX AMT", "GROSS AMT", "EST. EXTENDED COST", "EST. GROSS PROFIT", "PURCHASE PRICE"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    var tdElementsEur = document.querySelectorAll(querySelector);
    tdElementsEur.forEach(function(tdElementEur) {
        var contentEur = tdElementEur.textContent
            tdElementEur.textContent = currency + contentEur;
    });

    //Change sublist percentage fields
    tooltipValues = ["LIST PRICE DISCOUNT"];
    querySelector = tooltipValues.map(function(value) {
    return 'td.listtexthl[data-ns-tooltip="' + value + '"], td.listtext[data-ns-tooltip="' + value + '"]';
    }).join(', ');
    var tdElements = document.querySelectorAll(querySelector);
    tdElements.forEach(function(tdElement) {
        var content = tdElement.textContent.trim();
            tdElement.textContent = content + '%';
    });

});
