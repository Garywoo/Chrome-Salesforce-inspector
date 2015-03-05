function dataImport() {
  // Load a blank page and then inject the HTML to work around https://bugzilla.mozilla.org/show_bug.cgi?id=792479
  // An empty string as URL loads about:blank synchronously
  var popupWin;
  if (window.unsafeWindow && window.XPCNativeWrapper) {
    // Firefox
    // Use unsafeWindow to work around https://bugzilla.mozilla.org/show_bug.cgi?id=996069
    popupWin = new XPCNativeWrapper(unsafeWindow.open("", "", "width=900,height=800,scrollbars=yes"));
  } else {
    // Chrome
    popupWin = open("", "", "width=900,height=800,scrollbars=yes");
  }
  window.addEventListener("pagehide", function() {
    // All JS runs in the parent window, and will stop working when the parent goes away. Therefore close the popup.
    popupWin.close();
  });
  var document = popupWin.document;
  document.head.innerHTML = '\
  <title>Data Import</title>\
  <style>\
  body {\
    font-family: Arial, Helvetica, sans-serif;\
    font-size: 11px;\
    overflow: hidden;\
    margin-top: 0;\
  }\
  #user-info {\
    background-color: #1797c0;\
    color: white;\
    padding: .5em;\
    border-radius: 0 0 10px 10px;\
    margin-bottom: 8px;\
  }\
  textarea {\
    display:block;\
    width: 100%;\
    resize: vertical;\
    white-space: pre;\
    word-wrap: normal;\
  }\
  #result-box {\
    margin-top: 3px;\
    overflow: auto;\
  }\
  #data {\
    height:17em;\
    margin-top: 3px;\
  }\
  #import-result {\
    height: calc(100% - 2px);\
    resize: none;\
  }\
  .area {\
    background-color: #F8F8F8;\
    padding: 3px;\
    border-radius: 5px;\
    border: 1px solid #E0E3E5;\
    border-top: 3px solid #1797C0;\
  }\
  h1 {\
    font-size: 1.2em;\
    margin: 0px;\
    display: inline;\
  }\
  .action-arrow {\
    text-align: center;\
  }\
  .arrow-body {\
    background-color: green;\
    width: 100px;\
    margin: 0 auto;\
    padding-top: 5px;\
  }\
  .arrow-head {\
    border-left: 50px solid transparent;\
    border-right: 50px solid transparent;\
    border-top: 15px solid green;\
    width: 0;\
    margin: 0 auto -8px;\
    position: relative;\
  }\
  .area label {\
    font-weight: bold;\
    color: #4a4a56;\
    padding-left: 15px;\
    white-space: nowrap;\
  }\
  .area * {\
    vertical-align: middle\
  }\
  #import-help-btn {\
    float: right;\
    margin-top: 3px;\
  }\
  #spinner {\
    position: absolute;\
    left: -15px;\
    top: -15px;\
  }\
  .area label.statusGroupEmpty {\
    color: lightgray;\
    font-weight: normal;\
  }\
  .batch-size {\
    width: 3.4em;\
  }\
  .cancel-btn {\
    float: right;\
    height: 1.3em;\
    border: 1px solid gray;\
  }\
  </style>\
  ';

  document.body.innerHTML = '\
  <img id="spinner" src="data:image/gif;base64,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" data-bind="visible: spinnerCount() > 0">\
  <div id="user-info" data-bind="text: userInfo"></div>\
  <div class="area">\
    <h1>Input data</h1>\
    <label><span>Format:</span> <select data-bind="value: dataFormat"><option value="excel">Excel<option value="csv">CSV</select></label>\
    <label><span>Action:</span> <select data-bind="value: importAction"><option value="create">Insert<option value="update">Update<option value="delete">Delete</select></label>\
    <label><span>Object:</span> <input type="text" data-bind="value: importType" list="sobjectlist"></label>\
    <label title="The number of records per batch. A higher value is faster but increases the risk of errors due to governor limits."><span>Batch size:</span> <input type="number" data-bind="value: batchSize" class="batch-size"></label>\
    <label title="The number of batches to execute concurrently. A higher number is faster but increases the risk of errors due to lock congestion."><span>Threads:</span> <input type="number" data-bind="value: batchConcurrency" class="batch-size"></label>\
    <datalist id="sobjectlist" data-bind="foreach: sobjectList"><option data-bind="attr: {value: $data}"></datalist>\
    <a href="about:blank" id="import-help-btn" data-bind="click: toggleHelp">Import help</a>\
    <textarea id="data" data-bind="style: {maxHeight: (winInnerHeight() - 200) + \'px\'}"></textarea>\
    <div data-bind="visible: showHelp">\
      <p>Use for quick one-off data imports. Support is currently limited and may destroy your data.</p>\
      <ul>\
        <li>Enter your CSV or Excel data in the box above.\
          <ul>\
            <li>The input must contain a header row with field API names.</li>\
            <li>To use an external ID for a lookup field, the header row should contain the lookup relation name, the target sobject name and the external ID name separated by colons, e.g. "MyLookupField__r:MyObject__c:MyExternalIdField__c".</li>\
            <li>Empty cells insert null values.</li>\
            <li>Number, date, time and checkbox values must conform to the relevant <a href="http://www.w3.org/TR/xmlschema-2/#built-in-primitive-datatypes" target="_blank">XSD datatypes</a>.</li>\
            <li>Columns starting with an underscore are ignored.</li>\
            <li>You can use the result of an import to retry failed records. If the input contains a "__Status" column, records marked as "Succeeded" will not be imported.</li>\
          </ul>\
        </li>\
        <li>Select your input format</li>\
        <li>Select an action (insert, update or delete)</li>\
        <li>Enter the API name of the object to import</li>\
        <li>Press Import</li>\
      </ul>\
      <p>Upsert is not supported. Bulk API is not supported. Large data volumes may freeze or crash your browser.</p>\
    </div>\
  </div>\
  <div class="action-arrow">\
    <div class="arrow-body"><button data-bind="click: doImport, disable: activeBatches() > 0">Import</button><div style="color:white;font-weight:bold;font-size:1.4em;margin-top:.3em;text-shadow:2px 2px 3px red">BETA!</div></div>\
    <div class="arrow-head"></div>\
  </div>\
  <div class="area">\
    <h1>Import result</h1>\
    <label><input type=radio name="data-format" value="excel" data-bind="checked: dataResultFormat"> <span>Excel</span></label>\
    <label><input type=radio name="data-format" value="csv" data-bind="checked: dataResultFormat"> <span>CSV</span></label>\
    <button class="cancel-btn" data-bind="visible: importData().counts.Queued > 0, click: stopImport">Stop</button>\
    <div>\
      <span>Status:</span>\
      <label data-bind="css: {statusGroupEmpty: importData().counts.Queued == 0}"><input type=checkbox data-bind="checked: showStatus.Queued"> <span data-bind="text: importData().counts.Queued"></span> <span>Queued</span></label>\
      <label data-bind="css: {statusGroupEmpty: importData().counts.Processing == 0}"><input type=checkbox data-bind="checked: showStatus.Processing"> <span data-bind="text: importData().counts.Processing"></span> <span>Processing</span></label>\
      <label data-bind="css: {statusGroupEmpty: importData().counts.Succeeded == 0}"><input type=checkbox data-bind="checked: showStatus.Succeeded"> <span data-bind="text: importData().counts.Succeeded"></span> <span>Succeeded</span></label>\
      <label data-bind="css: {statusGroupEmpty: importData().counts.Failed == 0}"><input type=checkbox data-bind="checked: showStatus.Failed"> <span data-bind="text: importData().counts.Failed"></span> <span>Failed</span></label>\
      <label data-bind="css: {statusGroupEmpty: importData().counts.Canceled == 0}"><input type=checkbox data-bind="checked: showStatus.Canceled"> <span data-bind="text: importData().counts.Canceled"></span> <span>Canceled</span></label>\
    </div>\
    <div id="result-box" data-bind="style: {height: (winInnerHeight() - resultBoxOffsetTop() - 25) + \'px\'}">\
      <textarea id="import-result" readonly data-bind="value: importResult()"></textarea>\
    </div>\
  </div>\
  ';

  var importError = ko.observable(null);

  var vm = {
    spinnerCount: ko.observable(0),
    showHelp: ko.observable(false),
    userInfo: ko.observable("..."),
    winInnerHeight: ko.observable(0),
    resultBoxOffsetTop: ko.observable(0),
    sobjectList: ko.observable([]),
    dataFormat: ko.observable("Excel"),
    importAction: ko.observable("create"),
    importType: ko.observable("Account"),
    batchSize: ko.observable("200"),
    batchConcurrency: ko.observable("10"),
    activeBatches: ko.observable(0),
    dataResultFormat: ko.observable("excel"),
    showStatus: {
      Queued: ko.observable(true),
      Processing: ko.observable(true),
      Succeeded: ko.observable(true),
      Failed: ko.observable(true),
      Canceled: ko.observable(true)
    },
    importData: ko.observable({
      counts: {Queued: 0, Processing: 0, Succeeded: 0, Failed: 0, Canceled: 0},
      header: null,
      data: null,
      statusColumnIndex: -1,
      stopProcessing: function() {}
    }),
    importResult: function() {
      if (importError()) {
        return importError();
      }
      if (vm.importData().data == null) {
        return "";
      }
      var statusColumnIndex = vm.importData().statusColumnIndex;
      var filteredData = vm.importData().data.filter(function(row) { return vm.showStatus[row[statusColumnIndex]](); });
      return csvSerialize([vm.importData().header].concat(filteredData), vm.dataResultFormat() == "excel" ? "\t" : ",");
    },
    toggleHelp: function() {
      vm.showHelp(!vm.showHelp());
    },
    doImport: doImport,
    stopImport: function() {
      vm.importData().stopProcessing();
    }
  };

  ko.applyBindings(vm, document.documentElement);

  var dataInput = document.querySelector("#data");

  var resultBox = document.querySelector("#result-box");
  function recalculateHeight() {
    vm.resultBoxOffsetTop(resultBox.offsetTop);
  }
  dataInput.addEventListener("mousemove", recalculateHeight);
  popupWin.addEventListener("mouseup", recalculateHeight);
  popupWin.addEventListener("resize", function() {
    vm.winInnerHeight(popupWin.innerHeight);
    recalculateHeight(); // a resize event is fired when the window is opened after resultBox.offsetTop has been initialized, so initializes vm.resultBoxOffsetTop
  });

  function spinFor(promise) {
    vm.spinnerCount(vm.spinnerCount() + 1);
    promise.then(stopSpinner, stopSpinner);
  }
  function stopSpinner() {
    vm.spinnerCount(vm.spinnerCount() - 1);
  }

  spinFor(askSalesforce("/services/data/v33.0/sobjects/").then(function(res) {
    vm.sobjectList(res.sobjects.map(function(sobjectDescribe) { return sobjectDescribe.name; }));
  }));

  spinFor(askSalesforceSoap("<getUserInfo/>").then(function(res) {
    vm.userInfo(res.querySelector("Body userFullName").textContent + " / " + res.querySelector("Body userName").textContent + " / " + res.querySelector("Body organizationName").textContent);
  }));

  function doImport() {

    var text = dataInput.value;
    var separator = vm.dataFormat() == "excel" ? "\t" : ",";
    var data;
    try {
      data = csvParse(text, separator);
    } catch (e) {
      console.log(e);
      importError("=== ERROR ===\n" + e.message);
      dataInput.setSelectionRange(e.offsetStart, e.offsetEnd);
      return;
    }

    if (data.length < 2) {
      importError("=== ERROR ===\nNo records to import");
      return;
    }

    var header = data.shift();
    var idColumn = -1;

    for (var c = 0; c < header.length; c++) {
      if (header[c][0] != "_" && !/^[a-zA-Z0-9_]+(:[a-zA-Z0-9_]+:[a-zA-Z0-9_]+)?$/.test(header[c])) {
        importError("=== ERROR ===\nInvalid column name: " + header[c]);
        return;
      }
      if (header[c].toLowerCase() == "id") {
        idColumn = c;
      }
    }

    var action = vm.importAction();
    var sobjectType = vm.importType();

    if (!/^[a-zA-Z0-9_]+$/.test(sobjectType)) {
      importError("=== ERROR ===\nInvalid object name: " + sobjectType);
      return;
    }

    if (action != "create" && idColumn < 0) {
      importError("=== ERROR ===\nThere is no ID column");
      return;
    }

    var batchSize = +vm.batchSize();
    if (!(batchSize > 0)) { // This also handles NaN
      importError("=== ERROR ===\nBatch size must be a positive number");
      return;
    }

    var batchConcurrency = +vm.batchConcurrency();
    if (!(batchConcurrency > 0)) { // This also handles NaN
      importError("=== ERROR ===\nBatch concurrency must be a positive number");
      return;
    }

    var statusColumnIndex = header.indexOf("__Status");
    if (statusColumnIndex == -1) {
      statusColumnIndex = header.length;
      header.push("__Status");
      data.forEach(function(row) {
        row.push("");
      });
    }
    var resultIdColumnIndex = header.indexOf("__Id");
    if (resultIdColumnIndex == -1) {
      resultIdColumnIndex = header.length;
      header.push("__Id");
      data.forEach(function(row) {
        row.push("");
      });
    }
    var errorColumnIndex = header.indexOf("__Errors");
    if (errorColumnIndex == -1) {
      errorColumnIndex = header.length;
      header.push("__Errors");
      data.forEach(function(row) {
        row.push("");
      });
    }

    var batches = [];
    var batchRows = [];
    var importedRecords = 0;
    var skippedRecords = 0;
    var doc = window.document.implementation.createDocument(null, action);
    for (var r = 0; r < data.length; r++) {
      if (batchRows.length == batchSize) {
        batches.push({
          batchXml: new XMLSerializer().serializeToString(doc),
          batchRows: batchRows
        });
        batchRows = [];
        doc = window.document.implementation.createDocument(null, action);
      }
      var row = data[r];
      if (row[statusColumnIndex] == "Succeeded") {
        skippedRecords++;
        continue;
      }
      importedRecords++;
      batchRows.push(row);
      row[statusColumnIndex] = "Queued";
      if (action == "delete") {
        var deleteId = doc.createElement("ID");
        deleteId.textContent = row[idColumn];
        doc.documentElement.appendChild(deleteId);
      } else {
        var sobjects = doc.createElement("sObjects");
        var type = doc.createElement("type");
        type.textContent = sobjectType;
        sobjects.appendChild(type);
        for (var c = 0; c < row.length; c++) {
          if (header[c][0] != "_") {
            var columnName = header[c].split(":");
            if (row[c].trim() == "") {
              var field = doc.createElement("fieldsToNull");
              if (columnName.length == 1) { // Our regexp ensures there are always one or three elements in the array
                field.textContent = columnName[0];
              } else {
                field.textContent = /__r$/.test(columnName[0]) ? columnName[0].replace(/__r$/, "__c") : columnName[0] + "Id";
              }
              sobjects.appendChild(field);
            } else {
              if (columnName.length == 1) { // Our regexp ensures there are always one or three elements in the array
                // For Mozilla reviewers: doc is a SOAP XML document.
                var field = doc.createElement(columnName[0]);
                field.textContent = row[c];
              } else {
                var subType = doc.createElement("type");
                subType.textContent = columnName[1];
                // For Mozilla reviewers: doc is a SOAP XML document.
                var subField = doc.createElement(columnName[2]);
                subField.textContent = row[c];
                // For Mozilla reviewers: doc is a SOAP XML document.
                var field = doc.createElement(columnName[0]);
                field.appendChild(subType);
                field.appendChild(subField);
              }
              sobjects.appendChild(field);
            }
          }
        }
        doc.documentElement.appendChild(sobjects);
      }
    }
    batches.push({
      batchXml: new XMLSerializer().serializeToString(doc),
      batchRows: batchRows
    });

    if (vm.activeBatches() > 0) {
      importError("=== ERROR ===\nCannot start a new import while another is still in progress");
      return;
    }

    if (!popupWin.confirm("You are about to modify your data in Salesforce. This action cannot be undone."
      + " " + importedRecords + " records will be imported."
      + (skippedRecords > 0 ? " " + skippedRecords + " records will be skipped because they have __Status Succeeded." : ""))
    ) {
      return;
    }

    function updateResult() {
      var counts = {Queued: 0, Processing: 0, Succeeded: 0, Failed: 0, Canceled: 0};
      data.forEach(function(row) {
        counts[row[statusColumnIndex]]++;
      });
      vm.importData({counts: counts, header: header, data: data, statusColumnIndex: statusColumnIndex, stopProcessing: stopProcessing});
    }

    function stopProcessing() {
      while (batches.length > 0) {
        var batch = batches.shift();
        batch.batchRows.forEach(function(row) {
          row[statusColumnIndex] = "Canceled";
        });
      }
      updateResult();
      vm.activeBatches(0);
    }

    importError(null);
    updateResult();

    vm.activeBatches(batches.length);
    for (var i = 0; i < batchConcurrency && batches.length > 0; i++) {
      executeBatch();
    }

    function executeBatch() {
      var batch = batches.shift();
      batch.batchRows.forEach(function(row) {
        row[statusColumnIndex] = "Processing";
      });
      updateResult();
      spinFor(askSalesforceSoap(batch.batchXml).then(function(res) {
        var results = res.querySelectorAll("Body result");
        for (var i = 0; i < results.length; i++) {
          var result = results[i];
          var row = batch.batchRows[i];
          if (result.querySelector("success").textContent == "true") {
            row[statusColumnIndex] = "Succeeded";
          } else {
            row[statusColumnIndex] = "Failed";
          }
          row[resultIdColumnIndex] = result.querySelector("id").textContent;
          var errorNodes = result.querySelectorAll("errors");
          var errors = [];
          for (var e = 0; e < errorNodes.length; e++) {
            var errorNode = errorNodes[e];
            var fieldNodes = errorNode.querySelectorAll("fields");
            var fields = [];
            for (var f = 0; f < fieldNodes.length; f++) {
              var fieldNode = fieldNodes[f];
              fields.push(fieldNode.textContent);
            }
            var error = errorNode.querySelector("statusCode").textContent + ": " + errorNode.querySelector("message").textContent + " [" + fields.join(", ") + "]";
            errors.push(error);
          }
          row[errorColumnIndex] = errors.join(", ");
        }
      }, function(xhr) {
        if (!xhr || xhr.readyState != 4) {
          throw xhr; // Not an HTTP error response
        }
        var errorText;
        if (xhr.responseXML != null) {
          var soapFaults = xhr.responseXML.querySelectorAll("faultstring");
          var errors = [];
          for (var i = 0; i < soapFaults.length; i++) {
            errors.push(soapFaults[i].textContent);
          }
          errorText = errors.join(", ");
        } else {
          console.error(xhr);
          errorText = "Connection to Salesforce failed" + (xhr.status != 0 ? " (HTTP " + xhr.status + ")" : "");
        }
        batch.batchRows.forEach(function(row) {
          row[statusColumnIndex] = "Failed";
          row[resultIdColumnIndex] = "";
          row[errorColumnIndex] = errorText;
        });
      }).then(function() {
        updateResult();
        vm.activeBatches(vm.activeBatches() - 1);
        if (batches.length > 0) {
          executeBatch();
        }
      }).catch(function(error) {
        console.error(error);
        popupWin.alert("UNEXPECTED EXCEPTION: " + error);
      }));
    }

  }

  function csvSerialize(table, separator) {
    return table.map(function(row) { return row.map(function(text) { return "\"" + ("" + (text == null ? "" : text)).replace("\"", "\"\"") + "\""; }).join(separator); }).join("\r\n");
  }

  function csvParse(csv, separator) {
    var table = [];
    var row = [];
    var offset = 0;
    while (true) {
      var text, next;
      if (offset != csv.length && csv[offset] == "\"") {
        next = csv.indexOf("\"", offset + 1);
        text = "";
        while (true) {
          if (next == -1) {
            throw {message: "Quote not closed", offsetStart: offset, offsetEnd: offset + 1};
          }
          text += csv.substring(offset + 1, next);
          offset = next + 1;
          if (offset == csv.length || csv[offset] != "\"") {
            break;
          }
          text += "\"";
          next = csv.indexOf("\"", offset + 1);
        }
      } else {
        next = csv.length;
        i = csv.indexOf(separator, offset);
        if (i != -1 && i < next) {
          next = i;
        }
        var i = csv.indexOf("\n", offset);
        if (i != -1 && i < next) {
          if (i > offset && csv[i - 1] == "\r") {
            next = i - 1;
          } else {
            next = i;
          }
        }
        text = csv.substring(offset, next);
        offset = next;
      }
      row.push(text);
      if (offset == csv.length) {
        if (row.length != 1 || row[0] != "") {
          table.push(row);
        }
        if (table.length == 0) {
          throw {message: "no data", offsetStart: 0, offsetEnd: csv.length};
        }
        var len = table[0].length;
        for (var i = 0; i < table.length; i++) {
          if (table[i].length != len) {
            throw {
              message: "row " + (i + 1) + " has " + table[i].length + " cells, expected " + len,
              offsetStart: csv.split("\n").slice(0, i).join("\n").length + 1,
              offsetEnd: csv.split("\n").slice(0, i + 1).join("\n").length
            };
          }
        }
        return table;
      } else if (csv[offset] == "\n") {
        offset++;
        table.push(row);
        row = [];
      } else if (csv[offset] == "\r" && offset + 1 < csv.length && csv[offset + 1] == "\n") {
        offset += 2;
        table.push(row);
        row = [];
      } else if (csv[offset] == separator) {
        offset++;
      } else {
        throw {message: "unexpected token '" + csv[offset] + "'", offsetStart: offset, offsetEnd: offset + 1};
      }
    }
  }
}