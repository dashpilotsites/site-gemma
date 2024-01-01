const Handlebars = require('handlebars');
const prettify = require('html-prettify');
var uglifycss = require('uglifycss');
const fs = require('fs');

var uglified = uglifycss.processFiles(
  ['src/templates/style.css'], {
    maxLineLen: 500,
    expandVars: true
  }
);
fs.writeFileSync('./public/assets/style.min.css', uglified);

Handlebars.registerHelper("strip_tags", function(value) {
  return value.replace(/(<([^>]+)>)/gi, "");
});

Handlebars.registerHelper('ifEq', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEq', function(a, b, options) {
  if (a != b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifGt', function(a, b) {
  var next = arguments[arguments.length - 1];
  return (a > b) ? next.fn(this) : next.inverse(this);
});

// get the data
let rawdata = fs.readFileSync('./public/data.json', 'utf8');
const data = JSON.parse(rawdata);

data.current = 'page';
data.categories.forEach(function(item) {
  data.curPage = item;
  renderTemplate('page.html', item.slug + ".html", data);
})

data.current = 'item';
data.categories.forEach(function(cat) {
  cat.posts.forEach(function(item) {
    data.curPage = cat;
    data.curItem = item;
    renderTemplate('page.html', "work/" + item.slug + ".html", data);
  })
})


function renderTemplate(src, dest, data) {
  var source = fs.readFileSync('./src/templates/' + src, 'utf8');
  var template = Handlebars.compile(source);
  var result = template(data);
  // console.log(result);
  fs.writeFileSync('./public/' + dest, prettify(result));
}
