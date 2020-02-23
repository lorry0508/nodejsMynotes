app.get('/test', function(req,res) {
    fs.readFile('/file1', function(err,data) {
        if(err) {
            res.status(500).send('read filel error');
        }
        fs.readFile('/file2', function(err,data) {
            res.status(500).send('read file2 error');
        })
        res.type('text/plain');
        res.send(data);
    })
})