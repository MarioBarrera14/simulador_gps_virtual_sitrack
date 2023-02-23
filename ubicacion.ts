import * as crypto from 'crypto';
import * as http from 'http';

const application = "ReportGeneratorTest";
const secretKey = "ccd517a1-d39d-4cf6-af65-28d65e192149";
const SITRACK_API_URL = 'test-externalrgw.ar.sitrack.com';

const reportStatus = {};

function generateReport() {
  const now = new Date();
  const loginCode = "98173";
  const reportDate = now.toISOString();
  const latitude = -32.935482 + (Math.random() / 1000);
  const longitude = -68.81575 + (Math.random() / 1000);
  const gpsDop = parseFloat((Math.random() * 20).toFixed(2));
  const reportType = '2';
  const heading = Math.floor(Math.random() * 360);
  const speed = Math.round(Math.random() * 10000) / 100;
 // const timestamp = Math.floor(Date.now() / 1000).toString();
  const speedLabel = 'GPS';
  const gpsSatellites = Math.floor(Math.random() * 10);
  const text = 'Mario Barrera';
  const textLabel = 'TAG';

  const reportData = {
    reportDate,
    loginCode,
    latitude,
    longitude,
    gpsDop,
    reportType,
    heading,
    speed,
    speedLabel,
    gpsSatellites,
    text,
    textLabel,
  };

  sendAuthenticatedRequest(reportData);
}

function generateSignature(timestamp: number): string {
  const data = `${application}${secretKey}${timestamp}`;
  const hash = crypto.createHash('md5').update(data).digest('base64');
  return hash;
}

function sendAuthenticatedRequest(reportData: Record<string, unknown>): void {
  const reportKey = `${reportData.latitude}_${reportData.longitude}_${reportData.reportDate}`;
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `SWSAuth application="${application}", signature="${signature}", timestamp="${timestamp}"`
    };
    const options = {
      hostname: SITRACK_API_URL,
      path: '/frame',
      method: 'PUT',
      headers: headers
    };
    const request = http.request(options, (response) => {
      console.log(`Response status code: ${response.statusCode}`);
      reportStatus[reportKey] = 'sent';
      console.log(`El reporte ${reportKey} ya ha sido enviado`);
    });
    const body = JSON.stringify(reportData);
    request.write(body);
    request.end();
  } catch (error) {
    if (error.response && error.response.status >= 500) {
      console.error('Error al enviar reporte a SITRACK, se reintentará en 10 segundos:', error);
      setTimeout(() => {
        sendAuthenticatedRequest(reportData);
      }, 10000);
    } else if (error.response && error.response.status === 429) {
      console.warn('Demasiadas solicitudes, se reintentará en 10 segundos:', error);
      setTimeout(() => {
        sendAuthenticatedRequest(reportData);
      }, 10000);
    } else {
      console.error('Error al enviar reporte a SITRACK, se reintentará en 10 segundos:', error);
      setTimeout(() => {
        sendAuthenticatedRequest(reportData);
      }, 10000);
    }
  }
}

const intervalId = setInterval(generateReport, 60000);

setTimeout(() => {
  clearInterval(intervalId);
  console.log('Proceso finalizado');
}, 300000);
