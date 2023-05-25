const fs = require('fs');
const { exportsDB } = require("./db");
const con = exportsDB();
const { spawn } = require("child_process");

let sqlVideo = "SELECT `aplicar_convocatorias_id` FROM defaultdb.entrevistas where cargo IS NULL OR cargo = ''";

function python_getInfo(content) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", ["./zohoGetInf.py"]);
    let python_response = "";

    pythonProcess.stdout.on("data", function (data) {
      python_response += data;
    });

    pythonProcess.stderr.on("data", function (data) {
      console.error(data.toString());
      reject(data.toString());
    });

    pythonProcess.stdout.on("end", function () {
      console.log(python_response);
      resolve(python_response);
    });

    pythonProcess.on("error", function (error) {
      console.error(error);
      reject(error);
    });

    pythonProcess.stdin.write(JSON.stringify(content));
    pythonProcess.stdin.end();
  });
}

con.query(sqlVideo, async function (err, result) {
  // Si ocurre un error, imprimir en consola
  if (err) {
    console.log(err);
    return;
  }

  for (let index in result) {
    // Obtener el id de la información
    async function proceso() {
      try {
        var id_ = result[index]["aplicar_convocatorias_id"];
        console.log(id_);

        const response = await python_getInfo({ "key": "contenido", "id": id_ });
        console.log(response);

        var sqlUpdate = "UPDATE `entrevistas` SET `cargo` = '" + response + "' WHERE (`aplicar_convocatorias_id` = '" + id_ + "');";
        con.query(sqlUpdate, function (err, result) {
          if (err) throw err;
          console.log("guardado en db");
        });
      } catch (err) {
        console.log(err);
      }
    }

    await proceso();

    // Esperar 3 segundos antes de continuar con el siguiente ID
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
});