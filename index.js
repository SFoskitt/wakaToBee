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
  var tmp = someDate.toJSON();
  var thisDate = tmp.slice(0,10).replace(/-/g,'-');
  var url = 'https://wakatime.com/api/v1/users/current/durations?api_key='+ wKey +'&date=' + thisDate;
  fetch(url)
  .then(response => 
    response.json()
      .then(data => ({
          data: data,
      }))
    .then(res => {
        var info = res.data.data;
        var sum = info.reduce((acc, elem) => {
          return acc + elem.duration;
        }, 0)
        var total = sum / 60 / 60;
        console.log('total', total);
        total = total.toString();

        // var beeOpts = {
        //   'method': 'POST',
        //   'headers': {
        //     'auth_token': {
        //       "username":"liquidsilver",
        //       "auth_token": bKey
        //     }
        //   },
        //   'value': '0.022',
        //   'timestamp': '1494562463387',
        //   'requestid': '1494562463387d1',
        //   'comment': 'wakaTimeData'
        // }
        // var ifttUrl = 'https://maker.ifttt.com/trigger/waka/with/key/nVTS3kmHCRg1im28GZnNrDsQr6hBYo7ugB_57gIEJ0e';
        var now = new Date().getTime();
        // var beeUrl = 'https://www.beeminder.com/api/v1/users/liquidsilver/goals/wakatimefromzapier/datapoints.json?timestamp='+ now +'&value='+ total +'&comment=wakaTimeData';
        // var beeUrl = 'https://www.beeminder.com/api/v1/users/liquidsilver/goals/wakatimefromzapier/datapoints.json';
        var beeUrl2 = 'https://beeminder.com/api/v1/users/liquidsilver/goals/wakatimefromzapier/datapoints.json?auth_token='+ bKey +'&timestamp=1494562463&daystamp="20170511"&value=0.0624&comment="fromPostman"&requestid="1494562463abc2"&updated_at=1494594321';

        fetch(beeUrl2, {'method': 'POST'})
          .then(function(response){
            return response.text();
          })
          .then(res => {
            console.log('some response inside the bee POST', res);
          })
          .catch(error => {
            console.error('error message:', error);
          });
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
 * id (string): A unique ID, used to identify a datapoint when deleting or editing it.
timestamp (number): The unix time (in seconds) of the datapoint.
daystamp (string): The date of the datapoint (e.g., “20150831”). Sometimes timestamps are surprising due to goal deadlines, so if you’re looking at Beeminder data, you’re probably interested in the daystamp.
value (number): The value, e.g., how much you weighed on the day indicated by the timestamp.
comment (string): An optional comment about the datapoint.
updated_at (number): The unix time that this datapoint was entered or last updated.
requestid (string): If a datapoint was created via the API and this parameter was included, it will be echoed back.
 */


/*
SEE EVERNOTE AND APIGEE FOR FINAL SOLUTION - THIS ACTUALLY WORKS
1. COME UP WITH A BETTER SOLUTION FOR REQUESTID - SET THIS AS WAKATIME END TIME OR OTHER TO SPECIFY ONE DAY'S DATA
2. FIND SOMETHING IN ZAPIER THAT CAN CALL THE DEPLOYED URL ONCE PER DAY
3. PUT THE KEYS INTO HEROKU - *THEN* - PUSH TO GITHUB

*/