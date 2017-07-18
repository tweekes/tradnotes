
var actionButtonLabel = null;
var actionButtonLabels = ['Next','Answer'];
var canvas = null;
var currentFunction="fretboard";
var offsetH = 52, offsetV = 8;  // offsetH = 12
var stringGap = 20, fretWidth = 40;
var numberOfFrets = 14;

var tunings = new AvailableTunings();
var practiceMgr = new PracticeManager();
var practiceStats = new PracticeStats(updateUiWithPracticeStats);
var lastPracticeCircle = null, lastAnswerText = null, fbp = null;
var lastPracticePositionsForNote = "none"; 

(function() {
    var canvasEL = document.getElementById('C');    
    canvas = new fabric.Canvas(canvasEL);
    tunings.init();
    drawFretBoard();
    showHide('actionButtonContainer',false);
    applyForCurrentFunction();
    console.log("selected strings: " + tunings.getSelected().strings);

})();

function drawFretBoard() {
    var currentTuning = tunings.getSelected();
    var numStrings =  currentTuning.strings.length
    var fretHeight = stringGap * (numStrings -1) + 6;

   _(numStrings).times(function(n){
            var y = n*stringGap +10;
            var l = new fabric.Line([48, y, 600, y], {
                stroke: 'black'
            });
            
            canvas.add(l);
    })

    _(numberOfFrets).times(function(n){ 
        var x = offsetH + n * fretWidth;
        
        canvas.add(new fabric.Line([x, offsetV, x, offsetV + fretHeight ], {
            stroke: 'black'
        }));

    })

    if (numStrings === 6) {
        drawFretDot(offsetH + fretWidth * 2 + fretWidth /2 -6, offsetV + fretHeight / 2 - 6); // Fret 3
        drawFretDot(offsetH + fretWidth * 4 + fretWidth /2 -6, offsetV + stringGap + stringGap / 2 - 3); // Fret 5
        drawFretDot(offsetH + fretWidth * 4 + fretWidth /2 -6, offsetV + stringGap * 3 + stringGap / 2 - 3); // Fret 5
        drawFretDot(offsetH + fretWidth * 6 + fretWidth /2 -6, offsetV + fretHeight / 2 - 6); // Fret 7
        drawFretDot(offsetH + fretWidth * 8 + fretWidth /2 -6, offsetV + stringGap + stringGap / 2 - 3); // Fret 9
        drawFretDot(offsetH + fretWidth * 8 + fretWidth /2 -6, offsetV + stringGap * 3 + stringGap / 2 - 3); // Fret 9
        drawFretDot(offsetH + fretWidth * 11 + fretWidth /2 -6,offsetV + fretHeight / 2 - 6); // Fret 12
    } else if (numStrings === 4) {
        drawFretDot(offsetH + fretWidth * 2 + fretWidth /2 -6, offsetV + fretHeight / 2 - 6); // Fret 3
        drawFretDot(offsetH + fretWidth * 4 + fretWidth /2 -6, offsetV + fretHeight / 2 - 6); // Fret 5
        drawFretDot(offsetH + fretWidth * 6 + fretWidth /2 -6, offsetV + fretHeight / 2 - 6); // Fret 7
        drawFretDot(offsetH + fretWidth * 8 + fretWidth /2 -6, offsetV + fretHeight / 2 - 6); // Fret 9
        drawFretDot(offsetH + fretWidth * 11 + fretWidth /2 -6,offsetV + fretHeight / 2 - 6); // Fret 12
    }

    canvas.selection = false;
    canvas.forEachObject(function(o) {
        o.selectable = false;
    }); 
}


function drawCircleAtFretPosition(fretNumber,stringNumber,drawText,noteLetter,buffer) {
    var radius = 8; 
    var vPos = offsetV + (stringNumber - 1) * stringGap - radius + 2;
    var hPos = offsetH + fretWidth * (fretNumber - 1) + fretWidth / 2 - radius; 

    var circleObj = new fabric.Circle();

    circleObj.set({radius: radius, fill: 'blue', left: hPos , top: vPos, selectable:false});
    canvas.add(circleObj);

    if (buffer) buffer.push(circleObj);

    if (drawText) {
        drawText(hPos,vPos,noteLetter,buffer);
    }
 
    return circleObj;
}


