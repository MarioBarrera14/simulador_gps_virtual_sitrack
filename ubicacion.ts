import * as crypto from 'crypto';
import * as http from 'http';

const application = "ReportGeneratorTest";
const secretKey = "ccd517a1-d39d-4cf6-af65-28d65e192149";
const SITRACK_API_URL = 'test-externalrgw.ar.sitrack.com';

const reportStatus = {};

function generateReport() {
  const now = new Date();
  const loginCode = "98173";
  const reportDate = now.toISOString();//esta linea de codigo convierte la fecha actual almacenada en la variable now a un formato ISO 8601 (AAAA-MM-DDTHH:mm:ss.sssZ) y lo almacena en la constante reportDate
  const latitude = -32.935482 + (Math.random() / 1000);//generamos de manera aleatoria coordenadas de latitud y longitud, 
  const longitude = -68.81575 + (Math.random() / 1000); //utilizando valores base predefinidos para cada uno y sumando un número aleatorio entre 0 y 1 dividido por 1000.
  const gpsDop = parseFloat((Math.random() * 20).toFixed(2));//en esta linea generamos un número aleatorio que representa la dilución de precisión del GPS (GPS DOP) y lo almacena en la constante gpsDop
  const reportType = '2';
  const heading = Math.floor(Math.random() * 360);//generamos un número entero aleatorio entre 0 y 359,que representa la dirección en grados en la que se está moviendo el objeto o dispositivo que está enviando el informe de ubicación. 
  const speed = Math.round(Math.random() * 10000) / 100;//esta linea genera una velocidad aleatoria en kilómetros por hora (km/h) y la almacena en la constante speed. 
  const speedLabel = 'GPS';
  const gpsSatellites = Math.floor(Math.random() * 10);//esta linea genera un número entero aleatorio entre 0 y 9, que representa la cantidad de satélites GPS que se utilizan para determinar la ubicación del objeto o dispositivo que está enviando el informe de ubicación
  const text = 'Mario Barrera';
  const textLabel = 'TAG';
// creamos un objeto llamado reportData que contiene varias propiedades que se definen mediante variables previamente declaradas.
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
//Luego, este objeto reportData se pasa como argumento a la función sendAuthenticatedRequest(), que se encarga de enviar una solicitud HTTP autenticada que contiene los datos de este informe.
  sendAuthenticatedRequest(reportData);
}
/*creamos la función (generateSignature) se encarga de generar una firma digital para una solicitud HTTP autenticada.

La firma digital se genera a partir de tres elementos: el nombre de la aplicación, una clave secreta y una marca de tiempo. Estos elementos se concatenan en un solo string, y luego se calcula su hash MD5 utilizando la biblioteca crypto de Node.js.

La función devuelve la firma digital en formato base64. */
function generateSignature(timestamp: number): string {
  const data = `${application}${secretKey}${timestamp}`;
  const hash = crypto.createHash('md5').update(data).digest('base64');
  return hash;
}
/*creamos una función sendAuthenticatedRequest lo cual envía una solicitud HTTP autenticada a través del protocolo PUT a una API de SITRACK para enviar un reporte de ubicación.
la misma toma un objeto reportData que contiene datos del reporte, como la fecha, la ubicación, la velocidad, el tipo de reporte, etc.primero genera una clave única para el reporte combinando la latitud, longitud y la fecha. Luego, genera una marca de tiempo y firma digital utilizando la función generateSignature. */

function sendAuthenticatedRequest(reportData: Record<string, unknown>): void {
  const reportKey = `${reportData.latitude}_${reportData.longitude}_${reportData.reportDate}`;
  try {////se construyen los encabezados de la solicitud, que incluyen la firma digital y la marca de tiempo. 
    const timestamp = Math.floor(Date.now() / 1000);//obtienemos la marca de tiempo actual en segundos (desde el 1 de enero de 1970, 00:00:00 UTC) y la redondea hacia abajo al número entero más cercano utilizando Math.floor().
    const signature = generateSignature(timestamp);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `SWSAuth application="${application}", signature="${signature}", timestamp="${timestamp}"`
    };//Se crea un objeto de opciones para la solicitud que incluye la URL de la API de SITRACK, la ruta, el método y los encabezados.
    const options = {
      hostname: SITRACK_API_URL,
      path: '/frame',
      method: 'PUT',
      headers: headers
    };//se crea una solicitud HTTP utilizando el módulo http de Node.js. 
    const request = http.request(options, (response) => {
      console.log(`Response status code: ${response.statusCode}`);
      reportStatus[reportKey] = 'sent';//Si la solicitud es exitosa, la función guarda el estado del reporte en la variable reportStatus.
      console.log(`El reporte ${reportKey} ya ha sido enviado`);
    });//se envía el cuerpo de la solicitud que contiene los datos del reporte en formato JSON.
    const body = JSON.stringify(reportData);
    request.write(body);
    request.end();
  } catch (error) {//Si la solicitud falla, la función intentará reenviar el reporte después de un tiempo determinado, dependiendo del tipo de error que haya ocurrido.
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

/*Por ultimo se establece un intervalo para ejecutar la función generateReport() cada 60 segundos (60000 milisegundos), y guarda el identificador de intervalo devuelto en la variable intervalId. Luego, después de 5 minutos (300000 milisegundos), se llama a clearInterval() para detener la ejecución del intervalo y se muestra un mensaje de "Proceso finalizado" en la consola/terminal. */
const intervalId = setInterval(generateReport, 60000);

setTimeout(() => {
  clearInterval(intervalId);
  console.log('Proceso finalizado');
}, 300000);
