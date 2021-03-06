// Client ID and API key from the Developer Console
      var CLIENT_ID = '948438566026-t1l8noj0ld61278en99lkjq907405e1n.apps.googleusercontent.com';

      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = 'https://www.googleapis.com/auth/drive';

      var ID_FILE_ASSOCIAZIONI = '1EOJHCvlMuRgQzdBw4QBbiczxnNo7uVBN9HQiidVHy4g';
      var TITOLO_FILE_ASSOCIAZIONI = 'ASSOCIAZIONI_INDIRIZZO_GENERICO';
      var ASL_FOLDER_NAME="#ITIS-RIVA-MODULISTICA_ASL#";

      var authorizeButton = document.getElementById('authorize-button');
      var signoutButton = document.getElementById('signout-button');
      var copyFileButton = document.getElementById('copy-file');

      var folderId = 'root';

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
          copyFileButton.onclick= handleCopyFileClick;
        });
      }

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'inline-block';
          copyFileButton.style.display = 'inline-block';
        } else {
          authorizeButton.style.display = 'inline-block';
          signoutButton.style.display = 'none';
          copyFileButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

       /**
       *  Sign out the user upon button click.
       */
      function handleCopyFileClick(event) {
        createAssociationFile();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

      var DRIVE_FOLDER_LINK = "https://drive.google.com/drive/folders/";
      var DRIVE_SPREADSHEET_LINK = "https://docs.google.com/spreadsheets/d/";
      var GO_TO_FOLDER = "Vai alla cartella";
      var OPEN_SPREADSHEET = "Apri il folglio di lavoro appena creato";
      function appendLink(folderLink, text, fileId)
      {
        var pre = document.getElementById('content');
        var a = document.createElement('a');
        var linkText = document.createTextNode(text);
        a.appendChild(linkText);
        a.title = text;
        a.href = folderLink+fileId;
        a.target="_blank"
        pre.appendChild(a);
        var textContent = document.createTextNode('\n');
        pre.appendChild(textContent);
      }

      function appendElement(el)
      {
        var pre = document.getElementById('content');
        pre.appendChild(document.createElement(el));
      }

      /**
       * Print files.
       */
      function listFiles() {

        var query = "name='" + ASL_FOLDER_NAME + "'";
        gapi.client.drive.files.list({
          'pageSize': 10,
          'fields': "nextPageToken, files(id, name)",
          'q' : query
        }).then(function(response) {
          appendPre('Files:');
          var files = response.result.files;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              appendPre(file.name + ' (' + file.id + ')');
            }
          } else {
            appendPre('No files found.');
          }
        });
      }

      function createAssociationFile()
      {
        
        var query = "trashed=false and name='" + ASL_FOLDER_NAME + "'";
        gapi.client.drive.files.list({
          'pageSize': 10,
          'fields': "nextPageToken, files(id, name)",
          'q' : query
        }).then(
          function(response) {
            var files = response.result.files;
            if (files && files.length > 0) {
              var folderId = files[0].id;
              appendPre('Cartella '+ ASL_FOLDER_NAME + ' trovata; copia del file '+ TITOLO_FILE_ASSOCIAZIONI + ' in corso');
              appendLink(DRIVE_FOLDER_LINK, GO_TO_FOLDER, folderId);
              copyFile(ID_FILE_ASSOCIAZIONI, TITOLO_FILE_ASSOCIAZIONI, folderId)
            }
            else {
              appendPre('Cartella '+ ASL_FOLDER_NAME + ' non trovata; creazione cartella in corso');
              createFolderAndAddFile();
            }            
          });

        }


      function createFolderAndAddFile(){
        //var rootFolderId = resp.rootFolderId;
        data = new Object();
        data.name = ASL_FOLDER_NAME;
        data.parents = [{"id":'root'}];
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.create({'resource': data}).execute(
          function(resp)
          {
            appendPre('Cartella '+ ASL_FOLDER_NAME + ': creazione terminata; copia del file '+ TITOLO_FILE_ASSOCIAZIONI + ' in corso');
            appendLink(DRIVE_FOLDER_LINK, GO_TO_FOLDER,resp.id);
            copyFile(ID_FILE_ASSOCIAZIONI, TITOLO_FILE_ASSOCIAZIONI, resp.id)

          });
      }

      function copyFile(originFileId, copyTitle, parentFolderId) {
        var body = {'name': copyTitle};
        var request = gapi.client.drive.files.copy({
          'fileId': originFileId,
          
          'parents': [parentFolderId],
          'name':copyTitle
        });
        request.execute(function(resp) {
          appendPre('Copia del file '+ TITOLO_FILE_ASSOCIAZIONI + ' terminata con successo');
          appendLink(DRIVE_SPREADSHEET_LINK, OPEN_SPREADSHEET,resp.id);
          appendElement('hr');
        });
      }

      /**
       * Remove a file from a folder.
       *
       * @param {String} folderId ID of the folder to remove the file from.
       * @param {String} fileId ID of the file to remove from the folder.
       */
      function removeFileFromFolder(folderId, fileId) {
        var request = gapi.client.drive.parents.delete({
          'parentId': folderId,
          'fileId': fileId
        });
        request.execute(function(resp) { });
      }


      /**
       * Return a list of parents Id
       *
       * @param {String} fileId ID of the file to insert.
       */
      function getParents(fileId) {
        var request = gapi.client.drive.parents.list({
          'fileId': fileId
        });
        parents = new Array();
        request.execute(function(resp) {
          for (parent in resp.items) {
            //console.log('File Id: ' + resp.items[parent].id);
            parents.add(resp.items[parent].id);
          }
        });
      }

      /**
       * Insert a file into a folder.
       *
       * @param {String} folderId ID of the folder to insert the file into.
       * @param {String} fileId ID of the file to insert.
       */
      function insertFileIntoFolder(folderId, fileId) {
        var body = {'id': folderId};
        var request = gapi.client.drive.parents.insert({
          'fileId': fileId,
          'resource': body
        });
        request.execute(function(resp) { });
      }