const fs = require('fs');
const { exportsDB } = require("./db");
const path = require('path');
const { client } = require('./sftpConect.js');
const con = exportsDB();

const sqlIds = "SELECT `id` FROM defaultdb.antecedentes where id = 8198 ";

con.query(sqlIds, async function (err, result) {
  if (err) {
    console.log(err);
    return;
  }

  for (const item of result) {
    const id_ = item.id;
    console.log(id_);

    try {
      const sqlPdf = "SELECT `consolidado` FROM defaultdb.evidencia_antecedentes WHERE id = ?";
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
                  await client.uploadFile(filePath, tempFile);
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

                  // Resto del código aquí (como la actualización en la base de datos)
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
