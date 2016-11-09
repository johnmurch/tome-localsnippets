// @FUTURE - SEPERATE OUT - HARDCODED CONFIGS
var CONFIG = {
  directory: __dirname + '/snippets',
  output: 'gallery',
  index: 'index.json'
};
console.log(CONFIG);

// /////////////////////////////////////////////////////////////////////////////
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var removeMd = require('remove-markdown');
var getUrls = require('get-urls');
var webshot = require('webshot');

function fileList (dir) {
  return fs.readdirSync(dir).reduce(function (list, file) {
    var name = path.join(dir, file);
    var isDir = fs.statSync(name).isDirectory();
    return list.concat(isDir ? fileList(name) : [name]);
  }, []);
}

function sanatizeFiles (files) {
  return _.without(files.map(function (file) {
    // remove .DS_Store from files
    return (file.toString().indexOf('.DS_Store') === -1) ? file : '';
  }), '');
}

function findFilter (files, key) {
  return _.without(files.map(function (file) {
    if(file.toLowerCase().indexOf(key) >- 1) {
      return file;
    }
  }), undefined);
}

function genScreenshots (htmlfiles) {
  return htmlfiles.map(function (file) {
    // @hack - change out snippet named folder
    var outputdir = CONFIG.directory.replace('/snippets', '/'+CONFIG.output);
    return file.replace('.html', '.png').replace(CONFIG.directory, outputdir);
  });
}

function stripRtf (str) {
    var basicRtfPattern = /\{\*?\\[^{}]+;}|[{}]|\\[A-Za-z]+\n?(?:-?\d+)?[ ]?/g;
    var newLineSlashesPattern = /\\\n/g;
    var ctrlCharPattern = /\n\\f[0-9]\s/g;

    // Remove RTF Formatting, replace RTF new lines with real line breaks, and remove whitespace
    return str
        .replace(ctrlCharPattern, '')
        .replace(basicRtfPattern, '')
        .replace(newLineSlashesPattern, '\n')
        .trim();
}

var folders = fs.readdirSync(CONFIG.directory);
// console.log('PATH: '+DIR);

// clean out .DS_Store
folders = _.without(folders, '.DS_Store');

var files = sanatizeFiles(fileList(CONFIG.directory));

// Build index.json which is a mapping of every file/folder of snippets
var maps = [];
folders.map(function (folder) {
  var filterFiles = _.partition(files, function(o) { return o.indexOf(CONFIG.directory + '/' + folder) >- 1; })[0];
  var rawcontents = (findFilter(filterFiles, 'readme').length !=0) ? fs.readFileSync(findFilter(filterFiles, 'readme')[0]).toString() : "";
  var contents = removeMd(stripRtf(rawcontents));
  var search = contents + filterFiles.toString();
  maps.push({
    folder: folder,
    readme: findFilter(filterFiles, 'readme'),
    license: findFilter(filterFiles, 'license'),
    links: getUrls(contents),
    files: filterFiles,
    html: findFilter(filterFiles, '.html'),
    screenshots: genScreenshots(findFilter(filterFiles, '.html')),
    search: search
  });

  // @future - Generate basic configs for each snippets
  // e.g. license, Readme, link to downloaded source
  // write meta file? // Create new file for part of index?
  // console.log("WRITE",);
  // if (!fs.existsSync(folder+'/meta.json')){
  //   var meta = {
  //     readme: findFilter(filterFiles, 'readme'),
  //     license: findFilter(filterFiles, 'license'),
  //     tags: [],
  //     favorite: false,
  //   }
  //   file.writeFileSync(folder+'/meta.json', meta);
  // }
});

// WRITE INDEX OUT
console.log('Generate INDEX');
var outputFilename = CONFIG.index;
fs.writeFile(outputFilename, JSON.stringify(maps, null, 4), function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('INDEX saved to ' + outputFilename);
    }

    // NEXT
    console.log('Generate Screenshots');
    if (!fs.existsSync(CONFIG.output)) {
      fs.mkdirSync(__dirname + '/' + CONFIG.output, '0744');
    }

    // Create mapping of HTML files and Screenshots (images)
    var shots=[];
    maps.map(function(project){
      for(var i=0;i<project.html.length;i++){
        shots.push({
          html:project.html[i],
          image:project.screenshots[i]
        });
      }
    });
    console.log('Screenshots to Build: ', shots.length);

    // @future - Move Configs for Phantomjs Screenshotting
    // @future - take full screenshot - 'all'
    var options = {
      phantomConfig: {'ignore-ssl-errors': 'true'},
      screenSize: {
        width: 1280,
        height: 800
      },
     renderDelay: 5000,
     shotSize: {
       width: 1280,
       height: 800
     },
     userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
        + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
    };
    shots.filter(function (shot) {
      if (!fs.existsSync(shot.image)) {
        webshot('file://' + shot.html, shot.image, options, function (err) {
          // screenshot now saved to flickr.jpeg
          if (err) {
            console.log('ERROR: ', err);
          }
          console.log(shot.image);
        });
      }
    });
});
