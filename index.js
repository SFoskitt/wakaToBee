var express = require('express');
var dotenv = require('dotenv').config();
var https = require('https');

var app = express();
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var wKey = process.env.WAKAKEY;
var bKey = process.env.BEEKEY;

app.get('/', function(request, response) {

  // variables setup for wakatime
  var someDate = new Date();
  someDate.setDate(someDate.getDate() - 1);
  var tmp = someDate.toJSON();
  var thisDate = tmp.slice(0,10).replace(/-/g,'-');
  var wakaUrl = 'https://wakatime.com/api/v1/users/current/durations?api_key='+ wKey +'&date=' + thisDate;
  var tempData = [];

  // GET request to wakatime
  https.get(wakaUrl, (res) => {
    console.log(`status from waka: ${res.statusCode}`);
    res.on('data', (chunk) => {
      tempData.push(chunk);
    })
    res.on('end', (wakaData) => {
      var wakaData = JSON.parse(Buffer.concat(tempData));
      console.log(`wakaData: ${wakaData}`);

      // variables and data setup for beeminder
      var requestid = wakaData.end;
      var startTime = wakaData.start;
      var now = Math.floor(new Date().getTime()/1000);  // getTime() returns timestamp in milliseconds, needs seconds
      var daystamp = thisDate.replace(/-/g, '');
      var sum = wakaData.data.reduce((acc, elem) => {
        return acc + elem.duration;
      }, 0)
      var total = sum / 60 / 60;  // Math.round(num * 100) / 100

      var beeBody = JSON.stringify({
        value: total,
        timestamp: now,
        daystamp: daystamp,
        comment: 'start: ' + startTime + 'end: ' + wakaData.data.end,
        requestid: requestid,
      })

      var beeOpts = {
        hostname: 'www.beeminder.com',
        path: '/api/v1/users/liquidsilver/goals/wakatimefromzapier/datapoints.json?auth_token='+ bKey,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Content-Length': beeBody.length,
        },
        body: beeBody
      }

      // POST request to beeminder
      var req = https.request(beeOpts, (res) => {
        console.log(`status from bee: ${res.statusCode}`);
        res.on('data', (chunk) => {
          console.log(`body from bee: ${chunk}`);
        })
        res.on('end', () => {
          console.log('no more data from bee');
        })
      })  // closes req for beeminder

      req.on('error', (e) => {
        console.error(`error from beeminder: ${e.message}`);
      })
      req.write(beeBody);
      req.end();  // closes beeminder request

    });  // closes res.on('end') from wakatime
  })  // closes https.get() from wakatime
  .on('error', (e) => {
    console.error('error from wakatime: ', e);
  })

  response.render('pages/index'); // renders page for browser
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/*
SEE EVERNOTE AND APIGEE FOR FINAL SOLUTION - THIS ACTUALLY WORKS
1. COME UP WITH A BETTER SOLUTION FOR REQUESTID - SET THIS AS WAKATIME END TIME OR OTHER TO SPECIFY ONE DAY'S DATA
2. FIND SOMETHING IN ZAPIER THAT CAN CALL THE DEPLOYED URL ONCE PER DAY
3. PUT THE KEYS INTO HEROKU - *THEN* - PUSH TO GITHUB
*/
