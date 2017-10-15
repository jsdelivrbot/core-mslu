var request = require("request");
var fs = require('fs');
// const cheerio = require("cheerio");

function callbackWrap(cb) {
    return function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (cb) { cb(error, response, body); }
        } else {
            console.log(error);
        }
    }
}

module.exports = function(app) {
    request = request.defaults({jar: true});

    var baseUrl = "http://raspisanie.mslu.by/schedule/reports/publicreports/schedulelistforgroupreport";
    var heades = {
        "User-Agent": "request",
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "text/javascript, text/html, application/xml, text/xml, */*",
        "X-Requested-With": "XMLHttpRequest",
    }

    var mainResponse;
    var selectedWeek;

    function setInputValue(input, cb) {
        return request.post({url: baseUrl + "." + input + ":change", headers: heades}, cb);
    }

    function setFaculty() {
        setInputValue("faculty", callbackWrap(setCource))
        .form({
            "t:formcomponentid": "reports/publicreports/ScheduleListForGroupReport:printform",
            "t:formid": "printForm",
            "t:selectvalue": "5",
            "t:zoneid": "studyGroupZone"
        });
    }

    function setCource(error, response, html) {
        setInputValue("course", callbackWrap(setYear))
        .form({
            "t:formcomponentid": "reports/publicreports/ScheduleListForGroupReport:printform",
            "t:formid": "printForm",
            "t:selectvalue": "4",
            "t:zoneid": "studyWeekZone"
        });
    }

    function setYear(error, response, html) {
        setInputValue("studyyears", callbackWrap(setWeek))
        .form({
            "t:formcomponentid": "reports/publicreports/ScheduleListForGroupReport:printform",
            "t:formid": "printForm",
            "t:selectvalue": "2017",
            "t:zoneid": "studyWeekZone"
        });
    }

    function setWeek(error, response, html) {

        // var $ = cheerio.load(JSON.parse(html).zones.studyWeekZone);

        // $('select option').each(function(){
        //     var data = $(this);
        //     console.log(data.text(), data.val());
        // })

        // var $ = cheerio.load(JSON.parse(html).zones.studyGroupZone);

        // $('select option').each(function(){
        //     var data = $(this);
        //     console.log(data.text(), data.val());
        // })

        setInputValue("studyweeks", callbackWrap(setGroup))
        .form({
            "t:formcomponentid": "reports/publicreports/ScheduleListForGroupReport:printform",
            "t:formid": "printForm",
            "t:selectvalue": selectedWeek || "320",
            "t:zoneid": "buttonZone"
        });
    }

    function setGroup(error, response, html) {

        setInputValue("studygroups", callbackWrap(saveFile))
        .form({
            "t:formcomponentid": "reports/publicreports/ScheduleListForGroupReport:printform",
            "t:formid": "printForm",
            "t:selectvalue": "974",
            "t:zoneid": "buttonZone"
        });
    }

    function saveFile() {
        request.get(baseUrl + '.printreport')
            .on('response', function( res ){
                mainResponse.set(res.headers);
                res.pipe(mainResponse)
            });
            // .on('end', function() {
            //     console.log('File updated');
            // });
    }

    app.get('/schedule/:weekID', (req, res) => {
        selectedWeek = req.params.weekID;
        mainResponse = res;

        request({ url: baseUrl}, (error, resp, html) => {
            if(!error) {
                setFaculty();
            }
        });

    });
};
