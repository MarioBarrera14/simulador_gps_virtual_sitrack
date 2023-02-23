"use strict";
exports.__esModule = true;
var crypto = require("crypto");
var http = require("http");
var application = "ReportGeneratorTest";
var secretKey = "ccd517a1-d39d-4cf6-af65-28d65e192149";
var SITRACK_API_URL = 'test-externalrgw.ar.sitrack.com';
var reportStatus = {};
function generateReport() {
    var now = new Date();
    var loginCode = "98173";
    var reportDate = now.toISOString();
    var latitude = -32.935482 + (Math.random() / 1000);
    var longitude = -68.81575 + (Math.random() / 1000);
    var gpsDop = parseFloat((Math.random() * 20).toFixed(2));
    var reportType = '2';
    var heading = Math.floor(Math.random() * 360);
    var speed = Math.round(Math.random() * 10000) / 100;
    // const timestamp = Math.floor(Date.now() / 1000).toString();
    var speedLabel = 'GPS';
    var gpsSatellites = Math.floor(Math.random() * 10);
    var text = 'Mario Barrera';
    var textLabel = 'TAG';
    var reportData = {
        reportDate: reportDate,
        loginCode: loginCode,
        latitude: latitude,
        longitude: longitude,
        gpsDop: gpsDop,
        reportType: reportType,
        heading: heading,
        speed: speed,
        speedLabel: speedLabel,
        gpsSatellites: gpsSatellites,
        text: text,
        textLabel: textLabel
    };
    sendAuthenticatedRequest(reportData);
}
function generateSignature(timestamp) {
    var data = "".concat(application).concat(secretKey).concat(timestamp);
    var hash = crypto.createHash('md5').update(data).digest('base64');
    return hash;
}
function sendAuthenticatedRequest(reportData) {
    var reportKey = "".concat(reportData.latitude, "_").concat(reportData.longitude, "_").concat(reportData.reportDate);
    try {
        var timestamp = Math.floor(Date.now() / 1000);
        var signature = generateSignature(timestamp);
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': "SWSAuth application=\"".concat(application, "\", signature=\"").concat(signature, "\", timestamp=\"").concat(timestamp, "\"")
        };
        var options = {
            hostname: SITRACK_API_URL,
            path: '/frame',
            method: 'PUT',
            headers: headers
        };
        var request = http.request(options, function (response) {
            console.log("Response status code: ".concat(response.statusCode));
            reportStatus[reportKey] = 'sent';
            console.log("El reporte ".concat(reportKey, " ya ha sido enviado"));
        });
        var body = JSON.stringify(reportData);
        request.write(body);
        request.end();
    }
    catch (error) {
        if (error.response && error.response.status >= 500) {
            console.error('Error al enviar reporte a SITRACK, se reintentará en 10 segundos:', error);
            setTimeout(function () {
                sendAuthenticatedRequest(reportData);
            }, 10000);
        }
        else if (error.response && error.response.status === 429) {
            console.warn('Demasiadas solicitudes, se reintentará en 10 segundos:', error);
            setTimeout(function () {
                sendAuthenticatedRequest(reportData);
            }, 10000);
        }
        else {
            console.error('Error al enviar reporte a SITRACK, se reintentará en 10 segundos:', error);
            setTimeout(function () {
                sendAuthenticatedRequest(reportData);
            }, 10000);
        }
    }
}
var intervalId = setInterval(generateReport, 60000);
setTimeout(function () {
    clearInterval(intervalId);
    console.log('Proceso finalizado');
}, 300000);
