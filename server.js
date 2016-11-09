var express = require('express');
var app = express();
var fs = require('fs');
var elasticlunr = require('elasticlunr');
var path = require('path');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var _ = require('lodash');

var staticpath = __dirname;

// @todo - update /gallery to use config based file for index.json
app.use(serveStatic(__dirname + '/gallery'))
app.use(serveStatic(__dirname))

app.set('view engine', 'ejs');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var index = elasticlunr(function () {
    this.addField('folder');
    this.addField('readme');
    this.addField('license');
    this.addField('links');
    this.addField('files');
    this.addField('html');
    this.addField('search');
    this.setRef('folder');
});

var docs = JSON.parse(fs.readFileSync('index.json', 'utf8'));
docs.map(function (doc) {
  index.addDoc(doc);
});

app.get('/', function (req, res) {
  res.render('pages/search',{
    projects:docs,
    staticpath:staticpath,
    search:"",
    filter:null
  });
});

app.get('/search', function (req, res) {
  res.render('pages/search',{
    projects:docs,
    staticpath:staticpath,
    search:"",
    filter:null
  });
});


app.post('/search', function (req, res) {
  console.log(req.body)
  if(req.body.search==""|| req.body==null){
    res.redirect('/');
  }else{
    var result = index.search(req.body.search, {
        fields: {
            folder: {boost: 2, bool: "AND"},
            readme: {boost: 1},
            license: {boost: 1},
            links: {boost: 1},
            files: {boost: 1},
            html: {boost: 1},
            search: {boost: 1}
        },
        bool: "OR"
    });
    var match = result.map(function(r){
      return r.ref
    });
    // console.log(match);
    res.render('pages/search',{
      projects:docs,
      staticpath:staticpath,
      search:req.body.search,
      filter:match
    });  
  }
});


app.get('/folder/:folder', function (req, res) {
  var folder = req.params.folder.toString();
  var project = _.pickBy(docs, {folder:req.params.folder});
  console.log('project: ',project);

// @todo - check if exists
  // if(project === undefined){
  //   res.status('404').send('Not Found');
  // }else{
    for (var first in project) break; // @hack - to get first element in project
    res.render('pages/project',{
      project: project[first],
      staticpath: staticpath,
      search: "",
      filter: null
    });
  // }
  // res.send(project[first]);
});

// app.get('/search', function (req, res) {
//   res.send('search.html');
// });

app.listen(9001, function () {
  console.log('App listening on port 9001!');
});
