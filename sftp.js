
let Client = require('ssh2-sftp-client');
const fs = require('fs');
//const { exportsDB } = require("./db");
//const con = exportsDB();

// ID_userS="3960020000112264857"
diasAesperar="5";
let sqlVideo = "SELECT `aplicar_convocatorias_id`,`preguntasRes` FROM defaultdb.entrevistas WHERE `ruta` LIKE '/mnt/entrevistavirtual/' AND  DATE(`fecha`) <= CURDATE()-"+diasAesperar+" ;"
con.query(sqlVideo, async function (err, result){
  if(err) console.log(err); 
  for(index in result){
    var listaVideos=[];
    var id_=result[index]["aplicar_convocatorias_id"];
    var numPreguntas=result[index]["preguntasRes"];
    for(var i= 1;i<numPreguntas+1;i++  ){
      ruta="/mnt/entrevistavirtual/"+id_+"_"+i;
      listaVideos.push(ruta);
      
    }
    console.log(listaVideos)
    console.log(result[index]["aplicar_convocatorias_id"])
  };
})


//       con.query(sqlVideo, function (err, result) {
//         if (err) {
//           errores(res, err400);
//         }
//         else {
//           try {
//             ruta=result[0]["ruta"]
//             preguntasRes=result[0]["preguntasRes"]

//           }
//           catch (err) {
//             errores(res, err400);
//             console.log(err);
//           }
//         }
//       });

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

// //------------------------------------------------------------------
// const http = require('http'); // or 'https' for https:// URLs

// const file = fs.createWriteStream("file.jpg");
// const reqeust = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
//    response.pipe(file);

//    // after download completed close filestream
//    file.on("finish", () => {
//        file.close();
//        console.log("Download Completed");
//    });
// });
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
    try {
      await this.client.put(localFile, remoteFile);
    } catch (err) {
      console.error('Uploading failed:', err);
    }
  }

}

(async () => {


  //* Open the connection
  const client = new SFTPClient();
  const sftpSSHKey = fs.readFileSync('./keyPath');
  await client.connect({
    host: '201.184.98.75',
    port: '22',
    username: 'transfdhq5',
    privateKey: sftpSSHKey,
    passphrase: 'transfer',
  });
  //-----
  // remoteFile="/www/entrevistaVirtHQ5";
  // localFile="/mnt/entrevistavirtual/";
  var video="3960020000012264857_1.mp4"
  //* Upload local file to remote file
  await client.uploadFile("/mnt/entrevistavirtual/"+video, "./transfdhq5/remote.mp4");


  //* Close the connection
  await client.disconnect();
})();