var express = require('express');
var exphbs = require('express-handlebars');

var fs = require('fs');
var initSqlJs = require('sql.js');
var filebuffer = fs.readFileSync('sqlitedb');
var all = {}



var app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
 
app.get('/', function (req, res) {
  initSqlJs().then(function(SQL){
    var db = new SQL.Database(filebuffer);
    var schema = db.exec('SELECT name, sql FROM sqlite_master WHERE type="table";')[0].values;
    schema.forEach(t => {
      all[t[0]] = db.exec('SELECT * FROM ' + t[0]);
    });
    var renderedTables= '';
    Object.keys(all).forEach(table => {
      renderedTables+= '<span>' + table + '</span><table><tbody><tr>';
      all[table][0].columns.forEach(column => {
        renderedTables+= '<th>' + column + '</th>'
      });
      renderedTables+= '</tr>';
      all[table][0].values.forEach(row => {
        renderedTables+= '<tr>';
        row.forEach(value => {
          renderedTables+= '<td>' + value + '</td>'
        });
        renderedTables+= '</tr>';
      });
      renderedTables+= '</tbody></table>'
    });
    res.render('home', {
      helpers: {
        renderedTables: function () { return renderedTables; }
      }
    });
  });
});
 
app.listen(3333);