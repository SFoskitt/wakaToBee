var express = require('express');
var app = express();
var fetch = require('node-fetch');
var ConfigVars = require('./config_vars');
console.log('ConfigVars.port', ConfigVars.port);
app.set('port', (process.env.PORT || ConfigVars.port));
var wKey = (process.env.WAKAKEY || ConfigVars.wKey);
var bKey = (process.env.BEEKEY || ConfigVars.bKey);

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  var someDate = new Date();
  someDate.setDate(someDate.getDate() - 1);
  console.log('someDate', someDate);
  var tmp = someDate.toJSON();
  var thisDate = tmp.slice(0,10).replace(/-/g,'-');
  console.log('thisDate', thisDate);
  var url = 'https://wakatime.com/api/v1/users/current/durations?api_key='+ wKey +'&date=' + thisDate;
  fetch(url)
  .then(response => 
    response.json()
      .then(data => ({
          data: data,
      }))
    .then(res => {
        var info = res.data.data;
        var requestid = res.data.end;
        var startTime = res.data.start;
        var now = new Date().getTime();
        console.log('now', now);
        // var daystamp = Date.getYear() + Date.getMonth() + Date.getDay(); 
        // var daystamp = (new Date()).toISOString().slice(0,10).replace(/-/g,"");
        var daystamp = thisDate.replace(/-/g, '');
        console.log('daystamp', daystamp);
        // var sum = info.reduce((acc, elem) => {
        //   return acc + elem.duration;
        // }, 0)
        // var total = sum / 60 / 60;
        // console.log('total', total);
        // total = total.toString();

        // var beeUrl = 'https://beeminder.com/api/v1/users/liquidsilver/goals/wakatimefromzapier/datapoints.json?auth_token='+ bKey;
        // var beeOpts = {
        //   'method': 'POST',
        //   'headers': {
        //      'host': 'www.beeminder.com',
        //      'X-Target-URI': 'https://www.beeminder.com',
        //      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        // },
        //   'body': {
        //      'timestamp': now,
        //      'value': total,
        //      'comment': 'start' + startTime,
        //      'requestid': requestid,
        //      'daystamp': HELP HERE!!
        //   }
        // }

        // fetch(beeUrl, beeOpts)
        //   .then(function(response){
        //     return response.text();
        //   })
        //   .then(res => {
        //     console.log('some response inside the bee POST', res);
        //   })
        //   .catch(error => {
        //     console.error('error message:', error);
        //   });
    })
    .catch(error => {
      console.error('its an error: ', error);
    }));

  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


/**
 * THIS JSON BODY SUCCEEDED
 * {"timestamp":1494609823,"value":0.01023,"comment":"'from apigee'","id":"5915f024e1301f3e7d000f72","updated_at":1494609956,"requestid":"'abc1494609823'","canonical":"12 0.01023 \"'from apigee'\"","daystamp":"20170512","status":"created"}
 */


/*
SEE EVERNOTE AND APIGEE FOR FINAL SOLUTION - THIS ACTUALLY WORKS
1. COME UP WITH A BETTER SOLUTION FOR REQUESTID - SET THIS AS WAKATIME END TIME OR OTHER TO SPECIFY ONE DAY'S DATA
2. FIND SOMETHING IN ZAPIER THAT CAN CALL THE DEPLOYED URL ONCE PER DAY
3. PUT THE KEYS INTO HEROKU - *THEN* - PUSH TO GITHUB

*/