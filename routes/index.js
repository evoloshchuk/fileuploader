var formidable = require('formidable');
    
/*
 * GET form page.
 */
exports.show_form = function(req, res) {
    res.render('show_form', { title: 'SuperUpload form' });
};

/*
 * POST file upload.
 * While processing the multipart form data, progress updates are sent to the
 * client. The client is determined by cid GET parameter and has to be valid in
 * order for upload to work.
 */
exports.upload_file = function(req, res) {
    // Get a reference to the open connection with the client.
    try {
        var connection = require('../websockets.js').io.sockets.socket(
            req.query["cid"]);
    } catch (e) {
        res.end("Error occured. Something went wrong.");
        return;
    }

    var files = []

    var form = formidable.IncomingForm()
    form.uploadDir = './uploads';
    
    var previously_reported_progress;
    
    /**
     * Calculate the upload progress and report it back to the client.
     */
    form.on("progress", function(bytesReceived, bytesExpected) {
        progress = parseInt(bytesReceived / bytesExpected * 100);
        console.log("Uploading " + progress + "%\n");
        // We can add more sophisticated logic here to determine the frequency
        // of progress updates. For now let's report only uniq progress updates.
        if (previously_reported_progress != progress) {
           connection.emit('progress', progress);
           previously_reported_progress = progress;
        }
    });
    
    /**
     * Something went wrong.
     */
    form.on('error', function(err) {
        console.log("Error while uploading file.")
        connection.emit('error');
        res.end();
    });
    
    /**
     * File received event.
     */
    form.on('file', function(field, file) { 
        files.push([field, file])
    });

    /**
     * Post data processed event.
     */
    form.on('end', function() {
        res.end();
        // Let's notify the client.
        var response = {'path': files[0][1].path, 'name': files[0][1].name}
        connection.emit('end', response) 
    });
     
    form.parse(req);
};


/*
 * POST form page.
 */
exports.post_form = function(req, res) {
    // Default values for expected fields
    var fields = {filename: "", filepath: "", message: ""};

    var form = formidable.IncomingForm();       

    /**
      * Field received event.
      */
    form.on('field', function(field, value) {
        fields[field] = value;
    });

    /**
     * Something went wrong.
     */
    form.on('error', function(err) {
        console.log("Error with processing form.")
        res.end("Error occured.")
    });
    
    /**
     * Post data processed event.
     */
    form.on('end', function() {
        res.render('post_form', {
            title: 'SuperUpload form posted',
            uploaded_filename: fields['filename'],
            uploaded_filepath: fields['filepath'],
            message: fields['message']});
    });
     
    form.parse(req);
};

