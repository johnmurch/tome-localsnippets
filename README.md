# localsnippets
Tome Lab Day - Create a Gallery for viewing various code snippets locally


# Problem:
I have a ton of templates, code snippets, hacks from various sites I have built or downloaded.

I want a way to
* View each code snippets in a beautiful way
* Search for Snippets based on tags/readme/license
* View specific templates

## Code
* generator.js - Builder to generate screenshots and create index.json which indexes all files/folders of your snippets
* index.json - (built from generator.js) Index of all files/folder of your snippets - also used for search
* app.js - Node.js (Express.js) app to view screenshots/project/folder
* view - folder containing templates for app
* snippets - folder to put your code snippets - included 3


## How to use

Download Repo

```
$ git clone https://github.com/johnmurch/localsnippets.git
```
Install Dependencies

```
$ npm install
```
**Be sure to copy/remove whatever code snippets you want and put them in the snippets folder. I included 3 templates from [HTML5UP](https://html5up.net/)**

Generate index.json file

```
$ node generate.js
```

Start web app

```
$ node generate.js
```

Visit [localhost:9001](http://localhost:9001)