function drawFretDot(left,top) {        
    canvas.add(new fabric.Circle({
        radius: 6, fill: '#DDD', left: left , top: top
    }));
}

function navigationMgr(e) {
    if (e.value !== currentFunction) {
        currentFunction = e.value;
        applyForCurrentFunction();
    }
}

function applyForCurrentFunction() {
        canvas.clear();
        drawFretBoard();
        switch (currentFunction)
        {
            case "fretboard":
                showHide('actionButtonContainer',false);
                showHide('practiceStats',false);
                showHide('positionsForNote',false);
                populateFretboard();                
                break;

            case "scales":
                showHide('actionButtonContainer',false);
                showHide('practiceStats',false);
                showHide('positionsForNote',false);
                break;

            case "practice": 
                showHide('actionButtonContainer',true);
                showHide('practiceStats',true);
                showHide('positionsForNote',true);
                practiceMgr.setTuning(tunings.getSelected(),numberOfFrets);
                practiceMgr.currentAction = 0;
                actionBtn()
                break;
        }
        showHelpText();
} 


function actionBtn() {
   if (practiceMgr.currentAction == 0) {
        next();
   } else {
        answer();
   }
   practiceMgr.currentActionToggle();
   document.getElementById("actionButtonID").innerHTML = actionButtonLabels[practiceMgr.currentAction];
}



function drawAnimatedCircle(fretNumber,stringNumber,lastCircle) {
    var startRadius = 5, endRadius = 8;
    var pos = calcCenterPosition(fretNumber,stringNumber);

    if(lastCircle) {
        canvas.remove(lastCircle);
    }

    var c = new fabric.Circle();
    c.set({radius: startRadius, 
            fill: 'blue',
            originX:'center', 
            originY:'center',  
            left: pos.hPos, 
            top: pos.vPos,
            selectable:false });
    canvas.add(c);

    c.animate('radius', endRadius, {
        onChange: canvas.renderAll.bind(canvas)
    });

    return c;
}

function positionsForNoteHandler(e) {
    canvas.clear();
    drawFretBoard();
    if (e.value === "none" && lastPracticePositionsForNote !== "none") {        
        lastPracticePositionsForNote = "none";
        document.getElementById("actionButtonID").disabled = false;
        practiceStats.init();
        practiceMgr.currentAction = 0;
        actionBtn();
    } else if (e.value !== "none") {
        lastPracticePositionsForNote = e.value;
        document.getElementById("actionButtonID").disabled = true;
        var fbps = practiceMgr.getFretBoardPositionsForNote(lastPracticePositionsForNote);
        var base = tunings.getSelected().strings.length +1;
       _.each(fbps, function(fbp){
            drawCircleAtFretPosition(fbp.fretNumber,base - (fbp.stringNumber+1),drawText,lastPracticePositionsForNote,null); 
        });
    }
}

function next() {
    practiceStats.next();
    fbp = practiceMgr.getRandomFretBoardPosition();
    if(lastAnswerText != null) { 
        canvas.remove(lastAnswerText);
    }
    lastPracticeCircle = drawAnimatedCircle(fbp.fretNumber,fbp.stringNumber,lastPracticeCircle);
}

function answer() {
    practiceStats.answer();
    var note = practiceMgr.fretBoardNoteAt(fbp.fretNumber,fbp.stringNumber);
    var pos = calcCenterPosition(fbp.fretNumber,fbp.stringNumber);
    
    var answerText = new fabric.Textbox(note, {                        
                stroke: "white",
                originX:'center',
                originy:'center',
                top: pos.vPos -6,   // fudge factor!
                left: pos.hPos,
                fontSize: 9,
                selectable:false }
                );
    canvas.add(answerText);
    canvas.renderAll();
    lastAnswerText = answerText;
}

