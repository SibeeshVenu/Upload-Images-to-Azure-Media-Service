var selectedFile = [];
var compCount = 0;
var submitUri = null;
var reader = null;
var totalFileSize = 0;
var upldCount = 0;
var totSize = 0;
var startDateTime;
var baseUrl = '';

function formatSizeUnits(bytes) {
    if (bytes >= 1000000000) { bytes = (bytes / 1000000000).toFixed(2) + ' GB'; }
    else if (bytes >= 1000000) { bytes = (bytes / 1000000).toFixed(2) + ' MB'; }
    else if (bytes >= 1000) { bytes = (bytes / 1000).toFixed(2) + ' KB'; }
    else if (bytes > 1) { bytes = bytes + ' bytes'; }
    else if (bytes == 1) { bytes = bytes + ' byte'; }
    else { bytes = '0 byte'; }
    return bytes;
}

function findDateDiff(date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    //take out milliseconds
    difference_ms = difference_ms / 1000;
    var seconds = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60;
    var minutes = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60;

    //var hours = Math.floor(difference_ms % 24);
    //var days = Math.floor(difference_ms / 24);

    return minutes + ' minute (s), and ' + seconds + ' second (s)';
};

$(document).ready(function () {
    $('#fiesInfo').html('');
    $('#divOutput').html('');
    upldCount = 0;
    totSize = 0;

    $('#file').change(function () {
        selectedFile = [];
        if (this.files.length > 0) {
            $.each(this.files, function (i, v) {
                totalFileSize = totalFileSize + v.size;
                selectedFile.push({ size: v.size, name: v.name, file: v });
            });
        }
    });
});

function RptDisplay() {
    $('#divOutput').hide();
    $('#fiesInfo').append('<table></table>');
    $('#fiesInfo table').append('<tr><td><b>No of files uploaded: </b></td><td>' + upldCount + '</td></tr>');
    $('#fiesInfo table').append('<tr><td><b>Total size uploaded: </b></td><td>' + formatSizeUnits(totSize) + '</td></tr>');
    var endDateTime = new Date();
    $('#fiesInfo table').append('<tr><td><b>Uploading ends at </b></td><td>' + endDateTime + '</td></tr>');
    $('#fiesInfo table').append('<tr><td><b>The time taken is </b></td><td>' + findDateDiff(startDateTime, endDateTime) + '</td></tr>');
    $('#divOutput').show();
};

function upload() {
    $('#fiesInfo').html('');
    $('#divOutput').html('');
    upldCount = 0;
    totSize = 0;
    startDateTime = new Date();
    $('#fiesInfo').append('<span><b> Uploading starts at </b></span>' + startDateTime);
    if (selectedFile == null) {
        alert("Please select a file first.");
    }
    else {
        for (var i = 0; i < selectedFile.length; i++) {
            fileUploader(selectedFile[i]);
            upldCount = upldCount + 1;;
            totSize = totSize + selectedFile[i].size;
        }
    }
};

$("#buttonUploadFile").click(function (e) {
    upload();
});

function fileUploader(selectedFileContent) {
    reader = new FileReader();
    var fileContent = selectedFileContent.file.slice(0, selectedFileContent.size - 1);
    reader.readAsArrayBuffer(fileContent);
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) {
            var currentAzureStorageUrl = baseUrl;
            var indexOfQueryStart = currentAzureStorageUrl.indexOf("?");
            var uuid = generateUUID();
            var fileExtension = selectedFileContent.name.split('.').pop();
            var azureFileName = uuid + '.' + fileExtension;
            submitUri = currentAzureStorageUrl.substring(0, indexOfQueryStart) + '/' + azureFileName + currentAzureStorageUrl.substring(indexOfQueryStart);
            var requestData = new Uint8Array(evt.target.result);
            ajaxUploadCall(submitUri, requestData);
        }
    };
}

function ajaxUploadCall(submitUri, selectedFileContent) {
    $.ajax({
        url: submitUri,
        type: "PUT",
        data: selectedFileContent,
        processData: false,
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        },
        success: function (data, status) {

        },
        complete: function (event, xhr, settings) {
            compCount = compCount + 1;
            if (selectedFile.length == compCount) {
                RptDisplay();
            }
        },
        error: function (xhr, desc, err) {
        }
    });
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};
