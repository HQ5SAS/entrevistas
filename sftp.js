
let Client = require('ssh2-sftp-client');
const fs = require('fs');
const { exportsDB } = require("./db");
const { count } = require('console');
const con = exportsDB();

// ID_userS="3960020000112264857"
//días que se van a dejar desde que se grabó la entrevista para cambiar de ubicación del archivo 
diasAesperar="5";
//Query par buscar registros con la ruta de digital, validando que la fecha sea anterior a hoy hace los "días a esperar"
let sqlVideo = "SELECT `aplicar_convocatorias_id`,`preguntasRes` FROM defaultdb.entrevistas WHERE `ruta` LIKE '/mnt/entrevistavirtual/' AND  DATE(`fecha`) <= CURDATE()-"+diasAesperar+" ;"
//ejecución de query
con.query(sqlVideo, async function (err, result){
  //si toma error imprimir en consola
  if(err) console.log(err); 
  //intentar proceso completo
  try{
  //para cada registro de entrevista que encontró identifique el id y la cantidad de preguntas almacenadas(preguntasRes)
    for(index in result){
      var listaVideos=[];
      var id_=result[index]["aplicar_convocatorias_id"];
      var numPreguntas=result[index]["preguntasRes"];
      //para cada pregunta existente por entrevista crea ruta según parametrización (rutaDigitalocean/idRegistro_numeroPregunta.mp4)
      for(var i= 1;i<numPreguntas+1;i++  ){
        ruta="/mnt/entrevistavirtual/"+id_+"_"+i+".mp4";
        listaVideos.push(ruta);
        //Para cada ruta creada ejecutar clonacion de servidor digital Ocean a servidor físico HQ5
        //routeHQ5L="./transfdhq5/"+id_+"_"+i+".mp4"
        // try{
        //   await client.uploadFile(ruta ,routeHQ5L);
        // }
        // catch(err){
        //   console.log(err)
        // }    
      }
      //actualizar ruta en SQL
      // var sqlUpdate = "UPDATE `entrevistas` SET `ruta`= './transfdhq5/'  WHERE (`aplicar_convocatorias_id` = '" + id_ + "');";
      // con.query(sqlUpdate, function (err, result) {
      //   if (err) console.log(err); 
      //   console.log("video guardado en servidor físico");
      // })
      // //test imprimir en consola id's encontrados y listas de rutas videos generadas
      console.log(listaVideos)
      console.log(result[index]["aplicar_convocatorias_id"])
      //Eliminar alrchivos de servidor Digita Ocean
      // for(_ruta in listaVideos){
      //   fs.unlink(_ruta, (err) => {
      //     if (err) {
      //       console.error(err)
      //       return
      //     }
      //     console.log("eliminado:" + _ruta)
      //   })
      // }
    };
  }
  catch(err){
    console.log(err);
  }
})
 



// var sql = "UPDATE `entrevistas` SET `ruta`= '" + id + "' WHERE (`aplicar_convocatorias_id` = '" + id_ + "');";
// try {
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("video guardado en db");
//     resSQL = "succesfull query";
//   }).then(sendZoho(req, respuestasConsol));
// }
// catch (error) {
//   resSQL = error;
// }


// //-----------------------------------------

class SFTPClient {
  constructor() {
    this.client = new Client();
  }
//
  async connect(options) {
    console.log(`Connecting to ${options.host}:${options.port}`);
    try {
      await this.client.connect(options);
    } catch (err) {
      console.log('Failed to connect:', err);
    }
  }

  async disconnect() {
    await this.client.end();
  }

  async uploadFile(localFile, remoteFile) {
    console.log(`Uploading ${localFile} to ${remoteFile} ...`);
    await this.client.put(localFile, remoteFile);
  }

}

(async () => {


  //* Open the connection
  const client = new SFTPClient();
  const sftpSSHKey = fs.readFileSync('./id_rsa');
  await client.connect({
    host: '201.184.98.75',
    port: '22',
    username: 'transfdhq5',
    password: 's*3/X26Qm'
  });
  listTest=["/mnt/entrevistavirtual/3960020000012264857_3.mp4" ];
  var countProcess=0;
  idTest="3960020000012264857";
  for (route_ in listTest){
    countProcess++
    try{
      _ruta = listTest[route_];
      archivoNombre="./transfdhq5/"+idTest+"_"+countProcess+".mp4";
      
      promesaTraspaso= new Promise((resolve, reject) => {
        try{
         client.uploadFile( _ruta,archivoNombre );
         resolve();
        }
        catch(err){
          console.log(err);
          reject();
        }
      });


      await promesaTraspaso.then(fs.unlink(_ruta, (err) => {
            if (err) {
              console.error(err)
              return
            }
            console.log("eliminado:" + _ruta)
          }), console.log("error en traspaso"))
      
    }
    catch(err){
      console.log(err)
    }
  }
  //-----
  // remoteFile="/www/entrevistaVirtHQ5";
  // localFile="/mnt/entrevistavirtual/";
  //var video="3960020000012264857_1.mp4"
  //* Upload local file to remote file
  //await client.uploadFile("/mnt/entrevistavirtual/"+video, "./transfdhq5/remote.mp4");


  //* Close the connection
  //await client.disconnect();
})();