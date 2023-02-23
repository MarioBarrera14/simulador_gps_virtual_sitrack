# Simulador_gps_virtual


Este microservicio/aplicacion es un script de Node.js que genera un reporte de ubicación aleatoria y lo envía a través de una solicitud HTTP a un servidor remoto llamado SITRACK utilizando una autenticación basada en firma. A continuación se detalla el funcionamiento del código:

Se importan dos módulos nativos de Node.js: el módulo 'crypto' para generar la firma de autenticación y el módulo 'http' para enviar la solicitud HTTP.

Se definen algunas constantes y variables necesarias para el funcionamiento del script, como el nombre de la aplicación, la clave secreta para la firma de autenticación, la URL del servidor SITRACK y un objeto de estado de reporte para mantener un registro de los informes enviados.

Se define la función 'generateReport' que genera un objeto de datos de informe aleatorio utilizando valores como la fecha actual, la ubicación aleatoria, la velocidad, la etiqueta de velocidad, el tipo de informe, etc. Luego, llama a la función 'sendAuthenticatedRequest' para enviar el informe a SITRACK.

Se define la función 'generateSignature' que toma un timestamp y utiliza el nombre de la aplicación, la clave secreta y el timestamp para generar una firma de autenticación utilizando la función de hash MD5. La firma se devuelve en formato base64.

Se define la función 'sendAuthenticatedRequest' que toma un objeto de datos de informe y utiliza la firma de autenticación generada por la función 'generateSignature' para enviar una solicitud HTTP PUT a la URL del servidor SITRACK. La solicitud HTTP incluye el encabezado de autenticación y el cuerpo de la solicitud es el objeto de datos de informe en formato JSON. Si la solicitud falla, se intenta nuevamente en 10 segundos.

Se define una variable de intervalo que llama a la función 'generateReport' cada 60 segundos.

Se define un temporizador que detiene el intervalo después de 300 segundos (5 minutos) y muestra un mensaje de finalización del proceso.

En resumen, este script genera informes de ubicación aleatoria y los envía al servidor SITRACK utilizando una autenticación basada en firma. El proceso se repite cada 60 segundos durante 5 minutos antes de detenerse.


![This is an image](https://www.sitrack.com/portal/mobile/img/general/sitrack-logo.png)