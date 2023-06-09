
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
  const sqlIds = "SELECT `id` FROM defaultdb.antecedentes where ruta IS NULL OR ruta = '' ";

  con.query(sqlIds, async function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
  
    for (const item of result) {
      const id_ = item.id;
      console.log(id_);
  
      try {
        const sqlPdf = "SELECT `consolidado` FROM defaultdb.evidencia_antecedentes WHERE id = '"+id_+"'";
        con.query(sqlPdf, [id_], function (error, res) {
          if (error) {
            console.log(error);
            return;
          }
  
          if (res.length > 0) {
            const base64Pdf = res[0]['consolidado'].toString('utf8');
  
            if (typeof(base64Pdf) !== "object") {
              const pdfData = base64Pdf.replace(/^data:(.*?);base64,/, "").replace(/ /g, '+');
              const filePath = `./transfdhq5/hunterx/${id_}.pdf`;
              const tempFile = `${id_}.pdf`;
  
              fs.writeFile(tempFile, pdfData, 'base64', async function(err) {
                if (err) {
                  console.log(err);
                } else {
                  try {
                    await client.uploadFile(tempFile, filePath);
                    console.log("Archivo subido correctamente.");
  
                    if (fs.existsSync(tempFile)) {
                      fs.unlink(tempFile, (error) => {
                        if (error) {
                          console.log(`Error al eliminar el archivo: ${error}`);
                        } else {
                          console.log('Archivo eliminado correctamente.');
                        }
                      });
                    }
                        var sqlUpdate = "UPDATE `antecedentes` SET `ruta`= '"+ filePath+ "' WHERE id = " + id_ + "";
                      await con.query(sqlUpdate, function (err, result) {
                          if (err) throw err;
                      console.log("pdf guardado en db");
                      });
                      console.log("Archivo guardado exitosamente.");
                  } catch (err) {
                    console.log(err);
                  }
                }
              });
            } else {
              console.log("No hay archivo disponible.");
              console.log(base64Pdf);
            }
          } else {
            console.log("No se encontraron resultados para la consulta.");
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
      
})();