function calcCenterPosition(fretNumber,stringNumber) {
    return {
        vPos:offsetV + (stringNumber - 1) * stringGap + 2,
        hPos:offsetH + fretWidth * (fretNumber - 1) + fretWidth / 2 
    }
}

function updateUiWithPracticeStats(count,average,last) {
    function updateUI(targetId,text) {
        var targetEL = document.getElementById(targetId);
        targetEL.innerText = text;
    }

    updateUI('ps_count',count);
    updateUI('ps_average',"" + average + " secs");
    updateUI('ps_last',"" + last + " secs");
}


var canvasItemsBuffer = [];

function clearCanvasItemsBuffer() {
    var noItems =  canvasItemsBuffer.length;
    while (noItems > 0) {
        var item = canvasItemsBuffer.pop();
        canvas.remove(item);
        noItems--;
    }
}


function drawText(hPos,vPos,noteLetter,buffer) {
    var hAdjust =  (noteLetter.length == 1) ? 4.6:2.5;
    var text = new fabric.Textbox(noteLetter, {
            selectable:false,
            stroke :"white",
            top:vPos+4,
            left:hPos + hAdjust,
            fontSize: 8,
            fontWeight:'normal',
            fontFamily:'Comic Sans MS'}
            );
    if(buffer) buffer.push(text);        
    canvas.add(text);
}


function showScale(startStringNumber, startFretNumber) {
    var withSharps = true;
    var openStrings = tunings.getSelected().strings;
    var fbData = fbGenerate(openStrings,20,withSharps); 
    var majorScaleFormula = [0,2,4,5,7,9,11,12]; 

    // Root Note = string-1, Fret no :: A = 1, 0 | 0,7 D = 0 ,0

    var stringIdx = (openStrings.length - 1) - (startStringNumber -1);

    var result = getFretBoardPositionsForScale(stringIdx,startFretNumber,majorScaleFormula,fbData);



    var base = openStrings.length + 1;
    clearCanvasItemsBuffer();
    _.each(result,function(fp){
        drawCircleAtFretPosition(fp.f,base - (fp.s+1),drawText,fp.n,canvasItemsBuffer);        
    });

}

canvas.on('mouse:down', function(event) {
    if (canvas) {
        if (currentFunction === "scales") {
            canvas.deactivateAll();
            var pointer = canvas.getPointer(event.e);
            if( pointer.x >= 0 && pointer.y >= 0 && pointer.y <=120) {
                var fretNumber = Math.floor((pointer.x - 10) / fretWidth);
                var stringNumber = 1 + Math.floor(pointer.y / stringGap);
                showScale(stringNumber,fretNumber);
            }
        }
    }
});

canvas.on('mouse:up', function(event) {
    canvas.deactivateAll();
});

function showHide(targetCssId,bShow) {
    var t = document.getElementById(targetCssId);
    var v = {true:'block',false:'none'};
    t.style.display = v[bShow];
}

function showHelpText() {
    var t = document.getElementById("tw-helpText");
    var helpText = {
            "fretboard":"Fret board notes now showing for the active tuning.",
            "scales":"Select a fret position using the mouse or touch to indicate where the scale should start.",
            "practice":"Learn the notes of the fretboard by guessing the note, once done invoke the answer button."
        }
    
    t.innerText = helpText[currentFunction];       
}



function populateFretboard() { 
    var withSharps = true;
    var openStrings = tunings.getSelected().strings;
    var strings = fbGenerate(openStrings,numberOfFrets,withSharps); 
    var base = openStrings.length + 1;

    _.each(strings, function(string,stringIdx){
        _.each(string,function(fp,fretPos){
             drawCircleAtFretPosition(fretPos,base - (stringIdx+1),drawText,fp[0],null); 
        });
    });
}

function tuningChanged() {
    console.log(tunings.getSelected().strings);
    applyForCurrentFunction()
}

