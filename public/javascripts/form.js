/**
 * Asynchronous file uploading with a real-time progress report.
 *
 * To implemet Asynchronous file uploading the iframe approach is used.
 * Also there are few other well-known techniques for this task exist, but they
 * all seems to be less widely supported by old browsers. 
 *
 * To implement progress bar socket.io library is used. 
 * Again, there are a few well-known technics to implemtent this, but socket.io
 * does it out-of-the box, and it give much better expirience by choosing the
 * best transport browser can support.
 */

$(document).ready(function() {

    var upload_status = $("#upload_status");
    
    // Connection to the server.
    var socket;
  
    /**
     * Selecting a file will trigger asynchronous uploading process immediatly.
     */
    $("#upload_file").change(function() {
        // Open connection?
        if (socket && !socket.disconnected) {
            // Let's close it.
            socket.disconnect();
            // Let's clear main form file related fields.
            $("#filename").val("");
            $("#filepath").val("");
        }
        
        // Open a new connection with a server
        var options = {'force new connection': true};
        socket = io.connect($(location).attr('href'), options);

        /**
         * Connection with server established event.
         *   connection_id - The id of the established connection.
         */
        socket.on("connection", function(connection_id) {
            // Let's append the id of established connection to the upload url,
            // so server can communicate back the upload progress later.
            var upload_form = $("#upload_form")
            upload_form.attr("action", "/upload_file?cid=" + connection_id);
            upload_form.submit();
        });
        
        /**
         * Upload in progress event.
         *   percentage - percentage of the uploaded data.
         */
        socket.on("progress", function (percentage) {
            upload_status.text(percentage + '%');
        });

        /**
         * Upload failed event.
         */
        socket.on("error", function () {
            upload_status.text('Upload failed. Try again.');
        });

        /**
         * Upload finished event.
         *   data - name and path of the uploaded file.
         * Note: Normaly some kind of id of the uploaded file will be returend
         *       as well, so it can be comminicated back with the main form.
         */
        socket.on("end", function (data) {
            socket.disconnect();
            upload_status.text('100% ' + data["path"]);
            $("#filename").val(data["name"]);
            $("#filepath").val(data["path"]);
        });
        
        /**
         * Iframe should return empty page, otherwise it's error message.
         */
        $("#upload_target").load(function() {
            var contnet = $("#upload_target").contents().find('html').text();
            if (contnet) {
                upload_status.text(contnet);
            }
        });
    });

});
