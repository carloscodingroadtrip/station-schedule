$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBbz8hVF_czUjOPCdILZ9PtivEm-dwtRTY",
        authDomain: "trainscheduler-bf7ad.firebaseapp.com",
        databaseURL: "https://trainscheduler-bf7ad.firebaseio.com",
        projectId: "trainscheduler-bf7ad",
        storageBucket: "",
        messagingSenderId: "35492814730"
    };
    firebase.initializeApp(config);


    var db = firebase.database();
    //time caculation
    var currentTime = new Date(),
        currentHours = currentTime.getHours(),
        currentMinutes = currentTime.getMinutes(),
        currentTimeInMin = currentHours * 60 + currentMinutes;
    //console.log("current time in minutes: " + currentTimeInMin);

    //gain focus on first input onload
    $("#trainName").focus();

    // on submit button click
    $("#submit").on("click", function (e) {
        e.preventDefault(); //prevent page refresh

        //get the initial time from input and split it to hours and minutes
        // in array and calculate total time in minutes before pass it to
        //database
        var initTime = $("#trainTime").val().trim(),
            initTimeArr = initTime.split(":"), //split to hours and minutes
            initHours = parseInt(initTimeArr[0], )
        initMinutes = parseInt(initTimeArr[1]),
            initTimeInMinutes = initHours * 60 + initMinutes;
        //console.log("init time in minutes: " + initTimeInMinutes);

        //create new object
        var train = {
            tName: $("#trainName").val().trim(),
            tDestination: $("#trainDestination").val().trim(),
            tTime: initTimeInMinutes, //initial time in minutes
            tFrequency: $("#trainFrequency").val().trim()
        };

        db.ref("train").push(train)
        $("input").val("");
        $("#trainName").focus();
    })

    db.ref("train").on("value", getData)

    function getData(res) {
        $("tbody").empty(); //empty out the table
        var tableRow = $("<tr>"); // create new table row
        var keys = Object.keys(res.val()) //extract keys from response to array

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var myDataObject = res.val()[k]; //getting objects out of keys

            //console.log(myDataObject.tTime);

            var trainTimeInMinutes = parseInt(myDataObject.tTime);

            if (currentTimeInMin - trainTimeInMinutes < 0) { //if initial time is higher than current time
                var remainingMin = (currentTimeInMin - trainTimeInMinutes) * (-1),
                    //this will create td element with remaining time
                    tableRemaining = $("<td class = 'text-center'>").text(remainingMin),

                    x = trainFromMinuteToHours(trainTimeInMinutes),
                    tableNextTime = $("<td class = 'text-center'>").text(x);


            } else { //if initial time has expired
                var frequencyNumber = parseInt(myDataObject.tFrequency);
                //console.log(frequencyNumber);

                //increment represent number of times that frequency should be increased to get the next available train
                var increment = Math.floor((currentTimeInMin - trainTimeInMinutes) / frequencyNumber) + 1;
                //newTrainTime will exceed the current time to get the next train
                var newTrainTimeInMin = trainTimeInMinutes + (frequencyNumber * increment)

                var remainingMin = (currentTimeInMin - newTrainTimeInMin) * (-1) % frequencyNumber,
                    tableRemaining = $("<td class = 'text-center'>").text(remainingMin),


                    x = trainFromMinuteToHours(newTrainTimeInMin),
                    tableNextTime = $("<td class = 'text-center'>").text(x);

            }

            var tableRow = $("<tr>"); // create new table row
            var tableName = $("<th>").text(myDataObject.tName),
                tableDelete = $("<td dataKey= '" + k + "' class = 'text-center'>").html('<i class="text-danger fas fa-trash-alt"></i>'),
                tableDestination = $("<td>").text(myDataObject.tDestination),
                tableFrequency = $("<td class = 'text-center'>").text(myDataObject.tFrequency);
            tableRow.append(tableDelete, tableName, tableDestination, tableFrequency, tableNextTime, tableRemaining);
            $("tbody").append(tableRow);



            //console.log(myDataObject);

        }

    }

    function trainFromMinuteToHours(tInMin) { //converts time from minutes to hours
        var arrivalHours = Math.floor(tInMin / 60),
            arrivalMinutes = tInMin % 60,
            day; // store AM or PM
        if (arrivalHours < 12) {
            day = "AM";
        } else if (arrivalHours === 12) {
            day = "PM";
        } else {
            arrivalHours -= 12;
            day = "PM"
        };
        if (arrivalMinutes < 10) {
            arrivalMinutes = "0" + arrivalMinutes;
        }
        var finalTime = arrivalHours + ":" + arrivalMinutes + " " + day;

        return finalTime

    };

    //the next 3 events are time input validation
    $("#trainTime").blur(function () {
        if (!$("#trainTime")[0].validity.valid || $("#trainTime").val() === "") {//if user didn't input correct time format
            $('#myModal').modal("show", true)
        }
    })

    $("#modalOK").on("click", function () {
        $('#myModal').modal("hide")
    });
    $('#myModal').on('hidden.bs.modal', function (e) {
        $("#trainTime").focus();
    });

    $("tbody").on("click", "i", function () {
        var rowKey = $(this).parent().attr("dataKey");
        db.ref("train/"+ rowKey).remove();
    });

})