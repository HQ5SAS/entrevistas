
let Client = require('ssh2-sftp-client');
const fs = require('fs');
const { exportsDB } = require("./db");
const { count } = require('console');
const con = exportsDB();
const path = require('path');

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
    return ("done!")
  }

}
const client = new SFTPClient();

(async () => {
  //* Open the connection
  const sftpSSHKey = fs.readFileSync('./id_rsa');
  await client.connect({
    host: '201.184.98.75',
    port: '22',
    username: 'transfdhq5',
    password: 's*3/X26Qm'
  });
    // //--crear archivo en carpetalocal
    // try{
    //   archivoNombre="./transfdhq5/hunterx/"+id_+".mp4";  
    //   try{
    //     await client.uploadFile( archivoNombre, pdf )

    //     await console.log("done")
    //   }
    //   catch(err){
    //     console.log("no borrado ni almacenado: " +err)
    //   }
      
    // }
    // catch(err){
    //   console.log(err)
    // }
      
})();
module.exports=client;