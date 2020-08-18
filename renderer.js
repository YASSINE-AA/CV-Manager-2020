const remote = require('electron').remote;
const dialog = remote.dialog;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dir = path.join(__dirname, "files"); 
const dbPath = path.join(__dirname, "main.db");

//* Author Yassine Ahmed Ali

//initiates electron filesystem
fs = require('fs');

// Refreshes the file list on startup.
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    throw err.message;
  }
  console.log("successfully connected to database.");
});
db.run("CREATE TABLE IF NOT EXISTS cvs(file_name, filePath)");
db.all("SELECT * FROM cvs", [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    $("#resultdetails").append("<li>" + "<span><a class='fa fa-address-card entry' style='color: #2bcbba'></a>&nbsp;" + row.file_name + "</span>" + ": " + "<a id= 'locationLink' href='#'>" + row.filePath + "</a>" + "</li>");
  });
});

db.close((err) => {
  if (err) {
    throw err.message();
  }
  console.log("Database closed successfully");
});


$("#browse-directory").click(() => {
  //opens directory window
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then(result => {
    $("#location").val(result.filePaths);
    let cvtitleSplit = $("#location").val().split("\\");
    //? Gets filename.
    let cvtitleValue = cvtitleSplit[cvtitleSplit.length -1 ];
    cvtitleValue = cvtitleValue.split(".");
    cvtitleValue = cvtitleValue[0];
    $("#cvTitle").val(cvtitleValue);
  }).catch(error => {
    reportresult(
      "LI",
      "list-group-item danger",
      "Browse directory",
      "Error : [" + error + "]",
      "resultdetails"
    );
  });
  
});

$("#add-file").click(() => {
  let locationValue = $('#location').val();
  let cvTitleValue = $('#cvTitle').val();
  let splitLocation = locationValue.split('\\');
  if ($("#location").val() && $("#cvTitle").val()) {
    // TODO: Find a better condition.
    if (splitLocation[splitLocation.length - 1].includes('.docx') || splitLocation[splitLocation.length - 1].includes('.pdf') || splitLocation[splitLocation.length - 1].includes('.doc')) {
      $("#resultdetails").append("<li>" + "<span><a class='fa fa-address-card' style='color: #2bcbba;'></a>&nbsp;" + $("#cvTitle").val() + "</span>" + ": " + "<a id= 'locationLink' href='#'>" + $('#location').val() + "</a>" + "</li>");
      let db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          throw err.message;
        }
        console.log("successfully connected to database.")
      });
      db.run("INSERT INTO cvs VALUES('" + cvTitleValue + "','" + locationValue + "')");
      db.close((err) => {
        if (err) {
          throw err.message;
        }
        console.log("Database closed successfully")
      });
   
      //? Create files dir then copies cv file.
      if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        fs.copyFile($('#location').val(), path.join(dir, splitLocation[splitLocation.length - 1]), (err) => {
          if (err) {
            throw err.message;
          }
          console.log("Successfully copied file.")
        });
      }

      bootsalert({
        className: "success",
        message: "Successfully added file to database.",
        container: "top-message",
        closebtn: true
      });
    } else {
      let extension = splitLocation[splitLocation.length - 1].split('.');
      extension = extension[extension.length - 1];
      bootsalert({
        className: "danger",
        message: "Only .docx/.doc and .pdf files are allowed" + " (You've selected a ." + extension + " file).",
        container: "top-message",
        closebtn: true
      });
    }

  } else {
    bootsalert({
      className: "info",
      message: "Empty user input.",
      container: "top-message",
      closebtn: true
    });
  }
});

$("#apply-rename").click(() => {
  if ($('#rename-options').val() == "1") {
    // Delete file from database.
    let db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        throw err.message;
      }
      console.log("successfully connected to database.");
    });

    db.all("SELECT * FROM cvs", [], (err, rows) => {
      if (err) {
        throw err.message;
      }
      let fileName = $("#input-delete-character").val();
      rows.forEach((row) => {
        if (row.file_name == fileName) {
          db.run("DELETE FROM cvs WHERE file_name = '" + fileName + "'");
          bootsalert({
            className: "success",
            message: fileName + " successfully removed from database (original file remains untouched).",
            container: "top-message",
            closebtn: true
          });
        } else {
          bootsalert({
            className: "danger",
            message: "CV is not in database.",
            container: "top-message",
            closebtn: true
          });
        }

      });
    });
    db.close((err) => {
      if (err) {
        throw err.message;
      }
      console.log("Database closed successfully")
    });
  } 
  //? Replace file in database
  if ($("#rename-options").val() == "2"){
    bootsalert({
      className: "success",
      message: "File successfully renamed.",
      container: "top-message",
      closebtn: true
    });
  }
  }
);
